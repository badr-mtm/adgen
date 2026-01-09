
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Plus, X, Sparkles, MapPin } from "lucide-react";
import { CampaignStrategy } from "@/types/videoEditor";
import { cn } from "@/lib/utils";

// Leaflet Imports
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface StrategyAudienceProps {
    strategy: CampaignStrategy;
    setStrategy: (s: CampaignStrategy) => void;
}

const INTEREST_CATEGORIES = {
    "Auto": ["Luxury Vehicles", "Electric Vehicles", "SUVs", "Sedans", "Auto Parts", "Car Insurance"],
    "Finance": ["Crypto Traders", "Credit Card Holders", "Home Loan Seekers", "High Net Worth", "Investors"],
    "Health & Wellness": ["Gym Goers", "Organic Food Buyers", "Yoga Enthusiasts", "Vitamin Shoppers"],
    "Technology": ["Tech Early Adopters", "Gamers", "Smartphone Users", "Software Developers"],
    "Travel": ["Business Travelers", "Luxury Vacations", "Family Travel", "Adventure Seekers"],
    "Shopping": ["Luxury Shoppers", "Bargain Hunters", "Fashionistas", "Home Decor"]
};

// Mock AI Suggestions
const AI_SUGGESTIONS = ["Luxury Vehicles", "High Net Worth", "Business Travelers", "Tech Early Adopters"];

// Helper component to handle map clicks
function LocationMarker({ onAddLocation }: { onAddLocation: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onAddLocation(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export function StrategyAudience({ strategy, setStrategy }: StrategyAudienceProps) {
    const [locationSearch, setLocationSearch] = React.useState("");
    // We'll store custom coordinates separate from the simple string list for this demo, 
    // or mix them. To keep it simple with the existing type (string[]), we'll add "Lat: x, Lng: y" strings 
    // or just use a local state for markers and sync "Custom Location" strings to strategy.
    const [markers, setMarkers] = useState<{ lat: number, lng: number, name: string }[]>([
        { lat: 39.8283, lng: -98.5795, name: "United States (Center)" } // Default center
    ]);

    const addLocation = () => {
        // For text search, we just add the string to the list as before
        // In a real app, we'd geocode this to a marker
        if (locationSearch && !strategy.targeting.locations.includes(locationSearch)) {
            const newLocs = [...strategy.targeting.locations, locationSearch];
            setStrategy({ ...strategy, targeting: { ...strategy.targeting, locations: newLocs } });
            setLocationSearch("");
        }
    };

    const removeLocation = (loc: string) => {
        const newLocs = strategy.targeting.locations.filter(l => l !== loc);
        setStrategy({ ...strategy, targeting: { ...strategy.targeting, locations: newLocs } });

        // Also remove from markers if it matches
        setMarkers(current => current.filter(m => m.name !== loc));
    };

    const handleMapClick = (lat: number, lng: number) => {
        const name = `Loc: ${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        setMarkers(prev => [...prev, { lat, lng, name }]);

        // Add to strategy strings
        if (!strategy.targeting.locations.includes(name)) {
            setStrategy({
                ...strategy,
                targeting: {
                    ...strategy.targeting,
                    locations: [...strategy.targeting.locations, name]
                }
            });
        }
    };

    const toggleInterest = (interest: string) => {
        const currentInterests = strategy.targeting.interests;
        const newInterests = currentInterests.includes(interest)
            ? currentInterests.filter(i => i !== interest)
            : [...currentInterests, interest];
        setStrategy({ ...strategy, targeting: { ...strategy.targeting, interests: newInterests } });
    };

    return (
        <Card className="w-full bg-white/5 border-white/10 backdrop-blur-sm shadow-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white"><Users className="w-5 h-5 text-blue-500" /> Audience Targeting</CardTitle>
                <CardDescription className="text-white/50">Define exactly who sees your ads with precision targeting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* Location Section - Real Map */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label className="text-base text-white">Locations</Label>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>AI Location Optimization: <strong className="text-purple-400">Active</strong></span>
                        </div>
                    </div>

                    <div className="relative border border-white/10 rounded-lg overflow-hidden h-[400px] bg-black/20 group z-0">
                        <MapContainer
                            center={[39.8283, -98.5795]}
                            zoom={4}
                            scrollWheelZoom={false}
                            style={{ height: "100%", width: "100%", zIndex: 0 }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            <LocationMarker onAddLocation={handleMapClick} />
                            {markers.map((marker, idx) => (
                                <Marker key={`${marker.lat}-${marker.lng}-${idx}`} position={[marker.lat, marker.lng]}>
                                    <Popup className="text-black">{marker.name}</Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {/* Overlay Search */}
                        <div className="absolute top-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 shadow-lg rounded-lg p-2 flex gap-2 z-[400]">
                            <Search className="w-5 h-5 text-white/40 my-auto ml-2" />
                            <Input
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addLocation()}
                                placeholder="Search country, state, city or zip code..."
                                className="border-0 focus-visible:ring-0 bg-transparent text-white placeholder:text-white/20"
                            />
                            <Button size="sm" onClick={addLocation} className="bg-white/10 hover:bg-white/20 text-white"><Plus className="w-4 h-4 mr-2" /> Add</Button>
                        </div>

                        {/* Selected Tags */}
                        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-[400] pointer-events-none">
                            <div className="pointer-events-auto flex flex-wrap gap-2">
                                {strategy.targeting.locations.map(loc => (
                                    <Badge key={loc} variant="secondary" className="bg-blue-600/90 text-white border-blue-400/20 shadow-lg pl-2 pr-1 py-1 flex items-center gap-1 group/badge transition-all hover:bg-red-500 hover:text-white">
                                        {loc}
                                        <button onClick={() => removeLocation(loc)} className="hover:bg-black/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-white/30">Click on the map to drop a pin.</p>
                </div>

                {/* Detailed Interests */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base text-white">In-Market & Interests</Label>
                        <Badge variant="outline" className="text-xs font-normal border-purple-500/30 text-purple-300 bg-purple-500/10">
                            <Sparkles className="w-3 h-3 mr-1" /> AI Recommended based on Intent
                        </Badge>
                    </div>
                    <div className="border border-white/10 rounded-lg p-4 bg-black/20">
                        <ScrollArea className="h-60 pr-4">
                            <div className="space-y-6">
                                {Object.entries(INTEREST_CATEGORIES).map(([category, interests]) => (
                                    <div key={category}>
                                        <h4 className="font-semibold text-sm mb-3 text-white/60 flex items-center gap-2">
                                            {category}
                                            {/* Show icon for categories with AI suggestions */}
                                            {interests.some(i => AI_SUGGESTIONS.includes(i)) && (
                                                <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400/20" />
                                            )}
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {interests.map(interest => {
                                                const isAiSuggested = AI_SUGGESTIONS.includes(interest);
                                                const isSelected = strategy.targeting.interests.includes(interest);

                                                return (
                                                    <div
                                                        key={interest}
                                                        onClick={() => toggleInterest(interest)}
                                                        className={cn(
                                                            "relative flex items-center space-x-2 border p-2 rounded-md cursor-pointer transition-all hover:shadow-sm overflow-hidden",
                                                            isSelected
                                                                ? "border-blue-500 bg-blue-500/10 shadow-inner"
                                                                : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10",
                                                            isAiSuggested && !isSelected && "border-yellow-500/30 bg-yellow-500/5"
                                                        )}
                                                    >
                                                        <Checkbox checked={isSelected} className={cn(isAiSuggested ? "border-yellow-500/50 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500" : "border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500")} />
                                                        <span className={cn("text-sm z-10", isSelected ? "text-white" : "text-white/70")}>{interest}</span>

                                                        {/* AI Suggestion Badge */}
                                                        {isAiSuggested && (
                                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600" />
                                                        )}
                                                        {isAiSuggested && isSelected && (
                                                            <Sparkles className="w-3 h-3 text-yellow-500 absolute right-2 opacity-50" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base text-white">Age Range</Label>
                            <span className="text-sm font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                {strategy.targeting.ageRange[0]} - {strategy.targeting.ageRange[1]}
                            </span>
                        </div>
                        <Slider
                            value={strategy.targeting.ageRange}
                            onValueChange={(val) => setStrategy({ ...strategy, targeting: { ...strategy.targeting, ageRange: val as [number, number] } })}
                            min={18}
                            max={65}
                            step={1}
                            className="w-full py-4 text-white"
                        />
                        <div className="flex justify-between text-xs text-white/30">
                            <span>18</span>
                            <span>65+</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base text-white">Gender</Label>
                        <Tabs value={(strategy.targeting.genders[0] as "male" | "female" | "all") === 'all' ? 'all' : (strategy.targeting.genders[0] as "male" | "female" | "all")} onValueChange={(v) => setStrategy({ ...strategy, targeting: { ...strategy.targeting, genders: [v] } })}>
                            <TabsList className="w-full h-10 bg-white/5 text-white/40">
                                <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">All Genders</TabsTrigger>
                                <TabsTrigger value="male" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Male</TabsTrigger>
                                <TabsTrigger value="female" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Female</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
