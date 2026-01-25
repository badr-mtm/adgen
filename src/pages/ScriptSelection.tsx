import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Edit3,
  Sparkles,
  Loader2,
  RefreshCw,
  Film,
  Play,
  Heart,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface Script {
  id: string;
  title: string;
  approach: string;
  hook: string;
  fullScript: string;
  cta: string;
  tone: string;
  musicMood?: string;
  scenes: {
    sceneNumber: number;
    duration: string;
    visualDescription: string;
    cameraMovement?: string;
    voiceover: string;
    onScreenText?: string;
  }[];
}

interface VideoVariant {
  id: string;
  styleName: string;
  styleDescription: string;
  colorPalette?: string;
  cameraStyle?: string;
  editingPace?: string;
  musicStyle?: string;
  thumbnailPrompt: string;
  previewVideoUrl?: string;
  previewStatus?: 'pending' | 'generating' | 'complete' | 'error';
  scenes: {
    sceneNumber: number;
    duration: string;
    visualPrompt: string;
    transitionType?: string;
    voiceover: string;
  }[];
}

const APPROACH_ICONS: Record<string, any> = {
  emotional: Heart,
  problem_solution: Lightbulb,
  aspirational: Target,
};

const APPROACH_COLORS: Record<string, string> = {
  emotional: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  problem_solution: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  aspirational: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

export default function ScriptSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get data from navigation state
  const navState = location.state as {
    adDescription?: string;
    duration?: string;
    goal?: string;
    targetAudience?: any;
    references?: string[];
    brandId?: string;
    campaignId?: string;
  } | null;

  const [loading, setLoading] = useState(true);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [editingScript, setEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState<Script | null>(null);
  const [expandedScenes, setExpandedScenes] = useState(true);

  // Video variants state
  const [view, setView] = useState<"scripts" | "variants">("scripts");
  const [generatingVariants, setGeneratingVariants] = useState(false);
  const [videoVariants, setVideoVariants] = useState<VideoVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<VideoVariant | null>(null);

  useEffect(() => {
    if (navState?.adDescription) {
      generateScripts();
    } else if (id) {
      fetchCampaignAndGenerate();
    } else {
      toast({
        title: "Missing Data",
        description: "Please start from the Create page.",
        variant: "destructive"
      });
      navigate("/create");
    }
  }, [id, navState]);

  const fetchCampaignAndGenerate = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      generateScripts({
        adDescription: data.description,
        duration: (data.storyboard as any)?.duration || '30s',
        goal: data.goal,
        targetAudience: data.target_audience,
        brandId: data.brand_id
      });
    } catch (err) {
      console.error("Error fetching campaign:", err);
      toast({
        title: "Error",
        description: "Failed to load campaign data",
        variant: "destructive"
      });
    }
  };

  const generateScripts = async (overrideData?: any) => {
    setLoading(true);
    
    const data = overrideData || navState;
    
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-scripts', {
        body: {
          adDescription: data?.adDescription,
          duration: data?.duration || '30s',
          goal: data?.goal || 'awareness',
          targetAudience: data?.targetAudience,
          references: data?.references,
          brandId: data?.brandId
        }
      });

      if (error) throw error;

      if (result?.scripts && result.scripts.length > 0) {
        setScripts(result.scripts);
        setSelectedScript(result.scripts[0]);
        setEditedScript(result.scripts[0]);
        toast({
          title: "Scripts Generated",
          description: "3 unique scripts created based on your inputs.",
        });
      } else {
        throw new Error("No scripts generated");
      }
    } catch (err: any) {
      console.error("Error generating scripts:", err);
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate scripts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScript = (script: Script) => {
    setSelectedScript(script);
    setEditedScript({ ...script });
    setEditingScript(false);
  };

  const generateVideoVariants = async () => {
    if (!selectedScript) return;
    
    setGeneratingVariants(true);
    setView("variants");

    try {
      const { data: result, error } = await supabase.functions.invoke('generate-video-variants', {
        body: {
          script: editedScript || selectedScript,
          campaignId: id || navState?.campaignId,
          duration: navState?.duration || '30s',
          adDescription: navState?.adDescription
        }
      });

      if (error) throw error;

      if (result?.variants && result.variants.length > 0) {
        // Initialize variants with pending preview status
        const variantsWithStatus = result.variants.map((v: VideoVariant) => ({
          ...v,
          previewStatus: 'pending' as const
        }));
        setVideoVariants(variantsWithStatus);
        setSelectedVariant(variantsWithStatus[0]);
        
        toast({
          title: "Generating Video Previews",
          description: "Creating preview videos for each style...",
        });

        // Generate preview videos for all 3 variants in parallel
        generatePreviewVideos(variantsWithStatus);
      } else {
        throw new Error("No variants generated");
      }
    } catch (err: any) {
      console.error("Error generating variants:", err);
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate video variants.",
        variant: "destructive"
      });
      setView("scripts");
    } finally {
      setGeneratingVariants(false);
    }
  };

  const generatePreviewVideos = async (variants: VideoVariant[]) => {
    const campaignId = id || navState?.campaignId;
    
    // Update all to generating status
    setVideoVariants(prev => prev.map(v => ({ ...v, previewStatus: 'generating' as const })));
    
    // Generate previews in parallel
    const previewPromises = variants.map(async (variant, index) => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-variant-previews', {
          body: {
            variant,
            campaignId,
            variantIndex: index
          }
        });

        if (error) throw error;

        // Update this variant with the preview URL
        setVideoVariants(prev => prev.map((v, i) => 
          i === index 
            ? { ...v, previewVideoUrl: data.previewUrl, previewStatus: 'complete' as const }
            : v
        ));

        // Update selected variant if it's this one
        setSelectedVariant(prev => 
          prev?.id === variant.id 
            ? { ...prev, previewVideoUrl: data.previewUrl, previewStatus: 'complete' as const }
            : prev
        );

        return { success: true, index };
      } catch (err) {
        console.error(`Failed to generate preview for variant ${index}:`, err);
        
        setVideoVariants(prev => prev.map((v, i) => 
          i === index 
            ? { ...v, previewStatus: 'error' as const }
            : v
        ));

        return { success: false, index };
      }
    });

    const results = await Promise.allSettled(previewPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    
    if (successCount > 0) {
      toast({
        title: "Preview Videos Ready",
        description: `${successCount} of 3 preview videos generated successfully.`,
      });
    }
  };

  const handleContinueToEditor = async () => {
    const campaignId = id || navState?.campaignId;
    
    if (!campaignId || !selectedVariant) {
      toast({
        title: "Selection Required",
        description: "Please select a video variant to continue.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Initializing Editor",
      description: "Preparing your video for editing...",
      duration: 3000
    });

    try {
      // Save selected variant to campaign
      const storyboardData = {
        selectedScript: editedScript || selectedScript,
        selectedVariant: selectedVariant,
        scenes: selectedVariant.scenes.map((s, idx) => ({
          id: `scene-${idx + 1}`,
          sceneNumber: s.sceneNumber,
          duration: s.duration,
          visualDescription: s.visualPrompt,
          voiceover: s.voiceover,
          type: "generated"
        })),
        generatedAt: new Date().toISOString()
      };

      await supabase
        .from('campaigns')
        .update({
          storyboard: storyboardData as any,
          status: 'in_production'
        })
        .eq('id', campaignId);

      navigate(`/video-editor/${campaignId}`, {
        state: {
          preloadedScenes: selectedVariant.scenes.map((s, idx) => ({
            id: `scene-${idx + 1}`,
            name: `Scene ${s.sceneNumber}`,
            duration: s.duration,
            description: s.visualPrompt,
            voiceover: s.voiceover,
            type: "generated"
          })),
          script: editedScript || selectedScript,
          variant: selectedVariant
        }
      });
    } catch (err) {
      console.error("Failed to save:", err);
      navigate(`/video-editor/${campaignId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-medium text-foreground">AI is crafting your scripts...</h2>
          <p className="text-muted-foreground text-sm">Analyzing your inputs and creating 3 unique approaches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {view === "scripts" ? "Choose Your Script" : "Select Video Style"}
              </h1>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                {navState?.duration || "30s"} • {navState?.goal || "awareness"}
              </p>
            </div>
          </div>

          <div className="flex bg-muted rounded-full p-1 border border-border">
            <button
              onClick={() => setView("scripts")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === "scripts" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
            >
              Scripts
            </button>
            <button
              onClick={() => { if (videoVariants.length > 0) setView("variants") }}
              disabled={videoVariants.length === 0}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === "variants" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground disabled:opacity-30"}`}
            >
              Video Styles
            </button>
          </div>

          <Button size="sm" variant="ghost" onClick={() => generateScripts()} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 py-8">
        <AnimatePresence mode="wait">
          {view === "scripts" ? (
            <motion.div
              key="scripts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left: Script Options */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                    <Film className="h-5 w-5 text-primary" />
                    Generated Scripts
                  </h2>
                  <div className="space-y-3">
                    {scripts.map((script) => {
                      const ApproachIcon = APPROACH_ICONS[script.approach] || Sparkles;
                      const approachColor = APPROACH_COLORS[script.approach] || "text-primary bg-primary/10 border-primary/30";
                      const selected = selectedScript?.id === script.id;
                      
                      return (
                        <div
                          key={script.id}
                          onClick={() => handleSelectScript(script)}
                          className={`group relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                            selected 
                              ? "bg-card border-primary ring-1 ring-primary" 
                              : "bg-card/50 border-border hover:border-primary/50 hover:bg-card"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className={approachColor}>
                              <ApproachIcon className="h-3 w-3 mr-1" />
                              {script.approach.replace('_', ' ')}
                            </Badge>
                            {selected && <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />}
                          </div>
                          <h3 className={`font-bold text-lg mb-1 ${selected ? "text-foreground" : "text-foreground/80"}`}>
                            {script.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{script.hook}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="text-xs">{script.tone}</Badge>
                            <Badge variant="secondary" className="text-xs">{script.scenes?.length || 0} scenes</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Script Editor */}
              <div className="lg:col-span-8">
                <div className="h-full bg-card rounded-2xl border border-border flex flex-col overflow-hidden shadow-xl">
                  {/* Editor Toolbar */}
                  <div className="bg-muted/50 border-b border-border p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-500/50" />
                      <span className="h-3 w-3 rounded-full bg-yellow-500/50" />
                      <span className="h-3 w-3 rounded-full bg-green-500/50" />
                      <span className="ml-4 text-xs font-mono text-muted-foreground">
                        {editingScript ? "EDITING" : "PREVIEW"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingScript(!editingScript)}
                      className={editingScript ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {editingScript ? "Done" : "Edit"}
                    </Button>
                  </div>

                  {/* Editor Content */}
                  <ScrollArea className="flex-1 p-8">
                    <div className="max-w-2xl mx-auto space-y-8">
                      {/* Hook */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-primary font-bold">Hook</label>
                        {editingScript ? (
                          <Textarea
                            value={editedScript?.hook}
                            onChange={e => setEditedScript(prev => prev ? { ...prev, hook: e.target.value } : null)}
                            className="bg-muted/50 border-border text-lg text-foreground font-medium min-h-[80px]"
                          />
                        ) : (
                          <p className="text-xl text-foreground font-medium leading-relaxed">{selectedScript?.hook}</p>
                        )}
                      </div>

                      {/* Full Script */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-purple-500 font-bold">Full Script</label>
                        {editingScript ? (
                          <Textarea
                            value={editedScript?.fullScript}
                            onChange={e => setEditedScript(prev => prev ? { ...prev, fullScript: e.target.value } : null)}
                            className="bg-muted/50 border-border text-lg text-foreground/80 leading-relaxed min-h-[150px]"
                          />
                        ) : (
                          <p className="text-lg text-foreground/80 leading-relaxed">{selectedScript?.fullScript}</p>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Call to Action</label>
                        {editingScript ? (
                          <Textarea
                            value={editedScript?.cta}
                            onChange={e => setEditedScript(prev => prev ? { ...prev, cta: e.target.value } : null)}
                            className="bg-muted/50 border-border text-lg text-foreground font-semibold min-h-[60px]"
                          />
                        ) : (
                          <p className="text-lg text-foreground font-semibold">{selectedScript?.cta}</p>
                        )}
                      </div>

                      {/* Scenes */}
                      <div className="space-y-3">
                        <button 
                          onClick={() => setExpandedScenes(!expandedScenes)}
                          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold hover:text-foreground transition-colors"
                        >
                          Storyboard ({selectedScript?.scenes?.length || 0} scenes)
                          {expandedScenes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        
                        <AnimatePresence>
                          {expandedScenes && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="space-y-3 overflow-hidden"
                            >
                              {(editedScript?.scenes || selectedScript?.scenes || []).map((scene, idx) => (
                                <Card key={idx} className="p-4 bg-muted/30 border-border">
                                  <div className="flex items-start gap-4">
                                    <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                      <Play className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-primary">Scene {scene.sceneNumber}</span>
                                        <Badge variant="outline" className="text-xs">{scene.duration}</Badge>
                                      </div>
                                      <p className="text-sm text-foreground mb-1">{scene.visualDescription}</p>
                                      <p className="text-xs text-muted-foreground italic">"{scene.voiceover}"</p>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Footer */}
                  <div className="p-6 border-t border-border bg-muted/30 flex justify-end">
                    <Button
                      size="lg"
                      onClick={generateVideoVariants}
                      disabled={!selectedScript}
                      className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                    >
                      Generate Video Variants
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="variants"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {generatingVariants ? (
                <div className="py-20 text-center space-y-4">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="h-20 w-20 text-primary animate-spin relative z-10" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Generating Video Variants...</p>
                    <p className="text-sm text-muted-foreground">Creating 3 unique visual styles for your script</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Visual Style</h2>
                    <p className="text-muted-foreground">Select the video treatment that best matches your brand</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {videoVariants.map((variant) => {
                      const selected = selectedVariant?.id === variant.id;
                      return (
                        <Card
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`p-6 cursor-pointer transition-all ${
                            selected 
                              ? "ring-2 ring-primary bg-card" 
                              : "bg-card/50 hover:bg-card border-border"
                          }`}
                        >
                          {/* Video Preview or Stylized Placeholder */}
                          <div className="aspect-video rounded-lg mb-4 relative overflow-hidden group">
                            {/* Show actual video when available */}
                            {variant.previewVideoUrl && variant.previewStatus === 'complete' ? (
                              <>
                                <video
                                  src={variant.previewVideoUrl}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  muted
                                  loop
                                  playsInline
                                  autoPlay
                                  onMouseEnter={(e) => e.currentTarget.play()}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                              </>
                            ) : variant.previewStatus === 'generating' ? (
                              /* Loading state */
                              <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                                <span className="text-xs text-muted-foreground">Generating preview...</span>
                              </div>
                            ) : variant.previewStatus === 'error' ? (
                              /* Error state with fallback */
                              <div className="absolute inset-0 bg-muted/80 flex flex-col items-center justify-center">
                                <Film className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground">Preview unavailable</span>
                              </div>
                            ) : (
                              /* Stylized Preview based on variant type */
                              <>
                                {variant.styleName.toLowerCase().includes('cinematic') && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-stone-900 to-slate-900">
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Loader2 className="h-6 w-6 text-amber-400/80 animate-spin" />
                                    </div>
                                  </div>
                                )}
                                {variant.styleName.toLowerCase().includes('modern') && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-slate-900 to-cyan-900/80">
                                    <div className="absolute inset-0 bg-[conic-gradient(from_180deg,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-cyan-500/10" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Loader2 className="h-6 w-6 text-cyan-400/80 animate-spin" />
                                    </div>
                                  </div>
                                )}
                                {variant.styleName.toLowerCase().includes('authentic') && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-stone-800 to-amber-900/60">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-amber-500/10" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Loader2 className="h-6 w-6 text-emerald-400/80 animate-spin" />
                                    </div>
                                  </div>
                                )}
                                {!variant.styleName.toLowerCase().includes('cinematic') && 
                                 !variant.styleName.toLowerCase().includes('modern') && 
                                 !variant.styleName.toLowerCase().includes('authentic') && (
                                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                                  </div>
                                )}
                              </>
                            )}
                            {/* Selection indicator */}
                            {selected && (
                              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center z-10">
                                <Check className="h-4 w-4 text-primary-foreground" />
                              </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          <h3 className="font-bold text-lg text-foreground mb-1">{variant.styleName}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{variant.styleDescription}</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {variant.editingPace && (
                              <Badge variant="outline" className="text-xs">{variant.editingPace} pace</Badge>
                            )}
                            {variant.colorPalette && (
                              <Badge variant="outline" className="text-xs">{variant.colorPalette}</Badge>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Selected Variant Preview */}
                  {selectedVariant && (
                    <Card className="p-6 bg-card border-border mt-8">
                      <h3 className="font-bold text-lg text-foreground mb-4">Scene Breakdown</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {selectedVariant.scenes.map((scene, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-primary">Scene {scene.sceneNumber}</span>
                              <Badge variant="secondary" className="text-xs">{scene.duration}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-3">{scene.visualPrompt}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Continue Button */}
                  <div className="flex justify-center pt-6">
                    <Button
                      size="lg"
                      onClick={handleContinueToEditor}
                      disabled={!selectedVariant}
                      className="h-14 px-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                    >
                      Continue to Editor
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
