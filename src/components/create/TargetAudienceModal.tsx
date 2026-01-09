import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  MapPin,
  Target,
  Sparkles,
  Check,
  ChevronRight,
  Search,
  X
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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

// Predefined locations with coordinates for "FlyTo"
const LOCATION_DATA: Record<string, { lat: number; lng: number; zoom: number; type: string }> = {
  "United States": { lat: 37.0902, lng: -95.7129, zoom: 4, type: "Country" },
  "United Kingdom": { lat: 55.3781, lng: -3.4360, zoom: 6, type: "Country" },
  "Canada": { lat: 56.1304, lng: -106.3468, zoom: 4, type: "Country" },
  "Europe": { lat: 54.5260, lng: 15.2551, zoom: 4, type: "Region" },
  "California, US": { lat: 36.7783, lng: -119.4179, zoom: 6, type: "State" },
  "New York, US": { lat: 40.7128, lng: -74.0060, zoom: 7, type: "State" },
  "Texas, US": { lat: 31.9686, lng: -99.9018, zoom: 6, type: "State" },
  "London, UK": { lat: 51.5074, lng: -0.1278, zoom: 10, type: "City" },
  "Manchester, UK": { lat: 53.4808, lng: -2.2426, zoom: 11, type: "City" },
  "Paris, FR": { lat: 48.8566, lng: 2.3522, zoom: 11, type: "City" },
  "Berlin, DE": { lat: 52.5200, lng: 13.4050, zoom: 11, type: "City" },
};

// Map Controller to handle "FlyTo" animations
function MapController({ selectedLoc }: { selectedLoc: string | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLoc && LOCATION_DATA[selectedLoc]) {
      const { lat, lng, zoom } = LOCATION_DATA[selectedLoc];
      map.flyTo([lat, lng], zoom, {
        duration: 2, // Smooth 2s flight
        easeLinearity: 0.25
      });
    }
  }, [selectedLoc, map]);

  return null;
}

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

  const [openCombobox, setOpenCombobox] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string | null>("United States");

  // AI Simulate
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

  const addLocation = (loc: string) => {
    if (!data.locations.includes(loc)) {
      setData(prev => ({ ...prev, locations: [...prev.locations, loc] }));
      setActiveLocation(loc); // triggers map flyTo
    }
    setOpenCombobox(false);
  };

  const removeLocation = (loc: string) => {
    setData(prev => ({ ...prev, locations: prev.locations.filter(l => l !== loc) }));
    if (activeLocation === loc) setActiveLocation(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl bg-black/95 border-white/10 p-0 overflow-hidden h-[650px] backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row">

        {/* Left: Interactive Map */}
        <div className="w-full md:w-[450px] relative border-r border-white/10 flex flex-col">
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <button onClick={onBack} className="pointer-events-auto text-white/60 hover:text-white flex items-center gap-2 text-sm transition-colors backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full border border-white/5 hover:bg-black/40">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </div>

          <div className="flex-1 bg-gray-900 relative">
            <MapContainer
              center={[39.8283, -98.5795]}
              zoom={3}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              className="grayscale-[20%] brightness-75 bg-[#0a0a0a]" // Dark mode feel
            >
              {/* Darker tiles for command center vibe */}
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              <MapController selectedLoc={activeLocation} />

              {/* Markers for selected locations */}
              {data.locations.map(loc => {
                const info = LOCATION_DATA[loc];
                if (!info) return null;
                return (
                  <Marker key={loc} position={[info.lat, info.lng]} />
                )
              })}
            </MapContainer>

            {/* Map Overlays */}
            <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Estimated Reach</div>
                  <div className="text-3xl font-black text-white">14.2M <span className="text-sm font-normal text-white/40">Households</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-400">Live Audience Signal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selection Controls */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-zinc-900 to-black">
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-8">

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Target Audience</h2>
                <p className="text-white/60 text-sm">Define your broadcast reach and demographic precision.</p>
              </div>

              {/* Location Selector */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-primary" /> Geographic Targeting
                </label>

                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-12"
                    >
                      {activeLocation ? `Selected: ${activeLocation}` : "Select region, country, state or city..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 bg-zinc-950 border-white/10 text-white">
                    <Command className="bg-transparent">
                      <CommandInput placeholder="Search locations..." className="h-11 border-none focus:ring-0 text-white" />
                      <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup heading="Countries">
                          {Object.keys(LOCATION_DATA).filter(k => LOCATION_DATA[k].type === "Country").map((loc) => (
                            <CommandItem
                              key={loc}
                              value={loc}
                              onSelect={() => addLocation(loc)}
                              className="text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.locations.includes(loc) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {loc}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading="States & Regions">
                          {Object.keys(LOCATION_DATA).filter(k => ["State", "Region"].includes(LOCATION_DATA[k].type)).map((loc) => (
                            <CommandItem
                              key={loc}
                              value={loc}
                              onSelect={() => addLocation(loc)}
                              className="text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.locations.includes(loc) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {loc}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading="Cities">
                          {Object.keys(LOCATION_DATA).filter(k => LOCATION_DATA[k].type === "City").map((loc) => (
                            <CommandItem
                              key={loc}
                              value={loc}
                              onSelect={() => addLocation(loc)}
                              className="text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.locations.includes(loc) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {loc}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Selected Locations Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.locations.map(loc => (
                    <Badge
                      key={loc}
                      variant="outline"
                      className="px-3 py-1.5 text-sm bg-primary/10 text-primary border-primary/30 flex items-center gap-2 group cursor-pointer hover:bg-primary/20 transition-all"
                      onClick={() => setActiveLocation(loc)} // Fly to on click
                    >
                      {loc}
                      <X
                        className="h-3 w-3 hover:text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); removeLocation(loc); }}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <Target className="h-3 w-3 text-purple-400" /> Audience Interests
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center justify-between transition-all duration-300 ${data.inMarketInterests.includes(interest)
                        ? "bg-purple-500/20 text-purple-200 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                        : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:border-white/20"
                        }`}
                    >
                      {interest}
                      {data.inMarketInterests.includes(interest) && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>

                {/* AI Insight Box */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Smart Targeting Active</p>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">
                        Our AI has analyzed your campaign goal "{campaignDescription.slice(0, 15)}..." and auto-selected relevant interests.
                        Clicking "Generate Script" will use these to tailor the narrative.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end backdrop-blur-lg">
            <Button
              size="lg"
              onClick={() => onContinue(data)}
              className="h-12 px-8 bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)] font-bold tracking-wide transition-all hover:scale-105"
            >
              Confirm Target <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
