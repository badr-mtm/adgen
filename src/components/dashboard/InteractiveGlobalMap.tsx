import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Region {
  id: string;
  name: string;
  label: string;
  position: { top: string; left: string };
  campaigns: number;
  reach: string;
  status: "active" | "high-volume" | "growing" | "new";
}

const REGIONS: Region[] = [
  { id: "na", name: "North America", label: "NA", position: { top: "35%", left: "22%" }, campaigns: 12, reach: "18.2M", status: "active" },
  { id: "eu", name: "Europe", label: "EU", position: { top: "28%", left: "52%" }, campaigns: 8, reach: "14.5M", status: "high-volume" },
  { id: "apac", name: "Asia Pacific", label: "APAC", position: { top: "45%", left: "75%" }, campaigns: 5, reach: "8.1M", status: "growing" },
  { id: "latam", name: "Latin America", label: "LATAM", position: { top: "60%", left: "30%" }, campaigns: 3, reach: "2.0M", status: "new" },
];

const statusColors: Record<string, { bg: string; text: string; glow: string }> = {
  active: { bg: "bg-primary", text: "text-primary", glow: "hsl(var(--primary))" },
  "high-volume": { bg: "bg-indigo-500", text: "text-indigo-500", glow: "#6366f1" },
  growing: { bg: "bg-amber-500", text: "text-amber-500", glow: "#f59e0b" },
  new: { bg: "bg-emerald-500", text: "text-emerald-500", glow: "#10b981" },
};

interface Props {
  onRegionSelect: (regionId: string | null) => void;
  selectedRegion: string | null;
  totalHouseholds: string;
  activeNetworks: number;
  avgCpm: string;
  liveSpots: number;
}

export function InteractiveGlobalMap({ 
  onRegionSelect, 
  selectedRegion,
  totalHouseholds,
  activeNetworks,
  avgCpm,
  liveSpots
}: Props) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const selectedRegionData = REGIONS.find(r => r.id === selectedRegion);

  return (
    <div className="relative w-full h-[300px] lg:h-[400px] rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-b from-card/60 to-card backdrop-blur-xl group">
      {/* Abstract Map Background */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center bg-no-repeat grayscale contrast-125 dark:invert-[.85]" />

      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Interactive Region Beacons */}
      {REGIONS.map((region) => {
        const colors = statusColors[region.status];
        const isSelected = selectedRegion === region.id;
        const isHovered = hoveredRegion === region.id;

        return (
          <motion.button
            key={region.id}
            className="absolute group/beacon focus:outline-none"
            style={{ top: region.position.top, left: region.position.left }}
            onClick={() => onRegionSelect(isSelected ? null : region.id)}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              {/* Ping animation */}
              <div 
                className={`absolute -inset-4 rounded-full animate-ping ${colors.bg}/30`}
                style={{ animationDelay: `${REGIONS.indexOf(region) * 200}ms` }}
              />
              {/* Main beacon */}
              <div 
                className={`h-4 w-4 ${colors.bg} rounded-full transition-all duration-300 ${isSelected ? 'ring-4 ring-offset-2 ring-offset-background ring-primary' : ''}`}
                style={{ 
                  boxShadow: `0 0 ${isSelected || isHovered ? '25px' : '15px'} ${colors.glow}`
                }}
              />
              
              {/* Hover/Selected tooltip */}
              <AnimatePresence>
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
                  >
                    <div className="bg-popover text-popover-foreground text-xs font-medium px-3 py-2 rounded-lg border border-border shadow-lg whitespace-nowrap">
                      <div className="font-bold">{region.name}</div>
                      <div className="text-muted-foreground mt-1">
                        {region.campaigns} campaigns · {region.reach} reach
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 ${colors.text} border-current/30 text-[10px] uppercase`}
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
            className="absolute top-4 left-4 right-4 z-10"
          >
            <div className="bg-popover/95 backdrop-blur-md border border-border rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className={`h-5 w-5 ${statusColors[selectedRegionData.status].text}`} />
                <div>
                  <span className="font-bold text-foreground">{selectedRegionData.name}</span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    Filtering {selectedRegionData.campaigns} campaigns
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onRegionSelect(null)}
              >
                <X className="h-4 w-4" />
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
      <div className="absolute top-4 right-4 hidden lg:flex gap-2">
        {Object.entries(statusColors).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`h-2 w-2 rounded-full ${colors.bg}`} />
            <span className="capitalize">{status.replace("-", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
