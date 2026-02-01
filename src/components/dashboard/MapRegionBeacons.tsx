import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  title: string;
  status: string;
  target_audience?: any;
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
  { id: "na", name: "North America", label: "NA", position: { top: "32%", left: "20%" }, keywords: ["north america", "usa", "us", "united states", "canada", "new york", "los angeles", "chicago", "california", "texas", "florida"] },
  { id: "eu", name: "Europe", label: "EU", position: { top: "25%", left: "48%" }, keywords: ["europe", "uk", "germany", "france", "spain", "italy", "london", "paris", "berlin"] },
  { id: "apac", name: "Asia Pacific", label: "APAC", position: { top: "40%", left: "75%" }, keywords: ["asia", "pacific", "japan", "china", "australia", "india", "tokyo", "singapore", "sydney"] },
  { id: "latam", name: "Latin America", label: "LATAM", position: { top: "60%", left: "28%" }, keywords: ["latin america", "brazil", "mexico", "argentina", "south america"] },
];

const getStatusFromCampaignCount = (count: number): "dormant" | "new" | "growing" | "active" | "high-volume" => {
  if (count === 0) return "dormant";
  if (count === 1) return "new";
  if (count <= 3) return "growing";
  if (count <= 7) return "active";
  return "high-volume";
};

const statusStyles: Record<string, { bg: string; text: string; glow: string; color: string }> = {
  dormant: { bg: "bg-muted", text: "text-muted-foreground", glow: "transparent", color: "#71717a" },
  new: { bg: "bg-emerald-500", text: "text-emerald-500", glow: "rgba(16, 185, 129, 0.4)", color: "#10b981" },
  growing: { bg: "bg-amber-500", text: "text-amber-500", glow: "rgba(245, 158, 11, 0.4)", color: "#f59e0b" },
  active: { bg: "bg-primary", text: "text-primary", glow: "rgba(var(--primary), 0.4)", color: "hsl(var(--primary))" },
  "high-volume": { bg: "bg-indigo-500", text: "text-indigo-500", glow: "rgba(99, 102, 241, 0.4)", color: "#6366f1" },
};

interface MapRegionBeaconsProps {
  campaigns: Campaign[];
  selectedRegion: string | null;
  onRegionSelect: (regionId: string | null) => void;
  hoveredRegion: string | null;
  onHoverRegion: (regionId: string | null) => void;
}

export function MapRegionBeacons({
  campaigns,
  selectedRegion,
  onRegionSelect,
  hoveredRegion,
  onHoverRegion,
}: MapRegionBeaconsProps) {
  // Calculate dynamic region data from campaigns
  const regionData = useMemo(() => {
    return REGION_CONFIGS.map(config => {
      const matchingCampaigns = campaigns.filter(campaign => {
        const audience = campaign.target_audience;
        if (!audience) return false;
        const audienceStr = JSON.stringify(audience).toLowerCase();
        return config.keywords.some(keyword => audienceStr.includes(keyword));
      });

      const activeCampaigns = matchingCampaigns.filter(c => c.status === 'active' || c.status === 'live');
      const totalReach = matchingCampaigns.length * 2.1;
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

  return (
    <>
      {/* Interactive Region Beacons */}
      {regionData.map((region, idx) => {
        const styles = statusStyles[region.status];
        const isSelected = selectedRegion === region.id;
        const isHovered = hoveredRegion === region.id;
        const hasActivity = region.campaigns > 0;
        const beaconSize = hasActivity ? Math.min(28, 14 + region.campaigns * 3) : 14;

        return (
          <motion.button
            key={region.id}
            className="absolute z-30 focus:outline-none cursor-pointer"
            style={{ top: region.position.top, left: region.position.left }}
            onClick={(e) => {
              e.stopPropagation();
              onRegionSelect(isSelected ? null : region.id);
            }}
            onMouseEnter={() => onHoverRegion(region.id)}
            onMouseLeave={() => onHoverRegion(null)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="relative">
              {/* Outer pulse ring for active regions */}
              {hasActivity && (
                <motion.div 
                  className="absolute rounded-full border-2"
                  style={{
                    width: beaconSize + 20,
                    height: beaconSize + 20,
                    top: -10,
                    left: -10,
                    borderColor: styles.color,
                    opacity: 0.3,
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              
              {/* Live ping animation */}
              {region.isLive && (
                <motion.div 
                  className="absolute rounded-full"
                  style={{
                    width: beaconSize + 30,
                    height: beaconSize + 30,
                    top: -15,
                    left: -15,
                    backgroundColor: styles.color,
                    opacity: 0.2,
                  }}
                  animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: idx * 0.2 }}
                />
              )}
              
              {/* Main beacon */}
              <motion.div 
                className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'ring-4 ring-offset-2 ring-offset-card ring-primary' : ''}`}
                style={{ 
                  width: beaconSize,
                  height: beaconSize,
                  backgroundColor: styles.color,
                  boxShadow: hasActivity ? `0 0 ${isSelected || isHovered ? '35px' : '25px'} ${styles.glow}` : 'none'
                }}
                animate={hasActivity ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {region.isLive && (
                  <Radio className="text-white" style={{ width: beaconSize * 0.45, height: beaconSize * 0.45 }} />
                )}
              </motion.div>

              {/* Campaign count badge */}
              {region.campaigns > 0 && (
                <motion.div 
                  className="absolute -top-1.5 -right-1.5 h-5 min-w-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center px-1.5 shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 + 0.2, type: "spring" }}
                >
                  {region.campaigns}
                </motion.div>
              )}
              
              {/* Tooltip */}
              <AnimatePresence>
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50"
                  >
                    <div className="bg-popover text-popover-foreground text-xs font-medium px-4 py-3 rounded-xl border border-border shadow-2xl whitespace-nowrap min-w-[180px]">
                      <div className="font-bold text-sm mb-2 flex items-center gap-2">
                        {region.name}
                        {region.isLive && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Campaigns</span>
                          <span className="font-semibold text-foreground">{region.campaigns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. Reach</span>
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
                        className={`mt-2.5 ${styles.text} border-current/30 text-[10px] uppercase w-full justify-center`}
                      >
                        {region.status === 'dormant' ? 'No Activity' : region.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        );
      })}

      {/* Selected Region Banner */}
      <AnimatePresence>
        {selectedRegionData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-popover/95 backdrop-blur-md border border-border rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xl">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: statusStyles[selectedRegionData.status].color }}
              />
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{selectedRegionData.name}</span>
                <span className="text-muted-foreground text-sm">
                  {selectedRegionData.campaigns} campaign{selectedRegionData.campaigns !== 1 ? 's' : ''}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 ml-1"
                onClick={() => onRegionSelect(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-28 right-6 z-30 hidden lg:flex flex-col gap-1.5 bg-card/80 backdrop-blur-md p-3 rounded-xl border border-border">
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Activity Level</span>
        {Object.entries(statusStyles).filter(([key]) => key !== 'dormant').map(([status, style]) => (
          <div key={status} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: style.color }} />
            <span className="capitalize text-[10px]">{status.replace("-", " ")}</span>
          </div>
        ))}
      </div>
    </>
  );
}
