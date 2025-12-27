import { useState, useEffect } from "react";
import type { Json } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CampaignIntentModal, CampaignIntentData } from "@/components/create/CampaignIntentModal";
import { StrategyReviewModal, AIStrategy } from "@/components/create/StrategyReviewModal";
import { StoryboardConceptsModal, StoryboardConcept } from "@/components/create/StoryboardConceptsModal";
import { CreativeProductionModal, ProductionSettings } from "@/components/create/CreativeProductionModal";
import { StrategyConfirmationModal, StrategyConfirmationData } from "@/components/create/StrategyConfirmationModal";
import { PrePublishSimulationModal } from "@/components/create/PrePublishSimulationModal";
import CampaignCard from "@/components/CampaignCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Tv, Sparkles, Play, Clock, ArrowRight } from "lucide-react";
import { CreatePageSkeleton } from "@/components/skeletons/CreatePageSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0
  }
};
type ModalStep = "closed" | "intent" | "strategy" | "storyboard" | "production" | "confirmation" | "simulation";
const Create = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [modalStep, setModalStep] = useState<ModalStep>("closed");
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);

  // Flow state
  const [intentData, setIntentData] = useState<CampaignIntentData | null>(null);
  const [strategy, setStrategy] = useState<AIStrategy | null>(null);
  const [selectedLength, setSelectedLength] = useState("");
  const [concepts, setConcepts] = useState<StoryboardConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<StoryboardConcept | null>(null);
  const [productionSettings, setProductionSettings] = useState<ProductionSettings | null>(null);
  const [simulation, setSimulation] = useState<any>(null);

  // Quick create state
  const [concept, setConcept] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("30s");

  // Loading states
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [generatingStoryboards, setGeneratingStoryboards] = useState(false);
  const [simulatingCampaign, setSimulatingCampaign] = useState(false);
  const [publishing, setPublishing] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const {
        data: campaigns
      } = await supabase.from("campaigns").select("*").eq("user_id", session.user.id).order("created_at", {
        ascending: false
      }).limit(6);
      if (campaigns) setRecentCampaigns(campaigns);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);
  const handleStartCreate = () => setModalStep("intent");
  const handleIntentContinue = async (data: CampaignIntentData) => {
    setIntentData(data);
    setModalStep("strategy");
    setGeneratingStrategy(true);

    // Simulate AI strategy generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStrategy({
      campaignType: data.goal === "awareness" || data.goal === "brand_lift" ? "brand" : "performance",
      recommendedLengths: ["15s", "30s"],
      storytellingRequired: data.goal !== "promo",
      frequencyRange: "3-5x per week",
      airingWindows: ["Prime", "Fringe"],
      channelTypes: ["General Entertainment", "Sports", "News"],
      budgetEfficiencyTier: data.budgetRange === "enterprise" ? "high" : data.budgetRange === "starter" ? "low" : "medium",
      messagingHierarchy: {
        hook: "Attention-grabbing opening visual",
        message: "Core value proposition with emotional appeal",
        cta: "Clear call-to-action with urgency"
      }
    });
    setGeneratingStrategy(false);
  };
  const handleStrategyContinue = async (strat: AIStrategy, length: string) => {
    setSelectedLength(length);
    setModalStep("storyboard");
    setGeneratingStoryboards(true);

    // Simulate storyboard generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    setConcepts([{
      id: "1",
      title: "Emotional Journey",
      description: "A heartfelt story that connects with viewers on a personal level",
      scenes: [{
        number: 1,
        description: "Opening hook",
        duration: "3s"
      }, {
        number: 2,
        description: "Problem reveal",
        duration: "5s"
      }, {
        number: 3,
        description: "Solution",
        duration: "5s"
      }, {
        number: 4,
        description: "CTA",
        duration: "2s"
      }],
      tone: "Warm",
      style: "Cinematic",
      bestFor: "awareness"
    }, {
      id: "2",
      title: "Fast-Paced Impact",
      description: "Quick cuts and dynamic visuals for maximum recall",
      scenes: [{
        number: 1,
        description: "Bold opener",
        duration: "2s"
      }, {
        number: 2,
        description: "Product showcase",
        duration: "6s"
      }, {
        number: 3,
        description: "Benefits",
        duration: "5s"
      }, {
        number: 4,
        description: "Strong CTA",
        duration: "2s"
      }],
      tone: "Energetic",
      style: "Modern",
      bestFor: "recall"
    }, {
      id: "3",
      title: "Repetition Power",
      description: "Memorable branding through strategic repetition",
      scenes: [{
        number: 1,
        description: "Brand intro",
        duration: "3s"
      }, {
        number: 2,
        description: "Message 1",
        duration: "4s"
      }, {
        number: 3,
        description: "Message 2",
        duration: "4s"
      }, {
        number: 4,
        description: "Brand outro",
        duration: "4s"
      }],
      tone: "Confident",
      style: "Bold",
      bestFor: "frequency"
    }]);
    setGeneratingStoryboards(false);
  };
  const handleStoryboardSelect = (concept: StoryboardConcept) => {
    setSelectedConcept(concept);
    setModalStep("production");
  };
  const handleProductionContinue = (settings: ProductionSettings) => {
    setProductionSettings(settings);
    setModalStep("confirmation");
  };
  const handleConfirmationContinue = async () => {
    setModalStep("simulation");
    setSimulatingCampaign(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSimulation({
      estimatedReach: 2500000,
      estimatedFrequency: 4.2,
      estimatedImpressions: 10500000,
      estimatedCPM: 12.50,
      airingSchedule: [{
        daypart: "Prime Time",
        percentage: 45
      }, {
        daypart: "Fringe",
        percentage: 35
      }, {
        daypart: "Daytime",
        percentage: 20
      }],
      networkBreakdown: [{
        network: "ABC",
        impressions: 3200000
      }, {
        network: "NBC",
        impressions: 2800000
      }, {
        network: "CBS",
        impressions: 2500000
      }, {
        network: "FOX",
        impressions: 2000000
      }],
      riskWarnings: []
    });
    setSimulatingCampaign(false);
  };
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) return;
      let {
        data: brands
      } = await supabase.from("brands").select("id").eq("user_id", session.user.id).limit(1);
      let brandId = brands?.[0]?.id;
      if (!brandId) {
        const {
          data: newBrand
        } = await supabase.from("brands").insert({
          user_id: session.user.id,
          name: "My Brand"
        }).select().single();
        brandId = newBrand?.id;
      }
      const storyboardData = {
        scenes: selectedConcept?.scenes,
        duration: selectedLength,
        tone: selectedConcept?.tone,
        style: selectedConcept?.style,
        strategy,
        productionSettings
      } as unknown as Json;
      const {
        data: campaign,
        error
      } = await supabase.from("campaigns").insert([{
        user_id: session.user.id,
        brand_id: brandId!,
        title: selectedConcept?.title || "New TV Campaign",
        description: selectedConcept?.description || "",
        ad_type: "video",
        goal: intentData?.goal || "awareness",
        status: "concept",
        storyboard: storyboardData
      }]).select().single();
      if (error) throw error;
      setModalStep("closed");
      navigate(`/storyboard/${campaign.id}`);
      toast({
        title: "Campaign Published!",
        description: "Your TV campaign has been created successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
    }
  };
  const handleCloseModals = () => {
    setModalStep("closed");
    setIntentData(null);
    setStrategy(null);
    setConcepts([]);
    setSelectedConcept(null);
    setSimulation(null);
  };
  const handleDelete = async (id: string) => {
    if (confirm("Delete this campaign?")) {
      await supabase.from("campaigns").delete().eq("id", id);
      setRecentCampaigns(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Deleted",
        description: "Campaign deleted"
      });
    }
  };
  if (loading) return <DashboardLayout><CreatePageSkeleton /></DashboardLayout>;
  return <DashboardLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 max-w-6xl mx-auto space-y-10">
        {/* Quick TV Ad Creation Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Tv className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Create TV Ad</h3>
                  <p className="text-xs text-muted-foreground">Script-first broadcast advertising</p>
                </div>
              </div>

              <div className="space-y-4">
                <Textarea value={concept} onChange={e => setConcept(e.target.value)} placeholder="Describe your TV ad concept... What's the story you want to tell?" className="min-h-[80px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none" />

                <div>
                  <label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Spot Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{
                    value: "15s",
                    label: "15 sec",
                    description: "Quick impact"
                  }, {
                    value: "30s",
                    label: "30 sec",
                    description: "Standard spot"
                  }, {
                    value: "60s",
                    label: "60 sec",
                    description: "Story-driven"
                  }].map(option => <button key={option.value} onClick={() => setSelectedDuration(option.value)} className={`p-3 rounded-lg border text-center transition-all ${selectedDuration === option.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"}`}>
                        <p className="text-lg font-bold">{option.label}</p>
                        <p className="text-[10px]">{option.description}</p>
                      </button>)}
                  </div>
                </div>

                <Button onClick={handleStartCreate} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11">
                  <Sparkles className="h-4 w-4 mr-2" />
                  ​Next  
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {recentCampaigns.length > 0 && <motion.div className="space-y-6" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-bold text-foreground">Recent Campaigns</h2><p className="text-muted-foreground">Continue editing</p></div>
              <Button variant="ghost" onClick={() => navigate("/ad-operations")} className="text-primary">View all</Button>
            </div>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
              {recentCampaigns.slice(0, 6).map(campaign => <motion.div key={campaign.id} variants={itemVariants}>
                  <CampaignCard image="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800" title={campaign.title} description={campaign.description} onClick={() => navigate(campaign.status === "concept" ? `/storyboard/${campaign.id}` : `/video-editor/${campaign.id}`)} onEdit={() => navigate(campaign.status === "concept" ? `/storyboard/${campaign.id}` : `/video-editor/${campaign.id}`)} onDelete={() => handleDelete(campaign.id)} />
                </motion.div>)}
            </motion.div>
          </motion.div>}

        {recentCampaigns.length === 0 && <motion.div variants={itemVariants} className="text-center py-16 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-muted mb-4"><Play className="h-10 w-10 text-muted-foreground" /></div>
            <h3 className="text-xl font-semibold text-foreground">No campaigns yet</h3>
            <p className="text-muted-foreground">Create your first TV ad campaign</p>
          </motion.div>}
      </motion.div>

      {/* 7-Step Modal Flow */}
      <CampaignIntentModal open={modalStep === "intent"} onOpenChange={open => !open && handleCloseModals()} onContinue={handleIntentContinue} />
      <StrategyReviewModal open={modalStep === "strategy"} onOpenChange={open => !open && handleCloseModals()} onBack={() => setModalStep("intent")} onContinue={handleStrategyContinue} strategy={strategy} isLoading={generatingStrategy} />
      <StoryboardConceptsModal open={modalStep === "storyboard"} onOpenChange={open => !open && handleCloseModals()} onBack={() => setModalStep("strategy")} onSelect={handleStoryboardSelect} concepts={concepts} duration={selectedLength} isLoading={generatingStoryboards} />
      <CreativeProductionModal open={modalStep === "production"} onOpenChange={open => !open && handleCloseModals()} onBack={() => setModalStep("storyboard")} onContinue={handleProductionContinue} conceptTitle={selectedConcept?.title || ""} duration={selectedLength} />
      <StrategyConfirmationModal open={modalStep === "confirmation"} onOpenChange={open => !open && handleCloseModals()} onBack={() => setModalStep("production")} onContinue={handleConfirmationContinue} aiRecommendations={{
      budgetAllocation: 70,
      flightingPattern: "pulsing",
      deliveryTiming: "prime",
      placementStrategy: "balanced",
      frequencyCap: 5
    }} />
      <PrePublishSimulationModal open={modalStep === "simulation"} onOpenChange={open => !open && handleCloseModals()} onBack={() => setModalStep("confirmation")} onPublish={handlePublish} simulation={simulation} isLoading={simulatingCampaign} isPublishing={publishing} conceptTitle={selectedConcept?.title || ""} duration={selectedLength} />
    </DashboardLayout>;
};
export default Create;