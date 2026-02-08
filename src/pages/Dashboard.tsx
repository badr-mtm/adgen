import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { InteractiveGlobalMap } from "@/components/dashboard/InteractiveGlobalMap";
import { getCampaignRoute, getCampaignStageLabel, isCampaignComplete } from "@/lib/campaignNavigation";
import { Plus, Tv, Globe, Activity, Zap, BarChart3, ArrowUpRight, Clock, MapPin, TrendingUp, Signal, CheckCircle2, FileText, Play } from "lucide-react";

// Network mapping for display
const NETWORKS = ["Hulu", "Roku", "Samsung TV", "Apple TV+", "Amazon Fire"];
const getNetworkForCampaign = (index: number) => NETWORKS[index % NETWORKS.length];

// Region mapping for campaigns
const REGION_MAPPING: Record<string, string[]> = {
  na: ["north america", "usa", "us", "united states", "canada"],
  eu: ["europe", "uk", "germany", "france", "spain", "italy"],
  apac: ["asia", "pacific", "japan", "china", "australia", "india"],
  latam: ["latin america", "brazil", "mexico", "argentina"]
};

// Leaflet
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON as LeafletGeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LOCATION_DATA } from "@/lib/locations";
import usStatesData from "@/lib/us-states.json";
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  useEffect(() => {
    const initializeDashboard = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch active campaigns for telemetry
      const {
        data: campaigns
      } = await supabase.from('campaigns').select('*').eq('user_id', session.user.id).eq('status', 'active');
      if (campaigns) setActiveCampaigns(campaigns);
      setLoading(false);
    };
    initializeDashboard();
  }, [navigate]);

  // Fetch all campaigns for stats
  const {
    data: allCampaigns = []
  } = useQuery({
    queryKey: ['all-campaigns'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('campaigns').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!session
  });

  // Calculate coordinates for active campaigns
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

  // Derive active US state names from campaigns for GeoJSON highlighting
  const activeStateNames = useMemo(() => {
    const allLocations = allCampaigns.flatMap(c => {
      const audience = c.target_audience as any;
      return audience?.locations || [];
    });

    // Extract state names: "California, US" → "California", "New York, US" → "New York"
    const stateNames = new Set<string>();
    allLocations.forEach((loc: string) => {
      // If location is "United States" → all states are active
      if (loc.toLowerCase() === "united states") {
        // Add all US states from GeoJSON
        (usStatesData as any).features?.forEach((f: any) => stateNames.add(f.properties.name));
        return;
      }
      // Extract state name before comma: "California, US" → "California"
      const parts = loc.split(",");
      if (parts.length >= 2 && parts[1].trim().toUpperCase() === "US") {
        stateNames.add(parts[0].trim());
      }
    });

    // Simulated default active states when no real campaign data
    if (stateNames.size === 0) {
      ["California", "New York"].forEach(s => stateNames.add(s));
    }

    return stateNames;
  }, [allCampaigns]);

  // Calculate real KPI stats from campaigns
  const kpiStats = useMemo(() => {
    const totalCampaigns = allCampaigns.length;
    const liveCampaigns = allCampaigns.filter(c => c.status === 'live').length;
    const completedCampaigns = allCampaigns.filter(c => c.status === 'completed').length;
    const avgCtr = allCampaigns.reduce((acc, c) => acc + (c.predicted_ctr || 0), 0) / (totalCampaigns || 1);

    // Simulated spend based on campaign count
    const estimatedSpend = totalCampaigns * 2450;
    const completedViews = totalCampaigns * 168420;
    const complianceScore = totalCampaigns > 0 ? 100 : 0;
    return {
      totalSpend: `$${estimatedSpend.toLocaleString()}`,
      spendTrend: totalCampaigns > 0 ? `+${Math.min(12, totalCampaigns * 2)}%` : "0%",
      completedViews: completedViews > 1000000 ? `${(completedViews / 1000000).toFixed(1)}M` : completedViews > 1000 ? `${(completedViews / 1000).toFixed(1)}K` : completedViews.toString(),
      viewsTrend: `+${(avgCtr * 100).toFixed(1)}%`,
      liftRate: `${(avgCtr * 100).toFixed(1)}%`,
      liftTrend: `+${(avgCtr * 20).toFixed(1)}%`,
      complianceScore: `${complianceScore}%`,
      complianceTrend: complianceScore === 100 ? "Perfect" : "Needs Review",
      totalHouseholds: (totalCampaigns * 8.56).toFixed(1),
      activeNetworks: Math.min(14, totalCampaigns * 2 + 2),
      avgCpm: `$${(18.42 - totalCampaigns * 0.1).toFixed(2)}`,
      liveSpots: liveCampaigns * 170 + 10
    };
  }, [allCampaigns]);

  // Filter campaigns by selected region
  const filteredCampaigns = useMemo(() => {
    if (!selectedRegion) return allCampaigns.slice(0, 5);
    const regionKeywords = REGION_MAPPING[selectedRegion] || [];
    return allCampaigns.filter(campaign => {
      const targetAudience = campaign.target_audience as any;
      if (!targetAudience) return false;
      const audienceStr = JSON.stringify(targetAudience).toLowerCase();
      return regionKeywords.some(keyword => audienceStr.includes(keyword));
    }).slice(0, 5);
  }, [allCampaigns, selectedRegion]);
  if (loading) return <DashboardLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    </DashboardLayout>;
  return <DashboardLayout>
      <div className="min-h-screen bg-background text-foreground p-6 space-y-8 max-w-[1600px] mx-auto">

        {/* Header Section */}
        <ScrollReveal direction="down" duration={0.4}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Signal className="h-4 w-4 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">System Operational</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                Command Center
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Global TV delivery status and real-time performance monitoring.
              </p>
            </div>
            <div className="flex gap-3">
              
              <Button size="lg" className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)]" onClick={() => navigate("/create")}>
                <Plus className="h-5 w-5 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Global Reach Hero - Interactive Map */}
        <ScrollReveal direction="up" duration={0.5} delay={0.1}>
          <div className="relative w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden border border-border bg-card backdrop-blur-xl group">

            {/* Live Map Foundation - Seamless Tiling */}
            <div className="absolute inset-0 z-0">
              <MapContainer center={[39.5, -98.35]} zoom={4} minZoom={2} maxZoom={6} worldCopyJump={true} style={{
              height: "100%",
              width: "100%",
              background: 'hsl(var(--card))'
            }} zoomControl={false} attributionControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png" noWrap={false} />

                {campaignLocations.map((loc: any, idx: number) => (
                  <>
                    {/* Outer pulsing ring for active spots */}
                    <CircleMarker 
                      key={`pulse-${loc.name}-${idx}`} 
                      center={[loc.lat, loc.lng]} 
                      radius={25} 
                      pathOptions={{
                        fillColor: 'hsl(var(--primary))',
                        fillOpacity: 0.15,
                        color: 'hsl(var(--primary))',
                        weight: 2,
                        className: 'animate-ping'
                      }}
                    />
                    {/* Main active spot marker */}
                    <CircleMarker 
                      key={`${loc.name}-${idx}`} 
                      center={[loc.lat, loc.lng]} 
                      radius={12} 
                      pathOptions={{
                        fillColor: 'hsl(var(--primary))',
                        fillOpacity: 0.7,
                        color: 'hsl(var(--background))',
                        weight: 3,
                        className: 'animate-pulse'
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <p className="font-bold text-[10px] uppercase tracking-widest text-primary">Live Broadcast</p>
                          </div>
                          <p className="font-bold text-sm text-foreground">{loc.campaignTitle}</p>
                          <p className="text-xs text-muted-foreground mt-1">{loc.name}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </>
                ))}

                <LeafletGeoJSON data={usStatesData as any} style={feature => {
                const isActive = activeStateNames.has(feature?.properties?.name);
                return {
                  fillColor: isActive ? 'hsl(var(--primary))' : 'transparent',
                  weight: isActive ? 2 : 0,
                  opacity: 1,
                  color: isActive ? 'hsl(var(--primary))' : 'transparent',
                  fillOpacity: isActive ? 0.35 : 0
                };
              }} onEachFeature={(feature, layer) => {
                const isActive = activeStateNames.has(feature?.properties?.name);
                if (isActive) {
                  layer.bindPopup(`
                    <div style="padding: 8px;">
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                        <div style="height: 8px; width: 8px; border-radius: 50%; background: hsl(var(--primary));"></div>
                        <p style="font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: hsl(var(--primary));">Live Broadcast</p>
                      </div>
                      <p style="font-weight: 700; font-size: 14px;">Demo Campaign</p>
                      <p style="font-size: 12px; color: #888; margin-top: 4px;">${feature.properties.name}, US</p>
                    </div>
                  `);
                }
              }} />
              </MapContainer>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/60 to-transparent z-10 pointer-events-none" />

            {/* Live Data HUD */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Live Broadcast Telemetry</span>
              </div>
              {activeCampaigns.length > 0 && <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">
                  Streaming to {activeCampaigns.length} Active Nodes
                </div>}
              {selectedRegion && <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary uppercase text-[10px]">
                  Region: {selectedRegion}
                </Badge>}
            </div>

            {/* Hero Metrics Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row justify-between items-end gap-6 z-20">
              <div className="space-y-1">
                <h3 className="text-primary font-bold uppercase tracking-widest text-xs mb-1 opacity-80 flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Global Audience Impact
                </h3>
                <div className="text-5xl lg:text-6xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-lg">
                  {kpiStats.totalHouseholds}<span className="text-2xl text-muted-foreground font-normal ml-3">Million HH Reach</span>
                </div>
              </div>
              <div className="flex gap-8 text-right bg-card/80 backdrop-blur-md p-6 rounded-2xl border border-border">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">Active Spots</p>
                  <p className="text-2xl font-black text-foreground">{campaignLocations.length > 0 ? campaignLocations.length : 2}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">Network Load</p>
                  <p className={`text-2xl font-black ${activeCampaigns.length > 3 ? 'text-red-500' : activeCampaigns.length > 1 ? 'text-amber-500' : activeCampaigns.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {activeCampaigns.length > 3 ? 'Critical' : activeCampaigns.length > 1 ? 'High' : activeCampaigns.length > 0 ? 'Normal' : 'Idle'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">Latency</p>
                  <p className={`text-2xl font-black ${activeCampaigns.length > 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {Math.max(8, 8 + activeCampaigns.length * 4)}ms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Key Performance Indicators - Real Data */}
        <ScrollReveal direction="up" duration={0.5} delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Ad Spend" value={kpiStats.totalSpend} trend={kpiStats.spendTrend} icon={<Zap className="h-5 w-5 text-amber-500" />} color="from-amber-500/10 to-transparent" />
            <StatCard title="Completed Views" value={kpiStats.completedViews} trend={kpiStats.viewsTrend} icon={<Tv className="h-5 w-5 text-primary" />} color="from-primary/10 to-transparent" />
            <StatCard title="Avg. Lift Rate" value={kpiStats.liftRate} trend={kpiStats.liftTrend} icon={<TrendingUp className="h-5 w-5 text-indigo-500" />} color="from-indigo-500/10 to-transparent" />
            <StatCard title="Compliance Score" value={kpiStats.complianceScore} trend={kpiStats.complianceTrend} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} color="from-emerald-500/10 to-transparent" />
          </div>
        </ScrollReveal>

        {/* On-Air Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Active Campaigns List */}
          <div className="lg:col-span-2">
            <div className="bg-card/40 border border-border/50 rounded-2xl p-6 h-full space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  On-Air Status
                </h2>
                <Button variant="link" className="text-muted-foreground" onClick={() => navigate("/campaigns")}>View All</Button>
              </div>
              <div className="space-y-3">
                {filteredCampaigns.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    <Tv className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {selectedRegion ? `No campaigns in this region` : `No campaigns yet`}
                    </p>
                    {selectedRegion ? <Button variant="link" className="mt-2" onClick={() => setSelectedRegion(null)}>
                        Clear filter
                      </Button> : <Button variant="link" className="mt-2" onClick={() => navigate("/create")}>
                        Create your first campaign
                      </Button>}
                  </div> : filteredCampaigns.map((campaign, i) => {
                    // Extract video URL from storyboard
                    const storyboard = campaign.storyboard as any;
                    const videoUrl = storyboard?.selectedScript?.generatedVideoUrl || 
                                     storyboard?.generatedVideoUrl || 
                                     storyboard?.videoUrl || null;
                    
                    return (
                      <motion.div 
                        key={campaign.id} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.3 + i * 0.1 }} 
                        className="group bg-background/50 border border-border/50 hover:border-primary rounded-xl p-3 flex items-center gap-4 transition-all cursor-pointer" 
                        onClick={() => navigate(getCampaignRoute(campaign as any))}
                      >
                        <div 
                          className="relative h-16 w-28 rounded-lg overflow-hidden bg-muted flex items-center justify-center"
                          onMouseEnter={(e) => {
                            const video = e.currentTarget.querySelector('video');
                            if (video) video.play();
                          }}
                          onMouseLeave={(e) => {
                            const video = e.currentTarget.querySelector('video');
                            if (video) {
                              video.pause();
                              video.currentTime = 0;
                            }
                          }}
                        >
                          {videoUrl ? (
                            <>
                              <video 
                                src={videoUrl} 
                                className="absolute inset-0 w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 group-hover:opacity-0 transition-opacity">
                                <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                                  <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-foreground border-b-[5px] border-b-transparent ml-0.5" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <Tv className="h-6 w-6 text-muted-foreground" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent pointer-events-none" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors text-foreground">{campaign.title}</h3>
                            {isCampaignComplete(campaign as any) ? (
                              <Badge variant="outline" className={`
                                ${campaign.status === 'live' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : ''}
                                ${campaign.status === 'scheduled' ? 'text-amber-600 dark:text-amber-400 border-amber-500/30' : ''}
                                ${campaign.status === 'concept' ? 'text-blue-600 dark:text-blue-400 border-blue-500/30' : ''}
                                ${campaign.status === 'paused' || campaign.status === 'draft' ? 'text-muted-foreground border-border' : ''}
                                ${campaign.status === 'video_generated' ? 'text-primary border-primary/30' : ''}
                                uppercase text-[10px] h-5
                              `}>
                                {campaign.status === 'live' && <span className="mr-1.5 relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>}
                                {campaign.status || 'draft'}
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 uppercase text-[10px] h-5 gap-1">
                                <FileText className="h-3 w-3" />
                                {getCampaignStageLabel(campaign as any)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {getNetworkForCampaign(i)}</span>
                            <span className="flex items-center gap-1 capitalize"><Activity className="h-3 w-3" /> {campaign.ad_type}</span>
                            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {campaign.goal}</span>
                          </div>
                        </div>

                        <div className="px-4">
                          <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground">
                            <ArrowUpRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Spendings Panel */}
          <ScrollReveal direction="left" duration={0.5} delay={0.4}>
            <div className="bg-card/40 border border-border/50 rounded-2xl p-6 h-full space-y-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Spendings</h3>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/30 text-primary">This Month</Badge>
              </div>

              {/* Budget Status */}
              {/* Total Spend Highlight */}
              <div className="text-center py-3 pb-4 border-b border-border/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Spend</p>
                <p className="text-4xl font-black tracking-tight text-foreground">$24,850</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-500">+12.4%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget Used</span>
                  <span className="text-xs font-bold text-foreground">78%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: '78%' }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>$24,850 spent</span>
                  <span>$31,850 budget</span>
                </div>
              </div>

              {/* Spend Breakdown */}
              <div className="space-y-3">
                <SpendRow label="Media Buying" amount="$14,200" percentage={57} color="bg-primary" />
                <SpendRow label="Production" amount="$6,400" percentage={26} color="bg-blue-500" />
                <SpendRow label="Distribution" amount="$3,100" percentage={12} color="bg-amber-500" />
                <SpendRow label="Analytics" amount="$1,150" percentage={5} color="bg-purple-500" />
              </div>
            </div>
          </ScrollReveal>
        </div>


      </div>
    </DashboardLayout>;
};

// --- Sub-Components ---

const StatCard = ({
  title,
  value,
  trend,
  icon,
  color
}: any) => <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden relative group hover:border-primary/30 transition-all">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
    <CardContent className="px-3 py-2.5 relative">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
        <div className="p-1 bg-background/80 rounded-md border border-border shadow-sm [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </div>
      </div>
      <h4 className="text-xl font-bold tracking-tight text-foreground">{value}</h4>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
          {trend}
        </div>
        <span className="text-[10px] text-muted-foreground">vs 30d</span>
      </div>
    </CardContent>
  </Card>;

const SpendRow = ({ label, amount, percentage, color }: { label: string; amount: string; percentage: number; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{amount}</span>
    </div>
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

export default Dashboard;