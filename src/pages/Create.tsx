import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CampaignGoalModal } from "@/components/create/CampaignGoalModal";
import { TargetAudienceModal, AudienceData } from "@/components/create/TargetAudienceModal";
import CampaignCard from "@/components/CampaignCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Play, ArrowRight, Paperclip, X } from "lucide-react";
import { CreatePageSkeleton } from "@/components/skeletons/CreatePageSkeleton";
import { Textarea } from "@/components/ui/textarea";

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

type ModalStep = "closed" | "goal" | "audience";

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [modalStep, setModalStep] = useState<ModalStep>("closed");
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);

  // Flow state
  const [concept, setConcept] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("30s");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; preview: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
      if (campaigns) setRecentCampaigns(campaigns);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Step 1: Open Goal Modal when user clicks arrow
  const handleStartCreate = () => {
    if (!concept.trim()) {
      toast({
        title: "Please describe your ad",
        description: "Enter a concept for your TV ad to continue.",
        variant: "destructive"
      });
      return;
    }
    setModalStep("goal");
  };

  // Step 2: Goal selected, move to Audience
  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    setIsGenerating(true);
    // Simulate brief loading then move to audience
    setTimeout(() => {
      setIsGenerating(false);
      setModalStep("audience");
    }, 500);
  };

  // Step 3: Audience configured, navigate to Script Selection
  const handleAudienceContinue = (audience: AudienceData) => {
    setModalStep("closed");
    // Navigate to script selection with all the data
    navigate("/script-selection", {
      state: {
        concept,
        duration: selectedDuration,
        goal: selectedGoal,
        audience,
        referenceFiles: uploadedFiles.map(f => f.file.name)
      }
    });
  };

  const handleCloseModals = () => {
    setModalStep("closed");
    setIsGenerating(false);
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

  return (
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="p-6 max-w-6xl mx-auto space-y-10"
      >
        {/* Quick TV Ad Creation */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-foreground text-center">
              Create your TV ad
            </h1>

            {/* Uploaded files preview */}
            {uploadedFiles.length > 0 && (
              <div className="flex gap-2 flex-wrap">
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
                  size="icon"
                  className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Campaigns */}
        {recentCampaigns.length > 0 && (
          <motion.div className="space-y-6" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Recent Campaigns</h2>
                <p className="text-muted-foreground">Continue editing</p>
              </div>
              <Button variant="ghost" onClick={() => navigate("/ad-operations")} className="text-primary">
                View all
              </Button>
            </div>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
              {recentCampaigns.slice(0, 6).map(campaign => (
                <motion.div key={campaign.id} variants={itemVariants}>
                  <CampaignCard
                    image="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800"
                    title={campaign.title}
                    description={campaign.description}
                    onClick={() => navigate(campaign.status === "concept" ? `/storyboard/${campaign.id}` : `/video-editor/${campaign.id}`)}
                    onEdit={() => navigate(campaign.status === "concept" ? `/storyboard/${campaign.id}` : `/video-editor/${campaign.id}`)}
                    onDelete={() => handleDelete(campaign.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {recentCampaigns.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-16 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-muted mb-4">
              <Play className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No campaigns yet</h3>
            <p className="text-muted-foreground">Create your first TV ad campaign</p>
          </motion.div>
        )}
      </motion.div>

      {/* Modal Flow: Goal → Audience → Script Selection Page */}
      <CampaignGoalModal
        open={modalStep === "goal"}
        onOpenChange={open => !open && handleCloseModals()}
        onBack={handleCloseModals}
        onGenerate={handleGoalSelect}
        isGenerating={isGenerating}
      />

      <TargetAudienceModal
        open={modalStep === "audience"}
        onOpenChange={open => !open && handleCloseModals()}
        onBack={() => setModalStep("goal")}
        onContinue={handleAudienceContinue}
        campaignDescription={concept}
      />
    </DashboardLayout>
  );
};

export default Create;
