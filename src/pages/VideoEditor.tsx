import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import VideoEditorSidebar from "@/components/video-editor/VideoEditorSidebar";
import VideoPreview from "@/components/video-editor/VideoPreview";
import VideoTimeline from "@/components/video-editor/VideoTimeline";
import AIAssistantPanel from "@/components/video-editor/AIAssistantPanel";
import SceneEditor from "@/components/video-editor/SceneEditor";
import { StrategyConfigModal, type StrategyConfig } from "@/components/create/StrategyConfigModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";
import { Loader2, Sparkles } from "lucide-react";
import { defaultOverlaySettings, type VideoOverlaySettings } from "@/types/videoEditor";

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

const VideoEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [activeTab, setActiveTab] = useState("slideshow");
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);
  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [overlaySettings, setOverlaySettings] = useState<VideoOverlaySettings>(defaultOverlaySettings);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [showStrategyConfig, setShowStrategyConfig] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Video playback hook
  const playback = useVideoPlayback({
    scenes: storyboard?.scenes || [],
    onSceneChange: (index) => {
      // Show end screen when we reach the last scene and it ends
      const isLastScene = storyboard && index === storyboard.scenes.length - 1;
      if (isLastScene && overlaySettings.endScreen.enabled) {
        // Will be handled by timeline end
      }
    }
  });

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
        } else {
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
      
      toast({
        title: "Storyboard Generated!",
        description: "Your video storyboard is ready.",
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

  const generateSceneVisual = async (sceneNumber: number, customPrompt?: string) => {
    setRegeneratingScene(sceneNumber);
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
      setRegeneratingScene(null);
    }
  };

  const handleSceneSave = async (updatedScene: Scene) => {
    if (!storyboard) return;

    const newScenes = [...storyboard.scenes];
    const index = newScenes.findIndex(s => s.sceneNumber === updatedScene.sceneNumber);
    if (index >= 0) {
      newScenes[index] = updatedScene;
      
      const newStoryboard = { ...storyboard, scenes: newScenes };
      setStoryboard(newStoryboard);

      // Save to database
      try {
        await supabase
          .from("campaigns")
          .update({ 
            storyboard: newStoryboard as any,
            updated_at: new Date().toISOString()
          })
          .eq("id", id);

        toast({ title: "Scene updated" });
      } catch (error: any) {
        console.error("Error saving scene:", error);
        toast({
          title: "Save failed",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleStoryboardUpdate = useCallback((newStoryboard: Storyboard) => {
    setStoryboard(newStoryboard);
    toast({ title: "Storyboard updated" });
  }, [toast]);

  const handleAIActionComplete = useCallback((action: string) => {
    if (action === "scene_updated") {
      toast({ title: "Scene updated by AI" });
    }
  }, [toast]);

  const handleDownload = () => {
    toast({ title: "Download started", description: "Preparing your creative..." });
    // TODO: Implement video download/export
  };

  const handleAddToStrategy = () => {
    setShowStrategyConfig(true);
  };

  const handlePublishWithStrategy = async (config: StrategyConfig) => {
    setIsPublishing(true);
    try {
      await supabase
        .from("campaigns")
        .update({ 
          status: "live",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      toast({ 
        title: "Campaign is Live! 🚀", 
        description: `Your campaign is now running with a $${config.budget.amount} ${config.budget.type} budget.`
      });
      setShowStrategyConfig(false);
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Publish failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Convert storyboard scenes to timeline format
  const timelineScenes = storyboard?.scenes.map((scene, index) => {
    const durationSecs = parseInt(scene.duration) || 4;
    const startTime = storyboard.scenes.slice(0, index).reduce((acc, s) => acc + (parseInt(s.duration) || 4), 0);
    return {
      id: scene.sceneNumber,
      thumbnailUrl: scene.visualUrl,
      duration: scene.duration,
      startTime,
      endTime: startTime + durationSecs,
    };
  }) || [];

  const sidebarScenes = storyboard?.scenes.map((scene, index) => ({
    id: scene.sceneNumber,
    thumbnailUrl: scene.visualUrl,
    duration: `${parseInt(scene.duration) || 4}s`,
    label: `Scene ${scene.sceneNumber}`,
    isActive: playback.currentSceneIndex === index,
  })) || [];

  const currentScene = storyboard?.scenes[playback.currentSceneIndex];

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Sparkles className="h-16 w-16 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-ping" />
          </div>
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground">
            {generating ? "Generating your video storyboard..." : "Loading campaign..."}
          </p>
        </div>
      </div>
    );
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navigation />
      
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <VideoEditorSidebar
          scenes={sidebarScenes}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSceneSelect={(sceneId) => {
            setShowEndScreen(false);
            const index = storyboard.scenes.findIndex(s => s.sceneNumber === sceneId);
            if (index >= 0) {
              playback.seekToScene(index);
            }
          }}
          onSceneChange={(sceneId) => generateSceneVisual(sceneId)}
          overlaySettings={overlaySettings}
          onOverlaySettingsChange={setOverlaySettings}
          isPreviewingEndScreen={showEndScreen}
          onToggleEndScreenPreview={() => setShowEndScreen(!showEndScreen)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Video Preview - scrollable area */}
          <div className="flex-1 min-h-0 overflow-auto">
            <VideoPreview
              scenes={storyboard.scenes.map(s => ({
                id: s.sceneNumber,
                visualUrl: s.visualUrl,
                duration: s.duration,
                voiceover: s.voiceover,
              }))}
              currentSceneIndex={playback.currentSceneIndex}
              sceneProgress={playback.getCurrentSceneProgress()}
              brandName={campaign?.title}
              headline={campaign?.title}
              description={campaign?.description}
              ctaText={campaign?.cta_text || "Learn More"}
              isPlaying={playback.isPlaying}
              onPlayPause={playback.togglePlayPause}
              onEditScene={(index) => setEditingSceneIndex(index)}
              currentVoiceover={currentScene?.voiceover}
              overlaySettings={overlaySettings}
              showEndScreen={showEndScreen}
            />
          </div>

          {/* Timeline - fixed at bottom, scrollable if needed */}
          <div className="flex-shrink-0 max-h-[45%] overflow-auto">
            <VideoTimeline
              scenes={timelineScenes}
              currentTime={playback.currentTime}
              totalDuration={playback.totalDuration}
              currentSceneIndex={playback.currentSceneIndex}
              onSceneSelect={playback.seekToScene}
              onPlayPause={playback.togglePlayPause}
              onSeek={playback.seekToTime}
              onSkipBack={() => {
                const prevIndex = Math.max(0, playback.currentSceneIndex - 1);
                playback.seekToScene(prevIndex);
              }}
              onSkipForward={() => {
                const nextIndex = Math.min(storyboard.scenes.length - 1, playback.currentSceneIndex + 1);
                playback.seekToScene(nextIndex);
              }}
              isPlaying={playback.isPlaying}
              brandName={campaign?.title}
              onDownload={handleDownload}
              onAddToStrategy={handleAddToStrategy}
              overlaySettings={overlaySettings}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        campaignId={id || ""}
        storyboard={storyboard}
        currentSceneIndex={playback.currentSceneIndex}
        onStoryboardUpdate={handleStoryboardUpdate}
        onActionComplete={handleAIActionComplete}
      />

      {/* Scene Editor Dialog */}
      {editingSceneIndex !== null && storyboard.scenes[editingSceneIndex] && (
        <SceneEditor
          scene={storyboard.scenes[editingSceneIndex]}
          isOpen={editingSceneIndex !== null}
          onClose={() => setEditingSceneIndex(null)}
          onSave={handleSceneSave}
          onRegenerateVisual={(customPrompt) => {
            const sceneNumber = storyboard.scenes[editingSceneIndex].sceneNumber;
            generateSceneVisual(sceneNumber, customPrompt);
          }}
          isRegenerating={regeneratingScene === storyboard.scenes[editingSceneIndex]?.sceneNumber}
        />
      )}

      {/* Strategy Config Modal */}
      <StrategyConfigModal
        open={showStrategyConfig}
        onOpenChange={setShowStrategyConfig}
        onBack={() => setShowStrategyConfig(false)}
        onPublish={handlePublishWithStrategy}
        isPublishing={isPublishing}
        campaignPreview={{
          title: campaign?.title,
          description: campaign?.description,
          goal: campaign?.goal,
          audience: typeof campaign?.target_audience === 'string' 
            ? campaign?.target_audience 
            : campaign?.target_audience?.primary || "General Audience",
          duration: storyboard?.scenes?.reduce((acc, s) => {
            const seconds = parseInt(s.duration?.replace('s', '') || '0');
            return acc + seconds;
          }, 0) + "s",
          scenesCount: storyboard?.scenes?.length || 0,
          thumbnailUrl: storyboard?.scenes?.[0]?.visualUrl
        }}
      />
    </div>
  );
};

export default VideoEditor;
