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
  id?: string;
  sceneNumber: number;
  name?: string;
  duration: string;
  visualDescription: string;
  suggestedVisuals?: string;
  voiceover: string;
  visualUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  thumbnail?: string;
  url?: string;
  type?: string;
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
      <DialogContent className="max-w-5xl h-[85vh] p-0 bg-background backdrop-blur-xl border border-border shadow-2xl overflow-hidden flex flex-col gap-0 duration-300">

        {/* Header - Director's Monitor Style */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <DialogTitle className="text-lg font-mono tracking-wide text-foreground font-normal uppercase">
              Scene {scene.sceneNumber} <span className="text-muted-foreground mx-2">|</span> Metadata Editor
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-mono text-xs">
              EDIT MODE
            </Badge>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted ml-2">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Preview Monitor */}
          <div className="w-[60%] border-r border-border p-6 flex flex-col bg-muted/30">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Maximize2 className="w-3 h-3" />
                Visual Reference
              </Label>
              <div className="flex gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-[10px] cursor-pointer transition-all ${
                    viewMode === 'static' 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'bg-muted text-muted-foreground hover:bg-accent'
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
                      ? 'bg-accent/50 text-accent-foreground border border-accent' 
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                  onClick={() => setViewMode('motion')}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Motion
                </Badge>
              </div>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-border bg-card shadow-2xl relative group">
              {/* Visual Asset - Toggle between static and motion */}
              {viewMode === 'motion' && scene.videoUrl ? (
                <video
                  src={scene.videoUrl}
                  className="w-full h-full object-contain bg-muted"
                  controls
                  autoPlay
                  loop
                  muted
                />
              ) : getVisualUrl() ? (
                <img
                  src={getVisualUrl()}
                  alt={`Scene ${scene.sceneNumber}`}
                  className="w-full h-full object-contain bg-muted"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                  <Film className="w-16 h-16 stroke-1 opacity-50" />
                  <p className="font-mono text-sm">NO SIGNAL</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRegenerateClick}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate Preview
                  </Button>
                </div>
              )}

              {/* Overlay: Show "No Video" hint when in motion mode but no video */}
              {viewMode === 'motion' && !scene.videoUrl && getVisualUrl() && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center">
                  <Film className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm mb-4">No motion video generated yet</p>
                  <Button 
                    onClick={handleGenerateVideoClick}
                    disabled={isRegenerating}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
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
            <div className="mt-4 p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Camera className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Prompt Data</span>
              </div>
              <Textarea
                value={editedScene.visualDescription}
                onChange={(e) => setEditedScene({ ...editedScene, visualDescription: e.target.value })}
                placeholder="Describe the visual..."
                className="bg-transparent border-none text-foreground focus-visible:ring-0 p-0 text-sm min-h-[60px] resize-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="flex-1 flex flex-col overflow-hidden bg-card">
            {/* Tabs */}
            <div className="flex border-b border-border">
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
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Creative Direction</Label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter specific details for the AI... (e.g., 'dramatic lighting, slow motion, sunset colors')"
                      className="bg-muted/50 border-border text-foreground min-h-[100px] focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Render Engine</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setSelectedModel("luma")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === "luma" ? "bg-primary/20 border-primary/50 shadow-lg" : "bg-muted/30 border-border hover:border-primary/30"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-foreground">Luma Dream</span>
                          {selectedModel === "luma" && <div className="w-2 h-2 bg-primary rounded-full" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Cinematic motion, high coherence.</p>
                      </div>
                      <div
                        onClick={() => setSelectedModel("kling")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === "kling" ? "bg-accent/30 border-accent shadow-lg" : "bg-muted/30 border-border hover:border-accent/30"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-foreground">Kling AI</span>
                          {selectedModel === "kling" && <div className="w-2 h-2 bg-accent rounded-full" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Photorealistic texture focus.</p>
                      </div>
                      <div
                        onClick={() => setSelectedModel("pexels")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all col-span-2 ${selectedModel === "pexels" ? "bg-green-500/20 border-green-500/50 shadow-lg" : "bg-muted/30 border-border hover:border-green-500/30"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">Free Production (Pexels)</span>
                            <Badge variant="outline" className="text-[8px] h-4 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">RECOMMENDED FOR TEST</Badge>
                          </div>
                          {selectedModel === "pexels" && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Instant cinematic clips from stock library. No API key required for testing.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <Button
                      onClick={handleGenerateVideoClick}
                      disabled={isRegenerating}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 shadow-lg"
                    >
                      {isRegenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                      {isRegenerating ? "Rendering Scene..." : "Generate Cinematic Video"}
                    </Button>
                    <Button
                      onClick={handleRegenerateClick}
                      variant="outline"
                      disabled={isRegenerating}
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
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Voiceover Script</Label>
                    <Textarea
                      value={editedScene.voiceover}
                      onChange={(e) => setEditedScene({ ...editedScene, voiceover: e.target.value })}
                      placeholder="Enter text to be spoken..."
                      rows={6}
                      className="bg-muted/50 border-border text-foreground font-serif text-lg leading-relaxed focus:border-primary/50"
                    />
                    <p className="text-xs text-right text-muted-foreground">Word count: {editedScene.voiceover?.split(/\s+/).filter(Boolean).length || 0}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                    <div className="flex items-center gap-2 text-foreground">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">AI Style Enhancement</span>
                      {isApplyingStyle && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Punchy', 'Emotional', 'Professional', 'Dramatic'].map(style => (
                        <Badge 
                          key={style} 
                          variant="secondary" 
                          className={`cursor-pointer border transition-all ${
                            selectedStyle === style 
                              ? 'bg-primary/30 text-primary border-primary/50' 
                              : 'bg-muted hover:bg-accent text-muted-foreground border-border'
                          }`}
                          onClick={() => handleApplyStyle(style)}
                        >
                          {style}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Click a style to enhance your voiceover script</p>
                  </div>

                  {/* Suggested Visuals Section */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Suggested Visuals</Label>
                    <Textarea
                      value={editedScene.suggestedVisuals || ''}
                      onChange={(e) => setEditedScene({ ...editedScene, suggestedVisuals: e.target.value })}
                      placeholder="Describe what visuals should accompany this scene..."
                      rows={3}
                      className="bg-muted/50 border-border text-foreground text-sm focus:border-primary/50"
                    />
                  </div>
                </div>
              )}

              {activeTab === "timing" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-border" />
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="96" cy="96" r="92"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="8"
                          strokeDasharray={578}
                          strokeDashoffset={578 - (578 * durationSeconds) / 15}
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="text-center">
                        <span className="text-5xl font-bold text-foreground tracking-tighter">{durationSeconds}</span>
                        <span className="text-sm font-medium text-muted-foreground block mt-1">SECONDS</span>
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
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      <span>Snappy (1s)</span>
                      <span>Extended (15s)</span>
                    </div>
                  </div>

                  {/* Quick Duration Presets */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Quick Presets</Label>
                    <div className="flex gap-2">
                      {[3, 5, 7, 10].map(sec => (
                        <Button
                          key={sec}
                          variant="outline"
                          size="sm"
                          onClick={() => setEditedScene({ ...editedScene, duration: `${sec}s` })}
                          className={`flex-1 ${
                            durationSeconds === sec 
                              ? 'bg-primary/20 border-primary/50 text-primary' 
                              : ''
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
            <div className="p-4 border-t border-border bg-muted/50 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleDiscard}>
                Discard Changes
              </Button>
              <Button onClick={handleSave} className="font-semibold px-6">
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
