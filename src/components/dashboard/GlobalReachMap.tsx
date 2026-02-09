import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Globe, Radio } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON as LeafletGeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LOCATION_DATA } from "@/lib/locations";
import usStatesData from "@/lib/us-states.json";

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

const GlobalReachMap = ({ activeCampaigns, allCampaigns, kpiStats }: GlobalReachMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const campaignLocations = useMemo(() => {
    return activeCampaigns.flatMap(c => {
      const audience = c.target_audience as any;
      const locations = audience?.locations || [];
      return locations.map((locName: string) => ({
        ...LOCATION_DATA[locName],
        name: locName,
        campaignTitle: c.title
      })).filter((l: any) => l.lat !== undefined);
    });
  }, [activeCampaigns]);

  const activeStateNames = useMemo(() => {
    const allLocations = allCampaigns.flatMap(c => {
      const audience = c.target_audience as any;
      return audience?.locations || [];
    });

    const stateNames = new Set<string>();
    allLocations.forEach((loc: string) => {
      if (loc.toLowerCase() === "united states") {
        (usStatesData as any).features?.forEach((f: any) => stateNames.add(f.properties.name));
        return;
      }
      const parts = loc.split(",");
      if (parts.length >= 2 && parts[1].trim().toUpperCase() === "US") {
        stateNames.add(parts[0].trim());
      }
    });

    if (stateNames.size === 0) {
      ["California", "New York"].forEach(s => stateNames.add(s));
    }
    return stateNames;
  }, [allCampaigns]);

  return (
    <div className="relative w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden border border-border bg-card backdrop-blur-xl group">

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[54, -98]}
          zoom={3}
          minZoom={2}
          maxZoom={6}
          worldCopyJump={true}
          style={{ height: "100%", width: "100%", background: 'hsl(var(--card))' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            noWrap={false}
          />

          {/* Active state polygons */}
          <LeafletGeoJSON
            data={usStatesData as any}
            style={feature => {
              const isActive = activeStateNames.has(feature?.properties?.name);
              const isHovered = hoveredState === feature?.properties?.name;
              return {
                fillColor: isActive ? 'hsl(var(--primary))' : 'transparent',
                weight: isActive ? (isHovered ? 3 : 1.5) : 0,
                opacity: 1,
                color: isActive ? 'hsl(var(--primary))' : 'transparent',
                fillOpacity: isActive ? (isHovered ? 0.5 : 0.25) : 0,
                className: isActive ? 'transition-all duration-300' : ''
              };
            }}
            onEachFeature={(feature, layer) => {
              const isActive = activeStateNames.has(feature?.properties?.name);
              if (isActive) {
                layer.on({
                  mouseover: () => setHoveredState(feature.properties.name),
                  mouseout: () => setHoveredState(null),
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
            }}
          />

          {/* Campaign location markers — layered rings */}
          {campaignLocations.map((loc: CampaignLocation, idx: number) => (
            <MarkerCluster key={`marker-${loc.name}-${idx}`} loc={loc} />
          ))}
        </MapContainer>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 to-transparent z-10 pointer-events-none" />

      {/* Top-left HUD */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-card">
          <div className="relative flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="absolute h-4 w-4 rounded-full bg-primary/30 animate-ping" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            Live Broadcast Telemetry
          </span>
        </div>
        {activeCampaigns.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-card/70 backdrop-blur-sm border border-border/50">
            <Radio className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] font-medium text-muted-foreground">
              {activeCampaigns.length} Active Node{activeCampaigns.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Top-right legend */}
      <div className="absolute top-5 right-5 z-20 hidden md:flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-card">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Legend</span>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
          <span className="text-[10px] text-foreground/80">Active Spot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-5 rounded-sm bg-primary/25 border border-primary/40" />
          <span className="text-[10px] text-foreground/80">Coverage Area</span>
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

        <div className="flex gap-6 bg-card/90 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-border shadow-card">
          <MetricItem
            label="Active Spots"
            value={campaignLocations.length > 0 ? campaignLocations.length : 2}
          />
          <div className="w-px bg-border" />
          <MetricItem
            label="Network Load"
            value={
              activeCampaigns.length > 3 ? 'Critical' :
              activeCampaigns.length > 1 ? 'High' :
              activeCampaigns.length > 0 ? 'Normal' : 'Idle'
            }
            color={
              activeCampaigns.length > 3 ? 'text-destructive' :
              activeCampaigns.length > 1 ? 'text-amber-500' :
              activeCampaigns.length > 0 ? 'text-primary' : 'text-muted-foreground'
            }
          />
          <div className="w-px bg-border" />
          <MetricItem
            label="Latency"
            value={`${Math.max(8, 8 + activeCampaigns.length * 4)}ms`}
            color={activeCampaigns.length > 2 ? 'text-amber-500' : 'text-emerald-500'}
          />
        </div>
      </div>
    </div>
  );
};

/* --- Marker cluster with layered animated rings --- */
const MarkerCluster = ({ loc }: { loc: CampaignLocation }) => (
  <>
    {/* Outermost slow pulse */}
    <CircleMarker
      center={[loc.lat, loc.lng]}
      radius={32}
      pathOptions={{
        fillColor: 'hsl(var(--primary))',
        fillOpacity: 0.06,
        color: 'hsl(var(--primary))',
        weight: 1,
        opacity: 0.3,
        className: 'animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]'
      }}
    />
    {/* Middle ring */}
    <CircleMarker
      center={[loc.lat, loc.lng]}
      radius={20}
      pathOptions={{
        fillColor: 'hsl(var(--primary))',
        fillOpacity: 0.12,
        color: 'hsl(var(--primary))',
        weight: 1.5,
        opacity: 0.5,
        className: 'animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]'
      }}
    />
    {/* Core marker */}
    <CircleMarker
      center={[loc.lat, loc.lng]}
      radius={8}
      pathOptions={{
        fillColor: 'hsl(var(--primary))',
        fillOpacity: 0.85,
        color: 'hsl(var(--background))',
        weight: 3,
      }}
    >
      <Popup>
        <div style={{ padding: '12px', fontFamily: 'system-ui, -apple-system, sans-serif', minWidth: '180px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ height: '8px', width: '8px', borderRadius: '50%', background: 'hsl(var(--primary))', boxShadow: '0 0 8px hsl(var(--primary) / 0.6)' }} />
            <p style={{ fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'hsl(var(--primary))', margin: 0 }}>Live Broadcast</p>
          </div>
          <p style={{ fontWeight: 800, fontSize: '15px', margin: '0 0 4px 0' }}>{loc.campaignTitle}</p>
          <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{loc.name}</p>
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid hsl(var(--border))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: '#888' }}>Signal</span>
              <span style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Strong</span>
            </div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  </>
);

/* --- Small metric display --- */
const MetricItem = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
  <div className="text-center md:text-right">
    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">{label}</p>
    <p className={`text-xl font-black ${color || 'text-foreground'}`}>{value}</p>
  </div>
);

export default GlobalReachMap;
