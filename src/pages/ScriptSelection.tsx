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
    // Simulate AI script generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedScripts: Script[] = [
      {
        id: "1",
        title: "Emotional Connection",
        hook: "What if the perfect workout wasn't about the gym at all?",
        body: "It's about finding your sanctuary. A place where every rep feels intentional, where the energy elevates you, and where luxury meets determination.",
        cta: "Experience the difference. Visit us today.",
        tone: "Inspirational",
        duration: campaignData.duration || "30s"
      },
      {
        id: "2", 
        title: "Bold Statement",
        hook: "Forget everything you know about fitness.",
        body: "We've reimagined the entire experience. State-of-the-art equipment, personalized training, and an atmosphere that demands excellence from every member.",
        cta: "Join the elite. Start your journey now.",
        tone: "Confident",
        duration: campaignData.duration || "30s"
      },
      {
        id: "3",
        title: "Transformation Story",
        hook: "Sarah never thought she'd become a morning person.",
        body: "But something changed when she discovered a gym that felt more like a retreat. Now, 5 AM is her favorite hour. The journey from tired to transformed starts with a single step.",
        cta: "Your transformation awaits. Book your tour.",
        tone: "Warm",
        duration: campaignData.duration || "30s"
      },
      {
        id: "4",
        title: "Direct & Powerful",
        hook: "Your body deserves the best.",
        body: "Premium equipment. Expert trainers. Results that speak for themselves. No excuses, no shortcuts – just the tools and support you need to become your strongest self.",
        cta: "Elevate your fitness. Join today.",
        tone: "Assertive",
        duration: campaignData.duration || "30s"
      }
    ];
    
    setScripts(generatedScripts);
    setLoading(false);
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
    
    // Simulate AI scene generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const generatedScenes: Scene[] = [
      {
        id: "1",
        number: 1,
        description: "Opening: Cinematic establishing shot",
        duration: "5s",
        visualPrompt: "Aerial drone shot of luxurious modern gym exterior at golden hour, glass windows reflecting sunset",
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
      },
      {
        id: "2",
        number: 2,
        description: "Interior reveal: Premium equipment",
        duration: "4s",
        visualPrompt: "Slow tracking shot through high-end gym interior, focusing on premium equipment and atmospheric lighting",
        imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800"
      },
      {
        id: "3",
        number: 3,
        description: "Human element: Member in action",
        duration: "6s",
        visualPrompt: "Close-up of determined athlete mid-workout, sweat glistening, professional lighting emphasizing effort",
        imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800"
      },
      {
        id: "4",
        number: 4,
        description: "Community: Group energy",
        duration: "5s",
        visualPrompt: "Wide shot of diverse group fitness class, high energy, natural light flooding the space",
        imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800"
      },
      {
        id: "5",
        number: 5,
        description: "Transformation moment",
        duration: "4s",
        visualPrompt: "Emotional close-up of person achieving personal milestone, genuine smile, cinematic depth of field",
        imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800"
      },
      {
        id: "6",
        number: 6,
        description: "CTA: Brand reveal",
        duration: "6s",
        visualPrompt: "Elegant logo animation over ambient gym footage, premium typography, call to action overlay",
        imageUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800"
      }
    ];
    
    setScenes(generatedScenes);
    setGeneratingScenes(false);
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
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        selectedScript?.id === script.id
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
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                  selectedVoice === voice.id
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
