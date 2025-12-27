import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Calendar,
  Monitor,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  Users,
  Sparkles,
  Search,
  Check,
  Play,
  Target,
  Film,
  Settings2
} from "lucide-react";

export interface StrategyConfig {
  budget: {
    amount: number;
    type: "daily" | "lifetime";
  };
  schedule: {
    startDate: string;
    endDate?: string;
    deliverySlots: string;
    days: string[];
  };
  placement: {
    type: "apps_channels" | "live_sports";
    selectedChannels: string[];
  };
  bidding: {
    type: "automatic" | "manual";
    maxCPM?: number;
    frequency: string;
  };
}

interface CampaignPreviewData {
  title?: string;
  description?: string;
  goal?: string;
  audience?: string;
  duration?: string;
  scenesCount?: number;
  thumbnailUrl?: string;
}

interface StrategyConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onPublish: (config: StrategyConfig) => void;
  isPublishing: boolean;
  campaignPreview?: CampaignPreviewData;
}

const CHANNELS = [
  { id: "vibe", name: "Vibe's Performance Network", reach: "111.6M", logo: "🎯" },
  { id: "tubi", name: "Tubi", reach: "36.5M", logo: "📺" },
  { id: "paramount", name: "Paramount Streaming", reach: "30.7M", logo: "⭐" },
  { id: "peacock", name: "Peacock", reach: "25.9M", logo: "🦚" },
  { id: "hulu", name: "Hulu", reach: "25.2M", logo: "💚" },
  { id: "disney", name: "Disney+", reach: "19.7M", logo: "🏰" },
  { id: "pluto", name: "Pluto TV", reach: "19.2M", logo: "🪐" },
  { id: "samsung", name: "Samsung TV Plus", reach: "52.6M", logo: "📱" },
  { id: "roku", name: "Roku Channel", reach: "40.1M", logo: "📡" },
  { id: "wetv", name: "WETV", reach: "777K", logo: "📻" },
  { id: "vevo", name: "Vevo", reach: "311.9K", logo: "🎵" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DELIVERY_PRESETS = [
  { id: "anytime", label: "Any time, Any day" },
  { id: "custom", label: "Custom" },
  { id: "primetime", label: "Primetime" },
  { id: "afterwork", label: "After work" },
  { id: "workhours", label: "Work hours" },
  { id: "sleeping", label: "Sleeping time" },
  { id: "weekend", label: "Weekend" },
  { id: "workdays", label: "Work days" },
];

const FREQUENCY_OPTIONS = [
  { value: "3", label: "Maximum 3 times per day", description: "Conservative approach" },
  { value: "5", label: "Maximum 5 times per day", description: "Recommended for most use cases" },
  { value: "7", label: "Maximum 7 times per day", description: "Aggressive reach" },
  { value: "10", label: "Maximum 10 times per day", description: "High frequency campaigns" },
];

export function StrategyConfigModal({
  open,
  onOpenChange,
  onBack,
  onPublish,
  isPublishing,
  campaignPreview
}: StrategyConfigModalProps) {
  const [step, setStep] = useState<"preview" | "strategy">("preview");
  const [activeTab, setActiveTab] = useState("budget");
  const [config, setConfig] = useState<StrategyConfig>({
    budget: { amount: 200, type: "daily" },
    schedule: {
      startDate: new Date().toISOString().split('T')[0],
      deliverySlots: "anytime",
      days: DAYS
    },
    placement: {
      type: "apps_channels",
      selectedChannels: ["vibe", "tubi", "paramount", "peacock", "hulu"]
    },
    bidding: {
      type: "automatic",
      frequency: "5"
    }
  });

  const [expandedDelivery, setExpandedDelivery] = useState(false);
  const [expandedAdvanced, setExpandedAdvanced] = useState(false);
  const [channelSearch, setChannelSearch] = useState("");

  // Reset step when modal opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep("preview");
    }
    onOpenChange(open);
  };

  const toggleChannel = (channelId: string) => {
    setConfig(prev => ({
      ...prev,
      placement: {
        ...prev.placement,
        selectedChannels: prev.placement.selectedChannels.includes(channelId)
          ? prev.placement.selectedChannels.filter(id => id !== channelId)
          : [...prev.placement.selectedChannels, channelId]
      }
    }));
  };

  const toggleDay = (day: string) => {
    setConfig(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const filteredChannels = CHANNELS.filter(c => 
    c.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  const audienceSize = "2M - 2M";
  const estimatedImpressions = "47K - 93K";
  const estimatedHouseholds = "3.1K - 6.2K";

  const pageTransition = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.5, ease: "easeInOut" as const }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-6xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
        <AnimatePresence mode="wait">
          {step === "preview" ? (
            <motion.div
              key="preview"
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
              transition={pageTransition.transition}
              className="flex flex-col max-h-[85vh]"
            >
              {/* Preview Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <h2 className="text-xl font-semibold text-foreground">
                    Campaign Preview
                  </h2>
                </div>
              </div>

              {/* Preview Content */}
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                  {/* Campaign Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-6 space-y-6"
                  >
                    <div className="flex items-start gap-6">
                      {/* Thumbnail */}
                      <div className="w-40 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0 relative group">
                        {campaignPreview?.thumbnailUrl ? (
                          <img 
                            src={campaignPreview.thumbnailUrl} 
                            alt="Campaign thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <Film className="h-8 w-8 text-primary/60" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-foreground mb-2 truncate">
                          {campaignPreview?.title || "New Campaign"}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {campaignPreview?.description || "Your campaign is ready to go live."}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {campaignPreview?.duration && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {campaignPreview.duration}
                            </Badge>
                          )}
                          {campaignPreview?.scenesCount && (
                            <Badge variant="secondary" className="text-xs">
                              <Film className="h-3 w-3 mr-1" />
                              {campaignPreview.scenesCount} Scenes
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Campaign Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="rounded-xl border border-border bg-card p-5 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <Target className="h-5 w-5" />
                        <span className="font-medium">Campaign Goal</span>
                      </div>
                      <p className="text-foreground capitalize">
                        {campaignPreview?.goal || "Brand Awareness"}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="rounded-xl border border-border bg-card p-5 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Target Audience</span>
                      </div>
                      <p className="text-foreground">
                        {campaignPreview?.audience || "General Audience"}
                      </p>
                    </motion.div>
                  </div>

                  {/* What's Next */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="rounded-xl border border-primary/30 bg-primary/5 p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Settings2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Ready to configure your strategy?</h4>
                        <p className="text-sm text-muted-foreground">Set your budget, schedule, and placements</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Budget & Schedule
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Monitor className="h-4 w-4 text-primary" />
                        Placements
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-primary" />
                        Bidding
                      </div>
                    </div>
                  </motion.div>
                </div>
              </ScrollArea>

              {/* Preview Footer */}
              <div className="p-6 border-t border-border">
                <Button
                  size="lg"
                  onClick={() => setStep("strategy")}
                  className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 group"
                >
                  Configure Strategy
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="strategy"
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
              transition={pageTransition.transition}
              className="flex h-full max-h-[85vh]"
            >
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStep("preview")}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold text-foreground">
                  Campaign Strategy
                </h2>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-4 border-b border-border">
                <TabsList className="bg-transparent p-0 h-auto gap-6">
                  <TabsTrigger 
                    value="budget" 
                    className="px-0 pb-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Budget & Schedule
                  </TabsTrigger>
                  <TabsTrigger 
                    value="placement"
                    className="px-0 pb-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Placement Controls
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bidding"
                    className="px-0 pb-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Bidding
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-6 py-6">
                {/* Budget & Schedule Tab */}
                <TabsContent value="budget" className="mt-0 space-y-6">
                  {/* Budget Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Budget</h3>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={config.budget.amount}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              budget: { ...prev.budget, amount: parseInt(e.target.value) || 0 }
                            }))}
                            className="pl-8 h-12 text-lg bg-background"
                          />
                        </div>
                      </div>
                      <Select 
                        value={config.budget.type} 
                        onValueChange={(v: "daily" | "lifetime") => setConfig(prev => ({
                          ...prev,
                          budget: { ...prev.budget, type: v }
                        }))}
                      >
                        <SelectTrigger className="w-40 h-12 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily Budget</SelectItem>
                          <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Set a maximum amount of budget you are willing to spend per day.
                    </p>
                  </div>

                  {/* Schedule Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Schedule</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">Start Date</Label>
                        <Input
                          type="date"
                          value={config.schedule.startDate}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, startDate: e.target.value }
                          }))}
                          className="h-12 bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">End Date (Optional)</Label>
                        <Input
                          type="date"
                          value={config.schedule.endDate || ""}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, endDate: e.target.value || undefined }
                          }))}
                          placeholder="Pick an end date"
                          className="h-12 bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Time Slots */}
                  <Collapsible open={expandedDelivery} onOpenChange={setExpandedDelivery}>
                    <CollapsibleTrigger className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                      {expandedDelivery ? "Hide" : "Show"} settings
                      {expandedDelivery ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 space-y-4"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <h4 className="font-medium text-foreground">Delivery Time Slots</h4>
                          <span className="text-sm text-muted-foreground">• {DELIVERY_PRESETS.find(p => p.id === config.schedule.deliverySlots)?.label}</span>
                        </div>

                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="flex items-center gap-2 text-primary text-sm">
                            <Info className="h-4 w-4" />
                            Ads will be delivered in the respective timezone of the locations you targeted.
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {DELIVERY_PRESETS.map((preset) => (
                            <Badge
                              key={preset.id}
                              variant={config.schedule.deliverySlots === preset.id ? "default" : "outline"}
                              className={`cursor-pointer transition-all ${
                                config.schedule.deliverySlots === preset.id
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => setConfig(prev => ({
                                ...prev,
                                schedule: { ...prev.schedule, deliverySlots: preset.id }
                              }))}
                            >
                              {preset.label}
                            </Badge>
                          ))}
                        </div>

                        {/* Days Schedule */}
                        <div className="space-y-3">
                          {DAYS.map((day) => (
                            <div key={day} className="flex items-center gap-4">
                              <div className="flex items-center gap-2 w-32">
                                <Checkbox
                                  checked={config.schedule.days.includes(day)}
                                  onCheckedChange={() => toggleDay(day)}
                                  className="data-[state=checked]:bg-primary"
                                />
                                <span className="text-sm text-foreground">{day}</span>
                              </div>
                              <div className="flex gap-2 flex-1">
                                <Select defaultValue="12:00 am">
                                  <SelectTrigger className="w-32 h-9 bg-background">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="12:00 am">12:00 am</SelectItem>
                                    <SelectItem value="6:00 am">6:00 am</SelectItem>
                                    <SelectItem value="12:00 pm">12:00 pm</SelectItem>
                                    <SelectItem value="6:00 pm">6:00 pm</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select defaultValue="11:59 pm">
                                  <SelectTrigger className="w-32 h-9 bg-background">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="11:59 pm">11:59 pm</SelectItem>
                                    <SelectItem value="6:00 pm">6:00 pm</SelectItem>
                                    <SelectItem value="12:00 pm">12:00 pm</SelectItem>
                                    <SelectItem value="6:00 am">6:00 am</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                </TabsContent>

                {/* Placement Controls Tab */}
                <TabsContent value="placement" className="mt-0 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Placement Controls</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We'll automatically show ads where people are most likely to respond. Adjust placement controls to reflect legal or practical constraints only.
                    </p>

                    {/* Inventory Selection */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Inventory • {config.placement.selectedChannels.length} Apps & Channels</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setConfig(prev => ({ ...prev, placement: { ...prev.placement, type: "apps_channels" } }))}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            config.placement.type === "apps_channels"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              config.placement.type === "apps_channels" ? "border-primary" : "border-muted-foreground/50"
                            }`}>
                              {config.placement.type === "apps_channels" && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className={`font-medium ${config.placement.type === "apps_channels" ? "text-primary" : "text-foreground"}`}>
                              Apps & Channels
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => setConfig(prev => ({ ...prev, placement: { ...prev.placement, type: "live_sports" } }))}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            config.placement.type === "live_sports"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              config.placement.type === "live_sports" ? "border-primary" : "border-muted-foreground/50"
                            }`}>
                              {config.placement.type === "live_sports" && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className={`font-medium ${config.placement.type === "live_sports" ? "text-primary" : "text-foreground"}`}>
                              Live Sports
                            </span>
                          </div>
                        </button>
                      </div>

                      {/* Channel Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search for channels"
                          value={channelSearch}
                          onChange={(e) => setChannelSearch(e.target.value)}
                          className="pl-10 bg-background"
                        />
                      </div>

                      {/* Channel Grid */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Available ({filteredChannels.length})</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setConfig(prev => ({
                            ...prev,
                            placement: { ...prev.placement, selectedChannels: CHANNELS.map(c => c.id) }
                          }))}>
                            Select all
                          </Button>
                          <span className="text-muted-foreground">Selected ({config.placement.selectedChannels.length})</span>
                          <Button variant="outline" size="sm" onClick={() => setConfig(prev => ({
                            ...prev,
                            placement: { ...prev.placement, selectedChannels: [] }
                          }))}>
                            Unselect all
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-h-72 overflow-y-auto">
                        {filteredChannels.map((channel) => {
                          const isSelected = config.placement.selectedChannels.includes(channel.id);
                          return (
                            <button
                              key={channel.id}
                              onClick={() => toggleChannel(channel.id)}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-muted-foreground/50"
                              }`}
                            >
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                                {channel.logo}
                              </div>
                              <div className="flex-1 text-left">
                                <p className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                  {channel.name}
                                </p>
                              </div>
                              <span className="text-sm text-muted-foreground">{channel.reach}</span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Bidding Tab */}
                <TabsContent value="bidding" className="mt-0 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Bidding</h3>
                    </div>

                    <RadioGroup
                      value={config.bidding.type}
                      onValueChange={(v: "automatic" | "manual") => setConfig(prev => ({
                        ...prev,
                        bidding: { ...prev.bidding, type: v }
                      }))}
                      className="space-y-4"
                    >
                      <div className={`p-4 rounded-lg border-2 transition-all ${
                        config.bidding.type === "automatic" ? "border-primary bg-primary/5" : "border-border"
                      }`}>
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="automatic" id="automatic" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="automatic" className="font-medium text-foreground cursor-pointer">
                                Automatic
                              </Label>
                              <Badge className="bg-primary/20 text-primary border-0 text-xs">
                                Recommended
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Automatically optimize bidding to get the best results out of your budget.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg border-2 transition-all ${
                        config.bidding.type === "manual" ? "border-primary bg-primary/5" : "border-border"
                      }`}>
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="manual" id="manual" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="manual" className="font-medium text-foreground cursor-pointer">
                              Manual
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Manually define the fixed or maximum bid you are willing to pay for 1000 impressions (CPM).
                            </p>
                            {config.bidding.type === "manual" && (
                              <div className="mt-4">
                                <Label className="text-sm text-muted-foreground">Maximum CPM</Label>
                                <div className="relative mt-2">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                  <Input
                                    type="number"
                                    value={config.bidding.maxCPM || ""}
                                    onChange={(e) => setConfig(prev => ({
                                      ...prev,
                                      bidding: { ...prev.bidding, maxCPM: parseFloat(e.target.value) || undefined }
                                    }))}
                                    placeholder="0.00"
                                    className="pl-8 bg-background"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Advanced Options */}
                  <Collapsible open={expandedAdvanced} onOpenChange={setExpandedAdvanced}>
                    <CollapsibleTrigger className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                      Advanced options
                      {expandedAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 space-y-4"
                      >
                        <div>
                          <Label className="text-sm font-medium text-foreground">Choose maximum ad frequency per household</Label>
                          <Select
                            value={config.bidding.frequency}
                            onValueChange={(v) => setConfig(prev => ({
                              ...prev,
                              bidding: { ...prev.bidding, frequency: v }
                            }))}
                          >
                            <SelectTrigger className="w-full mt-2 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FREQUENCY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <span>{option.label}</span>
                                    <span className="text-muted-foreground text-xs">{option.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                </TabsContent>
              </ScrollArea>

              {/* Footer */}
              <div className="p-6 border-t border-border">
                <Button
                  size="lg"
                  onClick={() => onPublish(config)}
                  disabled={isPublishing}
                  className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                >
                  {isPublishing ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                      Publishing Campaign...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Publish Campaign
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          </div>

          {/* Strategy Estimate Sidebar */}
          <div className="w-72 border-l border-border bg-background/50 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Strategy Estimate</h3>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Audience Size</p>
                <p className="text-2xl font-bold text-foreground">{audienceSize}</p>
              </div>

              <div className="border-b border-border pb-4">
                <div className="flex gap-4 mb-3">
                  <button className="text-sm font-medium text-primary border-b-2 border-primary pb-1">Weekly</button>
                  <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-1">Daily</button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on your daily budget of <span className="text-foreground font-semibold">${config.budget.amount}</span>, your strategy estimated results are:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Impressions</p>
                  <p className="text-sm font-semibold text-primary">{estimatedImpressions}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Households</p>
                  <p className="text-sm font-semibold text-primary">{estimatedHouseholds}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deliverability forecast</span>
                  <Badge className="bg-green-500/20 text-green-400 border-0">
                    Optimal
                  </Badge>
                </div>
              </div>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
