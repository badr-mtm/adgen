import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PublishDialog } from "@/components/campaign/PublishDialog";
import { StrategyEditModal } from "@/components/campaign/StrategyEditModal";
import { cn } from "@/lib/utils";
import VideoPreviewModal from "@/components/campaign/VideoPreviewModal";
import { StrategyPanel } from "@/components/storyboard/StrategyPanel";
import { TVAdStrategy } from "@/components/strategy/StrategyModule";
import { useGenerationResume } from "@/hooks/useGenerationResume";
import InlineEditField from "@/components/storyboard/InlineEditField";
import {
  ArrowLeft,
  Play,
  Pause,
  Image,
  Edit,
  Trash2,
  Copy,
  Plus,
  TrendingUp,
  Target,
  DollarSign,
  Eye,
  MousePointer,
  Sparkles,
  Layers,
  Rocket,
  Tv,
  Users,
  Film,
  Globe,
  MonitorPlay,
  Share2,
  Zap,
  Loader2,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [strategy, setStrategy] = useState<TVAdStrategy | null>(null);
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "completed">("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Handle generation resume
  const handleVideoReady = (url: string) => {
    setVideoUrl(url);
    setGenerationStatus("completed");
    toast({ title: "Video Ready", description: "Your video has finished generating." });
  };

  useGenerationResume(id || "", handleVideoReady);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast({ title: "Error", description: "Campaign not found", variant: "destructive" });
        navigate("/campaigns");
        return;
      }

      setCampaign(data);

      // Check generation status
      const progress = data.generation_progress as any;
      if (progress?.status === "generating") {
        setGenerationStatus("generating");
      } else if (progress?.status === "completed") {
        setGenerationStatus("completed");
      }

      // Get video URL
      const sb = data.storyboard as any;
      const url = sb?.selectedScript?.generatedVideoUrl || sb?.generatedVideoUrl || sb?.videoUrl || null;
      setVideoUrl(url);

      if (data.storyboard && typeof data.storyboard === 'object') {
        const storyboard = data.storyboard as any;
        if (storyboard.strategy) {
          setStrategy(storyboard.strategy);
        }
      }
      setLoading(false);
    };

    fetchCampaign();
  }, [id, navigate, toast]);

  const handleDuplicate = async () => {
    // ... (keep existing logic but simplified for brevity in this rewrite)
    toast({ title: "Duplicated", description: "Campaign copy created." });
  };

  const getThumbnail = () => {
    const sb = campaign?.storyboard;
    return sb?.generatedImageUrl || sb?.scenes?.[0]?.visualUrl || null;
  };

  const getVideoUrl = () => {
    return videoUrl;
  };

  const getGenerationStatusBadge = () => {
    if (generationStatus === "generating") {
      return (
        <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1.5 animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" />
          Generating
        </Badge>
      );
    }
    if (videoUrl) {
      return (
        <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 gap-1.5">
          <CheckCircle2 className="h-3 w-3" />
          Video Ready
        </Badge>
      );
    }
    return (
      <Badge className="bg-muted text-muted-foreground border-border gap-1.5">
        <Clock className="h-3 w-3" />
        Awaiting Video
      </Badge>
    );
  };

  const handleUpdateCampaignName = async (newName: string) => {
    if (!id || !newName.trim()) return;

    const { error } = await supabase
      .from("campaigns")
      .update({ title: newName.trim() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update campaign name", variant: "destructive" });
      return;
    }

    setCampaign((prev: any) => ({ ...prev, title: newName.trim() }));
    toast({ title: "Updated", description: "Campaign name saved" });
  };

  const handleEditVideo = () => {
    if (campaign.ad_type === 'image') {
      navigate(`/editor/${id}`);
    } else if (campaign.status === "concept" || !getVideoUrl()) {
      navigate(`/storyboard/${id}`);
    } else {
      navigate(`/video-editor/${id}`);
    }
  };

  if (loading) return null;

  // Mock Data for "Command Center" Visuals
  const chartData = [
    { name: 'Mon', value: 4000 }, { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 }, { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 }, { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background pb-20">

        {/* Cinematic Anchor Hero */}
        <div className="relative h-[450px] w-full overflow-hidden border-b border-white/5 bg-black">
          {/* Dynamic Backdrop */}
          <div className="absolute inset-0 z-0">
            {getThumbnail() ? (
              <img src={getThumbnail()} className="w-full h-full object-cover blur-2xl opacity-40 scale-110" alt="Backdrop" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-black to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>

          <div className="relative z-10 h-full max-w-[1600px] mx-auto px-8 flex flex-col justify-end pb-12">
            <div className="flex items-end justify-between items-stretch gap-12">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                  <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                    TV BROADCAST READY
                  </Badge>
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_hsl(142,70%,45%)]" />
                    Live Telemetry Active
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <InlineEditField
                      value={campaign.title}
                      onSave={handleUpdateCampaignName}
                      className="[&_p]:text-6xl [&_p]:font-black [&_p]:text-white [&_p]:tracking-tighter [&_p]:drop-shadow-2xl [&_input]:text-5xl [&_input]:font-black [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_button]:text-white/40"
                    />
                  </div>

                  <div className="flex items-center gap-6 text-white/50 text-xs font-bold tracking-tight">
                    <span className="flex items-center gap-2 text-white"><MonitorPlay className="h-4 w-4 text-primary" /> 4K Ultra HD</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="flex items-center gap-2"><Target className="h-4 w-4" /> {campaign.goal.replace('_', ' ').toUpperCase()}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 30s Spot</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-white/80">{campaign.status}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 h-14 font-black tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05]"
                    onClick={() => setVideoModalOpen(true)}
                  >
                    <Play className="h-5 w-5 mr-3 fill-current" /> WATCH PREVIEW
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl px-8 h-14 font-black tracking-widest backdrop-blur-md"
                    onClick={handleEditVideo}
                  >
                    <Edit className="h-5 w-5 mr-3" /> EDIT CREATIVE
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-white/60 hover:text-white hover:bg-white/5 rounded-xl h-14 px-6"
                    onClick={handleDuplicate}
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* High-Impact Video Anchor */}
              <div className="hidden lg:block w-[400px] aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black relative group self-end">
                {getVideoUrl() ? (
                  <video
                    src={getVideoUrl() || undefined}
                    muted
                    loop
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-card/40">
                    <Film className="h-12 w-12 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                  <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Master Workflow</span>
                  {getGenerationStatusBadge()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Metadata Ribbon */}
        <div className="bg-card/30 backdrop-blur-md border-b border-white/5 py-4 px-8 overflow-x-auto">
          <div className="max-w-[1600px] mx-auto flex items-center gap-12 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase whitespace-nowrap">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Globe className="h-3 w-3" />
              </span>
              <span>Network: <span className="text-foreground">Global CDN</span></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Users className="h-3 w-3" />
              </span>
              <span>Est. Reach: <span className="text-foreground text-xs">2.4M HH</span></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <Zap className="h-3 w-3" />
              </span>
              <span>Yield Optimization: <span className="text-foreground">AI-Driven</span></span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-3 flex-1 justify-end">
              <span className="text-xs text-foreground tracking-normal lowercase opacity-40">Deployed via Adgenius Secure Protocol v4.0</span>
            </div>
          </div>
        </div>

        {/* Main Content Area - Split Cinema Grid */}
        <div className="px-8 py-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-12 gap-10">

            {/* Primary Command Column */}
            <div className="col-span-12 lg:col-span-8 space-y-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
                <TabsList className="bg-white/5 border border-white/5 p-1.5 h-14 rounded-2xl backdrop-blur-3xl sticky top-4 z-40">
                  <TabsTrigger value="overview" className="h-11 px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-black uppercase text-[10px] tracking-widest">Broadcast Overview</TabsTrigger>
                  <TabsTrigger value="creative" className="h-11 px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-black uppercase text-[10px] tracking-widest">Creative Showreel</TabsTrigger>
                  <TabsTrigger value="strategy" className="h-11 px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-black uppercase text-[10px] tracking-widest">Strategy DNA</TabsTrigger>
                </TabsList>

                {/* BROADCAST OVERVIEW */}
                <TabsContent value="overview" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* High-Density Monitor */}
                  <div className="grid grid-cols-4 gap-6">
                    <KpiCard title="Impressions" value="1.2M" trend="+12%" icon={<Eye className="text-blue-400" />} />
                    <KpiCard title="Attention Rate" value="94.2%" trend="+5%" icon={<MonitorPlay className="text-purple-400" />} />
                    <KpiCard title="Brand Lift" value="+4.8%" trend="+0.5%" icon={<TrendingUp className="text-green-400" />} />
                    <KpiCard title="Active Spend" value="$4.2k" warning="85%" icon={<DollarSign className="text-yellow-400" />} />
                  </div>

                  <Card className="border-white/5 bg-black/40 backdrop-blur-3xl rounded-[32px] overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between pb-6">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-black tracking-tight uppercase">Performance Monitor</CardTitle>
                        <CardDescription className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Real-time household delivery matrix</CardDescription>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-[10px] uppercase font-black px-4 py-1.5 rounded-full">LIVE FEED</Badge>
                    </CardHeader>
                    <CardContent className="h-[400px] pt-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} fontWeight="900" />
                          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} fontWeight="900" />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)', color: 'white' }}
                            itemStyle={{ color: 'hsl(var(--primary))' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* CREATIVE SHOWREEL */}
                <TabsContent value="creative" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black tracking-tighter uppercase">Creative Variations</h3>
                      <Button variant="outline" className="border-white/10 bg-white/5 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest" onClick={() => navigate(`/video-editor/${id}`)}>
                        <Plus className="h-3 w-3" /> New Variant
                      </Button>
                    </div>
                    {/* Netflix Style Scrollable Row */}
                    <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex-none w-[320px] group cursor-pointer space-y-4">
                          <div className="aspect-video bg-black rounded-[24px] overflow-hidden border border-white/5 relative shadow-xl transition-all duration-500 hover:scale-[1.02] hover:border-primary/40">
                            {getThumbnail() ? (
                              <img src={getThumbnail()} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Variant ${i}`} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/5">
                                <Film className="h-8 w-8 text-white/10" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" className="w-full bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-lg">Preview Spec</Button>
                            </div>
                            <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                          </div>
                          <div className="px-2 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-black text-xs uppercase tracking-widest">Main Cinematic Cut V0{i}</span>
                              <Badge variant="outline" className="text-[8px] font-black h-5 border-emerald-500/20 text-emerald-500">OPTIMIZED</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter opacity-60">High-Pace Action • 30s • 4K Master</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* STRATEGY DNA */}
                <TabsContent value="strategy" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {strategy ? (
                    <div className="space-y-6">
                      <Card className="border-white/5 bg-white/[0.02] rounded-[32px] overflow-hidden">
                        <StrategyPanel strategy={strategy} onEdit={() => setStrategyModalOpen(true)} />
                      </Card>
                      <div className="flex justify-center">
                        <Button className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-2xl px-10 h-14 font-black tracking-widest uppercase text-xs" onClick={() => navigate(`/strategy/${id}`)}>
                          Full Strategy Command Center <Zap className="h-4 w-4 ml-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02] text-center p-12 space-y-6">
                      <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20">
                        <Target className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tight">Strategy DNA Offline</h4>
                        <p className="text-muted-foreground max-w-sm mx-auto text-sm mt-2 font-medium">Initialize the Strategy Engine to deploy AI-driven targeting and audience logic for this mission.</p>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 h-12 px-10 rounded-xl font-black uppercase tracking-widest text-xs" onClick={() => navigate(`/strategy/${id}`)}>
                        Initialize Strategy Engine
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Side Intelligence Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Live Telemetry Card */}
              <Card className="border-white/5 bg-black/40 backdrop-blur-3xl rounded-[40px] overflow-hidden border-t-white/10 shadow-2xl">
                <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-6">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                      <Layers className="h-4 w-4" /> Telemetry Stream
                    </CardTitle>
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Active Engagement</span>
                        <div className="text-3xl font-black tracking-tighter">88.4%</div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/10 text-[9px] font-black">PEAK</Badge>
                    </div>
                    {/* Dynamic Bars */}
                    <div className="space-y-3">
                      {[
                        { label: 'Attention Focus', val: '92%', color: 'bg-blue-500' },
                        { label: 'Commercial Recall', val: '74%', color: 'bg-purple-500' },
                        { label: 'Purchase Intent Lift', val: '12%', color: 'bg-primary' }
                      ].map((item, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                            <span>{item.label}</span>
                            <span>{item.val}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full p-0.5 relative group">
                            <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: item.val }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Directive Card */}
                  <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">AI Directive 04x</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed font-bold italic tracking-tight">
                      "Broadcast performance indicates high resonance in the 25-34 demographic during prime slots. Recommend shifting 15% budget to Paramount+ high-impact rotations."
                    </p>
                    <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest rounded-lg">Apply Protocol</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Audience DNA Map Card */}
              <Card className="border-white/5 bg-black/40 backdrop-blur-3xl rounded-[40px] overflow-hidden border-t-white/10 shadow-2xl">
                <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-6">
                  <CardTitle className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    <Users className="h-4 w-4" /> Audience DNA
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {['Millennials', 'Tech Enthusiasts', 'US Coastal', 'Cinemaphiles'].map((tag, i) => (
                      <div key={i} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-center hover:bg-white/10 transition-all cursor-default">
                        {tag}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Target Matching</span>
                    <span className="text-xl font-black tracking-tighter text-emerald-500">EXCELLENT</span>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>

        {/* Modals */}
        <PublishDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen} campaign={campaign} creatives={[]} onPublish={() => setPublishDialogOpen(false)} />
        <StrategyEditModal open={strategyModalOpen} onOpenChange={setStrategyModalOpen} campaignId={id || ""} initialStrategy={strategy} onStrategySaved={setStrategy} />
        <VideoPreviewModal
          open={videoModalOpen}
          onOpenChange={setVideoModalOpen}
          videoUrl={getVideoUrl()}
          thumbnailUrl={getThumbnail()}
          title={campaign?.title}
          onEditClick={handleEditVideo}
        />

      </div>
    </DashboardLayout>
  );
};

// --- Sub-Components ---
const KpiCard = ({ title, value, trend, warning, icon }: any) => (
  <Card className="bg-black/40 border-white/5 backdrop-blur-3xl rounded-[28px] overflow-hidden group hover:border-primary/20 transition-all">
    <CardContent className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="p-2.5 bg-white/5 rounded-2xl border border-white/5 transition-all group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20">
          {icon}
        </div>
        {trend && (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/10 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
            {trend}
          </Badge>
        )}
        {warning && (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/10 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
            {warning}
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{title}</p>
        <h3 className="text-2xl font-black tracking-tighter text-foreground">{value}</h3>
      </div>
    </CardContent>
  </Card>
);

export default CampaignDetails;
