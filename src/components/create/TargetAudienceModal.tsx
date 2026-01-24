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
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON as LeafletGeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LOCATION_DATA } from "@/lib/locations";
import usStatesData from "@/lib/us-states.json";

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
      <DialogContent className="sm:max-w-5xl bg-background border-border p-0 overflow-hidden h-[650px] backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row">

        {/* Left: Interactive Map */}
        <div className="w-full md:w-[450px] relative border-r border-border flex flex-col">
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-background/80 to-transparent pointer-events-none">
            <button onClick={onBack} className="pointer-events-auto text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors backdrop-blur-sm bg-background/60 px-3 py-1.5 rounded-full border border-border hover:bg-background/80">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </div>

          <div className="flex-1 bg-muted relative">
            <MapContainer
              center={[39.8283, -98.5795]}
              zoom={3}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              className="brightness-95 dark:brightness-75 dark:grayscale-[20%]"
            >
              {/* Use light tiles for light mode, dark for dark mode */}
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                className="dark:hidden"
              />
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                className="hidden dark:block"
              />

              <MapController selectedLoc={activeLocation} />

              <LeafletGeoJSON
                data={usStatesData as any}
                style={(feature) => {
                  const isSelected = data.locations.includes(feature?.properties?.name);
                  return {
                    fillColor: isSelected ? 'hsl(85, 45%, 45%)' : 'transparent',
                    weight: isSelected ? 2 : 1,
                    opacity: 1,
                    color: isSelected ? 'hsl(85, 45%, 45%)' : 'hsl(120, 10%, 50%)',
                    dashArray: isSelected ? '' : '3',
                    fillOpacity: isSelected ? 0.5 : 0.1
                  };
                }}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    mouseover: (e) => {
                      const layer = e.target;
                      if (!data.locations.includes(feature.properties.name)) {
                        layer.setStyle({
                          weight: 2,
                          color: 'hsl(85, 45%, 55%)',
                          fillOpacity: 0.3,
                          fillColor: 'hsl(85, 45%, 45%)'
                        });
                      }
                    },
                    mouseout: (e) => {
                      const layer = e.target;
                      if (!data.locations.includes(feature.properties.name)) {
                        layer.setStyle({
                          weight: 1,
                          color: 'hsl(120, 10%, 50%)',
                          dashArray: '3',
                          fillOpacity: 0.1,
                          fillColor: 'transparent'
                        });
                      }
                    },
                    click: () => {
                      const stateName = feature.properties.name;
                      if (data.locations.includes(stateName)) {
                        removeLocation(stateName);
                      } else {
                        addLocation(stateName);
                      }
                    }
                  });
                }}
              />

              {/* Markers for selected locations */}
              {data.locations.map(loc => {
                const info = LOCATION_DATA[loc];
                if (!info) return null;
                return (
                  <Marker key={loc} position={[info.lat, info.lng]}>
                    <Popup className="text-foreground">
                      <strong>{loc}</strong><br />
                      {info.type}
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>

            {/* Map Overlays */}
            <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
              <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4 space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Estimated Reach</div>
                  <div className="text-3xl font-black text-foreground">14.2M <span className="text-sm font-normal text-muted-foreground">Households</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">Live Audience Signal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selection Controls */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-muted/50 to-background">
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-8">

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Target Audience</h2>
                <p className="text-muted-foreground text-sm">Define your broadcast reach and demographic precision.</p>
              </div>

              {/* Location Selector */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-primary" /> Geographic Targeting
                </label>

                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between bg-background border-border text-foreground hover:bg-muted h-12"
                    >
                      {activeLocation ? `Selected: ${activeLocation}` : "Select region, country, state or city..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 bg-popover border-border text-popover-foreground">
                    <Command className="bg-transparent">
                      <CommandInput placeholder="Search locations..." className="h-11 border-none focus:ring-0" />
                      <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup heading="Countries">
                          {Object.keys(LOCATION_DATA).filter(k => LOCATION_DATA[k].type === "Country").map((loc) => (
                            <CommandItem
                              key={loc}
                              value={loc}
                              onSelect={() => addLocation(loc)}
                              className="cursor-pointer"
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
                              className="cursor-pointer"
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
                              className="cursor-pointer"
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
                      onClick={() => setActiveLocation(loc)}
                    >
                      {loc}
                      <X
                        className="h-3 w-3 hover:text-primary-foreground transition-colors"
                        onClick={(e) => { e.stopPropagation(); removeLocation(loc); }}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Target className="h-3 w-3 text-primary" /> Audience Interests
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center justify-between transition-all duration-300 ${data.inMarketInterests.includes(interest)
                        ? "bg-primary/15 text-primary border border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
                        : "bg-muted/50 text-muted-foreground border border-border hover:bg-muted hover:border-border/80"
                        }`}
                    >
                      {interest}
                      {data.inMarketInterests.includes(interest) && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>

                {/* AI Insight Box */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-border backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Smart Targeting Active</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
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
          <div className="p-6 border-t border-border bg-background/60 flex justify-end backdrop-blur-lg">
            <Button
              size="lg"
              onClick={() => onContinue(data)}
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.25)] font-bold tracking-wide transition-all hover:scale-105"
            >
              Confirm Target <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
