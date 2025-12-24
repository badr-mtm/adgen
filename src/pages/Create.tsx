import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdCreationForm, { AdCreationData } from "@/components/AdCreationForm";
import CampaignConceptCard from "@/components/CampaignConceptCard";
import CampaignCard from "@/components/CampaignCard";
import { StrategyModule, TVAdStrategy } from "@/components/strategy/StrategyModule";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
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

type FlowStep = "input" | "strategy" | "concepts";

const Create = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>("input");
  const [strategy, setStrategy] = useState<TVAdStrategy | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [isStrategyLocked, setIsStrategyLocked] = useState(false);
  const [formData, setFormData] = useState<AdCreationData | null>(null);
  const [generatedConcepts, setGeneratedConcepts] = useState<any[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);

  // Parse URL params for pre-filled data
  const productUrl = searchParams.get("productUrl") || undefined;
  const productTitle = searchParams.get("productTitle") || "";
  const productDescription = searchParams.get("productDescription") || "";
  const assetsParam = searchParams.get("assets");
  const defaultAdType = searchParams.get("type") as "video" | "image" | null;

  const assetUrls = assetsParam ? JSON.parse(assetsParam) as string[] : [];
  const initialPrompt = productTitle 
    ? `Create an ad for: ${productTitle}${productDescription ? `. ${productDescription}` : ''}` 
    : "";
  
  const initialFormData = {
    prompt: initialPrompt,
    adType: defaultAdType || "video" as "video" | "image",
    assetUrls,
    productUrl
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      const { data: brands } = await supabase
        .from("brands")
        .select("name")
        .eq("user_id", session.user.id)
        .limit(1);
      
      if (!brands || brands.length === 0) {
        navigate("/brand-setup");
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

  // Step 1: User submits form → Generate strategy via AI
  const handleAdCreation = async (data: AdCreationData) => {
    setGenerating(true);
    setFormData(data);
    
    try {
      const { data: strategyData, error } = await supabase.functions.invoke("generate-tv-strategy", {
        body: {
          prompt: data.prompt,
          adType: data.adType,
          productUrl: data.productUrl
        }
      });
      
      if (error) throw error;
      
      if (strategyData?.strategy) {
        setStrategy(strategyData.strategy);
        setBrandId(strategyData.brandId);
        setFlowStep("strategy");
        toast({
          title: "Strategy Generated",
          description: "Review and customize your TV ad strategy below."
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

  // Step 2: User approves strategy → Generate creative concepts with strategy persistence
  const handleStrategyApproved = async () => {
    if (!strategy || !formData || !brandId) return;
    
    setGenerating(true);
    
    try {
      const { data: campaignsData, error } = await supabase.functions.invoke("generate-ideas", {
        body: {
          prompt: formData.prompt,
          adType: formData.adType,
          goal: strategy.objective,
          targetAudience: {
            demographics: strategy.audience.ageRange,
            interests: strategy.audience.psychographicIntent
          },
          creativeStyle: strategy.visualDirection.tone,
          aspectRatios: ["16:9"], // TV standard
          strategy // Include full strategy for persistence
        }
      });
      
      if (error) throw error;
      
      if (campaignsData?.campaigns) {
        setGeneratedConcepts(campaignsData.campaigns);
        setFlowStep("concepts");
        toast({
          title: "Concepts Generated!",
          description: `Created ${campaignsData.campaigns.length} TV ad concepts based on your strategy.`
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

  const handleBackToInput = () => {
    setFlowStep("input");
    setStrategy(null);
    setGeneratedConcepts([]);
  };

  const handleBackToStrategy = () => {
    setFlowStep("strategy");
    setGeneratedConcepts([]);
  };

  const getCampaignThumbnail = (campaign: any) => {
    const storyboard = campaign.storyboard as any;
    if (storyboard?.type === "image_ad" && storyboard?.generatedImageUrl) {
      return storyboard.generatedImageUrl;
    }
    if (storyboard?.scenes?.length > 0) {
      const firstSceneWithVisual = storyboard.scenes.find((s: any) => s.visualUrl);
      if (firstSceneWithVisual?.visualUrl) return firstSceneWithVisual.visualUrl;
    }
    return campaign.ad_type === "video" 
      ? "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&auto=format&fit=crop" 
      : "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop";
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
        className="p-6 max-w-6xl mx-auto space-y-6"
      >
        {/* Progress Steps */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
          {["Input", "Strategy", "Concepts"].map((step, index) => {
            const stepKey = ["input", "strategy", "concepts"][index] as FlowStep;
            const isActive = flowStep === stepKey;
            const isPast = 
              (flowStep === "strategy" && index === 0) || 
              (flowStep === "concepts" && index <= 1);
            
            return (
              <div key={step} className="flex items-center gap-2">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all
                  ${isActive ? "bg-primary text-primary-foreground" : ""}
                  ${isPast ? "bg-primary/20 text-primary" : ""}
                  ${!isActive && !isPast ? "bg-muted text-muted-foreground" : ""}
                `}>
                  {isPast ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {step}
                </span>
                {index < 2 && (
                  <div className={`w-12 h-0.5 ${isPast ? "bg-primary/30" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Input Form */}
          {flowStep === "input" && !generating && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <motion.div className="text-center space-y-2" variants={itemVariants}>
                <h1 className="font-bold text-foreground text-2xl">
                  Create Broadcast-Ready TV Ads
                </h1>
                <p className="text-muted-foreground">
                  Describe your concept and AI will build a complete strategy
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <AdCreationForm onSubmit={handleAdCreation} initialData={initialFormData} />
              </motion.div>

              {/* Recent Campaigns */}
              {recentCampaigns.length > 0 && (
                <motion.div className="space-y-4" variants={itemVariants}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Recent Campaigns</h2>
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

              {recentCampaigns.length === 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <p className="text-lg text-muted-foreground mb-2">No campaigns yet</p>
                    <p className="text-sm text-muted-foreground">
                      Describe your TV ad concept above to get started
                    </p>
                  </CardContent>
                </Card>
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
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-lg text-muted-foreground">
                {flowStep === "input" ? "Building your TV ad strategy..." : "Generating creative concepts..."}
              </p>
              <p className="text-sm text-muted-foreground">
                {flowStep === "input" 
                  ? "AI is analyzing your concept and creating a broadcast strategy"
                  : "Creating TV-grade creative directions based on your strategy"
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
                  onClick={handleBackToInput}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Input
                </Button>
                <div className="text-center">
                  <h1 className="font-bold text-foreground text-xl">Review Your Strategy</h1>
                  <p className="text-sm text-muted-foreground">Edit any section, then generate creatives</p>
                </div>
                <div className="w-[120px]" /> {/* Spacer for centering */}
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
                  Generate TV Ad Concepts
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
                  <h1 className="font-bold text-foreground text-xl">TV Ad Concepts</h1>
                  <p className="text-sm text-muted-foreground">Select a concept to continue production</p>
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
                        if (concept.ad_type === "image") {
                          navigate(`/editor/${concept.id}`);
                        } else {
                          navigate(`/storyboard/${concept.id}`);
                        }
                      }} 
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default Create;
