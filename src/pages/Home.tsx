import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CampaignCard from "@/components/CampaignCard";
import CampaignConceptCard from "@/components/CampaignConceptCard";
import Navigation from "@/components/Navigation";
import AdCreationForm, { AdCreationData } from "@/components/AdCreationForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
const Home = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [generatedConcepts, setGeneratedConcepts] = useState<any[]>([]);
  const [userCampaigns, setUserCampaigns] = useState<any[]>([]);
  const handleAdCreation = async (data: AdCreationData) => {
    setGenerating(true);
    try {
      const {
        data: campaignsData,
        error
      } = await supabase.functions.invoke('generate-ideas', {
        body: data
      });
      if (error) {
        throw error;
      }
      if (campaignsData?.campaigns) {
        setGeneratedConcepts(campaignsData.campaigns);
        toast({
          title: "Ideas Generated!",
          description: `Created ${campaignsData.campaigns.length} campaign concepts for you.`
        });
      }
    } catch (error: any) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate campaign ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };
  useEffect(() => {
    const checkAuthAndBrand = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has a brand
      const {
        data: brands
      } = await supabase.from("brands").select("name").eq("user_id", session.user.id).limit(1);
      if (!brands || brands.length === 0) {
        navigate("/brand-setup");
        return;
      }
      setBrandName(brands[0].name);

      // Fetch user's campaigns
      const {
        data: campaigns
      } = await supabase.from("campaigns").select("*").eq("user_id", session.user.id).order("created_at", {
        ascending: false
      }).limit(8);
      if (campaigns) {
        setUserCampaigns(campaigns);
      }
      setLoading(false);
    };
    checkAuthAndBrand();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>;
  }

  // Get thumbnail image for campaign - use generated image if available
  const getCampaignThumbnail = (campaign: any) => {
    const storyboard = campaign.storyboard as any;

    // For image ads - use the generated image
    if (storyboard?.type === 'image_ad' && storyboard?.generatedImageUrl) {
      return storyboard.generatedImageUrl;
    }

    // For video ads - use the first scene's visual if available
    if (storyboard?.scenes?.length > 0) {
      const firstSceneWithVisual = storyboard.scenes.find((s: any) => s.visualUrl);
      if (firstSceneWithVisual?.visualUrl) {
        return firstSceneWithVisual.visualUrl;
      }
    }

    // Fallback to placeholder based on ad type
    if (campaign.ad_type === "video") {
      return "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&auto=format&fit=crop";
    }
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop";
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          
          <p className="text-primary font-bold text-4xl">What would you like to create?</p>
        </div>

        {/* Ad Creation Form */}
        <div className="max-w-4xl mx-auto mb-16">
          <AdCreationForm onSubmit={handleAdCreation} />
        </div>

        {/* Loading State */}
        {generating && <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg text-muted-foreground">Generating campaign concepts...</p>
            <p className="text-sm text-muted-foreground">Using AI to create unique ideas based on your brand</p>
          </div>}

        {/* Generated Concepts */}
        {!generating && generatedConcepts.length > 0 && <div className="space-y-6 mb-16">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Generated Campaign Concepts
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedConcepts.map(concept => <CampaignConceptCard key={concept.id} title={concept.title} description={concept.description} script={concept.script} ctaText={concept.cta_text} predictedCtr={concept.predicted_ctr} predictedEngagement={concept.predicted_engagement} onClick={() => {
            // Route based on ad type: image ads go to editor, video ads go to storyboard
            if (concept.ad_type === 'image') {
              navigate(`/editor/${concept.id}`);
            } else {
              navigate(`/storyboard/${concept.id}`);
            }
          }} />)}
            </div>
          </div>}

        {/* Recent Campaigns */}
        {!generating && generatedConcepts.length === 0 && <div className="space-y-6 pt-[16px] rounded-xl bg-[#adcf7e]/0 border border-[#1a1a1a]/0 px-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Recent Campaigns
              </h2>
              <a href="/ad-operations" className="text-sm text-primary hover:underline">
                See all
              </a>
            </div>

            {userCampaigns.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {userCampaigns.map(campaign => <CampaignCard 
                  key={campaign.id} 
                  image={getCampaignThumbnail(campaign)} 
                  title={campaign.title} 
                  description={campaign.description} 
                  onClick={() => {
                    if (campaign.ad_type === 'image') {
                      navigate(`/editor/${campaign.id}`);
                    } else {
                      if (campaign.status === 'concept') {
                        navigate(`/storyboard/${campaign.id}`);
                      } else {
                        navigate(`/video-editor/${campaign.id}`);
                      }
                    }
                  }}
                  onEdit={() => {
                    if (campaign.ad_type === 'image') {
                      navigate(`/editor/${campaign.id}`);
                    } else {
                      if (campaign.status === 'concept') {
                        navigate(`/storyboard/${campaign.id}`);
                      } else {
                        navigate(`/video-editor/${campaign.id}`);
                      }
                    }
                  }}
                  onDelete={async () => {
                    if (confirm('Are you sure you want to delete this campaign?')) {
                      const { error } = await supabase.from('campaigns').delete().eq('id', campaign.id);
                      if (error) {
                        toast({ title: 'Error', description: 'Failed to delete campaign', variant: 'destructive' });
                      } else {
                        setUserCampaigns(prev => prev.filter(c => c.id !== campaign.id));
                        toast({ title: 'Deleted', description: 'Campaign deleted successfully' });
                      }
                    }
                  }}
                />)}
              </div> : <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No campaigns yet</p>
                <p className="text-sm">Create your first campaign above to get started</p>
              </div>}
          </div>}
      </main>
    </div>;
};
export default Home;