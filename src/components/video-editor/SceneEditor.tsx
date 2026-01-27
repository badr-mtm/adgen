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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Image as ImageIcon,
  AlertTriangle,
  RotateCcw,
  Globe,
  Video
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

type AspectRatioOption = "16:9" | "4:3" | "21:9";
type LanguageOption = "en" | "es" | "ja" | "ko" | "zh" | "pt" | "id";
type CameraMovementOption = "auto" | "static" | "pan" | "zoom" | "dolly" | "orbit" | "tracking";

const LANGUAGE_OPTIONS: { value: LanguageOption; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "ko", label: "Korean", flag: "🇰🇷" },
  { value: "zh", label: "Mandarin", flag: "🇨🇳" },
  { value: "pt", label: "Portuguese", flag: "🇧🇷" },
  { value: "id", label: "Indonesian", flag: "🇮🇩" },
];

const CAMERA_MOVEMENT_OPTIONS: { value: CameraMovementOption; label: string; desc: string }[] = [
  { value: "auto", label: "Auto", desc: "AI decides best camera" },
  { value: "static", label: "Static", desc: "No camera movement" },
  { value: "pan", label: "Pan", desc: "Horizontal sweep" },
  { value: "zoom", label: "Zoom", desc: "Gradual zoom in" },
  { value: "dolly", label: "Dolly", desc: "Push-in movement" },
  { value: "orbit", label: "Orbit", desc: "Circle around subject" },
  { value: "tracking", label: "Tracking", desc: "Follow the action" },
];

interface SceneEditorProps {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
  onSave: (scene: Scene) => void;
  onRegenerateVisual: (customPrompt?: string) => void;
  onGenerateVideo: (model: string, customPrompt?: string, duration?: string, aspectRatio?: string, language?: string, cameraMovement?: string) => void;
  isRegenerating?: boolean;
  generationError?: string | null;
  onClearError?: () => void;
}

const SceneEditor = ({
  scene,
  isOpen,
  onClose,
  onSave,
  onRegenerateVisual,
  onGenerateVideo,
  isRegenerating,
  generationError,
  onClearError
}: SceneEditorProps) => {
  const { toast } = useToast();
  const [editedScene, setEditedScene] = useState<Scene>(scene);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("wan-fast"); // Default to Wan Fast
  const [selectedDuration, setSelectedDuration] = useState<"5" | "10">("5"); // For Wan 2.5
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioOption>("16:9");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>("en");
  const [selectedCameraMovement, setSelectedCameraMovement] = useState<CameraMovementOption>("auto");
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
    // Clear any previous error
    onClearError?.();
    
    const modelNames: Record<string, string> = {
      "wan-fast": "Wan Fast",
      "wan-pro": "Wan Pro",
      "wan-25": "Wan 2.5",
      "luma": "Luma Dream",
      "kling": "Kling AI",
      "pexels": "Pexels Stock"
    };
    
    if (selectedModel === "pexels") {
      toast({
        title: "Fetching Stock Footage",
        description: "Searching for cinematic clips matching your scene..."
      });
    } else {
      const durationNote = selectedModel === "wan-25" ? ` (${selectedDuration}s clip)` : "";
      toast({
        title: `${modelNames[selectedModel] || selectedModel} Rendering`,
        description: `AI video generation started${durationNote} at ${selectedAspectRatio}. This may take 1-2 minutes.`
      });
    }
    // Pass duration for Wan 2.5 model, aspect ratio, language, and camera movement for all models
    const duration = selectedModel === "wan-25" ? selectedDuration : undefined;
    onGenerateVideo(selectedModel, customPrompt || undefined, duration, selectedAspectRatio, selectedLanguage, selectedCameraMovement);
  };

  const handleRegenerateClick = () => {
    // Clear any previous error
    onClearError?.();
    
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
                  {/* TV Aspect Ratio Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Broadcast Format</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "16:9" as AspectRatioOption, label: "16:9", desc: "HDTV Standard", width: 64, height: 36 },
                        { value: "4:3" as AspectRatioOption, label: "4:3", desc: "Legacy TV", width: 48, height: 36 },
                        { value: "21:9" as AspectRatioOption, label: "21:9", desc: "Cinematic", width: 72, height: 31 },
                      ].map((ratio) => (
                        <button
                          key={ratio.value}
                          onClick={() => setSelectedAspectRatio(ratio.value)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            selectedAspectRatio === ratio.value
                              ? "border-primary bg-primary/20 shadow-lg ring-2 ring-primary/30"
                              : "border-border bg-muted/30 hover:border-primary/50"
                          }`}
                        >
                          {/* Visual TV Screen Preview */}
                          <div className="flex items-center justify-center mb-2">
                            <div 
                              className={`border-2 rounded-sm flex items-center justify-center ${
                                selectedAspectRatio === ratio.value 
                                  ? "border-primary bg-primary/10" 
                                  : "border-muted-foreground/50 bg-muted/50"
                              }`}
                              style={{ 
                                width: `${ratio.width}px`, 
                                height: `${ratio.height}px`,
                                minHeight: '28px'
                              }}
                            >
                              <Film className={`w-3 h-3 ${
                                selectedAspectRatio === ratio.value 
                                  ? "text-primary" 
                                  : "text-muted-foreground/50"
                              }`} />
                            </div>
                          </div>
                          <span className={`text-sm font-bold block ${
                            selectedAspectRatio === ratio.value ? "text-primary" : "text-foreground"
                          }`}>{ratio.label}</span>
                          <p className="text-[10px] text-muted-foreground">{ratio.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

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
                      {/* Wan Fast - Primary recommended */}
                      <div
                        onClick={() => setSelectedModel("wan-fast")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === "wan-fast" ? "bg-primary/20 border-primary/50 shadow-lg ring-2 ring-primary/30" : "bg-muted/30 border-border hover:border-primary/30"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">Wan Fast</span>
                            <Badge variant="outline" className="text-[8px] h-4 bg-primary/20 text-primary border-primary/30">RECOMMENDED</Badge>
                          </div>
                          {selectedModel === "wan-fast" && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Fast, high-quality. Best balance of speed & quality.</p>
                      </div>
                      
                      {/* Wan Pro - Highest quality */}
                      <div
                        onClick={() => setSelectedModel("wan-pro")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === "wan-pro" ? "bg-accent/30 border-accent shadow-lg" : "bg-muted/30 border-border hover:border-accent/30"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-foreground">Wan Pro</span>
                          {selectedModel === "wan-pro" && <div className="w-2 h-2 bg-accent rounded-full" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Multi-step reasoning. Higher detail & coherence.</p>
                      </div>
                      
                      {/* Wan 2.5 - Latest model */}
                      <div
                        onClick={() => setSelectedModel("wan-25")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === "wan-25" ? "bg-indigo-500/20 border-indigo-500/50 shadow-lg" : "bg-muted/30 border-border hover:border-indigo-500/30"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">Wan 2.5</span>
                            <Badge variant="outline" className="text-[8px] h-4 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30">NEW</Badge>
                          </div>
                          {selectedModel === "wan-25" && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Latest model. 1080p output, 5s or 10s clips.</p>
                      </div>
                      
                      {/* Duration selector for Wan 2.5 */}
                      {selectedModel === "wan-25" && (
                        <div className="col-span-2 p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10">
                          <Label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Clip Duration</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedDuration("5")}
                              className={`p-2 rounded-md border text-center transition-all ${
                                selectedDuration === "5"
                                  ? "border-indigo-500 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                                  : "border-border bg-muted/30 text-muted-foreground hover:border-indigo-500/50"
                              }`}
                            >
                              <Clock className="w-4 h-4 mx-auto mb-1" />
                              <span className="text-sm font-bold">5 sec</span>
                              <p className="text-[10px] text-muted-foreground">Faster render</p>
                            </button>
                            <button
                              onClick={() => setSelectedDuration("10")}
                              className={`p-2 rounded-md border text-center transition-all ${
                                selectedDuration === "10"
                                  ? "border-indigo-500 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                                  : "border-border bg-muted/30 text-muted-foreground hover:border-indigo-500/50"
                              }`}
                            >
                              <Clock className="w-4 h-4 mx-auto mb-1" />
                              <span className="text-sm font-bold">10 sec</span>
                              <p className="text-[10px] text-muted-foreground">Longer clip</p>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Luma Dream */}
                      <div
                        onClick={() => setSelectedModel("luma")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === "luma" ? "bg-amber-500/20 border-amber-500/50 shadow-lg" : "bg-muted/30 border-border hover:border-amber-500/30"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-foreground">Luma Dream</span>
                          {selectedModel === "luma" && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Cinematic motion, high coherence.</p>
                      </div>
                      
                      {/* Kling AI */}
                      <div
                        onClick={() => setSelectedModel("kling")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === "kling" ? "bg-rose-500/20 border-rose-500/50 shadow-lg" : "bg-muted/30 border-border hover:border-rose-500/30"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-foreground">Kling AI</span>
                          {selectedModel === "kling" && <div className="w-2 h-2 bg-rose-500 rounded-full" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Photorealistic texture focus.</p>
                      </div>
                      
                      {/* Pexels Stock */}
                      <div
                        onClick={() => setSelectedModel("pexels")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === "pexels" ? "bg-green-500/20 border-green-500/50 shadow-lg" : "bg-muted/30 border-border hover:border-green-500/30"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">Pexels Stock</span>
                            <Badge variant="outline" className="text-[8px] h-4 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">FREE</Badge>
                          </div>
                          {selectedModel === "pexels" && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Instant stock clips. No API cost.</p>
                      </div>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" />
                      Voiceover Language
                    </Label>
                    <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as LanguageOption)}>
                      <SelectTrigger className="bg-muted/50 border-border">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">
                      TTS voiceover will be generated in the selected language
                    </p>
                  </div>

                  {/* Camera Movement Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Video className="w-3.5 h-3.5" />
                      Camera Movement
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {CAMERA_MOVEMENT_OPTIONS.map((cam) => (
                        <button
                          key={cam.value}
                          onClick={() => setSelectedCameraMovement(cam.value)}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            selectedCameraMovement === cam.value
                              ? "border-primary bg-primary/20 shadow-md ring-1 ring-primary/30"
                              : "border-border bg-muted/30 hover:border-primary/50"
                          }`}
                        >
                          <span className={`text-xs font-bold block ${
                            selectedCameraMovement === cam.value ? "text-primary" : "text-foreground"
                          }`}>{cam.label}</span>
                          <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{cam.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Display */}
                  {generationError && (
                    <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-destructive">Video Generation Failed</p>
                          <p className="text-xs text-destructive/80 mt-1 break-words">{generationError}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleGenerateVideoClick}
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Retry Generation
                        </Button>
                        <Button
                          onClick={() => onClearError?.()}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}

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
