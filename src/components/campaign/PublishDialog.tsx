import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  DollarSign,
  Calendar,
  Layers,
  Rocket,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  Clock,
} from "lucide-react";

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  selected: boolean;
  budgetPercent: number;
  aiRecommended?: boolean;
}

interface Creative {
  id: number;
  name: string;
  thumbnail?: string;
  ctr: string;
  platforms: string[];
  aiRecommended?: boolean;
}

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: any;
  creatives: Creative[];
  onPublish: () => void;
}

const steps = [
  { id: 1, name: "Platforms", icon: Globe },
  { id: 2, name: "Budget", icon: DollarSign },
  { id: 3, name: "Duration", icon: Calendar },
  { id: 4, name: "Creatives", icon: Layers },
  { id: 5, name: "Confirmation", icon: Rocket },
];

export const PublishDialog = ({
  open,
  onOpenChange,
  campaign,
  creatives,
  onPublish,
}: PublishDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [publishing, setPublishing] = useState(false);

  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: "instagram", name: "Instagram", icon: <Instagram className="h-5 w-5" />, selected: true, budgetPercent: 40, aiRecommended: true },
    { id: "facebook", name: "Facebook", icon: <Facebook className="h-5 w-5" />, selected: true, budgetPercent: 30 },
    { id: "tiktok", name: "TikTok", icon: <TikTokIcon className="h-5 w-5" />, selected: false, budgetPercent: 20, aiRecommended: true },
    { id: "google", name: "Google Ads", icon: <Globe className="h-5 w-5" />, selected: false, budgetPercent: 10 },
    { id: "youtube", name: "YouTube", icon: <Youtube className="h-5 w-5" />, selected: false, budgetPercent: 0 },
  ]);

  const [budget, setBudget] = useState({
    total: 500,
    daily: 50,
  });

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5" },
    { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6" },
    { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)", offset: "UTC-9" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HST)", offset: "UTC-10" },
    { value: "Europe/London", label: "London (GMT)", offset: "UTC+0" },
    { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1" },
    { value: "Europe/Berlin", label: "Berlin (CET)", offset: "UTC+1" },
    { value: "Asia/Dubai", label: "Dubai (GST)", offset: "UTC+4" },
    { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "UTC+8" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
    { value: "Australia/Sydney", label: "Sydney (AEST)", offset: "UTC+10" },
  ];

  const detectTimezone = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "America/New_York";
    }
  };

  const [duration, setDuration] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    timezone: detectTimezone(),
    startTime: "09:00",
  });

  const [creativeAssignments, setCreativeAssignments] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    platforms.forEach((p) => {
      if (creatives.length > 0) {
        initial[p.id] = [creatives[0]?.id?.toString()];
      } else {
        initial[p.id] = [];
      }
    });
    return initial;
  });

  const selectedPlatforms = platforms.filter((p) => p.selected);

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const updateBudgetSplit = (platformId: string, newPercent: number) => {
    const selectedCount = selectedPlatforms.length;
    const otherPlatforms = selectedPlatforms.filter((p) => p.id !== platformId);
    const remainingPercent = 100 - newPercent;
    const perOther = Math.floor(remainingPercent / Math.max(otherPlatforms.length, 1));

    setPlatforms((prev) =>
      prev.map((p) => {
        if (p.id === platformId) return { ...p, budgetPercent: newPercent };
        if (p.selected) return { ...p, budgetPercent: perOther };
        return p;
      })
    );
  };

  const applyAiBudgetSplit = () => {
    setPlatforms((prev) =>
      prev.map((p) => {
        if (!p.selected) return p;
        // AI-recommended budget split based on platform performance
        const aiSplits: Record<string, number> = {
          instagram: 40,
          facebook: 25,
          tiktok: 20,
          google: 10,
          youtube: 5,
        };
        return { ...p, budgetPercent: aiSplits[p.id] || 10 };
      })
    );
  };

  const toggleCreativeAssignment = (platformId: string, creativeId: string) => {
    setCreativeAssignments((prev) => {
      const current = prev[platformId] || [];
      if (current.includes(creativeId)) {
        return { ...prev, [platformId]: current.filter((c) => c !== creativeId) };
      }
      return { ...prev, [platformId]: [...current, creativeId] };
    });
  };

  const applyAiCreativeAssignment = () => {
    // AI assigns best performing creative to each platform
    const aiAssignments: Record<string, string[]> = {};
    selectedPlatforms.forEach((p) => {
      if (creatives.length > 0) {
        // Assign top 2 creatives by CTR
        const sorted = [...creatives].sort((a, b) => parseFloat(b.ctr) - parseFloat(a.ctr));
        aiAssignments[p.id] = sorted.slice(0, Math.min(2, sorted.length)).map((c) => c.id.toString());
      }
    });
    setCreativeAssignments(aiAssignments);
  };

  const getDurationDays = () => {
    const start = new Date(duration.startDate);
    const end = new Date(duration.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handlePublish = async () => {
    setPublishing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPublishing(false);
    onPublish();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Select Platforms</h3>
                <p className="text-sm text-muted-foreground">Choose where to publish your campaign</p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Suggested
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <Card
                  key={platform.id}
                  className={`cursor-pointer transition-all ${
                    platform.selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${platform.selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {platform.icon}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{platform.name}</div>
                        {platform.aiRecommended && (
                          <div className="text-xs text-primary flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Recommended
                          </div>
                        )}
                      </div>
                    </div>
                    <Checkbox checked={platform.selected} />
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Set Budget</h3>
                <p className="text-sm text-muted-foreground">Define your total and daily spend</p>
              </div>
              <Button variant="outline" size="sm" onClick={applyAiBudgetSplit}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Split
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Budget</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={budget.total}
                    onChange={(e) => setBudget({ ...budget, total: Number(e.target.value) })}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Daily Budget</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={budget.daily}
                    onChange={(e) => setBudget({ ...budget, daily: Number(e.target.value) })}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Budget Split by Platform</Label>
              <Card className="bg-muted/30 border-border">
                <CardContent className="p-4 space-y-4">
                  {selectedPlatforms.map((platform) => (
                    <div key={platform.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {platform.icon}
                          <span className="text-foreground">{platform.name}</span>
                        </div>
                        <span className="font-medium text-foreground">
                          ${Math.round((budget.total * platform.budgetPercent) / 100)} ({platform.budgetPercent}%)
                        </span>
                      </div>
                      <Slider
                        value={[platform.budgetPercent]}
                        max={100}
                        step={5}
                        onValueChange={([value]) => updateBudgetSplit(platform.id, value)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* AI Suggestion Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">AI Budget Recommendation</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on your campaign goal ({campaign?.goal}), we recommend allocating 40% to Instagram
                      for highest engagement, 25% to Facebook for broader reach, and 20% to TikTok for younger demographics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        const isScheduledForFuture = new Date(duration.startDate) > new Date();
        const selectedTimezone = timezones.find(tz => tz.value === duration.timezone);
        
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground">Schedule Campaign</h3>
              <p className="text-sm text-muted-foreground">Define when your campaign runs</p>
            </div>

            {/* Timezone Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timezone
              </Label>
              <Select
                value={duration.timezone}
                onValueChange={(value) => setDuration({ ...duration, timezone: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{tz.label}</span>
                        <span className="text-muted-foreground text-xs">{tz.offset}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={duration.startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDuration({ ...duration, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={duration.startTime}
                  onChange={(e) => setDuration({ ...duration, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={duration.endDate}
                min={duration.startDate}
                onChange={(e) => setDuration({ ...duration, endDate: e.target.value })}
              />
            </div>

            {/* Scheduled Campaign Notice */}
            {isScheduledForFuture && (
              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Calendar className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Scheduled Campaign</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your campaign will automatically go live on{" "}
                        <span className="font-medium text-foreground">
                          {new Date(duration.startDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>{" "}
                        at <span className="font-medium text-foreground">{duration.startTime}</span>{" "}
                        ({selectedTimezone?.label})
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-muted/30 border-border">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{getDurationDays()}</div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">${budget.total}</div>
                    <div className="text-sm text-muted-foreground">Total Budget</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      ${(budget.total / Math.max(getDurationDays(), 1)).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Per Day Avg</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Duration Presets */}
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="flex gap-2 flex-wrap">
                {[7, 14, 30, 60].map((days) => (
                  <Button
                    key={days}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDuration({
                        ...duration,
                        endDate: new Date(new Date(duration.startDate).getTime() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                      })
                    }
                    className={getDurationDays() === days ? "border-primary bg-primary/10" : ""}
                  >
                    {days} days
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Assign Creatives</h3>
                <p className="text-sm text-muted-foreground">Select creatives for each platform</p>
              </div>
              {creatives.length > 1 && (
                <Button variant="outline" size="sm" onClick={applyAiCreativeAssignment}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Assign
                </Button>
              )}
            </div>

            {creatives.length > 0 ? (
              <div className="space-y-4">
                {selectedPlatforms.map((platform) => (
                  <Card key={platform.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {platform.icon}
                        <span className="font-medium text-foreground">{platform.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {creatives.map((creative) => {
                          const isAssigned = creativeAssignments[platform.id]?.includes(creative.id.toString());
                          const isAiRecommended = parseFloat(creative.ctr) > 2;
                          return (
                            <div
                              key={creative.id}
                              onClick={() => toggleCreativeAssignment(platform.id, creative.id.toString())}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                isAssigned
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                                    {creative.thumbnail ? (
                                      <img src={creative.thumbnail} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Layers className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-foreground">{creative.name}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3" />
                                      {creative.ctr}% CTR
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isAiRecommended && (
                                    <Sparkles className="h-4 w-4 text-primary" />
                                  )}
                                  <Checkbox checked={isAssigned} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* AI Creative Suggestion */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">AI Creative Recommendation</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on historical performance, we recommend using your top-performing creative 
                          (highest CTR) for Instagram and TikTok, while using a broader selection for Facebook to enable A/B testing.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No creatives available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your campaign will use the default creative
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Ready to Go Live!</h3>
              <p className="text-muted-foreground mt-2">Review your campaign settings before publishing</p>
            </div>

            <Card className="border-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Campaign</span>
                  <span className="font-medium text-foreground">{campaign?.title}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Platforms</span>
                  <div className="flex gap-1">
                    {selectedPlatforms.map((p) => (
                      <div key={p.id} className="p-1.5 rounded bg-muted">{p.icon}</div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="font-medium text-foreground">${budget.total}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Daily Budget</span>
                  <span className="font-medium text-foreground">${budget.daily}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{getDurationDays()} days</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Creatives Assigned</span>
                  <span className="font-medium text-foreground">
                    {Object.values(creativeAssignments).flat().filter((v, i, a) => a.indexOf(v) === i).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Budget Breakdown */}
            <Card className="bg-muted/30 border-border">
              <CardContent className="p-4">
                <div className="font-medium text-foreground mb-3">Budget Breakdown</div>
                <div className="space-y-2">
                  {selectedPlatforms.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {p.icon}
                        <span className="text-foreground">{p.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ${Math.round((budget.total * p.budgetPercent) / 100)} ({p.budgetPercent}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Prediction */}
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Zap className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium text-green-500">Estimated Performance</div>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-center">
                      <div>
                        <div className="text-lg font-bold text-foreground">25-35K</div>
                        <div className="text-xs text-muted-foreground">Est. Impressions</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-foreground">2.5-3.2%</div>
                        <div className="text-xs text-muted-foreground">Est. CTR</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-foreground">$0.15-0.22</div>
                        <div className="text-xs text-muted-foreground">Est. CPC</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish Campaign</DialogTitle>
          <DialogDescription>
            Configure your campaign settings before going live
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-2 py-4">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isActive
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {step.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-8 md:w-12 h-0.5 mx-1 ${
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] py-4">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 1) {
                onOpenChange(false);
              } else {
                setCurrentStep((prev) => prev - 1);
              }
            }}
            disabled={publishing}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          {currentStep < 5 ? (
            <Button onClick={() => setCurrentStep((prev) => prev + 1)} disabled={selectedPlatforms.length === 0}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={publishing} className="bg-green-600 hover:bg-green-700">
              {publishing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Go Live
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
