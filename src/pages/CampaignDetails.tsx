import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PublishDialog } from "@/components/campaign/PublishDialog";
import { StrategyEditModal } from "@/components/campaign/StrategyEditModal";
import { StrategyPanel } from "@/components/storyboard/StrategyPanel";
import { TVAdStrategy } from "@/components/strategy/StrategyModule";
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
  TrendingDown,
  Users,
  Target,
  DollarSign,
  Eye,
  MousePointer,
  Sparkles,
  Calendar,
  Globe,
  Settings as SettingsIcon,
  BarChart3,
  Layers,
  Save,
  Rocket,
  Tv,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [strategy, setStrategy] = useState<TVAdStrategy | null>(null);

  // Editable settings state
  const [settings, setSettings] = useState({
    title: "",
    description: "",
    goal: "",
    status: "",
    dailyBudget: "50",
    totalBudget: "500",
    startDate: "",
    endDate: "",
    autoOptimize: true,
    abTesting: true,
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast({ title: "Error", description: "Campaign not found", variant: "destructive" });
        navigate("/ad-operations");
        return;
      }

      setCampaign(data);
      
      // Extract strategy from storyboard if it exists
      const storyboardData = data.storyboard as any;
      if (storyboardData?.strategy) {
        setStrategy(storyboardData.strategy);
      }
      
      setSettings({
        title: data.title,
        description: data.description,
        goal: data.goal,
        status: data.status || "concept",
        dailyBudget: "50",
        totalBudget: "500",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        autoOptimize: true,
        abTesting: true,
      });
      setLoading(false);
    };

    fetchCampaign();
  }, [id, navigate, toast]);

  const handleSaveSettings = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("campaigns")
      .update({
        title: settings.title,
        description: settings.description,
        goal: settings.goal,
        status: settings.status,
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } else {
      setCampaign({ ...campaign, ...settings });
      toast({ title: "Saved", description: "Campaign settings updated" });
    }
    setSaving(false);
  };

  const handleDuplicate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !campaign) return;

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        ...campaign,
        id: undefined,
        title: `${campaign.title} (Copy)`,
        created_at: undefined,
        updated_at: undefined,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to duplicate campaign", variant: "destructive" });
    } else if (data) {
      toast({ title: "Success", description: "Campaign duplicated" });
      navigate(`/campaign/${data.id}`);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) {
        toast({ title: "Error", description: "Failed to delete campaign", variant: "destructive" });
      } else {
        toast({ title: "Deleted", description: "Campaign deleted successfully" });
        navigate("/ad-operations");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: React.ReactNode }> = {
      active: { class: "bg-green-500/10 text-green-500 border-green-500/20", icon: <Play className="h-3 w-3" /> },
      paused: { class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: <Pause className="h-3 w-3" /> },
      concept: { class: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: null },
      in_progress: { class: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: null },
      completed: { class: "bg-primary/10 text-primary border-primary/20", icon: null },
    };
    return config[status] || config.concept;
  };

  const getCampaignThumbnail = () => {
    const storyboard = campaign?.storyboard as any;
    if (storyboard?.type === "image_ad" && storyboard?.generatedImageUrl) {
      return storyboard.generatedImageUrl;
    }
    if (storyboard?.scenes?.length > 0) {
      const firstSceneWithVisual = storyboard.scenes.find((s: any) => s.visualUrl);
      if (firstSceneWithVisual?.visualUrl) return firstSceneWithVisual.visualUrl;
    }
    return null;
  };

  const getCreatives = () => {
    const storyboard = campaign?.storyboard as any;
    if (storyboard?.scenes?.length) {
      return storyboard.scenes.map((scene: any, idx: number) => ({
        id: idx,
        name: `Scene ${idx + 1}`,
        thumbnail: scene.visualUrl,
        ctr: (Math.random() * 3 + 0.5).toFixed(2),
        impressions: Math.floor(Math.random() * 10000 + 1000),
        clicks: Math.floor(Math.random() * 300 + 50),
        status: Math.random() > 0.3 ? "active" : "paused",
      }));
    }
    if (storyboard?.type === "image_ad") {
      return [{
        id: 0,
        name: "Main Creative",
        thumbnail: storyboard.generatedImageUrl,
        ctr: (Math.random() * 3 + 0.5).toFixed(2),
        impressions: Math.floor(Math.random() * 10000 + 1000),
        clicks: Math.floor(Math.random() * 300 + 50),
        status: "active",
      }];
    }
    return [];
  };

  // Mock performance data
  const performanceData = {
    impressions: 45230,
    clicks: 1256,
    ctr: 2.78,
    conversions: 89,
    conversionRate: 7.08,
    spend: 234.50,
    cpc: 0.19,
    cpa: 2.64,
    roas: 4.2,
  };

  // Mock audience data
  const audienceData = {
    demographics: { age: "25-44", gender: "All", location: "United States" },
    interests: ["Technology", "Business", "Fitness"],
    devices: { mobile: 65, desktop: 30, tablet: 5 },
    topLocations: [
      { name: "California", percentage: 22 },
      { name: "New York", percentage: 18 },
      { name: "Texas", percentage: 14 },
      { name: "Florida", percentage: 12 },
    ],
  };

  // Mock time series data for charts
  const performanceTimeSeries = [
    { date: "Dec 1", impressions: 5200, clicks: 145, conversions: 12, spend: 28 },
    { date: "Dec 3", impressions: 6800, clicks: 189, conversions: 15, spend: 35 },
    { date: "Dec 5", impressions: 5900, clicks: 162, conversions: 11, spend: 31 },
    { date: "Dec 7", impressions: 7400, clicks: 210, conversions: 18, spend: 42 },
    { date: "Dec 9", impressions: 8100, clicks: 235, conversions: 21, spend: 48 },
    { date: "Dec 11", impressions: 7200, clicks: 198, conversions: 16, spend: 39 },
    { date: "Dec 13", impressions: 9500, clicks: 278, conversions: 24, spend: 52 },
  ];

  const dailyMetrics = [
    { day: "Mon", impressions: 6200, clicks: 172, ctr: 2.77 },
    { day: "Tue", impressions: 7100, clicks: 198, ctr: 2.79 },
    { day: "Wed", impressions: 6800, clicks: 195, ctr: 2.87 },
    { day: "Thu", impressions: 7500, clicks: 215, ctr: 2.87 },
    { day: "Fri", impressions: 8200, clicks: 238, ctr: 2.90 },
    { day: "Sat", impressions: 5400, clicks: 145, ctr: 2.69 },
    { day: "Sun", impressions: 4030, clicks: 108, ctr: 2.68 },
  ];

  const platformBreakdown = [
    { name: "Instagram", value: 42, color: "hsl(var(--chart-1))" },
    { name: "Facebook", value: 28, color: "hsl(var(--chart-2))" },
    { name: "TikTok", value: 18, color: "hsl(var(--chart-3))" },
    { name: "Google", value: 12, color: "hsl(var(--chart-4))" },
  ];

  const conversionFunnel = [
    { stage: "Impressions", value: 45230 },
    { stage: "Clicks", value: 1256 },
    { stage: "Leads", value: 234 },
    { stage: "Conversions", value: 89 },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusBadge(campaign?.status || "concept");
  const creatives = getCreatives();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/ad-operations")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                {getCampaignThumbnail() ? (
                  <img src={getCampaignThumbnail()} alt="" className="w-full h-full object-cover" />
                ) : campaign?.ad_type === "video" ? (
                  <Play className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{campaign?.title}</h1>
                  <Badge variant="outline" className={`gap-1 ${statusConfig.class}`}>
                    {statusConfig.icon}
                    <span className="capitalize">{campaign?.status || "concept"}</span>
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">{campaign?.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="capitalize">{campaign?.ad_type} Ad</span>
                  <span>•</span>
                  <span className="capitalize">{campaign?.goal}</span>
                  <span>•</span>
                  <span>Created {new Date(campaign?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              if (campaign?.ad_type === "image") {
                navigate(`/editor/${campaign.id}`);
              } else {
                navigate(campaign?.status === "concept" ? `/storyboard/${campaign.id}` : `/video-editor/${campaign.id}`);
              }
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Creative
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button size="sm" onClick={() => setPublishDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Rocket className="h-4 w-4 mr-2" />
              Publish Campaign
            </Button>
          </div>
        </div>

        {/* Publish Dialog */}
        <PublishDialog
          open={publishDialogOpen}
          onOpenChange={setPublishDialogOpen}
          campaign={campaign}
          creatives={creatives.map((c: any) => ({
            id: c.id,
            name: c.name,
            thumbnail: c.thumbnail,
            ctr: c.ctr,
            platforms: [],
          }))}
          onPublish={() => {
            setPublishDialogOpen(false);
            toast({
              title: "Campaign Published!",
              description: "Your campaign is now live and running.",
            });
            setSettings({ ...settings, status: "active" });
            setCampaign({ ...campaign, status: "active" });
          }}
        />

        {/* Strategy Edit Modal */}
        <StrategyEditModal
          open={strategyModalOpen}
          onOpenChange={setStrategyModalOpen}
          campaignId={id || ""}
          initialStrategy={strategy}
          onStrategySaved={(newStrategy) => {
            setStrategy(newStrategy);
            setCampaign({
              ...campaign,
              storyboard: { ...(campaign?.storyboard || {}), strategy: newStrategy }
            });
          }}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview" className="gap-2">
              <Layers className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="strategy" className="gap-2">
              <Tv className="h-4 w-4" />
              Strategy
            </TabsTrigger>
            <TabsTrigger value="creatives" className="gap-2">
              <Image className="h-4 w-4" />
              Creatives
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="audience" className="gap-2">
              <Users className="h-4 w-4" />
              Audience
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Impressions</span>
                  </div>
                  <div className="text-2xl font-bold">{performanceData.impressions.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5%
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MousePointer className="h-4 w-4" />
                    <span className="text-sm">Clicks</span>
                  </div>
                  <div className="text-2xl font-bold">{performanceData.clicks.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +8.3%
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">CTR</span>
                  </div>
                  <div className="text-2xl font-bold">{performanceData.ctr}%</div>
                  <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +0.3%
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Spend</span>
                  </div>
                  <div className="text-2xl font-bold">${performanceData.spend}</div>
                  <div className="text-sm text-muted-foreground mt-1">of $500 budget</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Insights */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-500">Scale Opportunity</div>
                        <div className="text-sm text-muted-foreground">
                          CTR is 40% above average. Consider increasing budget by 20%.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-500">Audience Suggestion</div>
                        <div className="text-sm text-muted-foreground">
                          Users aged 25-34 convert 2x more. Consider narrowing targeting.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-2">
                      <Image className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-500">Creative Tip</div>
                        <div className="text-sm text-muted-foreground">
                          Variant A outperforms others. Create similar variations for testing.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Campaign Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Creatives</span>
                    <span className="font-medium">{creatives.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Conversions</span>
                    <span className="font-medium">{performanceData.conversions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cost per Click</span>
                    <span className="font-medium">${performanceData.cpc}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cost per Acquisition</span>
                    <span className="font-medium">${performanceData.cpa}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ROAS</span>
                    <span className="font-medium text-green-500">{performanceData.roas}x</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Budget Used</span>
                      <span>{Math.round((performanceData.spend / 500) * 100)}%</span>
                    </div>
                    <Progress value={(performanceData.spend / 500) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            {strategy ? (
              <StrategyPanel 
                strategy={strategy} 
                onEdit={() => setStrategyModalOpen(true)} 
              />
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Strategy Found</h3>
                  <p className="text-muted-foreground mb-4">
                    This campaign doesn't have a TV ad strategy yet.
                  </p>
                  <Button onClick={() => setStrategyModalOpen(true)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Strategy
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Creatives Tab */}
          <TabsContent value="creatives" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Creative Variants</h3>
                <p className="text-sm text-muted-foreground">Manage and compare your ad creatives</p>
              </div>
              <Button onClick={() => navigate("/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Creative
              </Button>
            </div>

            {creatives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creatives.map((creative: any) => (
                  <Card key={creative.id} className="bg-card border-border overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      {creative.thumbnail ? (
                        <img src={creative.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`absolute top-2 right-2 ${creative.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}`}
                      >
                        {creative.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">{creative.name}</div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold">{creative.ctr}%</div>
                          <div className="text-xs text-muted-foreground">CTR</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{(creative.impressions / 1000).toFixed(1)}k</div>
                          <div className="text-xs text-muted-foreground">Impr.</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{creative.clicks}</div>
                          <div className="text-xs text-muted-foreground">Clicks</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          {creative.status === "active" ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                          {creative.status === "active" ? "Pause" : "Resume"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground mb-2">No creatives yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate your first creative to start running ads
                  </p>
                  <Button onClick={() => navigate("/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Creative
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Impressions</div>
                  <div className="text-2xl font-bold">{performanceData.impressions.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-green-500 text-xs mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5%
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Clicks</div>
                  <div className="text-2xl font-bold">{performanceData.clicks.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-green-500 text-xs mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +8.3%
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">CTR</div>
                  <div className="text-2xl font-bold">{performanceData.ctr}%</div>
                  <div className="flex items-center gap-1 text-green-500 text-xs mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +0.3%
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">ROAS</div>
                  <div className="text-2xl font-bold text-green-500">{performanceData.roas}x</div>
                  <div className="flex items-center gap-1 text-green-500 text-xs mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +0.8x
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Over Time Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>Impressions, clicks, and conversions trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceTimeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="impressions" 
                        stroke="hsl(var(--chart-1))" 
                        fillOpacity={1} 
                        fill="url(#colorImpressions)" 
                        name="Impressions"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="hsl(var(--chart-2))" 
                        fillOpacity={1} 
                        fill="url(#colorClicks)" 
                        name="Clicks"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Performance Bar Chart */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Daily Breakdown</CardTitle>
                  <CardDescription>Performance by day of week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyMetrics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Bar dataKey="impressions" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Impressions" />
                        <Bar dataKey="clicks" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Clicks" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Distribution Pie Chart */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>Traffic by advertising platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {platformBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel & Cost Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                  <CardDescription>User journey from impression to conversion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversionFunnel} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis type="category" dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                          formatter={(value: number) => value.toLocaleString()}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Cost Metrics</CardTitle>
                  <CardDescription>Spend efficiency breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Spend</div>
                      <div className="text-xl font-bold">${performanceData.spend}</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">CPC</div>
                      <div className="text-lg font-bold">${performanceData.cpc}</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">CPA</div>
                      <div className="text-lg font-bold">${performanceData.cpa}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="font-bold">{performanceData.conversionRate}%</span>
                  </div>
                  <Progress value={performanceData.conversionRate * 10} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Demographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Age Range</span>
                    <span className="font-medium">{audienceData.demographics.age}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium">{audienceData.demographics.gender}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Primary Location</span>
                    <span className="font-medium">{audienceData.demographics.location}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {audienceData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mobile</span>
                      <span>{audienceData.devices.mobile}%</span>
                    </div>
                    <Progress value={audienceData.devices.mobile} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Desktop</span>
                      <span>{audienceData.devices.desktop}%</span>
                    </div>
                    <Progress value={audienceData.devices.desktop} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tablet</span>
                      <span>{audienceData.devices.tablet}%</span>
                    </div>
                    <Progress value={audienceData.devices.tablet} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {audienceData.topLocations.map((location) => (
                    <div key={location.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{location.name}</span>
                        <span>{location.percentage}%</span>
                      </div>
                      <Progress value={location.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Campaign Settings</CardTitle>
                <CardDescription>Manage your campaign configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Name</Label>
                    <Input
                      id="title"
                      value={settings.title}
                      onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={settings.status} onValueChange={(v) => setSettings({ ...settings, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concept">Concept</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Campaign Goal</Label>
                  <Select value={settings.goal} onValueChange={(v) => setSettings({ ...settings, goal: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="consideration">Consideration</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="app_installs">App Installs</SelectItem>
                      <SelectItem value="lead_gen">Lead Generation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dailyBudget">Daily Budget ($)</Label>
                    <Input
                      id="dailyBudget"
                      type="number"
                      value={settings.dailyBudget}
                      onChange={(e) => setSettings({ ...settings, dailyBudget: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalBudget">Total Budget ($)</Label>
                    <Input
                      id="totalBudget"
                      type="number"
                      value={settings.totalBudget}
                      onChange={(e) => setSettings({ ...settings, totalBudget: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={settings.startDate}
                      onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={settings.endDate}
                      onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoOptimize">Auto-Optimize</Label>
                      <p className="text-sm text-muted-foreground">Let AI automatically adjust bids and targeting</p>
                    </div>
                    <Switch
                      id="autoOptimize"
                      checked={settings.autoOptimize}
                      onCheckedChange={(v) => setSettings({ ...settings, autoOptimize: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="abTesting">A/B Testing</Label>
                      <p className="text-sm text-muted-foreground">Enable automatic creative testing</p>
                    </div>
                    <Switch
                      id="abTesting"
                      checked={settings.abTesting}
                      onCheckedChange={(v) => setSettings({ ...settings, abTesting: v })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => navigate("/ad-operations")}>Cancel</Button>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Campaign</p>
                    <p className="text-sm text-muted-foreground">Permanently delete this campaign and all its data</p>
                  </div>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetails;
