import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TVScriptInputForm, TVScriptFormData } from "@/components/create/TVScriptInputForm";
import { StrategyModule, TVAdStrategy } from "@/components/strategy/StrategyModule";
import CampaignConceptCard from "@/components/CampaignConceptCard";
import CampaignCard from "@/components/CampaignCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Check, 
  FileText, 
  Wand2, 
  Tv,
  Clock,
  Shield,
  Calendar
} from "lucide-react";
import { CreatePageSkeleton } from "@/components/skeletons/CreatePageSkeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

type FlowStep = "script" | "strategy" | "storyboard" | "concepts";

const STEP_CONFIG = [
  { key: "script", label: "Script", icon: FileText, description: "Write your TV script" },
  { key: "strategy", label: "Strategy", icon: Wand2, description: "AI builds broadcast strategy" },
  { key: "storyboard", label: "Storyboard", icon: Tv, description: "Scene-by-scene breakdown" },
  { key: "concepts", label: "Production", icon: Sparkles, description: "Generate final concepts" },
];

const Create = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>("script");
  const [strategy, setStrategy] = useState<TVAdStrategy | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [isStrategyLocked, setIsStrategyLocked] = useState(false);
  const [formData, setFormData] = useState<TVScriptFormData | null>(null);
  const [generatedConcepts, setGeneratedConcepts] = useState<any[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);

  // Parse URL params for pre-filled data
  const initialConcept = searchParams.get("concept") || undefined;
  const initialDuration = searchParams.get("duration") || undefined;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (campaigns) {
        setRecentCampaigns(campaigns);
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Step 1: User submits script → Generate strategy via AI
  const handleScriptSubmit = async (data: TVScriptFormData) => {
    setGenerating(true);
    setFormData(data);
    
    try {
      const { data: strategyData, error } = await supabase.functions.invoke("generate-tv-strategy", {
        body: {
          prompt: data.script,
          adType: "video",
          duration: data.duration,
          dayparts: data.dayparts,
          objective: data.objective,
          targetDemo: data.targetDemo
        }
      });
      
      if (error) throw error;
      
      if (strategyData?.strategy) {
        setStrategy(strategyData.strategy);
        setBrandId(strategyData.brandId);
        setFlowStep("strategy");
        toast({
          title: "Strategy Generated",
          description: "Review your TV ad strategy and customize as needed."
        });
      }
    } catch (error: any) {
      console.error("Error generating strategy:", error);
      toast({
        title: "Strategy Generation Failed",
        description: error.message || "Failed to generate strategy. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  // Step 2: User approves strategy → Generate concepts
  const handleStrategyApproved = async () => {
    if (!strategy || !formData || !brandId) return;
    
    setGenerating(true);
    
    try {
      const { data: campaignsData, error } = await supabase.functions.invoke("generate-ideas", {
        body: {
          prompt: formData.script,
          adType: "video",
          goal: strategy.objective,
          targetAudience: {
            demographics: strategy.audience.ageRange,
            interests: strategy.audience.psychographicIntent
          },
          creativeStyle: strategy.visualDirection.tone,
          aspectRatios: ["16:9"], // TV standard
          duration: formData.duration,
          strategy // Include full strategy for persistence
        }
      });
      
      if (error) throw error;
      
      if (campaignsData?.campaigns) {
        setGeneratedConcepts(campaignsData.campaigns);
        setFlowStep("concepts");
        toast({
          title: "TV Ad Concepts Generated!",
          description: `Created ${campaignsData.campaigns.length} broadcast-ready concepts.`
        });
      }
    } catch (error: any) {
      console.error("Error generating concepts:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate TV ad concepts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleBackToScript = () => {
    setFlowStep("script");
    setStrategy(null);
    setGeneratedConcepts([]);
  };

  const handleBackToStrategy = () => {
    setFlowStep("strategy");
    setGeneratedConcepts([]);
  };

  const getCurrentStepIndex = () => STEP_CONFIG.findIndex(s => s.key === flowStep);

  const getCampaignThumbnail = (campaign: any) => {
    const storyboard = campaign.storyboard as any;
    if (storyboard?.type === "image_ad" && storyboard?.generatedImageUrl) {
      return storyboard.generatedImageUrl;
    }
    if (storyboard?.scenes?.length > 0) {
      const firstSceneWithVisual = storyboard.scenes.find((s: any) => s.visualUrl);
      if (firstSceneWithVisual?.visualUrl) return firstSceneWithVisual.visualUrl;
    }
    return "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&auto=format&fit=crop";
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete campaign",
          variant: "destructive"
        });
      } else {
        setRecentCampaigns(prev => prev.filter(c => c.id !== id));
        toast({
          title: "Deleted",
          description: "Campaign deleted successfully"
        });
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <CreatePageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants} 
        className="p-6 max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div className="text-center space-y-2" variants={itemVariants}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Tv className="h-7 w-7 text-primary" />
            <h1 className="font-bold text-foreground text-2xl">
              Create TV Ad
            </h1>
          </div>
          <p className="text-muted-foreground">
            Script-first approach for broadcast-ready advertising
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-1 md:gap-2 overflow-x-auto pb-2">
          {STEP_CONFIG.map((step, index) => {
            const isActive = flowStep === step.key;
            const isPast = getCurrentStepIndex() > index;
            const IconComponent = step.icon;
            
            return (
              <div key={step.key} className="flex items-center gap-1 md:gap-2">
                <div className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all
                  ${isActive ? "bg-primary text-primary-foreground" : ""}
                  ${isPast ? "bg-primary/20 text-primary" : ""}
                  ${!isActive && !isPast ? "bg-muted text-muted-foreground" : ""}
                `}>
                  {isPast ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <IconComponent className="h-4 w-4" />
                  )}
                  <span className="hidden md:inline font-medium">{step.label}</span>
                </div>
                {index < STEP_CONFIG.length - 1 && (
                  <div className={`w-6 md:w-10 h-0.5 ${isPast ? "bg-primary/30" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* TV Ad Features Strip */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 flex-wrap">
          <Badge variant="outline" className="border-border text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            15s / 30s / 60s Spots
          </Badge>
          <Badge variant="outline" className="border-border text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Daypart Targeting
          </Badge>
          <Badge variant="outline" className="border-border text-muted-foreground">
            <Shield className="h-3 w-3 mr-1" />
            Broadcast Compliance
          </Badge>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Script Input */}
          {flowStep === "script" && !generating && (
            <motion.div
              key="script"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <TVScriptInputForm 
                onSubmit={handleScriptSubmit}
                initialConcept={initialConcept}
                initialDuration={initialDuration}
              />

              {/* Recent Campaigns */}
              {recentCampaigns.length > 0 && (
                <motion.div className="space-y-4 mt-8" variants={itemVariants}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Recent TV Campaigns</h2>
                    <Button variant="link" onClick={() => navigate("/ad-operations")} className="text-primary">
                      View all
                    </Button>
                  </div>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                    variants={containerVariants}
                  >
                    {recentCampaigns.slice(0, 3).map((campaign) => (
                      <motion.div key={campaign.id} variants={itemVariants}>
                        <CampaignCard 
                          image={getCampaignThumbnail(campaign)} 
                          title={campaign.title} 
                          description={campaign.description} 
                          onClick={() => {
                            if (campaign.ad_type === "image") {
                              navigate(`/editor/${campaign.id}`);
                            } else {
                              navigate(campaign.status === "concept" ? `/storyboard/${campaign.id}` : `/video-editor/${campaign.id}`);
                            }
                          }} 
                          onEdit={() => {
                            if (campaign.ad_type === "image") {
                              navigate(`/editor/${campaign.id}`);
                            } else {
                              navigate(campaign.status === "concept" ? `/storyboard/${campaign.id}` : `/video-editor/${campaign.id}`);
                            }
                          }} 
                          onDelete={() => handleDelete(campaign.id)} 
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {generating && (
            <motion.div 
              key="loading"
              className="flex flex-col items-center justify-center py-20 space-y-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <Tv className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-lg text-foreground font-medium">
                {flowStep === "script" ? "Building TV Strategy..." : "Generating TV Concepts..."}
              </p>
              <p className="text-sm text-muted-foreground max-w-md text-center">
                {flowStep === "script" 
                  ? "AI is analyzing your script and creating a broadcast-ready strategy with scene breakdowns"
                  : "Creating production-ready TV ad concepts with storyboards"
                }
              </p>
            </motion.div>
          )}

          {/* Step 2: Strategy Review */}
          {flowStep === "strategy" && !generating && strategy && (
            <motion.div
              key="strategy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={handleBackToScript}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Script
                </Button>
                <div className="text-center">
                  <h2 className="font-bold text-foreground text-xl">TV Ad Strategy</h2>
                  <p className="text-sm text-muted-foreground">Review and customize before production</p>
                </div>
                <div className="w-[120px]" />
              </div>

              <StrategyModule
                strategy={strategy}
                onStrategyChange={setStrategy}
                isAIGenerated={true}
                isLocked={isStrategyLocked}
                onToggleLock={() => setIsStrategyLocked(!isStrategyLocked)}
              />

              {/* Approve & Generate Button */}
              <motion.div 
                className="flex justify-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  size="lg" 
                  onClick={handleStrategyApproved}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate TV Concepts
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Generated Concepts */}
          {flowStep === "concepts" && !generating && generatedConcepts.length > 0 && (
            <motion.div
              key="concepts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={handleBackToStrategy}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Strategy
                </Button>
                <div className="text-center">
                  <h2 className="font-bold text-foreground text-xl">TV Ad Concepts</h2>
                  <p className="text-sm text-muted-foreground">Select a concept to begin production</p>
                </div>
                <div className="w-[140px]" />
              </div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6" 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {generatedConcepts.map((concept) => (
                  <motion.div key={concept.id} variants={itemVariants}>
                    <CampaignConceptCard 
                      title={concept.title} 
                      description={concept.description} 
                      script={concept.script} 
                      ctaText={concept.cta_text} 
                      predictedCtr={concept.predicted_ctr} 
                      predictedEngagement={concept.predicted_engagement} 
                      onClick={() => {
                        navigate(`/storyboard/${concept.id}`);
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Start New */}
              <div className="text-center pt-4">
                <Button variant="outline" onClick={handleBackToScript}>
                  Start New TV Ad
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State for Concepts */}
        {flowStep === "script" && recentCampaigns.length === 0 && !generating && (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-foreground mb-2">Ready to create your first TV ad</p>
              <p className="text-sm text-muted-foreground">
                Write your script above and AI will build the complete broadcast strategy
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Create;
