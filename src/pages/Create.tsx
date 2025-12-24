import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdCreationForm, { AdCreationData } from "@/components/AdCreationForm";
import CampaignConceptCard from "@/components/CampaignConceptCard";
import CampaignCard from "@/components/CampaignCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { CreatePageSkeleton } from "@/components/skeletons/CreatePageSkeleton";
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
const Create = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedConcepts, setGeneratedConcepts] = useState<any[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);

  // Parse URL params for pre-filled data from Product URL dialog
  const productUrl = searchParams.get("productUrl") || undefined;
  const productTitle = searchParams.get("productTitle") || "";
  const productDescription = searchParams.get("productDescription") || "";
  const assetsParam = searchParams.get("assets");
  const defaultAdType = searchParams.get("type") as "video" | "image" | null;

  // Parse asset URLs from query params
  const assetUrls = assetsParam ? JSON.parse(assetsParam) as string[] : [];

  // Build initial prompt from product data
  const initialPrompt = productTitle ? `Create an ad for: ${productTitle}${productDescription ? `. ${productDescription}` : ''}` : "";
  const initialFormData = {
    prompt: initialPrompt,
    adType: defaultAdType || "video" as "video" | "image",
    assetUrls,
    productUrl
  };
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
        data: brands
      } = await supabase.from("brands").select("name").eq("user_id", session.user.id).limit(1);
      if (!brands || brands.length === 0) {
        navigate("/brand-setup");
        return;
      }

      // Fetch recent campaigns
      const {
        data: campaigns
      } = await supabase.from("campaigns").select("*").eq("user_id", session.user.id).order("created_at", {
        ascending: false
      }).limit(6);
      if (campaigns) {
        setRecentCampaigns(campaigns);
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);
  const handleAdCreation = async (data: AdCreationData) => {
    setGenerating(true);
    try {
      const {
        data: campaignsData,
        error
      } = await supabase.functions.invoke("generate-ideas", {
        body: data
      });
      if (error) throw error;
      if (campaignsData?.campaigns) {
        setGeneratedConcepts(campaignsData.campaigns);
        toast({
          title: "Ideas Generated!",
          description: `Created ${campaignsData.campaigns.length} campaign concepts for you.`
        });
      }
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate campaign ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
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
    return campaign.ad_type === "video" ? "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&auto=format&fit=crop" : "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop";
  };
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      const {
        error
      } = await supabase.from("campaigns").delete().eq("id", id);
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
    return <DashboardLayout>
        <CreatePageSkeleton />
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 max-w-6xl mx-auto space-y-8 px-[23px]">
        {/* Header */}
        <motion.div className="text-center space-y-2" variants={itemVariants}>
          <h1 className="font-bold text-foreground text-2xl">Create Broadcast-Ready TV Ads in Minutes
        </h1>
          <p className="text-muted-foreground">Strategy-first AI generates TV-grade outputs (15s / 30s / 45s)</p>
        </motion.div>

        {/* Ad Creation Form */}
        <motion.div variants={itemVariants}>
          <AdCreationForm onSubmit={handleAdCreation} initialData={initialFormData} />
        </motion.div>

        {/* Loading State */}
        {generating && <motion.div className="flex flex-col items-center justify-center py-16 space-y-4" initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.3
      }}>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg text-muted-foreground">Building your TV ad strategy...</p>
            <p className="text-sm text-muted-foreground">
              AI is generating strategy + creative concepts for broadcast
            </p>
          </motion.div>}

        {/* Generated Concepts */}
        {!generating && generatedConcepts.length > 0 && <motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div className="flex items-center justify-between" variants={itemVariants}>
              <h2 className="text-xl font-semibold text-foreground">
                Generated Campaign Concepts
              </h2>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={containerVariants}>
              {generatedConcepts.map((concept, index) => <motion.div key={concept.id} variants={itemVariants}>
                  <CampaignConceptCard title={concept.title} description={concept.description} script={concept.script} ctaText={concept.cta_text} predictedCtr={concept.predicted_ctr} predictedEngagement={concept.predicted_engagement} onClick={() => {
              if (concept.ad_type === "image") {
                navigate(`/editor/${concept.id}`);
              } else {
                navigate(`/storyboard/${concept.id}`);
              }
            }} />
                </motion.div>)}
            </motion.div>
          </motion.div>}

        {/* Recent Campaigns */}
        {!generating && generatedConcepts.length === 0 && <motion.div className="space-y-4" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Recent Campaigns</h2>
              <Button variant="link" onClick={() => navigate("/ad-operations")} className="text-primary">
                View all
              </Button>
            </div>

            {recentCampaigns.length > 0 ? <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" initial="hidden" animate="visible" variants={containerVariants}>
                {recentCampaigns.map((campaign, index) => <motion.div key={campaign.id} variants={itemVariants}>
                    <CampaignCard image={getCampaignThumbnail(campaign)} title={campaign.title} description={campaign.description} onClick={() => {
              if (campaign.ad_type === "image") {
                navigate(`/editor/${campaign.id}`);
              } else {
                navigate(campaign.status === "concept" ? `/storyboard/${campaign.id}` : `/video-editor/${campaign.id}`);
              }
            }} onEdit={() => {
              if (campaign.ad_type === "image") {
                navigate(`/editor/${campaign.id}`);
              } else {
                navigate(campaign.status === "concept" ? `/storyboard/${campaign.id}` : `/video-editor/${campaign.id}`);
              }
            }} onDelete={() => handleDelete(campaign.id)} />
                  </motion.div>)}
              </motion.div> : <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <p className="text-lg text-muted-foreground mb-2">No campaigns yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fill out the form above to create your first campaign
                  </p>
                </CardContent>
              </Card>}
          </motion.div>}
      </motion.div>
    </DashboardLayout>;
};
export default Create;