import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CampaignGoalModal } from "@/components/create/CampaignGoalModal";
import { TargetAudienceModal, AudienceData } from "@/components/create/TargetAudienceModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  ArrowRight,
  Sparkles,
  Tv,
  Globe,
  Target,
  Zap,
  Upload,
  X,
  FileVideo,
  Image as ImageIcon
} from "lucide-react";
import { CreatePageSkeleton } from "@/components/skeletons/CreatePageSkeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [modalStep, setModalStep] = useState<"closed" | "goal" | "audience">("closed");

  // Flow state
  const [concept, setConcept] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("30s");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    preview: string;
    type: 'image' | 'video';
  }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Quick auth check
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
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

  const handleStartCreate = () => {
    if (!concept.trim()) {
      toast({
        title: "Concept Required",
        description: "Please describe your campaign vision to proceed.",
        variant: "destructive"
      });
      return;
    }
    setModalStep("goal");
  };

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setModalStep("audience");
    }, 800);
  };

  const handleAudienceContinue = async (audience: AudienceData) => {
    setModalStep("closed");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      // Get or create a default brand for this user
      let brandId: string;
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)
        .single();

      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        const { data: newBrand, error: brandError } = await supabase
          .from('brands')
          .insert({
            name: 'My Brand',
            user_id: session.user.id
          })
          .select()
          .single();
        if (brandError) throw brandError;
        brandId = newBrand.id;
      }

      // Create the campaign record first to get a permanent ID
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          title: `Project ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
          description: concept,
          ad_type: 'TV',
          goal: selectedGoal,
          status: 'concept',
          user_id: session.user.id,
          brand_id: brandId,
          target_audience: audience as any,
          storyboard: {
            duration: selectedDuration,
            concept: concept,
            assets: [] // Placeholder for URLs
          } as any
        }])
        .select()
        .single();

      if (error) throw error;

      // Now upload fles if any
      let assetUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        toast({ title: "Uploading Assets", description: `Archiving ${uploadedFiles.length} reference files...` });

        for (const fileObj of uploadedFiles) {
          const fileExt = fileObj.file.name.split('.').pop();
          const fileName = `${data.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `references/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('ad-visuals')
            .upload(filePath, fileObj.file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('ad-visuals')
              .getPublicUrl(filePath);
            assetUrls.push(publicUrl);
          }
        }

        // Update campaign with real URLs
        await supabase
          .from('campaigns')
          .update({
            storyboard: {
              duration: selectedDuration,
              concept: concept,
              assets: assetUrls
            } as any
          })
          .eq('id', data.id);
      }

      toast({
        title: "Campaign Initialized",
        description: "Entering AI Creative Hub...",
      });

      // Flow: Create -> Script Selection (as requested)
      navigate(`/script-selection/${data.id}`);

    } catch (err: any) {
      console.error("Failed to create campaign:", err);
      toast({
        title: "Initialization Failed",
        description: err.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  if (loading) return <DashboardLayout><CreatePageSkeleton /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">

        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background z-0" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none mix-blend-overlay" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-4xl space-y-8"
        >

          {/* Hero Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Sparkles className="h-3 w-3" />
              Campaign Strategy Engine
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50">
              What's your vision?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Describe your product or service. Our AI will architect a
              <span className="text-foreground font-medium"> national TV campaign </span>
              tailored to your goals.
            </p>
          </div>

          {/* Input Area "Launchpad" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="group relative bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative bg-background/40 rounded-2xl p-4 transition-colors group-hover:bg-background/50">
              <Textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. A luxury electric car that redefines travel, targeting tech-savvy professionals..."
                className="min-h-[160px] text-lg md:text-xl bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50 resize-none leading-relaxed p-4"
              />

              {/* Uploads Preview Row */}
              <div className="flex gap-3 px-4 pb-2 overflow-x-auto py-2">
                <AnimatePresence>
                  {uploadedFiles.map((file, i) => (
                    <motion.div
                      key={file.preview}
                      initial={{ opacity: 0, scale: 0.8, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative flex-shrink-0 group/file"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 relative">
                        {file.type === 'video' ? (
                          <video src={file.preview} className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <img src={file.preview} className="w-full h-full object-cover opacity-80" alt="preview" />
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/file:opacity-100 transition-opacity hover:cursor-pointer" onClick={() => removeFile(i)}>
                          <X className="h-4 w-4 text-white" />
                        </div>
                        {file.type === 'video' && <div className="absolute bottom-1 right-1"><FileVideo className="h-3 w-3 text-white/70" /></div>}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-16 h-16 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-[9px] uppercase font-bold">Add Asset</span>
                </button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>

              {/* Bottom Controls Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 px-2">
                <div className="flex items-center gap-3">
                  {["15s", "30s", "60s"].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setSelectedDuration(dur)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedDuration === dur
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                        : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                        }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>

                <Button
                  size="lg"
                  onClick={handleStartCreate}
                  className="h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105"
                >
                  Launch Campaign <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats / Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8"
          >
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm uppercase tracking-wide font-medium">
                <Tv className="h-4 w-4" /> Reach
              </div>
              <div className="text-2xl font-bold text-white">120M+ <span className="text-sm font-normal text-muted-foreground">Households</span></div>
            </div>
            <div className="text-center space-y-1 border-l border-white/10">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm uppercase tracking-wide font-medium">
                <Globe className="h-4 w-4" /> Networks
              </div>
              <div className="text-2xl font-bold text-white">85+ <span className="text-sm font-normal text-muted-foreground">Premium Channels</span></div>
            </div>
            <div className="text-center space-y-1 border-l border-white/10">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm uppercase tracking-wide font-medium">
                <Zap className="h-4 w-4" /> Speed
              </div>
              <div className="text-2xl font-bold text-white">24h <span className="text-sm font-normal text-muted-foreground">To Air</span></div>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Modals are still used but will be styled to match */}
      <CampaignGoalModal
        open={modalStep === "goal"}
        onOpenChange={(open) => !open && setModalStep("closed")}
        onBack={() => setModalStep("closed")}
        onGenerate={handleGoalSelect}
        isGenerating={isGenerating}
      />

      <TargetAudienceModal
        open={modalStep === "audience"}
        onOpenChange={(open) => !open && setModalStep("closed")}
        onBack={() => setModalStep("goal")}
        onContinue={handleAudienceContinue}
        campaignDescription={concept}
      />

    </DashboardLayout>
  );
};

export default Create;