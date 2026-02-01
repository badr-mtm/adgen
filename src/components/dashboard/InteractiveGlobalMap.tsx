import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Activity, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  title: string;
  status: string;
  target_audience?: {
    locations?: string[];
    demographics?: string[];
  } | null;
  predicted_ctr?: number;
}

interface RegionConfig {
  id: string;
  name: string;
  label: string;
  position: { top: string; left: string };
  keywords: string[];
}

const REGION_CONFIGS: RegionConfig[] = [
  { id: "na", name: "North America", label: "NA", position: { top: "35%", left: "22%" }, keywords: ["north america", "usa", "us", "united states", "canada", "new york", "los angeles", "chicago", "california", "texas", "florida"] },
  { id: "eu", name: "Europe", label: "EU", position: { top: "28%", left: "52%" }, keywords: ["europe", "uk", "germany", "france", "spain", "italy", "london", "paris", "berlin"] },
  { id: "apac", name: "Asia Pacific", label: "APAC", position: { top: "45%", left: "75%" }, keywords: ["asia", "pacific", "japan", "china", "australia", "india", "tokyo", "singapore", "sydney"] },
  { id: "latam", name: "Latin America", label: "LATAM", position: { top: "60%", left: "30%" }, keywords: ["latin america", "brazil", "mexico", "argentina", "south america"] },
];

const getStatusFromCampaignCount = (count: number): "dormant" | "new" | "growing" | "active" | "high-volume" => {
  if (count === 0) return "dormant";
  if (count === 1) return "new";
  if (count <= 3) return "growing";
  if (count <= 7) return "active";
  return "high-volume";
};

const statusColors: Record<string, { bg: string; text: string; glow: string; pulse: boolean }> = {
  dormant: { bg: "bg-muted", text: "text-muted-foreground", glow: "hsl(var(--muted))", pulse: false },
  new: { bg: "bg-emerald-500", text: "text-emerald-500", glow: "#10b981", pulse: true },
  growing: { bg: "bg-amber-500", text: "text-amber-500", glow: "#f59e0b", pulse: true },
  active: { bg: "bg-primary", text: "text-primary", glow: "hsl(var(--primary))", pulse: true },
  "high-volume": { bg: "bg-indigo-500", text: "text-indigo-500", glow: "#6366f1", pulse: true },
};

interface Props {
  onRegionSelect: (regionId: string | null) => void;
  selectedRegion: string | null;
  totalHouseholds: string;
  activeNetworks: number;
  avgCpm: string;
  liveSpots: number;
  campaigns?: Campaign[];
}

export function InteractiveGlobalMap({ 
  onRegionSelect, 
  selectedRegion,
  totalHouseholds,
  activeNetworks,
  avgCpm,
  liveSpots,
  campaigns = []
}: Props) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Calculate dynamic region data from campaigns
  const regionData = useMemo(() => {
    return REGION_CONFIGS.map(config => {
      // Find campaigns that match this region
      const matchingCampaigns = campaigns.filter(campaign => {
        const audience = campaign.target_audience;
        if (!audience) return false;
        const audienceStr = JSON.stringify(audience).toLowerCase();
        return config.keywords.some(keyword => audienceStr.includes(keyword));
      });

      const activeCampaigns = matchingCampaigns.filter(c => c.status === 'active' || c.status === 'live');
      const totalReach = matchingCampaigns.length * 2.1; // ~2.1M per campaign
      const avgCtr = matchingCampaigns.reduce((acc, c) => acc + (c.predicted_ctr || 0), 0) / (matchingCampaigns.length || 1);

      return {
        ...config,
        campaigns: matchingCampaigns.length,
        activeCampaigns: activeCampaigns.length,
        reach: totalReach > 0 ? `${totalReach.toFixed(1)}M` : "0",
        avgCtr: (avgCtr * 100).toFixed(1),
        status: getStatusFromCampaignCount(matchingCampaigns.length),
        isLive: activeCampaigns.length > 0,
      };
    });
  }, [campaigns]);

  const selectedRegionData = regionData.find(r => r.id === selectedRegion);
  const totalActiveCampaigns = regionData.reduce((acc, r) => acc + r.activeCampaigns, 0);

  return (
    <div className="relative w-full h-[300px] lg:h-[400px] rounded-3xl overflow-hidden border border-border bg-card backdrop-blur-xl group">
      {/* Abstract Map Background - Seamless Tiling Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='0.5' d='M0,250 Q250,200 500,250 T1000,250 M0,150 Q200,100 400,150 T800,150 T1000,150 M0,350 Q300,300 600,350 T1000,350'/%3E%3Ccircle cx='200' cy='180' r='3' fill='currentColor'/%3E%3Ccircle cx='500' cy='220' r='4' fill='currentColor'/%3E%3Ccircle cx='800' cy='200' r='3' fill='currentColor'/%3E%3Ccircle cx='150' cy='320' r='2' fill='currentColor'/%3E%3Ccircle cx='650' cy='350' r='3' fill='currentColor'/%3E%3C/svg%3E")`,
          backgroundSize: '600px 300px',
          backgroundRepeat: 'repeat',
        }}
      />
      {/* Dot Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Live Status Indicator */}
      {totalActiveCampaigns > 0 && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-primary/30">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {totalActiveCampaigns} Live Region{totalActiveCampaigns > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Interactive Region Beacons */}
      {regionData.map((region, idx) => {
        const colors = statusColors[region.status];
        const isSelected = selectedRegion === region.id;
        const isHovered = hoveredRegion === region.id;
        const hasActivity = region.campaigns > 0;

        return (
          <motion.button
            key={region.id}
            className="absolute group/beacon focus:outline-none"
            style={{ top: region.position.top, left: region.position.left }}
            onClick={() => onRegionSelect(isSelected ? null : region.id)}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
          >
            <div className="relative">
              {/* Outer ring for active regions */}
              {hasActivity && (
                <motion.div 
                  className={`absolute -inset-3 rounded-full border-2 ${colors.bg.replace('bg-', 'border-')}/40`}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              
              {/* Ping animation for live regions */}
              {region.isLive && (
                <div 
                  className={`absolute -inset-4 rounded-full animate-ping ${colors.bg}/30`}
                  style={{ animationDelay: `${idx * 200}ms`, animationDuration: '2s' }}
                />
              )}
              
              {/* Main beacon - size varies with campaign count */}
              <motion.div 
                className={`relative ${colors.bg} rounded-full transition-all duration-300 flex items-center justify-center ${isSelected ? 'ring-4 ring-offset-2 ring-offset-background ring-primary' : ''}`}
                style={{ 
                  width: hasActivity ? Math.min(24, 12 + region.campaigns * 2) : 12,
                  height: hasActivity ? Math.min(24, 12 + region.campaigns * 2) : 12,
                  boxShadow: hasActivity ? `0 0 ${isSelected || isHovered ? '30px' : '20px'} ${colors.glow}` : 'none'
                }}
                animate={colors.pulse ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {region.isLive && (
                  <Radio className="h-2.5 w-2.5 text-white" />
                )}
              </motion.div>

              {/* Campaign count badge */}
              {region.campaigns > 0 && (
                <div className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center px-1">
                  {region.campaigns}
                </div>
              )}
              
              {/* Hover/Selected tooltip */}
              <AnimatePresence>
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
                  >
                    <div className="bg-popover text-popover-foreground text-xs font-medium px-4 py-3 rounded-xl border border-border shadow-xl whitespace-nowrap min-w-[160px]">
                      <div className="font-bold text-sm mb-2">{region.name}</div>
                      <div className="space-y-1.5 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Campaigns</span>
                          <span className="font-semibold text-foreground">{region.campaigns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reach</span>
                          <span className="font-semibold text-foreground">{region.reach}</span>
                        </div>
                        {region.campaigns > 0 && (
                          <div className="flex justify-between">
                            <span>Avg CTR</span>
                            <span className="font-semibold text-foreground">{region.avgCtr}%</span>
                          </div>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`mt-2 ${colors.text} border-current/30 text-[10px] uppercase w-full justify-center`}
                      >
                        {region.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        );
      })}

      {/* Selected Region Filter Banner */}
      <AnimatePresence>
        {selectedRegionData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="bg-popover/95 backdrop-blur-md border border-border rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-lg">
              <div className={`h-3 w-3 rounded-full ${statusColors[selectedRegionData.status].bg}`} />
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{selectedRegionData.name}</span>
                <span className="text-muted-foreground text-sm">
                  {selectedRegionData.campaigns} campaign{selectedRegionData.campaigns !== 1 ? 's' : ''}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 ml-2"
                onClick={() => onRegionSelect(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Metrics Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-1">Global Broadcast Reach</h3>
          <div className="text-5xl font-black tabular-nums tracking-tighter text-foreground">
            {totalHouseholds}<span className="text-2xl text-muted-foreground font-normal ml-2">Million Households</span>
          </div>
        </div>
        <div className="flex gap-8 text-right">
          <div>
            <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Active Networks</p>
            <p className="text-2xl font-bold text-foreground">{activeNetworks}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Avg. CPM</p>
            <p className="text-2xl font-bold text-foreground">{avgCpm}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Live Spots</p>
            <p className="text-2xl font-bold text-primary">{liveSpots}+</p>
          </div>
        </div>
      </div>

      {/* Region Legend */}
      <div className="absolute top-4 right-4 hidden lg:flex gap-3">
        {Object.entries(statusColors).filter(([key]) => key !== 'dormant').map(([status, colors]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`h-2.5 w-2.5 rounded-full ${colors.bg}`} />
            <span className="capitalize text-[10px]">{status.replace("-", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
