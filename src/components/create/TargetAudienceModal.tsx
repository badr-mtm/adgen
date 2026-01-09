import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Target,
  Sparkles,
  Users,
  Check,
  ChevronRight
} from "lucide-react";

export interface AudienceData {
  locations: string[];
  inMarketInterests: string[];
  ageRanges: string[];
}

interface TargetAudienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onContinue: (audience: AudienceData) => void;
  campaignDescription?: string;
}

const INTERESTS = [
  "Tech Enthusiasts", "Fashion Forward", "Fitness Buffs", "Foodies",
  "Business Pros", "Gamers", "Parents", "Travelers", "Luxury Shoppers", "Sports Fans"
];

export function TargetAudienceModal({
  open,
  onOpenChange,
  onBack,
  onContinue,
  campaignDescription = ""
}: TargetAudienceModalProps) {

  const [data, setData] = useState<AudienceData>({
    locations: ["United States"],
    inMarketInterests: [],
    ageRanges: ["25-34", "35-44"]
  });

  // Simple AI Simulate
  useEffect(() => {
    if (open && campaignDescription) {
      const lower = campaignDescription.toLowerCase();
      const newInterests = [];
      if (lower.includes('tech') || lower.includes('app')) newInterests.push("Tech Enthusiasts");
      if (lower.includes('fashion') || lower.includes('style')) newInterests.push("Fashion Forward");
      if (lower.includes('gym') || lower.includes('health')) newInterests.push("Fitness Buffs");
      if (newInterests.length > 0) setData(prev => ({ ...prev, inMarketInterests: newInterests }));
    }
  }, [open, campaignDescription]);

  const toggleInterest = (i: string) => {
    setData(prev => ({
      ...prev,
      inMarketInterests: prev.inMarketInterests.includes(i)
        ? prev.inMarketInterests.filter(item => item !== i)
        : [...prev.inMarketInterests, i]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl bg-black/95 border-white/10 p-0 overflow-hidden h-[600px] backdrop-blur-3xl shadow-2xl">
        <div className="flex h-full">

          {/* Left: Interactive Map / Summary */}
          <div className="w-[350px] bg-card/10 border-r border-white/10 p-0 relative flex flex-col">
            {/* Fake Map Background */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center grayscale invert" />

            <div className="relative z-10 p-6 flex flex-col h-full bg-gradient-to-b from-black/80 via-black/40 to-black/80">
              <button onClick={onBack} className="text-white/60 hover:text-white mb-6 flex items-center gap-2 text-sm transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Goal
              </button>

              <div className="mt-auto space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Estimated Reach</div>
                  <div className="text-4xl font-black text-white">14.2M <span className="text-lg font-normal text-white/40">Households</span></div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Audience Quality</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-green-500 shadow-[0_0_10px_#22c55e]" />
                    </div>
                    <span className="text-green-500 font-bold text-sm">Excellent</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-white">AI Optimization Active</p>
                      <p className="text-xs text-white/60 mt-1">We've automatically selected segments that match your prompt "{campaignDescription.slice(0, 20)}...".</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Selection Controls */}
          <div className="flex-1 p-10 bg-gradient-to-br from-black to-indigo-950/20 overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-2">Target Audience</h2>
            <p className="text-white/60 mb-8">Who are we broadcasting to?</p>

            <div className="space-y-8">

              {/* Location */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Location
                </label>
                <div className="flex flex-wrap gap-2">
                  {["United States", "Canada", "UK", "Europe"].map(loc => (
                    <Badge
                      key={loc}
                      variant="outline"
                      className={`px-4 py-2 text-sm cursor-pointer transition-all ${data.locations.includes(loc) ? 'bg-white text-black border-white' : 'text-white/50 border-white/20 hover:border-white/50'}`}
                      onClick={() => setData(d => ({ ...d, locations: d.locations.includes(loc) ? d.locations.filter(l => l !== loc) : [...d.locations, loc] }))}
                    >
                      {loc}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" /> Interests & Segments
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center justify-between transition-all ${data.inMarketInterests.includes(interest)
                          ? "bg-primary/20 text-primary border border-primary/50"
                          : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"
                        }`}
                    >
                      {interest}
                      {data.inMarketInterests.includes(interest) && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <Button
                  size="lg"
                  onClick={() => onContinue(data)}
                  className="h-14 px-8 text-lg bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)] group"
                >
                  Generate Script <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
