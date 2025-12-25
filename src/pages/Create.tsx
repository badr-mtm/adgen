import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ConceptInputModal } from "@/components/create/ConceptInputModal";
import { CampaignGoalModal } from "@/components/create/CampaignGoalModal";
import { StoryboardSelectionModal } from "@/components/create/StoryboardSelectionModal";
import CampaignCard from "@/components/CampaignCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Tv,
  Sparkles,
  Play
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

type ModalStep = "closed" | "concept" | "goal" | "storyboard";

interface ConceptData {
  concept: string;
  duration: string;
  referenceFile?: File;
}

interface StoryboardConcept {
  id: string;
  title: string;
  description: string;
  scenes: {
    number: number;
    description: string;
    duration: string;
  }[];
  tone: string;
  style: string;
}

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>("closed");
  const [conceptData, setConceptData] = useState<ConceptData | null>(null);
  const [generatedConcepts, setGeneratedConcepts] = useState<StoryboardConcept[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);

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

  const handleStartCreate = () => {
    setModalStep("concept");
  };

  const handleConceptContinue = (data: ConceptData) => {
    setConceptData(data);
    setModalStep("goal");
  };

  const handleBackToConceptInput = () => {
    setModalStep("concept");
  };

  const handleGenerateConcepts = async (goal: string) => {
    if (!conceptData) return;
    
    setGenerating(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-storyboard", {
        body: {
          prompt: conceptData.concept,
          duration: conceptData.duration,
          goal: goal,
          adType: "video"
        }
      });
      
      if (error) throw error;
      
      if (result?.concepts) {
        setGeneratedConcepts(result.concepts);
        setModalStep("storyboard");
        toast({
          title: "Storyboards Generated",
          description: `Created ${result.concepts.length} unique concepts for your TV ad.`
        });
      }
    } catch (error: any) {
      console.error("Error generating concepts:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate storyboards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleBackToGoal = () => {
    setModalStep("goal");
  };

  const handleSelectStoryboard = async (concept: StoryboardConcept) => {
    // Create campaign and navigate to storyboard editor
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get or create brand
      let { data: brands } = await supabase
        .from("brands")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1);

      let brandId = brands?.[0]?.id;
      
      if (!brandId) {
        const { data: newBrand, error: brandError } = await supabase
          .from("brands")
          .insert({
            user_id: session.user.id,
            name: "My Brand"
          })
          .select()
          .single();
        
        if (brandError) throw brandError;
        brandId = newBrand.id;
      }

      const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert({
          user_id: session.user.id,
          brand_id: brandId,
          title: concept.title,
          description: concept.description,
          ad_type: "video",
          goal: "awareness",
          status: "concept",
          storyboard: {
            scenes: concept.scenes.map((scene, index) => ({
              id: `scene-${index + 1}`,
              sceneNumber: scene.number,
              description: scene.description,
              duration: scene.duration,
              dialogue: "",
              visualUrl: null
            })),
            duration: conceptData?.duration,
            tone: concept.tone,
            style: concept.style
          }
        })
        .select()
        .single();

      if (error) throw error;

      setModalStep("closed");
      navigate(`/storyboard/${campaign.id}`);
      
      toast({
        title: "Storyboard Created",
        description: "You can now refine your TV ad storyboard."
      });
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCloseModals = () => {
    setModalStep("closed");
    setConceptData(null);
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
        className="p-6 max-w-6xl mx-auto space-y-10"
      >
        {/* Hero Section */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-border p-10"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Tv className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Create Broadcast-Ready TV Ads
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Describe your concept or start with a script. Our AI will generate professional storyboards 
              optimized for 15s, 30s, or 60s spots.
            </p>
            
            <Button 
              size="lg" 
              onClick={handleStartCreate}
              className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New TV Ad
            </Button>
          </div>
        </motion.div>

        {/* Recent Campaigns */}
        {recentCampaigns.length > 0 && (
          <motion.div className="space-y-6" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Recent Campaigns</h2>
                <p className="text-muted-foreground">Continue editing your TV ads</p>
              </div>
              <Button variant="ghost" onClick={() => navigate("/ad-operations")} className="text-primary">
                View all
              </Button>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              variants={containerVariants}
            >
              {recentCampaigns.slice(0, 6).map((campaign) => (
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

        {/* Empty State */}
        {recentCampaigns.length === 0 && (
          <motion.div 
            variants={itemVariants}
            className="text-center py-16 space-y-4"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-muted mb-4">
              <Play className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No campaigns yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create your first TV ad campaign and see it appear here
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Modals */}
      <ConceptInputModal
        open={modalStep === "concept"}
        onOpenChange={(open) => !open && handleCloseModals()}
        onContinue={handleConceptContinue}
      />

      <CampaignGoalModal
        open={modalStep === "goal"}
        onOpenChange={(open) => !open && handleCloseModals()}
        onBack={handleBackToConceptInput}
        onGenerate={handleGenerateConcepts}
        isGenerating={generating}
      />

      <StoryboardSelectionModal
        open={modalStep === "storyboard"}
        onOpenChange={(open) => !open && handleCloseModals()}
        onBack={handleBackToGoal}
        onSelect={handleSelectStoryboard}
        concepts={generatedConcepts}
        duration={conceptData?.duration || "30s"}
      />
    </DashboardLayout>
  );
};

export default Create;
