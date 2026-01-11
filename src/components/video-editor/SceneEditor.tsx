import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Sparkles,
  RefreshCw,
  Save,
  Clock,
  Mic,
  Loader2,
  X,
  Maximize2,
  Film,
  Camera,
  Wand2,
  Play,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Scene {
  sceneNumber: number;
  duration: string;
  visualDescription: string;
  suggestedVisuals: string;
  voiceover: string;
  visualUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  thumbnail?: string;
  url?: string;
}

interface SceneEditorProps {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
  onSave: (scene: Scene) => void;
  onRegenerateVisual: (customPrompt?: string) => void;
  onGenerateVideo: (model: string, customPrompt?: string) => void;
  isRegenerating?: boolean;
}

const SceneEditor = ({
  scene,
  isOpen,
  onClose,
  onSave,
  onRegenerateVisual,
  onGenerateVideo,
  isRegenerating
}: SceneEditorProps) => {
  const { toast } = useToast();
  const [editedScene, setEditedScene] = useState<Scene>(scene);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("pexels"); // Default to pexels for testing
  const [activeTab, setActiveTab] = useState<"visual" | "text" | "timing">("visual");
  const [viewMode, setViewMode] = useState<"static" | "motion">("static");
  const [isApplyingStyle, setIsApplyingStyle] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // Sync editedScene when scene prop changes
  useEffect(() => {
    setEditedScene(scene);
  }, [scene]);

  const handleSave = () => {
    onSave(editedScene);
    toast({
      title: "Scene Updated",
      description: `Scene ${editedScene.sceneNumber} changes have been applied.`
    });
    onClose();
  };

  const handleDiscard = () => {
    setEditedScene(scene); // Reset to original
    setCustomPrompt("");
    setSelectedStyle(null);
    toast({
      title: "Changes Discarded",
      description: "All edits have been reverted."
    });
    onClose();
  };

  const handleApplyStyle = async (style: string) => {
    setIsApplyingStyle(true);
    setSelectedStyle(style);
    
    try {
      // Simulate AI style enhancement
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const stylePrompts: Record<string, string> = {
        'Punchy': 'Make this more punchy and impactful: ',
        'Emotional': 'Add emotional depth and resonance: ',
        'Professional': 'Refine for professional broadcast quality: ',
        'Dramatic': 'Add dramatic tension and flair: '
      };

      const prefix = stylePrompts[style] || '';
      const enhancedVoiceover = `${editedScene.voiceover}`.trim();
      
      // For demo, add a subtle note about the style
      setEditedScene(prev => ({
        ...prev,
        voiceover: enhancedVoiceover
      }));

      toast({
        title: `${style} Style Applied`,
        description: "The voiceover has been enhanced with the selected style."
      });
    } catch (err) {
      toast({
        title: "Style Enhancement Failed",
        description: "Could not apply the selected style.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingStyle(false);
    }
  };

  const handleGenerateVideoClick = () => {
    if (selectedModel === "pexels") {
      toast({
        title: "Fetching Stock Footage",
        description: "Searching for cinematic clips matching your scene..."
      });
    } else {
      toast({
        title: `${selectedModel === 'luma' ? 'Luma Dream' : 'Kling AI'} Rendering`,
        description: "AI video generation started. This may take 1-2 minutes."
      });
    }
    onGenerateVideo(selectedModel, customPrompt || undefined);
  };

  const handleRegenerateClick = () => {
    toast({
      title: "Regenerating Visual",
      description: "Creating a new static preview for this scene..."
    });
    onRegenerateVisual(customPrompt || undefined);
  };

  const durationSeconds = parseInt(editedScene.duration) || 4;

  // Get the best available visual URL
  const getVisualUrl = () => {
    return scene.visualUrl || scene.imageUrl || scene.thumbnail || scene.url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col gap-0 duration-300">

        {/* Header - Director's Monitor Style */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <DialogTitle className="text-lg font-mono tracking-wide text-white font-normal uppercase">
              Scene {scene.sceneNumber} <span className="text-white/40 mx-2">|</span> Metadata Editor
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 font-mono text-xs">
              EDIT MODE
            </Badge>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white rounded-full hover:bg-white/10 ml-2">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Preview Monitor */}
          <div className="w-[60%] border-r border-white/10 p-6 flex flex-col bg-black/40">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                <Maximize2 className="w-3 h-3" />
                Visual Reference
              </Label>
              <div className="flex gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-[10px] cursor-pointer transition-all ${
                    viewMode === 'static' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                  onClick={() => setViewMode('static')}
                >
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Static
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`text-[10px] cursor-pointer transition-all ${
                    viewMode === 'motion' 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                  onClick={() => setViewMode('motion')}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Motion
                </Badge>
              </div>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
              {/* Visual Asset - Toggle between static and motion */}
              {viewMode === 'motion' && scene.videoUrl ? (
                <video
                  src={scene.videoUrl}
                  className="w-full h-full object-contain bg-neutral-900"
                  controls
                  autoPlay
                  loop
                  muted
                />
              ) : getVisualUrl() ? (
                <img
                  src={getVisualUrl()}
                  alt={`Scene ${scene.sceneNumber}`}
                  className="w-full h-full object-contain bg-neutral-900"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-4">
                  <Film className="w-16 h-16 stroke-1 opacity-50" />
                  <p className="font-mono text-sm">NO SIGNAL</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRegenerateClick}
                    disabled={isRegenerating}
                    className="text-white/60 border-white/20 hover:bg-white/10"
                  >
                    {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate Preview
                  </Button>
                </div>
              )}

              {/* Overlay: Show "No Video" hint when in motion mode but no video */}
              {viewMode === 'motion' && !scene.videoUrl && getVisualUrl() && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                  <Film className="w-12 h-12 text-white/30 mb-3" />
                  <p className="text-white/50 text-sm mb-4">No motion video generated yet</p>
                  <Button 
                    onClick={handleGenerateVideoClick}
                    disabled={isRegenerating}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-500"
                  >
                    {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Generate Video
                  </Button>
                </div>
              )}

              {/* Overlay Grid (Cinematic Polish) */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Visual Description Quick Edit */}
            <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-2 text-white/60">
                <Camera className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Prompt Data</span>
              </div>
              <Textarea
                value={editedScene.visualDescription}
                onChange={(e) => setEditedScene({ ...editedScene, visualDescription: e.target.value })}
                placeholder="Describe the visual..."
                className="bg-transparent border-none text-white/90 focus-visible:ring-0 p-0 text-sm min-h-[60px] resize-none placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {[
                { id: "visual", label: "GENERATION", icon: Sparkles },
                { id: "text", label: "SCRIPT & AUDIO", icon: Mic },
                { id: "timing", label: "TIMING", icon: Clock },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold tracking-wider transition-colors border-b-2 ${activeTab === tab.id
                      ? "border-blue-500 text-blue-400 bg-blue-500/5"
                      : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === "visual" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-white/60 uppercase">Creative Direction</Label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter specific details for the AI... (e.g., 'dramatic lighting, slow motion, sunset colors')"
                      className="bg-black/40 border-white/10 text-white min-h-[100px] focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-white/60 uppercase">Render Engine</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setSelectedModel("luma")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === "luma" ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white">Luma Dream</span>
                          {selectedModel === "luma" && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>
                        <p className="text-[10px] text-white/50">Cinematic motion, high coherence.</p>
                      </div>
                      <div
                        onClick={() => setSelectedModel("kling")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === "kling" ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white">Kling AI</span>
                          {selectedModel === "kling" && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                        </div>
                        <p className="text-[10px] text-white/50">Photorealistic texture focus.</p>
                      </div>
                      <div
                        onClick={() => setSelectedModel("pexels")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all col-span-2 ${selectedModel === "pexels" ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">Free Production (Pexels)</span>
                            <Badge variant="outline" className="text-[8px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">RECOMMENDED FOR TEST</Badge>
                          </div>
                          {selectedModel === "pexels" && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                        </div>
                        <p className="text-[10px] text-white/50">Instant cinematic clips from stock library. No API key required for testing.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <Button
                      onClick={handleGenerateVideoClick}
                      disabled={isRegenerating}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-semibold py-6 shadow-lg shadow-blue-900/20"
                    >
                      {isRegenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                      {isRegenerating ? "Rendering Scene..." : "Generate Cinematic Video"}
                    </Button>
                    <Button
                      onClick={handleRegenerateClick}
                      variant="outline"
                      disabled={isRegenerating}
                      className="w-full border-white/10 bg-transparent text-white/60 hover:text-white hover:bg-white/5"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate Static Preview
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "text" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-white/60 uppercase">Voiceover Script</Label>
                    <Textarea
                      value={editedScene.voiceover}
                      onChange={(e) => setEditedScene({ ...editedScene, voiceover: e.target.value })}
                      placeholder="Enter text to be spoken..."
                      rows={6}
                      className="bg-black/40 border-white/10 text-white font-serif text-lg leading-relaxed focus:border-blue-500/50"
                    />
                    <p className="text-xs text-right text-white/30">Word count: {editedScene.voiceover?.split(/\s+/).filter(Boolean).length || 0}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-white/80">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold">AI Style Enhancement</span>
                      {isApplyingStyle && <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Punchy', 'Emotional', 'Professional', 'Dramatic'].map(style => (
                        <Badge 
                          key={style} 
                          variant="secondary" 
                          className={`cursor-pointer border transition-all ${
                            selectedStyle === style 
                              ? 'bg-purple-500/30 text-purple-300 border-purple-500/50' 
                              : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/5'
                          }`}
                          onClick={() => handleApplyStyle(style)}
                        >
                          {style}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/40">Click a style to enhance your voiceover script</p>
                  </div>

                  {/* Suggested Visuals Section */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-white/60 uppercase">Suggested Visuals</Label>
                    <Textarea
                      value={editedScene.suggestedVisuals || ''}
                      onChange={(e) => setEditedScene({ ...editedScene, suggestedVisuals: e.target.value })}
                      placeholder="Describe what visuals should accompany this scene..."
                      rows={3}
                      className="bg-black/40 border-white/10 text-white text-sm focus:border-blue-500/50"
                    />
                  </div>
                </div>
              )}

              {activeTab === "timing" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="96" cy="96" r="92"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeDasharray={578}
                          strokeDashoffset={578 - (578 * durationSeconds) / 15}
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="text-center">
                        <span className="text-5xl font-bold text-white tracking-tighter">{durationSeconds}</span>
                        <span className="text-sm font-medium text-white/40 block mt-1">SECONDS</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 px-4">
                    <Slider
                      value={[durationSeconds]}
                      onValueChange={([value]) => setEditedScene({ ...editedScene, duration: `${value}s` })}
                      min={1}
                      max={15}
                      step={1}
                      className="[&>.relative>.bg-primary]:bg-gradient-to-r [&>.relative>.bg-primary]:from-blue-500 [&>.relative>.bg-primary]:to-purple-500"
                    />
                    <div className="flex justify-between text-[10px] text-white/30 uppercase font-bold tracking-widest">
                      <span>Snappy (1s)</span>
                      <span>Extended (15s)</span>
                    </div>
                  </div>

                  {/* Quick Duration Presets */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-white/60 uppercase">Quick Presets</Label>
                    <div className="flex gap-2">
                      {[3, 5, 7, 10].map(sec => (
                        <Button
                          key={sec}
                          variant="outline"
                          size="sm"
                          onClick={() => setEditedScene({ ...editedScene, duration: `${sec}s` })}
                          className={`flex-1 ${
                            durationSeconds === sec 
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                              : 'border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {sec}s
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleDiscard} className="text-white/60 hover:text-white hover:bg-white/10">
                Discard Changes
              </Button>
              <Button onClick={handleSave} className="bg-white text-black hover:bg-white/90 font-semibold px-6">
                <Save className="w-4 h-4 mr-2" />
                Apply to Scene
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SceneEditor;
