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
import { Plus, Tv, Play, ArrowRight, Paperclip, X } from "lucide-react";
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
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; preview: string }>>([]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };
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
        productionSettings,
        concept: intentData?.concept,
        referenceFiles: intentData?.referenceFiles
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
          <Card className="bg-card border-border overflow-hidden relative">
            <CardContent className="p-4 relative">
              {/* Uploaded files preview */}
              {uploadedFiles.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {uploadedFiles.map((item, index) => (
                    <div key={index} className="relative group">
                      {item.file.type.startsWith('video/') ? (
                        <video 
                          src={item.preview} 
                          className="w-16 h-16 object-cover rounded-lg border border-border"
                        />
                      ) : (
                        <img 
                          src={item.preview} 
                          alt={`Reference ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-border"
                        />
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {item.file.type.startsWith('video/') && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-background/80 flex items-center justify-center">
                            <Play className="h-3 w-3 text-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="relative">
                <Textarea 
                  value={concept} 
                  onChange={e => setConcept(e.target.value)} 
                  placeholder="Describe your TV ad concept..." 
                  className="min-h-[120px] bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground resize-none pr-16 pb-14" 
                />
                
                {/* Bottom controls inside textarea area */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  {/* Left side: Upload + Duration chips */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*,video/*';
                        input.multiple = true;
                        input.onchange = (e) => {
                          handleFileUpload((e.target as HTMLInputElement).files);
                        };
                        input.click();
                      }}
                      className="w-7 h-7 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    
                    {["15s", "30s", "60s"].map(duration => (
                      <button 
                        key={duration} 
                        onClick={() => setSelectedDuration(duration)} 
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedDuration === duration 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted/80 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                  
                  {/* Right side: Submit button */}
                  <Button 
                    onClick={handleStartCreate} 
                    size="sm"
                    className="h-8 px-4 rounded-full bg-foreground text-background hover:bg-foreground/90"
                  >
                    Next
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
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
      <CampaignIntentModal 
        open={modalStep === "intent"} 
        onOpenChange={open => !open && handleCloseModals()} 
        onContinue={handleIntentContinue}
        initialConcept={concept}
        initialDuration={selectedDuration}
        referenceFiles={uploadedFiles}
      />
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