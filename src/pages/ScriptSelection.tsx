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
  Mic,
  Clapperboard,
  Wand2,
  BrainCircuit,
  Film
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Script {
  id: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  tone: string;
  duration: string;
  voiceover?: string;
  persona?: string; // New: AI Persona ID
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
  { id: "professional_male", name: "Professional Male", accent: "US English", style: "Trustworthy & Deep" },
  { id: "professional_female", name: "Professional Female", accent: "US English", style: "Clear & Polished" },
  { id: "friendly_male", name: "Friendly Male", accent: "US English", style: "Warm & Relatable" },
  { id: "friendly_female", name: "Friendly Female", accent: "US English", style: "Energetic & Bright" },
  { id: "dramatic_male", name: "Cinematic Voice", accent: "British English", style: "Epic & Movie Trailer" },
];

const AI_PERSONAS = [
  { id: "visionary", name: "The Visionary", icon: BrainCircuit, description: "Big picture, inspirational, and future-forward." },
  { id: "storyteller", name: "The Storyteller", icon: Clapperboard, description: "Narrative-driven, emotional, and character-focused." },
  { id: "analyst", name: "The Strategist", icon: Check, description: "Direct, benefit-focused, and conversion-optimized." },
];

export default function ScriptSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const campaignData = location.state || {}; // Mock data if empty for dev

  const [loading, setLoading] = useState(true);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [editingScript, setEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState<Script | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [generatingScenes, setGeneratingScenes] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [view, setView] = useState<"script-lab" | "storyboard-studio">("script-lab");

  useEffect(() => {
    generateScripts();
  }, []);

  const generateScripts = async () => {
    setLoading(true);
    // Simulate API latency for "processing" feel
    setTimeout(() => {
      const mockScripts: Script[] = [
        {
          id: "1",
          title: "The Emotional Arc",
          hook: "What if the perfect moment wasn't about time, but about feeling?",
          body: "We often rush through life, missing the details. But with AdGen Premium, every second is crafted for impact. It's not just advertising; it's a connection. Rediscover what it means to truly reach your audience.",
          cta: "Experience the difference today.",
          tone: "Inspirational",
          duration: "30s",
          persona: "storyteller"
        },
        {
          id: "2",
          title: "The Power Move",
          hook: "Stop competing. Start dominating.",
          body: "The market is crowded. Noise is everywhere. You need a signal that cuts through. Our platform delivers precision targeting and creative excellence that your competitors can't match. Be the leader.",
          cta: "Claim your market share.",
          tone: "Assertive",
          duration: "30s",
          persona: "visionary"
        },
        {
          id: "3",
          title: "The Smart Choice",
          hook: "30% of your budget is being wasted. Here's why.",
          body: "Inefficiency is the silent killer of growth. We analyzed the data, and the solution is clear. Optimize your spend, maximize your ROAS, and stop guessing. Science meets art.",
          cta: "Start optimizing now.",
          tone: "Analytical",
          duration: "30s",
          persona: "analyst"
        }
      ];
      setScripts(mockScripts);
      setSelectedScript(mockScripts[0]);
      setEditedScript(mockScripts[0]);
      setLoading(false);
      toast({
        title: "AI Concepts Generated",
        description: "The Writers Room has produced 3 unique scripts.",
      });
    }, 2000);
  };

  const handleSelectScript = (script: Script) => {
    setSelectedScript(script);
    setEditedScript({ ...script });
    setEditingScript(false);
  };

  const generateScenes = async () => {
    if (!selectedScript) return;
    setGeneratingScenes(true);

    // Simulate generation
    setTimeout(() => {
      const mockScenes: Scene[] = [
        { id: "1", number: 1, duration: "5s", description: "Opening shot: close up on eye opening, pupil dilating", visualPrompt: "Cinematic macro shot of human eye, golden hour lighting", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800" },
        { id: "2", number: 2, duration: "10s", description: "Montage of fast-paced city life, blurring into light streaks", visualPrompt: "Time-lapse of city traffic at night, cyberpunk colors", imageUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800" },
        { id: "3", number: 3, duration: "10s", description: "Product hero shot, floating in zero gravity", visualPrompt: "3D render of abstract geometric product, clean studio background", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800" },
        { id: "4", number: 4, duration: "5s", description: "Closing logo animation on black background", visualPrompt: "Minimalist white logo on black, smooth fade out", imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800" },
      ];
      setScenes(mockScenes);
      setGeneratingScenes(false);
      setView("storyboard-studio");
      toast({
        title: "Storyboard Visualized",
        description: "Scenes have been rendered from your script.",
      });
    }, 2500);
  };

  const handleContinue = async () => {
    const campaignId = campaignData.id;

    // Show cinematic transition feedback
    toast({
      title: "Initializing Production Studio",
      description: "Syncing creative assets and configuring timeline...",
      duration: 3000
    });

    if (campaignId) {
      try {
        // Persist generated assets to Supabase
        const { error } = await supabase
          .from('campaigns')
          .update({
            storyboard: {
              scenes: scenes.map(s => ({
                id: s.id,
                name: `Scene ${s.number}`,
                duration: s.duration,
                thumbnail: s.imageUrl,
                description: s.description,
                type: "generated",
                url: s.imageUrl
              })),
              generatedAt: new Date().toISOString()
            }
          })
          .eq('id', campaignId);

        if (error) throw error;

        // Navigate with state for immediate render (optimistic UI)
        navigate(`/video-editor/${campaignId}`, {
          state: {
            preloadedScenes: scenes,
            script: selectedScript
          }
        });

      } catch (err) {
        console.error("Failed to save assets:", err);
        // Fallback navigation
        navigate(`/video-editor/${campaignId}`);
      }
    } else {
      // Demo/Dev mode handling
      console.warn("No campaign ID - Entering Demo Mode");
      navigate(`/video-editor/demo`, {
        state: {
          preloadedScenes: scenes,
          script: selectedScript
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-medium text-white">AI Writers Room is thinking...</h2>
          <p className="text-white/40 text-sm">Analyzing market trends and crafting hooks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* Cinematic Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white/60 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                Creative Intelligence Hub
              </h1>
              <p className="text-xs text-white/40 font-mono uppercase tracking-widest">
                SESSION ID: {campaignData.id?.slice(0, 8) || "GEN-ALPHA-01"}
              </p>
            </div>
          </div>

          <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setView("script-lab")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === "script-lab" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-white/40 hover:text-white"}`}
            >
              Script Lab
            </button>
            <button
              onClick={() => { if (scenes.length > 0) setView("storyboard-studio") }}
              disabled={scenes.length === 0}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === "storyboard-studio" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"}`}
            >
              Storyboard Studio
            </button>
          </div>

          <Button size="sm" variant="ghost" className="text-white/40 hover:text-white">
            <RefreshCw className="h-4 w-4 mr-2" /> Reset Session
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 py-8">
        <AnimatePresence mode="wait">
          {view === "script-lab" ? (
            <motion.div
              key="lab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left: AI Personas / Script Options */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-400" />
                    Generated Concepts
                  </h2>
                  <div className="space-y-3">
                    {scripts.map((script) => {
                      const PersonaIcon = AI_PERSONAS.find(p => p.id === script.persona)?.icon || Sparkles;
                      const selected = selectedScript?.id === script.id;
                      return (
                        <div
                          key={script.id}
                          onClick={() => handleSelectScript(script)}
                          className={`group relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${selected ? "bg-white/10 border-blue-500/50 ring-1 ring-blue-500/50" : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className={`bg-transparent ${selected ? "text-blue-300 border-blue-500/30" : "text-white/40 border-white/10"}`}>
                              {script.tone}
                            </Badge>
                            {selected && <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />}
                          </div>
                          <h3 className={`font-bold text-lg mb-1 ${selected ? "text-white" : "text-white/80"}`}>{script.title}</h3>
                          <p className="text-sm text-white/50 line-clamp-2">{script.hook}</p>

                          {/* Persona Watermark */}
                          <PersonaIcon className="absolute -bottom-4 -right-4 h-24 w-24 text-white/5 group-hover:text-white/10 transition-colors rotate-12" />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-white mb-2">Pro Tip</h3>
                    <p className="text-xs text-white/60">
                      "The Visionary" persona typically performs 15% better for brand awareness campaigns, while "The Strategist" excels at conversion.
                    </p>
                  </div>
                  <Sparkles className="absolute top-2 right-2 h-32 w-32 text-purple-500/10 blur-2xl" />
                </div>
              </div>

              {/* Right: Script Editor */}
              <div className="lg:col-span-8">
                <div className="h-full bg-[#111] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
                  {/* Editor Toolbar */}
                  <div className="bg-white/5 border-b border-white/5 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
                      <span className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <span className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
                      <span className="ml-4 text-xs font-mono text-white/40">EDITOR_MODE: {editingScript ? "WRITE" : "READ_ONLY"}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingScript(!editingScript)}
                      className={editingScript ? "text-blue-400 bg-blue-400/10" : "text-white/60 hover:text-white"}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {editingScript ? "Done Editing" : "Edit Script"}
                    </Button>
                  </div>

                  {/* Editor Content */}
                  <ScrollArea className="flex-1 p-8">
                    <div className="max-w-2xl mx-auto space-y-8 font-mono">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-blue-500 font-bold">The Hook (0:00-0:05)</label>
                        {editingScript ? (
                          <Textarea
                            value={editedScript?.hook}
                            onChange={e => setEditedScript(prev => prev ? { ...prev, hook: e.target.value } : null)}
                            className="bg-white/5 border-white/10 text-lg text-white font-medium min-h-[80px] focus:ring-blue-500/50"
                          />
                        ) : (
                          <p className="text-xl text-white font-medium leading-relaxed">{selectedScript?.hook}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-purple-500 font-bold">The Narrative (0:05-0:25)</label>
                        {editingScript ? (
                          <Textarea
                            value={editedScript?.body}
                            onChange={e => setEditedScript(prev => prev ? { ...prev, body: e.target.value } : null)}
                            className="bg-white/5 border-white/10 text-lg text-white/80 leading-relaxed min-h-[150px] focus:ring-purple-500/50"
                          />
                        ) : (
                          <p className="text-lg text-white/80 leading-relaxed">{selectedScript?.body}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-green-500 font-bold">Call to Action (0:25-0:30)</label>
                        {editingScript ? (
                          <Textarea
                            value={editedScript?.cta}
                            onChange={e => setEditedScript(prev => prev ? { ...prev, cta: e.target.value } : null)}
                            className="bg-white/5 border-white/10 text-lg text-white font-bold min-h-[60px] focus:ring-green-500/50"
                          />
                        ) : (
                          <p className="text-xl text-white font-bold">{selectedScript?.cta}</p>
                        )}
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Voice Selector Footer */}
                  <div className="bg-white/5 border-t border-white/5 p-4 px-8">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Mic className="h-4 w-4" />
                        <span>Voice:</span>
                      </div>
                      <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {VOICE_OPTIONS.map(voice => (
                          <button
                            key={voice.id}
                            onClick={() => setSelectedVoice(voice.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap transition-all ${selectedVoice === voice.id ? "bg-white text-black border-white" : "bg-black/20 border-white/10 text-white/60 hover:border-white/30"}`}
                          >
                            <Volume2 className="h-3 w-3" />
                            {voice.name}
                          </button>
                        ))}
                      </div>
                      <Button
                        onClick={generateScenes}
                        disabled={generatingScenes}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                      >
                        {generatingScenes ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Visualizing...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generate Storyboard
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="storyboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              {/* Storyboard View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {scenes.map((scene, idx) => (
                  <div key={scene.id} className="group relative aspect-[9/16] md:aspect-video rounded-2xl overflow-hidden bg-gray-900 border border-white/10 ring-1 ring-white/5 hover:ring-blue-500/50 transition-all shadow-2xl">
                    {/* Scene Number */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="text-[10px] font-mono font-bold bg-black/50 backdrop-blur border border-white/10 px-2 py-1 rounded text-white/80">
                        SCENE {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="text-[10px] font-mono bg-black/50 backdrop-blur border border-white/10 px-2 py-1 rounded text-white/80 flex items-center gap-1">
                        <Film className="h-3 w-3" /> {scene.duration}
                      </span>
                    </div>

                    {/* Image with Hover Effect */}
                    <div className="absolute inset-0 bg-gray-800">
                      {scene.imageUrl ? (
                        <img src={scene.imageUrl} alt="Storyboard frame" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    </div>

                    {/* Caption */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <p className="text-sm font-medium text-white line-clamp-2 leading-relaxed">
                        {scene.description}
                      </p>
                      <p className="text-xs text-white/40 mt-2 font-mono truncate">
                        PROMPT: {scene.visualPrompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Production Control Bar */}
              <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40 flex justify-center pointer-events-none">
                <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 p-2 pr-6 rounded-full flex items-center gap-6 shadow-2xl">
                  <div className="flex -space-x-3 px-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] text-white/60">
                        TM
                      </div>
                    ))}
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-sm">
                    <span className="text-white/40 mr-2">Est. Cost:</span>
                    <span className="text-white font-mono">$2,400</span>
                  </div>
                  <Button onClick={handleContinue} className="bg-white text-black hover:bg-gray-200 rounded-full px-8 font-bold">
                    Start Production <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
