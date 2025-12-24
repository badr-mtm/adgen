import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Music, Film, ArrowRight, Sparkles, Check, Edit3 } from "lucide-react";
import SceneCard from "@/components/storyboard/SceneCard";
import { StoryboardPageSkeleton } from "@/components/skeletons/StoryboardPageSkeleton";

interface Scene {
  sceneNumber: number;
  duration: string;
  visualDescription: string;
  suggestedVisuals: string;
  voiceover: string;
  voiceoverLines?: string[];
  visualUrl?: string;
  audioUrl?: string;
  generatedAt?: string;
}

interface Storyboard {
  scriptVariants: {
    "15s": string;
    "30s": string;
    "60s": string;
  };
  scenes: Scene[];
  musicMood: string;
}

type StoryboardStep = "script" | "storyboard";

const Storyboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingScenes, setGeneratingScenes] = useState<Set<number>>(new Set());
  const [campaign, setCampaign] = useState<any>(null);
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<"15s" | "30s" | "60s">("30s");
  const [editedScript, setEditedScript] = useState("");
  const [step, setStep] = useState<StoryboardStep>("script");
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [isEditingMusicMood, setIsEditingMusicMood] = useState(false);
  const [editedMusicMood, setEditedMusicMood] = useState("");

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", id)
          .eq("user_id", session.user.id)
          .single();

        if (error || !data) {
          toast({
            title: "Campaign not found",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setCampaign(data);
        
        if (data.storyboard) {
          const storyboardData = data.storyboard as unknown as Storyboard;
          setStoryboard(storyboardData);
          setEditedScript(storyboardData.scriptVariants["30s"]);
          setEditedMusicMood(storyboardData.musicMood);
          
          // If scenes already have visuals, go directly to storyboard step
          const hasVisuals = storyboardData.scenes?.some(s => s.visualUrl);
          if (hasVisuals) {
            setStep("storyboard");
          }
        } else {
          // Generate storyboard if it doesn't exist
          await generateStoryboard();
        }
      } catch (error: any) {
        console.error("Error loading campaign:", error);
        toast({
          title: "Error loading campaign",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [id, navigate, toast]);

  const generateStoryboard = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-storyboard", {
        body: { campaignId: id },
      });

      if (error) throw error;

      setStoryboard(data.storyboard);
      setEditedScript(data.storyboard.scriptVariants["30s"]);
      setEditedMusicMood(data.storyboard.musicMood);
      
      toast({
        title: "Script Generated!",
        description: "Review and confirm your script to proceed.",
      });
    } catch (error: any) {
      console.error("Error generating storyboard:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate storyboard",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (storyboard) {
      setEditedScript(storyboard.scriptVariants[selectedDuration]);
    }
  }, [selectedDuration, storyboard]);

  const confirmScriptAndGenerateScenes = async () => {
    if (!storyboard) return;
    
    setStep("storyboard");
    
    // Start generating all scene visuals
    const scenesToGenerate = storyboard.scenes.filter(s => !s.visualUrl);
    if (scenesToGenerate.length === 0) {
      toast({ title: "All scenes already have visuals" });
      return;
    }

    setGeneratingScenes(new Set(scenesToGenerate.map(s => s.sceneNumber)));
    
    try {
      const results = await Promise.allSettled(
        scenesToGenerate.map(scene => 
          supabase.functions.invoke("generate-scene-visual", {
            body: { campaignId: id, sceneNumber: scene.sceneNumber },
          })
        )
      );

      const successfulResults = results.filter(r => r.status === 'fulfilled' && r.value.data);
      const failedCount = results.filter(r => r.status === 'rejected' || r.value?.error).length;

      // Refresh campaign data to get all updates
      const { data: refreshedCampaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();
      
      if (refreshedCampaign?.storyboard) {
        setStoryboard(refreshedCampaign.storyboard as unknown as Storyboard);
      }

      if (failedCount > 0) {
        toast({
          title: `Generated ${successfulResults.length}/${scenesToGenerate.length} visuals`,
          description: `${failedCount} scene(s) failed. Try regenerating individually.`,
          variant: failedCount === scenesToGenerate.length ? "destructive" : "default",
        });
      } else {
        toast({
          title: "All Visuals Generated!",
          description: "Your storyboard scenes now have AI-generated visuals.",
        });
      }
    } catch (error: any) {
      console.error("Error generating all visuals:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate all visuals",
        variant: "destructive",
      });
    } finally {
      setGeneratingScenes(new Set());
    }
  };

  const generateSceneVisual = async (sceneNumber: number, customPrompt?: string) => {
    setGeneratingScenes(prev => new Set(prev).add(sceneNumber));
    try {
      const { data, error } = await supabase.functions.invoke("generate-scene-visual", {
        body: { 
          campaignId: id, 
          sceneNumber,
          ...(customPrompt && { customPrompt })
        },
      });

      if (error) throw error;

      setStoryboard(data.storyboard);
      
      toast({
        title: "Visual Generated!",
        description: `Scene ${sceneNumber} visual created successfully.`,
      });
    } catch (error: any) {
      console.error("Error generating scene visual:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate visual",
        variant: "destructive",
      });
    } finally {
      setGeneratingScenes(prev => {
        const next = new Set(prev);
        next.delete(sceneNumber);
        return next;
      });
    }
  };

  const updateScene = async (sceneNumber: number, updates: Partial<Scene>) => {
    try {
      const { data, error } = await supabase.functions.invoke("update-scene", {
        body: { 
          campaignId: id, 
          sceneNumber,
          updates
        },
      });

      if (error) throw error;

      setStoryboard(data.storyboard);
      
      toast({
        title: "Scene Updated",
        description: `Scene ${sceneNumber} updated successfully.`,
      });
    } catch (error: any) {
      console.error("Error updating scene:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update scene",
        variant: "destructive",
      });
    }
  };

  const handleUploadAudio = async (sceneNumber: number, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/scene-${sceneNumber}-voiceover.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ad-visuals')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ad-visuals')
        .getPublicUrl(fileName);

      await updateScene(sceneNumber, { audioUrl: publicUrl });
      
      toast({
        title: "Audio Uploaded",
        description: `Voiceover for scene ${sceneNumber} uploaded successfully.`,
      });
    } catch (error: any) {
      console.error("Error uploading audio:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload audio",
        variant: "destructive",
      });
    }
  };

  const saveScriptEdit = async () => {
    if (!storyboard) return;
    
    try {
      const updatedStoryboard = {
        ...storyboard,
        scriptVariants: {
          ...storyboard.scriptVariants,
          [selectedDuration]: editedScript
        }
      };

      const { error } = await supabase
        .from("campaigns")
        .update({ storyboard: updatedStoryboard as any })
        .eq("id", id);

      if (error) throw error;

      setStoryboard(updatedStoryboard);
      setIsEditingScript(false);
      
      toast({ title: "Script saved" });
    } catch (error: any) {
      toast({
        title: "Failed to save script",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveMusicMood = async () => {
    if (!storyboard) return;
    
    try {
      const updatedStoryboard = {
        ...storyboard,
        musicMood: editedMusicMood
      };

      const { error } = await supabase
        .from("campaigns")
        .update({ storyboard: updatedStoryboard as any })
        .eq("id", id);

      if (error) throw error;

      setStoryboard(updatedStoryboard);
      setIsEditingMusicMood(false);
      
      toast({ title: "Music mood saved" });
    } catch (error: any) {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || generating) {
    return <StoryboardPageSkeleton />;
  }

  if (!storyboard) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No storyboard available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">{campaign?.title}</h1>
              <p className="text-muted-foreground">{campaign?.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{campaign?.ad_type}</Badge>
                <Badge variant="secondary">{campaign?.creative_style}</Badge>
                <Badge variant="outline">{campaign?.goal}</Badge>
              </div>
            </div>
            {step === "storyboard" && (
              <Button 
                onClick={() => navigate(`/video-editor/${id}`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue to Editor
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 pt-4">
            <div className={`flex items-center gap-2 ${step === "script" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "script" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {step === "storyboard" ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="font-medium">Confirm Script</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === "storyboard" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "storyboard" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                2
              </div>
              <span className="font-medium">Storyboard</span>
            </div>
          </div>
        </div>

        {step === "script" ? (
          /* Script Confirmation Step */
          <div className="space-y-6">
            {/* Script Variants */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Script</h2>
                </div>
                {!isEditingScript && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setIsEditingScript(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              
              <Tabs value={selectedDuration} onValueChange={(v) => setSelectedDuration(v as any)}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="15s">15 Seconds</TabsTrigger>
                  <TabsTrigger value="30s">30 Seconds</TabsTrigger>
                  <TabsTrigger value="60s">60 Seconds</TabsTrigger>
                </TabsList>
                
                {isEditingScript ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editedScript}
                      onChange={(e) => setEditedScript(e.target.value)}
                      className="min-h-[150px] bg-background text-foreground border-border resize-none"
                      placeholder="Edit your script here..."
                    />
                    <div className="flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setEditedScript(storyboard.scriptVariants[selectedDuration]);
                          setIsEditingScript(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveScriptEdit}>
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-foreground whitespace-pre-wrap">{editedScript}</p>
                  </div>
                )}
              </Tabs>
            </Card>

            {/* Music Mood */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Music Mood</h2>
                </div>
                {!isEditingMusicMood && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setIsEditingMusicMood(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditingMusicMood ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedMusicMood}
                    onChange={(e) => setEditedMusicMood(e.target.value)}
                    className="min-h-[80px] bg-background text-foreground border-border resize-none"
                    placeholder="Describe the music mood..."
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setEditedMusicMood(storyboard.musicMood);
                        setIsEditingMusicMood(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveMusicMood}>
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground">{storyboard.musicMood}</p>
              )}
            </Card>

            {/* Confirm & Generate Button */}
            <div className="flex justify-center pt-4">
              <Button 
                size="lg"
                onClick={confirmScriptAndGenerateScenes}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Confirm Script & Generate All Scenes
              </Button>
            </div>
          </div>
        ) : (
          /* Storyboard Step */
          <div className="space-y-6">
            {/* Scenes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">Storyboard Scenes</h2>
                {generatingScenes.size > 0 && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Generating {generatingScenes.size} scene(s)...
                  </Badge>
                )}
              </div>
              
              <div className="space-y-6">
                {storyboard.scenes.map((scene) => (
                  <SceneCard
                    key={scene.sceneNumber}
                    scene={scene}
                    isGenerating={generatingScenes.has(scene.sceneNumber)}
                    onGenerateVisual={generateSceneVisual}
                    onUpdateScene={updateScene}
                    onUploadAudio={handleUploadAudio}
                  />
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-8 flex justify-center">
              <Button 
                onClick={() => navigate(`/video-editor/${id}`)}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue to Visual Editor
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Storyboard;
