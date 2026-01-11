import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Tv,
  Globe,
  Activity,
  Zap,
  BarChart3,
  ArrowUpRight,
  Play,
  Clock,
  MapPin,
  TrendingUp,
  Signal
} from "lucide-react";

// --- Mock Data ---
const ACTIVE_REGIONS = [
  { id: 1, name: "North America", active: true, campaigns: 12 },
  { id: 2, name: "Europe", active: true, campaigns: 8 },
  { id: 3, name: "Asia Pacific", active: false, campaigns: 0 },
  { id: 4, name: "LATAM", active: true, campaigns: 3 },
];

const RECENT_CAMPAIGNS = [
  { id: 1, title: "Summer Launch", network: "Hulu", status: "live", viewers: "2.4M", thumbnail: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80" },
  { id: 2, title: "Brand Awareness", network: "Roku", status: "scheduled", viewers: "-", thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80" },
  { id: 3, title: "Q3 Retargeting", network: "Samsung TV", status: "paused", viewers: "850K", thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80" },
];

// Leaflet
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LOCATION_DATA } from "@/lib/locations";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch active campaigns for telemetry
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active');

      if (campaigns) setActiveCampaigns(campaigns);
      setLoading(false);
    };

    initializeDashboard();
  }, [navigate]);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    </DashboardLayout>
  );

  // Calculate coordinates for active campaigns
  const campaignLocations = activeCampaigns.flatMap(c => {
    const audience = c.target_audience as any;
    const locations = audience?.locations || [];
    return locations.map((locName: string) => ({
      ...LOCATION_DATA[locName],
      name: locName,
      campaignTitle: c.title
    })).filter((l: any) => l.lat !== undefined);
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background text-foreground p-6 space-y-8 max-w-[1600px] mx-auto">

        {/* Header Section */}
        <ScrollReveal direction="down" duration={0.4}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary/80">
                <Signal className="h-4 w-4 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">System Operational</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Command Center
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Global TV delivery status and real-time performance monitoring.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="h-12 border-white/10 hover:bg-white/5" onClick={() => navigate("/campaigns")}>
                <Activity className="h-4 w-4 mr-2" />
                Strategy Studio
              </Button>
              <Button size="lg" className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)]" onClick={() => navigate("/create")}>
                <Plus className="h-5 w-5 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Global Reach Hero */}
        <ScrollReveal direction="up" duration={0.5} delay={0.1}>
          <div className="relative w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden border border-white/5 bg-black/40 backdrop-blur-xl group">

            {/* Live Map Foundation */}
            <div className="absolute inset-0 z-0">
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%", background: '#0a0a0a' }}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {campaignLocations.map((loc: any, idx: number) => (
                  <CircleMarker
                    key={`${loc.name}-${idx}`}
                    center={[loc.lat, loc.lng]}
                    radius={15}
                    pathOptions={{
                      fillColor: 'hsl(var(--primary))',
                      fillOpacity: 0.4,
                      color: 'hsl(var(--primary))',
                      weight: 1,
                      className: 'animate-pulse'
                    }}
                  >
                    <Popup className="text-black">
                      <div className="p-1">
                        <p className="font-bold text-xs uppercase tracking-widest text-primary mb-1">Live Delivery</p>
                        <p className="font-bold text-sm">{loc.campaignTitle}</p>
                        <p className="text-xs text-muted-foreground">{loc.name}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Always show a few global beacons for depth if no active campaigns */}
                {campaignLocations.length === 0 && (
                  <>
                    <CircleMarker center={[40.7128, -74.0060]} radius={8} pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.2, color: '#3b82f6', weight: 1 }} />
                    <CircleMarker center={[51.5074, -0.1278]} radius={8} pathOptions={{ fillColor: '#6366f1', fillOpacity: 0.2, color: '#6366f1', weight: 1 }} />
                    <CircleMarker center={[35.6762, 139.6503]} radius={8} pathOptions={{ fillColor: '#8b5cf6', fillOpacity: 0.2, color: '#8b5cf6', weight: 1 }} />
                  </>
                )}
              </MapContainer>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/80 to-transparent z-10 pointer-events-none" />

            {/* Live Data HUD */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Broadcast Telemetry</span>
              </div>
              {activeCampaigns.length > 0 && (
                <div className="px-3 py-1 text-[10px] font-medium text-white/40 uppercase tracking-tighter">
                  Streaming to {activeCampaigns.length} Active Nodes
                </div>
              )}
            </div>

            {/* Hero Metrics Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row justify-between items-end gap-6 z-20">
              <div className="space-y-1">
                <h3 className="text-primary font-bold uppercase tracking-widest text-xs mb-1 opacity-80 flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Global Audience Impact
                </h3>
                <div className="text-5xl lg:text-6xl font-black tabular-nums tracking-tighter text-white drop-shadow-2xl">
                  {activeCampaigns.length > 0 ? (activeCampaigns.length * 4.2).toFixed(1) : "0.0"}<span className="text-2xl text-white/40 font-normal ml-3">Million HH Reach</span>
                </div>
              </div>
              <div className="flex gap-8 text-right bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/5">
                <div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Nodes</p>
                  <p className="text-2xl font-black text-white">{activeCampaigns.length}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Network Load</p>
                  <p className="text-2xl font-black text-primary">High</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Latency</p>
                  <p className="text-2xl font-black text-white">12ms</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Key Performance Indicators */}
        <ScrollReveal direction="up" duration={0.5} delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Ad Spend"
              value="$12,450"
              trend="+12%"
              icon={<Zap className="h-5 w-5 text-yellow-400" />}
              color="from-yellow-500/10 to-transparent"
            />
            <StatCard
              title="Completed Views"
              value="842.1K"
              trend="+5.4%"
              icon={<Tv className="h-5 w-5 text-primary" />}
              color="from-primary/10 to-transparent"
            />
            <StatCard
              title="Avg. Lift Rate"
              value="4.2%"
              trend="+0.8%"
              icon={<TrendingUp className="h-5 w-5 text-indigo-400" />}
              color="from-indigo-500/10 to-transparent"
            />
            <StatCard
              title="Compliance Score"
              value="100%"
              trend="Perfect"
              icon={<Activity className="h-5 w-5 text-emerald-400" />}
              color="from-emerald-500/10 to-transparent"
            />
          </div>
        </ScrollReveal>

        {/* On-Air Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Active Campaigns List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                On-Air Status
              </h2>
              <Button variant="link" className="text-muted-foreground" onClick={() => navigate("/campaigns")}>View All</Button>
            </div>
            <div className="space-y-3">
              {RECENT_CAMPAIGNS.map((campaign, i) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="group bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-xl p-3 flex items-center gap-4 transition-all"
                >
                  <div className="relative h-16 w-28 rounded-lg overflow-hidden bg-muted">
                    <img src={campaign.thumbnail} alt={campaign.title} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-1 right-1">
                      <img src="/placeholder.svg" className="h-4 w-4 opacity-50" /> {/* Network Logo Placeholder */}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{campaign.title}</h3>
                      <Badge variant="outline" className={`
                                ${campaign.status === 'live' ? 'text-green-400 border-green-400/30' : ''}
                                ${campaign.status === 'scheduled' ? 'text-yellow-400 border-yellow-400/30' : ''}
                                ${campaign.status === 'paused' ? 'text-muted-foreground border-border' : ''}
                                uppercase text-[10px] h-5
                             `}>
                        {campaign.status === 'live' && <span className="mr-1.5 relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span></span>}
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {campaign.network}</span>
                      <span className="flex items-center gap-1"><Tv className="h-3 w-3" /> {campaign.viewers} Viewers</span>
                    </div>
                  </div>

                  <div className="px-4">
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <ScrollReveal direction="left" duration={0.5} delay={0.4}>
            <div className="bg-card/40 border border-border/50 rounded-2xl p-6 h-full space-y-6 backdrop-blur-sm">
              <h3 className="font-bold text-lg">Quick Actions</h3>

              <div className="grid gap-3">
                <QuickAction
                  icon={<Tv className="h-5 w-5" />}
                  label="Generate New Ad"
                  desc="Create a new TV advertisement"
                  onClick={() => navigate("/create")}
                />
                <QuickAction
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Check Attribution"
                  desc="Analyze pixel performance"
                  onClick={() => navigate("/integrations")}
                />
                <QuickAction
                  icon={<Globe className="h-5 w-5" />}
                  label="Global Inventory"
                  desc="View real-time network availability"
                  onClick={() => navigate("/campaigns")}
                />
              </div>

              <div className="pt-4 border-t border-border/30">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">System Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500" /> API Gateway</span>
                    <span className="text-green-500 font-mono">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500" /> Rendering Engine</span>
                    <span className="text-green-500 font-mono">Idle</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-yellow-500" /> DSP Connection</span>
                    <span className="text-yellow-500 font-mono">Syncing</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>


      </div>
    </DashboardLayout>
  );
};

// --- Sub-Components ---

const StatCard = ({ title, value, trend, icon, color }: any) => (
  <Card className="border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden relative group">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <CardContent className="p-6 relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h4 className="text-3xl font-bold mt-1 tracking-tight">{value}</h4>
        </div>
        <div className="p-2 bg-background/50 rounded-lg border border-white/5 shadow-sm">
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/20">
          {trend}
        </div>
        <span className="text-xs text-muted-foreground">vs last 30 days</span>
      </div>
    </CardContent>
  </Card>
);

const QuickAction = ({ icon, label, desc, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 p-3 rounded-xl bg-background/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all text-left group w-full"
  >
    <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors border border-border shadow-sm">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{label}</h4>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
    <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
  </button>
);

export default Dashboard;