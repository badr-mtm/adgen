import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Edit3,
  Play,
  Volume2,
  Sparkles,
  Loader2,
  RefreshCw,
  Mic
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Script {
  id: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  tone: string;
  duration: string;
  voiceover?: string;
}

interface Scene {
  id: string;
  number: number;
  description: string;
  duration: string;
  visualPrompt: string;
  imageUrl?: string;
}

const VOICE_OPTIONS = [
  { id: "professional_male", name: "Professional Male", accent: "US English" },
  { id: "professional_female", name: "Professional Female", accent: "US English" },
  { id: "friendly_male", name: "Friendly Male", accent: "US English" },
  { id: "friendly_female", name: "Friendly Female", accent: "US English" },
  { id: "dramatic_male", name: "Dramatic Male", accent: "British English" },
  { id: "dramatic_female", name: "Dramatic Female", accent: "British English" },
];

export default function ScriptSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const campaignData = location.state || {};

  const [loading, setLoading] = useState(true);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [editingScript, setEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState<Script | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [generatingScenes, setGeneratingScenes] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [step, setStep] = useState<"scripts" | "scenes">("scripts");

  useEffect(() => {
    generateScripts();
  }, []);

  const generateScripts = async () => {
    setLoading(true);

    try {
      console.log('Generating real AI scripts with data:', campaignData);
      const { data, error } = await supabase.functions.invoke('generate-ideas', {
        body: {
          prompt: campaignData.description || campaignData.prompt,
          adType: 'video',
          goal: campaignData.goal,
          targetAudience: campaignData.target_audience,
          creativeStyle: campaignData.style || 'modern',
          aspectRatios: ['16:9'],
        }
      });

      if (error) throw error;

      if (data?.campaigns) {
        const mappedScripts: Script[] = data.campaigns.map((c: any, index: number) => ({
          id: c.id || String(index + 1),
          title: c.title,
          hook: c.description.split('.')[0] + '.',
          body: c.script,
          cta: c.cta_text || 'Learn More',
          tone: c.creative_style || 'Professional',
          duration: campaignData.duration || '30s'
        }));
        setScripts(mappedScripts);
        toast({
          title: "AI Scripts Generated",
          description: "We've created 4 unique concepts based on your brief.",
        });
      } else {
        throw new Error('No campaigns returned from AI');
      }
    } catch (error: any) {
      console.error("AI Generation failed, falling back to mock data:", error);

      const generatedScripts: Script[] = [
        {
          id: "1",
          title: "Emotional Connection (Offline)",
          hook: "What if the perfect workout wasn't about the gym at all?",
          body: "It's about finding your sanctuary. A place where every rep feels intentional, where the energy elevates you, and where luxury meets determination.",
          cta: "Experience the difference.",
          tone: "Inspirational",
          duration: campaignData.duration || "30s"
        },
        {
          id: "2",
          title: "Bold Statement (Offline)",
          hook: "Forget everything you know about fitness.",
          body: "We've reimagined the entire experience. State-of-the-art equipment, personalized training, and an atmosphere that demands excellence from every member.",
          cta: "Join the elite.",
          tone: "Confident",
          duration: campaignData.duration || "30s"
        },
        {
          id: "3",
          title: "Transformation Story (Offline)",
          hook: "Sarah never thought she'd become a morning person.",
          body: "But something changed when she discovered a gym that felt more like a retreat. Now, 5 AM is her favorite hour.",
          cta: "Your transformation awaits.",
          tone: "Warm",
          duration: campaignData.duration || "30s"
        },
        {
          id: "4",
          title: "Direct & Powerful (Offline)",
          hook: "Your body deserves the best.",
          body: "Premium equipment. Expert trainers. Results that speak for themselves. No excuses, no shortcuts – just the tools and support you need.",
          cta: "Elevate your fitness.",
          tone: "Assertive",
          duration: campaignData.duration || "30s"
        }
      ];
      setScripts(generatedScripts);

      toast({
        title: "AI Gateway Offline",
        description: "Falling back to smart templates. Connect your AI API key for real-time generation.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScript = (script: Script) => {
    setSelectedScript(script);
    setEditedScript({ ...script });
  };

  const handleSaveEdit = () => {
    if (editedScript) {
      setSelectedScript(editedScript);
      setEditingScript(false);
    }
  };

  const generateScenes = async () => {
    if (!selectedScript) return;

    setGeneratingScenes(true);
    setStep("scenes");

    try {
      const { data, error } = await supabase.functions.invoke('generate-storyboard', {
        body: {
          campaignId: campaignData.id,
          prompt: selectedScript.body,
          duration: selectedScript.duration,
          goal: selectedScript.tone
        }
      });

      if (error) throw error;

      if (data?.concepts?.[0]?.scenes || data?.storyboard?.scenes) {
        const aiScenes = (data.concepts?.[0]?.scenes || data.storyboard.scenes).map((s: any, idx: number) => ({
          id: String(idx + 1),
          number: s.number || s.sceneNumber || idx + 1,
          description: s.description || s.visualDescription,
          duration: s.duration,
          visualPrompt: s.visualPrompt || s.suggestedVisuals,
          imageUrl: `https://images.unsplash.com/photo-${1534438327276 + idx}-14e5300c3a48?w=800`
        }));
        setScenes(aiScenes);
        toast({
          title: "Storyboard Generated",
          description: "AI has visualized your campaign script into scenes.",
        });
      } else {
        throw new Error('No scenes returned from AI');
      }
    } catch (error: any) {
      console.error("Scene generation failed, falling back to mock data:", error);

      const generatedScenes: Scene[] = [
        {
          id: "1",
          number: 1,
          description: "Opening: Cinematic establishing shot (Offline)",
          duration: "5s",
          visualPrompt: "Aerial drone shot of luxurious modern gym exterior at golden hour, glass windows reflecting sunset",
          imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
        },
        {
          id: "2",
          number: 2,
          description: "The Experience: State-of-the-art equipment (Offline)",
          duration: "10s",
          visualPrompt: "Close-up slow motion of high-end chrome weight machines, clean environment, glowing accent lights",
          imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800"
        },
        {
          id: "3",
          number: 3,
          description: "The Result: Focused athlete (Offline)",
          duration: "10s",
          visualPrompt: "Portrait of a person finishing a set, wiping sweat, looking satisfied in a premium locker room",
          imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800"
        },
        {
          id: "4",
          number: 4,
          description: "Closing: Logo and Call to Action (Offline)",
          duration: "5s",
          visualPrompt: "Minimalist graphic with brand logo and text 'Join the Elite Today' on a dark textured background",
          imageUrl: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800"
        }
      ];
      setScenes(generatedScenes);
      toast({
        title: "AI Visualizer Offline",
        description: "Using pre-rendered storyboard templates.",
      });
    } finally {
      setGeneratingScenes(false);
    }
  };

  const handleContinueToEditor = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get or create brand
      let { data: brands } = await supabase
        .from("brands")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1);

      let brandId = brands?.[0]?.id;

      if (!brandId) {
        const { data: newBrand } = await supabase
          .from("brands")
          .insert({ user_id: session.user.id, name: "My Brand" })
          .select()
          .single();
        brandId = newBrand?.id;
      }

      // Create campaign with storyboard
      const storyboardData = {
        script: selectedScript,
        scenes: scenes,
        voiceover: selectedVoice,
        duration: selectedScript?.duration,
        ...campaignData
      };

      const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert([{
          user_id: session.user.id,
          brand_id: brandId!,
          title: selectedScript?.title || "New TV Campaign",
          description: selectedScript?.body || "",
          ad_type: "video",
          goal: campaignData.goal || "awareness",
          status: "storyboard",
          storyboard: storyboardData
        }])
        .select()
        .single();

      if (error) throw error;

      navigate(`/video-editor/${campaign.id}`, {
        state: {
          fromScriptSelection: true,
          campaignData: { ...campaignData, ...storyboardData }
        }
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground">Generating script options...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {step === "scripts" ? "Choose Your Script" : "Review Scenes"}
              </h1>
              <p className="text-muted-foreground">
                {step === "scripts"
                  ? "Select and customize one of our AI-generated scripts"
                  : "Review and edit your storyboard scenes"
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              {campaignData.duration || "30s"} Ad
            </Badge>
            <Badge variant="outline" className="text-primary border-primary">
              {campaignData.goal || "Awareness"}
            </Badge>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "scripts" ? (
            <motion.div
              key="scripts"
              initial={{ opacity: 0, x: -30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Scripts List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">AI Generated Scripts</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateScripts}
                    className="text-muted-foreground"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {scripts.map((script) => (
                    <motion.button
                      key={script.id}
                      onClick={() => handleSelectScript(script)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${selectedScript?.id === script.id
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border hover:border-primary/50 bg-card"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {script.tone}
                        </Badge>
                        {selectedScript?.id === script.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{script.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{script.hook}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Script Preview / Editor */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                  {selectedScript ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-border bg-card p-6 space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">Script Preview</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingScript(!editingScript)}
                          className="text-primary"
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          {editingScript ? "Cancel" : "Edit"}
                        </Button>
                      </div>

                      {editingScript ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Hook</label>
                            <Textarea
                              value={editedScript?.hook || ""}
                              onChange={(e) => setEditedScript(prev => prev ? { ...prev, hook: e.target.value } : null)}
                              className="bg-background min-h-[60px]"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Body</label>
                            <Textarea
                              value={editedScript?.body || ""}
                              onChange={(e) => setEditedScript(prev => prev ? { ...prev, body: e.target.value } : null)}
                              className="bg-background min-h-[100px]"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Call to Action</label>
                            <Textarea
                              value={editedScript?.cta || ""}
                              onChange={(e) => setEditedScript(prev => prev ? { ...prev, cta: e.target.value } : null)}
                              className="bg-background min-h-[40px]"
                            />
                          </div>
                          <Button onClick={handleSaveEdit} className="w-full">
                            Save Changes
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-primary font-medium mb-1">HOOK</p>
                            <p className="text-foreground">{selectedScript.hook}</p>
                          </div>
                          <div>
                            <p className="text-xs text-primary font-medium mb-1">BODY</p>
                            <p className="text-foreground">{selectedScript.body}</p>
                          </div>
                          <div>
                            <p className="text-xs text-primary font-medium mb-1">CTA</p>
                            <p className="text-foreground">{selectedScript.cta}</p>
                          </div>
                        </div>
                      )}

                      {/* Voice Selection */}
                      <div className="border-t border-border pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Mic className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">Voiceover</span>
                        </div>
                        <ScrollArea className="h-32">
                          <div className="space-y-2">
                            {VOICE_OPTIONS.map((voice) => (
                              <button
                                key={voice.id}
                                onClick={() => setSelectedVoice(voice.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${selectedVoice === voice.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-muted-foreground/50"
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Volume2 className={`h-4 w-4 ${selectedVoice === voice.id ? "text-primary" : "text-muted-foreground"}`} />
                                  <span className="text-sm text-foreground">{voice.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{voice.accent}</span>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>

                      <Button
                        size="lg"
                        onClick={generateScenes}
                        disabled={generatingScenes}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {generatingScenes ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Scenes...
                          </>
                        ) : (
                          <>
                            Generate Scenes
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Play className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Select a script to preview</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="scenes"
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-6"
            >
              {/* Scenes Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {scenes.map((scene, index) => (
                  <motion.div
                    key={scene.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative aspect-video rounded-xl overflow-hidden border border-border bg-card cursor-pointer hover:border-primary/50 transition-all"
                  >
                    {scene.imageUrl && (
                      <img
                        src={scene.imageUrl}
                        alt={`Scene ${scene.number}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="secondary" className="text-xs">
                          Scene {scene.number}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{scene.duration}</span>
                      </div>
                      <p className="text-xs text-foreground line-clamp-2">{scene.description}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Script Summary */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{selectedScript?.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedScript?.tone} tone • {selectedScript?.duration}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep("scripts")}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Script
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-xs text-primary font-medium mb-1">HOOK</p>
                    <p className="text-muted-foreground">{selectedScript?.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary font-medium mb-1">BODY</p>
                    <p className="text-muted-foreground">{selectedScript?.body}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary font-medium mb-1">CTA</p>
                    <p className="text-muted-foreground">{selectedScript?.cta}</p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setStep("scripts")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Scripts
                </Button>
                <Button
                  size="lg"
                  onClick={handleContinueToEditor}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Continue to Video Editor
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
