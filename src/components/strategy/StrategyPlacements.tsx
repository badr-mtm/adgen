
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MonitorPlay, Sparkles, Tv, Check, Search, Star, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { CampaignStrategy } from "@/types/videoEditor";
import { cn } from "@/lib/utils";

interface StrategyPlacementsProps {
  strategy: CampaignStrategy;
  setStrategy: (s: CampaignStrategy) => void;
}

type ChannelData = {
  name: string;
  audience: string;
  logoColor: string;
};

const CHANNELS_DATA: Record<string, ChannelData[]> = {
  "Sports": [
  { name: "ESPN", audience: "131.6M", logoColor: "bg-red-600" },
  { name: "Fox Sports", audience: "98.2M", logoColor: "bg-blue-600" },
  { name: "NBC Sports", audience: "85.4M", logoColor: "bg-purple-600" },
  { name: "CBS Sports", audience: "76.1M", logoColor: "bg-blue-500" },
  { name: "NFL Network", audience: "65.3M", logoColor: "bg-red-700" },
  { name: "NBA TV", audience: "42.8M", logoColor: "bg-orange-600" }],

  "News": [
  { name: "CNN", audience: "110.5M", logoColor: "bg-red-600" },
  { name: "MSNBC", audience: "95.2M", logoColor: "bg-blue-500" },
  { name: "Fox News", audience: "120.1M", logoColor: "bg-blue-800" },
  { name: "BBC World", audience: "88.4M", logoColor: "bg-red-700" },
  { name: "Bloomberg", audience: "45.2M", logoColor: "bg-foreground" }],

  "Entertainment": [
  { name: "TNT", audience: "145.2M", logoColor: "bg-yellow-500" },
  { name: "TBS", audience: "138.9M", logoColor: "bg-blue-400" },
  { name: "USA Network", audience: "122.5M", logoColor: "bg-slate-600" },
  { name: "FX", audience: "98.7M", logoColor: "bg-foreground" },
  { name: "AMC", audience: "87.3M", logoColor: "bg-yellow-600" },
  { name: "Bravo", audience: "76.2M", logoColor: "bg-blue-300" }],

  "Streaming TV": [
  { name: "Hulu", audience: "155.0M", logoColor: "bg-green-500" },
  { name: "Samsung TV", audience: "88.5M", logoColor: "bg-blue-600" },
  { name: "Pluto TV", audience: "72.1M", logoColor: "bg-purple-500" },
  { name: "Tubi", audience: "68.4M", logoColor: "bg-orange-500" },
  { name: "Roku Channel", audience: "92.3M", logoColor: "bg-purple-700" }]

};

const getAIScore = (channelName: string) => {
  const score = channelName.length * 7 % 50 + 50;
  return score > 40 ? score : score + 40;
};

export function StrategyPlacements({ strategy, setStrategy }: StrategyPlacementsProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("manual");
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({
    "Sports": true,
    "News": true,
    "Entertainment": true,
    "Streaming TV": true
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleChannel = (channel: string) => {
    const current = strategy.placements || [];
    const newPlacements = current.includes(channel) ?
    current.filter((c) => c !== channel) :
    [...current, channel];
    setStrategy({ ...strategy, placements: newPlacements });
  };

  const toggleAllInCategory = (category: string) => {
    const allChannels = CHANNELS_DATA[category].map((c) => c.name);
    const current = strategy.placements || [];
    const allSelected = allChannels.every((c) => current.includes(c));

    let newPlacements = [...current];
    if (allSelected) {
      newPlacements = newPlacements.filter((c) => !allChannels.includes(c));
    } else {
      allChannels.forEach((c) => {
        if (!newPlacements.includes(c)) newPlacements.push(c);
      });
    }
    setStrategy({ ...strategy, placements: newPlacements });
  };

  return (
    <Card className="w-full border-border backdrop-blur-sm shadow-card bg-primary-foreground">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground"><MonitorPlay className="w-5 h-5 text-primary" /> Placements & Channels</CardTitle>
                <CardDescription className="text-muted-foreground">Choose where your ads will appear across premium TV networks and streaming platforms.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted text-muted-foreground">
                        <TabsTrigger value="manual" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <Tv className="w-4 h-4" />
                            Apps & Channels
                        </TabsTrigger>
                        <TabsTrigger value="smart" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <Sparkles className="w-4 h-4" />
                            Auto Sports
                            <Badge variant="secondary" className="ml-2 text-[10px] bg-primary/20 text-primary">AI</Badge>
                        </TabsTrigger>
                    </TabsList>

                    {/* Manual Selection View with Icons & Audience */}
                    <TabsContent value="manual" className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                  placeholder="Search for channels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-11 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-primary/10" />

                            </div>
                        </div>

                        <div className="border border-border rounded-lg overflow-hidden bg-primary-foreground">
                            {/* List Header */}
                            <div className="flex items-center justify-between p-3 px-6 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                                <div>Available ({Object.values(CHANNELS_DATA).flat().length})</div>
                                <div className="flex gap-8">
                                    <span className="w-24 text-right">Weekly Est. Audience</span>
                                    <span className="w-16 text-right">Match</span>
                                </div>
                            </div>

                            <ScrollArea className="h-[600px]">
                                <div className="">
                                    {Object.entries(CHANNELS_DATA).map(([category, channels]) => {
                    const filteredChannels = channels.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
                    if (filteredChannels.length === 0) return null;

                    const isExpanded = expandedCategories[category];

                    return (
                      <div key={category} className="border-b border-border/50 last:border-0">
                                                {/* Category Header */}
                                                <div className="flex items-center p-4 bg-muted/40 hover:bg-muted/60 cursor-pointer select-none">
                                                    <button onClick={() => toggleCategory(category)} className="flex items-center gap-2 flex-1 text-foreground">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                                        <span className="font-semibold text-sm">{category}</span>
                                                    </button>
                                                    <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary/80 hover:bg-primary/10" onClick={() => toggleAllInCategory(category)}>
                                                        Select all
                                                    </Button>
                                                </div>

                                                {/* Channels List */}
                                                {isExpanded &&
                        <div className="divide-y divide-border/30">
                                                        {filteredChannels.map((channel) => {
                            const isSelected = strategy.placements?.includes(channel.name);
                            const score = getAIScore(channel.name);
                            const isHighMatch = score > 85;

                            return (
                              <div
                                key={channel.name}
                                onClick={() => toggleChannel(channel.name)}
                                className={cn(
                                  "flex items-center justify-between p-3 px-6 cursor-pointer transition-colors hover:bg-muted/50",
                                  isSelected && "bg-primary/5 hover:bg-primary/10"
                                )}>

                                                                    <div className="flex items-center gap-4">
                                                                        <CheckboxWithCheck isChecked={!!isSelected} />

                                                                        {/* Logo / Icon */}
                                                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm", channel.logoColor)}>
                                                                            {channel.name.substring(0, 1)}
                                                                        </div>

                                                                        <span className="font-medium text-sm text-foreground">{channel.name}</span>

                                                                        {isHighMatch &&
                                  <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-green-400 border-emerald-500/30 bg-emerald-500/10">
                                                                                <Sparkles className="w-3 h-3 mr-1" /> Best Match
                                                                            </Badge>
                                  }
                                                                    </div>

                                                                    <div className="flex items-center gap-8">
                                                                        <span className="text-sm font-medium text-muted-foreground w-24 text-right">
                                                                            {channel.audience}
                                                                        </span>
                                                                        <span className={cn("text-sm font-bold w-16 text-right", isHighMatch ? "text-emerald-600 dark:text-green-400" : "text-muted-foreground")}>
                                                                            {score}%
                                                                        </span>
                                                                    </div>
                                                                </div>);

                          })}
                                                    </div>
                        }
                                            </div>);

                  })}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="smart">
                        <div className="p-12 text-center text-muted-foreground border border-border rounded-lg border-dashed bg-muted/30">
                            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500/50 dark:text-purple-400/50" />
                            <p>AI Auto-Sports mode will automatically select the best live sports inventory.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>);

}

// Custom Checkbox that resembles the design
function CheckboxWithCheck({ isChecked }: {isChecked: boolean;}) {
  return (
    <div className={cn(
      "w-5 h-5 rounded border flex items-center justify-center transition-all",
      isChecked ? "bg-primary border-primary" : "border-muted-foreground/30 bg-background"
    )}>
            {isChecked && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
        </div>);

}