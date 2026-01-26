import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronUp,
  Settings2,
  Clock,
  Monitor,
  Video,
  Globe,
  Camera,
  MessageSquare,
  Volume2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// VideoVariant interface removed - now generating single video from script

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
  const [expandedScenes, setExpandedScenes] = useState(false);

  // Video generation state
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [showRegenSettings, setShowRegenSettings] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video settings for regeneration
  const [videoDuration, setVideoDuration] = useState<string>("5");
  const [videoAspectRatio, setVideoAspectRatio] = useState<string>("16:9");
  const [videoModel, setVideoModel] = useState<string>("seedance-pro");
  const [voiceoverLanguage, setVoiceoverLanguage] = useState<string>("en");
  const [cameraMovement, setCameraMovement] = useState<string>("auto");
  const [showVoiceoverPreview, setShowVoiceoverPreview] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>("scripts");
  
  // Computed voiceover script
  const voiceoverScript = (editedScript || selectedScript)?.scenes 
    ? (editedScript || selectedScript)?.scenes.map((s) => s.voiceover).filter(Boolean).join(' ')
    : `${(editedScript || selectedScript)?.hook || ''} ${(editedScript || selectedScript)?.cta || ''}`;

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

  const generateVideoAndContinue = async (customDuration?: string, customAspectRatio?: string) => {
    const campaignId = id || navState?.campaignId;
    const scriptToUse = editedScript || selectedScript;
    
    if (!campaignId || !scriptToUse) {
      toast({
        title: "Selection Required",
        description: "Please select a script to continue.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingVideo(true);
    setShowRegenSettings(false);

    try {
      toast({
        title: "Generating Video",
        description: "AI is creating your video from the script...",
        duration: 60000
      });

      // Use custom duration if provided, otherwise use state or default
      const durationToUse = customDuration || videoDuration;
      const aspectRatioToUse = customAspectRatio || videoAspectRatio;

      const { data: result, error } = await supabase.functions.invoke('generate-video-from-script', {
        body: {
          campaignId,
          script: scriptToUse,
          duration: durationToUse,
          aspectRatio: aspectRatioToUse,
          language: voiceoverLanguage,
          cameraMovement: cameraMovement
        }
      });

      if (error) throw error;

      if (result?.videoUrl) {
        setGeneratedVideoUrl(result.videoUrl);
        setShowVideoPreview(true);
        setActiveTab("preview"); // Switch to preview tab after generation
        toast({
          title: "Video Generated!",
          description: `${durationToUse}s ${aspectRatioToUse} video ready for preview.`,
        });
      } else {
        throw new Error("No video generated");
      }
    } catch (err: any) {
      console.error("Error generating video:", err);
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingVideo(false);
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
                Choose Your Script
              </h1>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                {navState?.duration || "30s"} • {navState?.goal || "awareness"}
              </p>
            </div>
          </div>

          <Button size="sm" variant="ghost" onClick={() => generateScripts()} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 py-8">
        <AnimatePresence mode="wait">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-muted/50 p-1">
              <TabsTrigger value="scripts" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Script Selection
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                disabled={!generatedVideoUrl}
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Video Preview
                {generatedVideoUrl && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-green-500/20 text-green-500">
                    Ready
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Scripts Tab */}
            <TabsContent value="scripts" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
                    <div className="p-6 border-t border-border bg-muted/30 flex items-center justify-between gap-4">
                      {/* Video Model Selector */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Model:</span>
                        <Select value={videoModel} onValueChange={setVideoModel}>
                          <SelectTrigger className="w-[200px] h-10 bg-background">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="seedance-pro">Seedance 1.5 Pro (VO)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        size="lg"
                        onClick={() => generateVideoAndContinue()}
                        disabled={!selectedScript || generatingVideo}
                        className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                      >
                        {generatingVideo ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Generating Video...
                          </>
                        ) : (
                          <>
                            Generate Video
                            <Sparkles className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Video Preview Tab */}
            <TabsContent value="preview" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Main Video Player */}
                <div className="lg:col-span-2">
                  <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
                    <div className="bg-muted/50 border-b border-border p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {generatingVideo ? (
                          <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        ) : (
                          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {generatingVideo ? "Generating Video..." : "Generated Video Preview"}
                        </span>
                      </div>
                      {generatingVideo ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Processing
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      )}
                    </div>
                    <div className="p-6">
                      {generatingVideo ? (
                        /* Loading Skeleton */
                        <div className="aspect-video bg-muted rounded-xl overflow-hidden relative">
                          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 animate-pulse" />
                            
                            {/* Central loader */}
                            <div className="relative z-10 flex flex-col items-center space-y-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center relative z-10">
                                  <Video className="h-6 w-6 text-primary animate-pulse" />
                                </div>
                              </div>
                              <div className="text-center space-y-2">
                                <p className="text-sm font-medium text-foreground">AI is generating your video</p>
                                <p className="text-xs text-muted-foreground">This may take up to a minute...</p>
                              </div>
                            </div>
                            
                            {/* Skeleton bars */}
                            <div className="absolute bottom-6 left-6 right-6 space-y-2">
                              <div className="h-2 bg-muted-foreground/10 rounded-full w-3/4 animate-pulse" />
                              <div className="h-2 bg-muted-foreground/10 rounded-full w-1/2 animate-pulse" style={{ animationDelay: "150ms" }} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-black rounded-xl overflow-hidden">
                          {generatedVideoUrl && (
                            <video
                              ref={videoRef}
                              src={generatedVideoUrl}
                              controls
                              autoPlay
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Settings Panel */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Voiceover Preview */}
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <button 
                      onClick={() => setShowVoiceoverPreview(!showVoiceoverPreview)}
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Volume2 className="h-4 w-4 text-primary" />
                        Voiceover Script Preview
                      </div>
                      {showVoiceoverPreview ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {showVoiceoverPreview && (
                      <div className="px-4 pb-4 space-y-3">
                        <div className="p-3 bg-muted/50 rounded-lg border border-border">
                          <p className="text-sm text-foreground leading-relaxed">
                            {voiceoverScript || "No voiceover script available"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>{voiceoverScript?.split(' ').length || 0} words • ~{Math.ceil((voiceoverScript?.split(' ').length || 0) / 2.5)}s read time</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Regeneration Settings */}
                  <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Settings2 className="h-4 w-4 text-primary" />
                      Video Settings
                    </div>
                    
                    {/* Language */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Globe className="h-3 w-3" />
                        Voiceover Language
                      </label>
                      <Select value={voiceoverLanguage} onValueChange={setVoiceoverLanguage}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                          <SelectItem value="ko">Korean</SelectItem>
                          <SelectItem value="zh">Mandarin Chinese</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                          <SelectItem value="id">Indonesian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Camera Movement */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Camera className="h-3 w-3" />
                        Camera Movement
                      </label>
                      <Select value={cameraMovement} onValueChange={setCameraMovement}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Camera Movement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto (AI Decides)</SelectItem>
                          <SelectItem value="static">Static</SelectItem>
                          <SelectItem value="pan">Pan</SelectItem>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="dolly">Dolly</SelectItem>
                          <SelectItem value="orbit">Orbit</SelectItem>
                          <SelectItem value="tracking">Tracking Shot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Duration */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Duration
                      </label>
                      <Select value={videoDuration} onValueChange={setVideoDuration}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 seconds</SelectItem>
                          <SelectItem value="10">10 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Aspect Ratio */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Monitor className="h-3 w-3" />
                        Aspect Ratio
                      </label>
                      <Select value={videoAspectRatio} onValueChange={setVideoAspectRatio}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Aspect Ratio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">16:9 (HDTV)</SelectItem>
                          <SelectItem value="4:3">4:3 (Legacy TV)</SelectItem>
                          <SelectItem value="21:9">21:9 (Cinematic)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={() => generateVideoAndContinue(videoDuration, videoAspectRatio)}
                      disabled={generatingVideo}
                      variant="outline"
                      className="w-full"
                    >
                      {generatingVideo ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate Video
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Script Summary */}
                  <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
                    <div className="text-sm font-medium text-foreground">Selected Script</div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">{selectedScript?.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-3">{selectedScript?.hook}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <Badge variant="secondary" className="text-xs">{selectedScript?.tone}</Badge>
                        <Badge variant="secondary" className="text-xs">{selectedScript?.scenes?.length || 0} scenes</Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab("scripts")}
                      className="w-full mt-2 text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="h-3 w-3 mr-2" />
                      Edit Script
                    </Button>
                  </div>

                  {/* Continue Button */}
                  <Button
                    size="lg"
                    onClick={() => {
                      const campaignId = id || navState?.campaignId;
                      navigate(`/video-editor/${campaignId}`, {
                        state: {
                          generatedVideoUrl,
                          script: editedScript || selectedScript
                        }
                      });
                    }}
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                  >
                    Continue to Editor
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </AnimatePresence>
      </main>
    </div>
  );
}