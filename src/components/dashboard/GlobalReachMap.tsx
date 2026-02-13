import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Globe, Radio, Eye, CheckCircle2, Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON as LeafletGeoJSON, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LOCATION_DATA } from "@/lib/locations";
import usStatesData from "@/lib/us-states.json";

/* Animated LIVE badge as a Leaflet DivIcon */
const createLiveIcon = () => L.divIcon({
  className: '',
  iconSize: [52, 24],
  iconAnchor: [26, 12],
  html: `
    <div style="
      display: flex; align-items: center; gap: 4px;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      padding: 3px 10px 3px 7px;
      border-radius: 9999px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      box-shadow: 0 0 12px hsl(var(--primary) / 0.5), 0 2px 8px rgba(0,0,0,0.25);
      white-space: nowrap;
      pointer-events: none;
      animation: liveBadgePulse 2s ease-in-out infinite;
    ">
      <span style="
        display: inline-block;
        height: 6px; width: 6px;
        border-radius: 50%;
        background: hsl(var(--primary-foreground));
        animation: liveDot 1.5s ease-in-out infinite;
      "></span>
      LIVE
    </div>
    <style>
      @keyframes liveBadgePulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.08); opacity: 0.9; }
      }
      @keyframes liveDot {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    </style>
  `
});

/* Approximate US state centroids for LIVE badge placement */
const STATE_CENTROIDS: Record<string, [number, number]> = {
  "Alabama": [32.806671, -86.791130],
  "Alaska": [61.370716, -152.404419],
  "Arizona": [33.729759, -111.431221],
  "Arkansas": [34.969704, -92.373123],
  "California": [36.116203, -119.681564],
  "Colorado": [39.059811, -105.311104],
  "Connecticut": [41.597782, -72.755371],
  "Delaware": [39.318523, -75.507141],
  "Florida": [27.766279, -81.686783],
  "Georgia": [33.040619, -83.643074],
  "Hawaii": [21.094318, -157.498337],
  "Idaho": [44.240459, -114.478828],
  "Illinois": [40.349457, -88.986137],
  "Indiana": [39.849426, -86.258278],
  "Iowa": [42.011539, -93.210526],
  "Kansas": [38.526600, -96.726486],
  "Kentucky": [37.668140, -84.670067],
  "Louisiana": [31.169546, -91.867805],
  "Maine": [44.693947, -69.381927],
  "Maryland": [39.063946, -76.802101],
  "Massachusetts": [42.230171, -71.530106],
  "Michigan": [43.326618, -84.536095],
  "Minnesota": [45.694454, -93.900192],
  "Mississippi": [32.741646, -89.678696],
  "Missouri": [38.456085, -92.288368],
  "Montana": [46.921925, -110.454353],
  "Nebraska": [41.125370, -98.268082],
  "Nevada": [38.313515, -117.055374],
  "New Hampshire": [43.452492, -71.563896],
  "New Jersey": [40.298904, -74.521011],
  "New Mexico": [34.840515, -106.248482],
  "New York": [42.165726, -74.948051],
  "North Carolina": [35.630066, -79.806419],
  "North Dakota": [47.528912, -99.784012],
  "Ohio": [40.388783, -82.764915],
  "Oklahoma": [35.565342, -96.928917],
  "Oregon": [44.572021, -122.070938],
  "Pennsylvania": [40.590752, -77.209755],
  "Rhode Island": [41.680893, -71.511780],
  "South Carolina": [33.856892, -80.945007],
  "South Dakota": [44.299782, -99.438828],
  "Tennessee": [35.747845, -86.692345],
  "Texas": [31.054487, -97.563461],
  "Utah": [40.150032, -111.862434],
  "Vermont": [44.045876, -72.710686],
  "Virginia": [37.769337, -78.169968],
  "Washington": [47.400902, -121.490494],
  "West Virginia": [38.491226, -80.954456],
  "Wisconsin": [44.268543, -89.616508],
  "Wyoming": [42.755966, -107.302490],
  "District of Columbia": [38.897438, -77.026817]
};
interface CampaignLocation {
  lat: number;
  lng: number;
  name: string;
  campaignTitle: string;
}
interface GlobalReachMapProps {
  activeCampaigns: any[];
  allCampaigns: any[];
  kpiStats: {
    totalHouseholds: string;
  };
}
const GlobalReachMap = ({
  activeCampaigns,
  allCampaigns,
  kpiStats
}: GlobalReachMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const campaignLocations = useMemo(() => {
    return activeCampaigns.flatMap((c) => {
      const audience = c.target_audience as any;
      const locations = audience?.locations || [];
      return locations.map((locName: string) => ({
        ...LOCATION_DATA[locName],
        name: locName,
        campaignTitle: c.title
      })).filter((l: any) => l.lat !== undefined);
    });
  }, [activeCampaigns]);

  // Map of plain location names to their corresponding US state names in GeoJSON
  const locationToStateMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    const features = (usStatesData as any).features || [];
    features.forEach((f: any) => {
      const name = f.properties.name as string;
      map[name.toLowerCase()] = name;
      map[`${name.toLowerCase()}, us`] = name;
    });
    // City-to-state mappings
    const cityToState: Record<string, string> = {
      "new york city": "New York",
      "los angeles": "California",
      "san francisco": "California",
      "san diego": "California",
      "sacramento": "California",
      "san jose": "California",
      "chicago": "Illinois",
      "houston": "Texas",
      "dallas": "Texas",
      "san antonio": "Texas",
      "austin": "Texas",
      "fort worth": "Texas",
      "el paso": "Texas",
      "miami": "Florida",
      "orlando": "Florida",
      "tampa": "Florida",
      "jacksonville": "Florida",
      "atlanta": "Georgia",
      "phoenix": "Arizona",
      "tucson": "Arizona",
      "seattle": "Washington",
      "spokane": "Washington",
      "denver": "Colorado",
      "colorado springs": "Colorado",
      "boston": "Massachusetts",
      "philadelphia": "Pennsylvania",
      "pittsburgh": "Pennsylvania",
      "detroit": "Michigan",
      "minneapolis": "Minnesota",
      "st. paul": "Minnesota",
      "portland": "Oregon",
      "las vegas": "Nevada",
      "nashville": "Tennessee",
      "memphis": "Tennessee",
      "charlotte": "North Carolina",
      "raleigh": "North Carolina",
      "indianapolis": "Indiana",
      "columbus": "Ohio",
      "cleveland": "Ohio",
      "cincinnati": "Ohio",
      "kansas city": "Missouri",
      "st. louis": "Missouri",
      "new orleans": "Louisiana",
      "salt lake city": "Utah",
      "milwaukee": "Wisconsin",
      "baltimore": "Maryland",
      "washington dc": "District of Columbia",
      "washington d.c.": "District of Columbia"
    };
    Object.entries(cityToState).forEach(([city, state]) => {
      map[city] = state;
      map[`${city}, us`] = state;
    });
    return map;
  }, []);
  const activeStateNames = useMemo(() => {
    const activeLocations = activeCampaigns.flatMap((c) => {
      const audience = c.target_audience as any;
      return audience?.locations || [];
    });
    const stateNames = new Set<string>();
    activeLocations.forEach((loc: string) => {
      const key = loc.toLowerCase().trim();
      /* if (key === "united states") {
        (usStatesData as any).features?.forEach((f: any) => stateNames.add(f.properties.name));
        return;
      } */
      const mapped = locationToStateMap[key];
      if (mapped) {
        stateNames.add(mapped);
      }
    });
    return stateNames;
  }, [activeCampaigns, locationToStateMap]);

  // Compute LIVE icon positions from active state centroids
  const liveIconPositions = useMemo(() => {
    return Array.from(activeStateNames).map((name) => ({
      name,
      center: STATE_CENTROIDS[name]
    })).filter((s) => s.center !== undefined) as {
      name: string;
      center: [number, number];
    }[];
  }, [activeStateNames]);
  const liveIcon = useMemo(() => createLiveIcon(), []);
  return <div className="relative w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden border border-border bg-card backdrop-blur-xl group">

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={[54, -98]} zoom={3} minZoom={2} maxZoom={6} worldCopyJump={true} style={{
        height: "100%",
        width: "100%",
        background: 'hsl(var(--card))'
      }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png" noWrap={false} />

          {/* Active state polygons */}
          <LeafletGeoJSON data={usStatesData as any} style={(feature) => {
          const isActive = activeStateNames.has(feature?.properties?.name);
          const isHovered = hoveredState === feature?.properties?.name;
          return {
            fillColor: isActive ? 'hsl(var(--primary))' : 'transparent',
            weight: isActive ? isHovered ? 3 : 1.5 : 0,
            opacity: 1,
            color: isActive ? 'hsl(var(--primary))' : 'transparent',
            fillOpacity: isActive ? isHovered ? 0.5 : 0.25 : 0,
            className: isActive ? 'transition-all duration-300' : ''
          };
        }} onEachFeature={(feature, layer) => {
          const isActive = activeStateNames.has(feature?.properties?.name);
          if (isActive) {
            layer.on({
              mouseover: () => setHoveredState(feature.properties.name),
              mouseout: () => setHoveredState(null)
            });
            layer.bindPopup(`
                  <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; min-width: 180px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <div style="height: 8px; width: 8px; border-radius: 50%; background: hsl(var(--primary)); box-shadow: 0 0 8px hsl(var(--primary) / 0.6);"></div>
                      <p style="font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: hsl(var(--primary)); margin: 0;">Active Region</p>
                    </div>
                    <p style="font-weight: 800; font-size: 15px; margin: 0 0 4px 0; color: hsl(var(--foreground));">${feature.properties.name}</p>
                    <p style="font-size: 11px; color: hsl(var(--muted-foreground)); margin: 0;">United States</p>
                    <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid hsl(var(--border));">
                      <div style="display: flex; justify-content: space-between; font-size: 11px;">
                        <span style="color: hsl(var(--muted-foreground));">Status</span>
                        <span style="color: hsl(var(--primary)); font-weight: 600;">Broadcasting</span>
                      </div>
                    </div>
                  </div>
                `);
          }
        }} />

          {/* Campaign location markers — layered rings */}
          {campaignLocations.map((loc: CampaignLocation, idx: number) => <MarkerCluster key={`marker-${loc.name}-${idx}`} loc={loc} />)}

          {/* Animated LIVE badges on active state centroids */}
          {liveIconPositions.map(({
          name,
          center
        }) => <Marker key={`live-${name}`} position={center} icon={liveIcon} interactive={false} />)}
        </MapContainer>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 to-transparent z-10 pointer-events-none" />

      {/* Top-left HUD */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
        
        {activeCampaigns.length > 0




      }
      </div>

      {/* Top-right legend */}
      <div className="absolute top-5 right-5 z-20 hidden md:flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-card">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Legend</span>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
          <span className="text-[10px] text-foreground/80">Active Spot</span>
        </div>
        
        
      </div>

      {/* Bottom metrics bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col md:flex-row justify-between items-end gap-6 z-20">
        <div className="space-y-1">
          <h3 className="text-primary font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" /> US Audience Reach
          </h3>
          <div className="text-4xl lg:text-5xl font-black tabular-nums tracking-tighter text-foreground">
            {kpiStats.totalHouseholds}
            <span className="text-xl text-muted-foreground font-normal ml-2">Million US Households</span>
          </div>
        </div>

        <div className="flex gap-3">
          <PerformanceCard icon={Eye} label="Impressions" value={activeCampaigns.length > 0 ? `${(activeCampaigns.length * 4.2).toFixed(1)}M` : '0'} trend="+12.4%" trendUp />
          <PerformanceCard icon={CheckCircle2} label="VCR" value={activeCampaigns.length > 0 ? '93.4%' : '—'} trend="+2.1%" trendUp />
          <PerformanceCard icon={Users} label="Unique Reach" value={activeCampaigns.length > 0 ? `${(activeCampaigns.length * 2.1).toFixed(1)}M` : '0'} trend="+8.6%" trendUp />
          <PerformanceCard icon={DollarSign} label="CPM" value={activeCampaigns.length > 0 ? '$26.80' : '—'} trend="-3.2%" trendUp />
        </div>
      </div>
    </div>;
};

/* --- Marker cluster with layered animated rings --- */
const MarkerCluster = ({
  loc


}: {loc: CampaignLocation;}) => <>
    {/* Outermost slow pulse */}
    <CircleMarker center={[loc.lat, loc.lng]} radius={32} pathOptions={{
    fillColor: 'hsl(var(--primary))',
    fillOpacity: 0.06,
    color: 'hsl(var(--primary))',
    weight: 1,
    opacity: 0.3,
    className: 'animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]'
  }} />
    {/* Middle ring */}
    <CircleMarker center={[loc.lat, loc.lng]} radius={20} pathOptions={{
    fillColor: 'hsl(var(--primary))',
    fillOpacity: 0.12,
    color: 'hsl(var(--primary))',
    weight: 1.5,
    opacity: 0.5,
    className: 'animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]'
  }} />
    {/* Core marker */}
    <CircleMarker center={[loc.lat, loc.lng]} radius={8} pathOptions={{
    fillColor: 'hsl(var(--primary))',
    fillOpacity: 0.85,
    color: 'hsl(var(--background))',
    weight: 3
  }}>
      <Popup>
        <div style={{
        padding: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minWidth: '180px'
      }}>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
            <div style={{
            height: '8px',
            width: '8px',
            borderRadius: '50%',
            background: 'hsl(var(--primary))',
            boxShadow: '0 0 8px hsl(var(--primary) / 0.6)'
          }} />
            <p style={{
            fontWeight: 700,
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'hsl(var(--primary))',
            margin: 0
          }}>Live Broadcast</p>
          </div>
          <p style={{
          fontWeight: 800,
          fontSize: '15px',
          margin: '0 0 4px 0'
        }}>{loc.campaignTitle}</p>
          <p style={{
          fontSize: '11px',
          color: '#888',
          margin: 0
        }}>{loc.name}</p>
          <div style={{
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid hsl(var(--border))'
        }}>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px'
          }}>
              <span style={{
              color: '#888'
            }}>Signal</span>
              <span style={{
              color: 'hsl(var(--primary))',
              fontWeight: 600
            }}>Strong</span>
            </div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  </>;

/* --- Performance card for bottom bar --- */
const PerformanceCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendUp






}: {icon: React.ElementType;label: string;value: string;trend: string;trendUp: boolean;}) =>
<div className="bg-card/90 backdrop-blur-md px-4 py-3 rounded-xl border border-border/50 min-w-[120px] hover:border-primary/30 transition-all">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-lg font-black tracking-tight text-foreground">{value}</p>
    <div className="flex items-center gap-1 mt-0.5">
      {trendUp ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-amber-500" />}
      <span className={`text-[10px] font-semibold ${trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>{trend}</span>
    </div>
  </div>;


/* --- Small metric display --- */
const MetricItem = ({
  label,
  value,
  color




}: {label: string;value: string | number;color?: string;}) => <div className="text-center md:text-right">
    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">{label}</p>
    <p className={`text-xl font-black ${color || 'text-foreground'}`}>{value}</p>
  </div>;
export default GlobalReachMap;