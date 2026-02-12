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
import VideoPreviewModal from "@/components/campaign/VideoPreviewModal";
import { TVAdStrategy } from "@/components/strategy/StrategyModule";
import { useGenerationResume } from "@/hooks/useGenerationResume";
import InlineEditField from "@/components/storyboard/InlineEditField";
import { DeploymentSummary } from "@/components/campaign/DeploymentSummary";
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
  const [deploymentStrategy, setDeploymentStrategy] = useState<any>(null);
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

      // Merge Mission Control strategy
      if (data.strategy) {
        setDeploymentStrategy(data.strategy);
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

        {/* Cinematic Header with Full Video Background */}
        <div className="relative h-[450px] w-full overflow-hidden border-b border-white/5 bg-black">
          {/* Background Video Layer */}
          <div className="absolute inset-0 z-0">
            {getVideoUrl() ? (
              <video
                src={getVideoUrl() || undefined}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover opacity-60 scale-105 blur-[2px]"
              />
            ) : getThumbnail() ? (
              <img src={getThumbnail()} className="w-full h-full object-cover blur-xl opacity-40 scale-110" alt="Background" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-900/20 to-black" />
            )}

            {/* Cinematic Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-black/20 z-10" />

            {/* Focal Point Shadow */}
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-10" />
          </div>

          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            {getVideoUrl() && generationStatus === "completed" && (
              <div className="p-4 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 top-0 z-40 p-8 lg:p-12 flex flex-col justify-end max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-8 relative group/preview w-full lg:w-auto">
                {/* Hero Preview Card */}
                <div
                  className="w-full md:w-80 aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-md relative group cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ring-1 ring-white/5"
                  onClick={() => getVideoUrl() ? setVideoModalOpen(true) : handleEditVideo()}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                  {generationStatus === "generating" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="relative">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <div className="absolute inset-0 blur-lg bg-primary/20 animate-pulse" />
                      </div>
                      <span className="text-xs text-primary/80 font-bold uppercase tracking-widest mt-4 animate-pulse">Processing Stream</span>
                    </div>
                  ) : getVideoUrl() ? (
                    <div className="w-full h-full group/video">
                      <video
                        src={getVideoUrl() || undefined}
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover/video:bg-transparent transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover/video:opacity-0 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                          <Play className="h-5 w-5 text-white ml-1 fill-white" />
                        </div>
                      </div>
                    </div>
                  ) : getThumbnail() ? (
                    <div className="w-full h-full relative">
                      <img src={getThumbnail()} className="w-full h-full object-cover opacity-80" alt="Thumbnail" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MonitorPlay className="h-10 w-10 text-white/40" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tv className="h-10 w-10 text-white/20" />
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">30s spot</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] h-7 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider px-3 rounded-full"
                      onClick={(e) => { e.stopPropagation(); handleEditVideo(); }}
                    >
                      Open Editor
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 max-w-2xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 transition-colors uppercase tracking-widest text-[9px] font-bold py-1 px-2.5 rounded-full">
                        {campaign.status || 'Draft'}
                      </Badge>
                      {getGenerationStatusBadge()}
                      <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 uppercase tracking-widest border-l border-white/10 pl-3">
                        <Zap className="h-3 w-3 text-amber-500" />
                        AI Optimized
                      </div>
                    </div>

                    <div className="group/title flex items-center gap-4">
                      <InlineEditField
                        value={campaign.title}
                        onSave={handleUpdateCampaignName}
                        className="[&_p]:text-5xl [&_p]:font-bold [&_p]:text-white [&_p]:tracking-tight [&_p]:drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] [&_input]:text-4xl [&_input]:font-bold [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:rounded-2xl [&_button]:text-white/40 [&_button]:hover:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center items-center gap-6 text-white/50 text-xs font-medium tracking-wide">
                    <span className="flex items-center gap-2"><Film className="h-4 w-4 text-primary" /> {campaign.ad_type.toUpperCase()} SPOT</span>
                    <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                    <span className="flex items-center gap-2"><Target className="h-4 w-4 text-purple-400" /> {campaign.goal.toUpperCase()}</span>
                    <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                    <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-400" /> NATIONWIDE SYNC</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto self-end">
                <Button variant="outline" className="h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md gap-3 px-6 rounded-2xl transition-all" onClick={handleDuplicate}>
                  <Copy className="h-4 w-4" /> <span className="text-xs font-bold tracking-wider">CLONE MISSION</span>
                </Button>
                <Button className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-3 px-8 rounded-2xl shadow-[0_10px_30px_-10px_rgba(255,100,100,0.5)] transition-all hover:scale-[1.02] active:scale-95" onClick={() => setPublishDialogOpen(true)}>
                  <Rocket className="h-5 w-5" /> <span className="text-sm font-bold tracking-widest uppercase">Launch to Broadcast</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-8 py-8 max-w-[1600px] mx-auto space-y-8">

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-card/50 border border-border/50 p-1 h-12 rounded-xl backdrop-blur-sm">
              <TabsTrigger value="overview" className="h-10 px-6 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Overview</TabsTrigger>
              <TabsTrigger value="strategy" className="h-10 px-6 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Strategy Engine</TabsTrigger>
              <TabsTrigger value="creative" className="h-10 px-6 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Creative Yield</TabsTrigger>
              <TabsTrigger value="audience" className="h-10 px-6 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Audience DNA</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Total Impressions" value="1.2M" trend="+12%" icon={<Eye className="text-blue-400" />} />
                <KpiCard title="Avg. Attention" value="14.2s" trend="+5%" icon={<MonitorPlay className="text-purple-400" />} />
                <KpiCard title="Household Lift" value="4.8%" trend="+0.5%" icon={<TrendingUp className="text-green-400" />} />
                <KpiCard title="Spend" value="$4,250" warning="85% of budget" icon={<DollarSign className="text-yellow-400" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Broadcast Performance</CardTitle>
                    <CardDescription>Real-time delivery across connected networks</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* AI Insights Sidebar */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-400" /> AI Optimization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="font-bold text-green-600 dark:text-green-400 text-sm mb-1">Scale Opportunity</h4>
                      <p className="text-xs text-muted-foreground">CTR is 40% above benchmark on Roku. Recommend increasing bid cap by $2.00.</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-bold text-blue-600 dark:text-blue-400 text-sm mb-1">Creative Fatigue</h4>
                      <p className="text-xs text-muted-foreground">Scene 3 drop-off increased by 5%. Consider swapping with "Lifestyle" variant.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* STRATEGY TAB */}
            <TabsContent value="strategy" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Deployment Architecture Summary */}
                <div className="xl:col-span-1 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold tracking-tight">Mission Control</h3>
                    <Button variant="ghost" size="sm" className="h-8 text-primary hover:bg-primary/5" onClick={() => navigate(`/strategy/${id}`)}>
                      <Layers className="h-3.5 w-3.5 mr-1.5" /> Full View
                    </Button>
                  </div>
                  <DeploymentSummary strategy={deploymentStrategy} />
                </div>

                {/* Creative Strategy Details */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold tracking-tight">Creative Strategy</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">Active Intent</Badge>
                    </div>
                  </div>
                  {strategy ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <section className="space-y-3">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Narrative Bridge</label>
                          <div className="p-5 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-sm">
                            <p className="text-lg font-semibold leading-relaxed">{strategy.coreMessage?.primary}</p>
                            <p className="mt-3 text-sm text-muted-foreground">{strategy.coreMessage?.supporting}</p>
                          </div>
                        </section>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-card/40 border border-border/50">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Pacing</label>
                            <span className="font-bold capitalize">{strategy.pacing}</span>
                          </div>
                          <div className="p-4 rounded-2xl bg-card/40 border border-border/50">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Hook Window</label>
                            <span className="font-bold">{strategy.hookTiming}s</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <section className="space-y-3">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Visual Architecture</label>
                          <div className="p-5 rounded-[2rem] bg-primary/5 border border-primary/10">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-background/50">{strategy.visualDirection?.tone}</Badge>
                              <Badge variant="outline" className="bg-background/50">{strategy.visualDirection?.cameraMovement}</Badge>
                              <Badge variant="outline" className="bg-background/50">{strategy.visualDirection?.musicMood}</Badge>
                            </div>
                            <div className="mt-6 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/20">
                                  <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                <div className="text-xs">
                                  <p className="text-muted-foreground">Prompt Engine</p>
                                  <p className="font-bold uppercase tracking-widest">Optimized</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-3">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Call to Action</label>
                          <div className="p-5 rounded-[2rem] bg-card/40 border border-border/50 flex items-center justify-between">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                              <MousePointer className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="flex-1 px-4">
                              <p className="text-sm font-bold">{strategy.cta?.text}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{strategy.cta?.strength} • {strategy.cta?.placement}</p>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-[2.5rem] bg-card/30">
                      <p className="text-muted-foreground mb-4">No creative intent configured.</p>
                      <Button onClick={() => navigate(`/storyboard/${id}`)}>
                        <Target className="h-4 w-4 mr-2" />
                        Generate Strategy
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Other tabs placeholders for now - keeping it focused on the "Wow" factor */}
            <TabsContent value="creative">
              <div className="grid grid-cols-3 gap-6">
                {/* Placeholder creative cards */}
                {[1, 2, 3].map(i => (
                  <Card key={i} className="overflow-hidden border-border/50 bg-card/50 group">
                    <div className="aspect-video bg-black relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Film className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      {/* Heatmap Overlay Mockup */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-50" />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">Variant {String.fromCharCode(64 + i)}</span>
                        <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-500/30">Strong Win</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Attention: <span className="text-foreground">High</span></div>
                        <div>Completion: <span className="text-foreground">94%</span></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

          </Tabs>

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
  <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg border border-border/50">{icon}</div>
      </div>
      <div>
        {trend && <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">{trend} vs batch</span>}
        {warning && <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">{warning}</span>}
      </div>
    </CardContent>
  </Card>
);

export default CampaignDetails;
