import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VideoProject, Scene, VideoOverlaySettings, defaultOverlaySettings } from "@/types/videoEditor";

// Components
import VideoEditorSidebar from "@/components/video-editor/VideoEditorSidebar";
import VideoPreview from "@/components/video-editor/VideoPreview";
import VideoTimeline from "@/components/video-editor/VideoTimeline";
import AIAssistantPanel from "@/components/video-editor/AIAssistantPanel";
import SceneEditor from "@/components/video-editor/SceneEditor";
import VideoEditorHeader from "@/components/video-editor/VideoEditorHeader";

export default function VideoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [scenes, setScenes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("slideshow");
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [overlaySettings, setOverlaySettings] = useState<VideoOverlaySettings>(defaultOverlaySettings);
  const [isEditingScene, setIsEditingScene] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);

  // Undo/Redo History
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = (newScenes: any[], newSettings: VideoOverlaySettings) => {
    const newState = { scenes: JSON.parse(JSON.stringify(newScenes)), settings: JSON.parse(JSON.stringify(newSettings)) };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift(); // Limit history size
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setScenes(prevState.scenes);
      setOverlaySettings(prevState.settings);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setScenes(nextState.scenes);
      setOverlaySettings(nextState.settings);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Refs for playback
  const playbackIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load project data
  useEffect(() => {
    async function loadProject() {
      if (!id) return;
      try {
        const { data: campaign, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (campaign) {
          setProject(campaign);
          const storyboard = campaign.storyboard as any;
          if (storyboard?.scenes) {
            setScenes(storyboard.scenes);
          }
          const strategy = campaign.strategy as any;
          if (strategy?.videoSettings) {
            setOverlaySettings(prev => ({ ...prev, ...strategy.videoSettings }));
          }
        }
      } catch (err: any) {
        console.error("Error loading project:", err);
        toast({
          title: "Error loading project",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id, toast]);

  // Debounced Auto-save for Overlay Settings
  useEffect(() => {
    if (!id || loading) return;

    const timer = setTimeout(async () => {
      try {
        const currentStrategy = (project?.strategy as any) || {};
        const updatedStrategy = {
          ...currentStrategy,
          videoSettings: overlaySettings
        };

        const { error } = await supabase
          .from('campaigns')
          .update({
            strategy: updatedStrategy,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
        console.log("Overlay settings auto-saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [overlaySettings, id, loading, project?.strategy]);

  // Playback Logic
  const totalDuration = scenes.reduce((acc, scene) => acc + (parseInt(scene.duration) || 0), 0) + (overlaySettings.endScreen.enabled ? overlaySettings.endScreen.duration : 0);

  useEffect(() => {
    if (isPlaying) {
      const step = 0.1;
      playbackIntervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + step;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    }
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [isPlaying, totalDuration]);

  // Sync currentSceneIndex with currentTime
  useEffect(() => {
    let accumulatedTime = 0;
    let found = false;

    for (let i = 0; i < scenes.length; i++) {
      const sceneDuration = parseInt(scenes[i].duration) || 0;
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + sceneDuration) {
        setCurrentSceneIndex(i);
        setShowEndScreen(false);
        found = true;
        break;
      }
      accumulatedTime += sceneDuration;
    }

    if (!found && overlaySettings.endScreen.enabled && currentTime >= accumulatedTime) {
      setShowEndScreen(true);
    }
  }, [currentTime, scenes, overlaySettings.endScreen.enabled]);

  // Handlers
  const handleSaveScene = async (updatedScene: any) => {
    saveToHistory(scenes, overlaySettings); // Save history BEFORE updating
    const updatedScenes = [...scenes];
    updatedScenes[currentSceneIndex] = updatedScene;
    setScenes(updatedScenes);

    // Save to Supabase
    try {
      const updatedStoryboard = {
        ...project.storyboard,
        scenes: updatedScenes
      };

      const { error } = await supabase
        .from('campaigns')
        .update({
          storyboard: updatedStoryboard,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Scene saved", description: `Scene ${updatedScene.sceneNumber} updated successfully.` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const handleRegenerateVisual = async (customPrompt?: string) => {
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-scene-visual', {
        body: {
          campaignId: id,
          sceneNumber: scenes[currentSceneIndex].sceneNumber,
          customPrompt
        }
      });

      if (error) throw error;

      if (data.visualUrl) {
        saveToHistory(scenes, overlaySettings);
        const updatedScenes = [...scenes];
        updatedScenes[currentSceneIndex] = { ...updatedScenes[currentSceneIndex], visualUrl: data.visualUrl };
        setScenes(updatedScenes);
        toast({ title: "Visual regenerated", description: "The new visual has been applied to this scene." });
      }
    } catch (err: any) {
      toast({ title: "Regeneration failed", description: err.message, variant: "destructive" });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleGenerateVideo = async (model: string, customPrompt?: string) => {
    setIsRegenerating(true);
    try {
      toast({ title: "Generating video clip...", description: "This may take a minute or two. Please wait." });
      const { data, error } = await supabase.functions.invoke('generate-video-scene', {
        body: {
          campaignId: id,
          sceneNumber: scenes[currentSceneIndex].sceneNumber,
          model,
          customPrompt
        }
      });

      if (error) throw error;

      if (data.videoUrl) {
        saveToHistory(scenes, overlaySettings);
        const updatedScenes = [...scenes];
        updatedScenes[currentSceneIndex] = { ...updatedScenes[currentSceneIndex], videoUrl: data.videoUrl };
        setScenes(updatedScenes);
        toast({ title: "Video generated", description: "The cinematic clip has been added to this scene." });
      }
    } catch (err: any) {
      toast({ title: "Video generation failed", description: err.message, variant: "destructive" });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleOverlaySettingsChange = async (newSettings: VideoOverlaySettings) => {
    saveToHistory(scenes, overlaySettings);
    setOverlaySettings(newSettings);
    // Optional: Debounced auto-save to DB strategy
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (isPlaying) setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading video editor...</p>
        </div>
      </div>
    );
  }

  // Map local scenes to TimelineScene format
  const timelineScenes = scenes.map((s, idx) => {
    let startTime = 0;
    for (let i = 0; i < idx; i++) {
      startTime += parseInt(scenes[i].duration) || 0;
    }
    const duration = parseInt(s.duration) || 0;
    return {
      id: idx,
      thumbnailUrl: s.visualUrl,
      duration: s.duration,
      startTime: startTime,
      endTime: startTime + duration
    };
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [pendingAIAction, setPendingAIAction] = useState<{ action: string; message: string; timestamp: number } | null>(null);

  const handleAIAction = (action: string, context?: any) => {
    const actionMessages: Record<string, string> = {
      improve_banner_text: `Improve this banner text: "${context?.text || ''}"`,
      improve_cta_text: `Make this CTA more compelling: "${context?.text || ''}"`,
      improve_script: `Refine this script for better flow and impact: "${context?.script || ''}"`
    };

    setPendingAIAction({
      action,
      message: actionMessages[action] || action,
      timestamp: Date.now()
    });
    setIsAssistantOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <VideoEditorHeader
        title={project?.title || "Untitled Campaign"}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <VideoEditorSidebar
          scenes={scenes.map((s, idx) => ({
            id: idx,
            label: `Scene ${s.sceneNumber}`,
            duration: s.duration,
            thumbnailUrl: s.visualUrl,
            isActive: currentSceneIndex === idx
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSceneSelect={(idx) => {
            let startTime = 0;
            for (let i = 0; i < idx; i++) {
              startTime += parseInt(scenes[i].duration) || 0;
            }
            setCurrentTime(startTime);
            setCurrentSceneIndex(idx);
          }}
          onSceneChange={(idx) => {
            setCurrentSceneIndex(idx);
            setIsEditingScene(true);
          }}
          overlaySettings={overlaySettings}
          onOverlaySettingsChange={handleOverlaySettingsChange}
          isPreviewingEndScreen={showEndScreen}
          onToggleEndScreenPreview={() => {
            if (!showEndScreen) {
              const scenesDuration = scenes.reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0);
              setCurrentTime(scenesDuration);
            } else {
              setCurrentTime(0);
            }
            setShowEndScreen(!showEndScreen);
          }}
          onAIAction={handleAIAction}
        />

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Preview Player */}
          <VideoPreview
            scenes={scenes.map((s, idx) => ({
              id: idx,
              visualUrl: s.visualUrl,
              videoUrl: s.videoUrl,
              duration: s.duration,
              voiceover: s.voiceover
            }))}
            currentSceneIndex={currentSceneIndex}
            sceneProgress={timelineScenes[currentSceneIndex] ? (currentTime - timelineScenes[currentSceneIndex].startTime) / (parseInt(scenes[currentSceneIndex]?.duration) || 1) : 0}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onEditScene={() => setIsEditingScene(true)}
            currentVoiceover={scenes[currentSceneIndex]?.voiceover}
            overlaySettings={overlaySettings}
            showEndScreen={showEndScreen}
            brandName={project?.brand_name || "Brand"}
            headline={scenes[currentSceneIndex]?.visualDescription?.split('.')[0]}
            description={scenes[currentSceneIndex]?.visualDescription}
            ctaText={overlaySettings.endScreen.ctaText}
            ctaUrl={overlaySettings.endScreen.ctaUrl}
          />

          {/* Assistant Toggle */}
          <AIAssistantPanel
            campaignId={id!}
            storyboard={project?.storyboard}
            currentSceneIndex={currentSceneIndex}
            onStoryboardUpdate={(newStoryboard) => {
              saveToHistory(scenes, overlaySettings);
              setProject({ ...project, storyboard: newStoryboard });
              setScenes(newStoryboard.scenes);
            }}
            onActionComplete={(action) => {
              toast({ title: "AI Action Applied", description: `Applied changes for: ${action.replace('_', ' ')}` });
            }}
            isOpen={isAssistantOpen}
            onOpenChange={setIsAssistantOpen}
            externalMessage={pendingAIAction}
          />

          {/* Timeline */}
          <VideoTimeline
            scenes={timelineScenes}
            currentTime={currentTime}
            totalDuration={totalDuration}
            currentSceneIndex={currentSceneIndex}
            onSceneSelect={(idx) => {
              let startTime = 0;
              for (let i = 0; i < idx; i++) {
                startTime += parseInt(scenes[i].duration) || 0;
              }
              setCurrentTime(startTime);
              setCurrentSceneIndex(idx);
            }}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onSeek={handleSeek}
            isPlaying={isPlaying}
            brandName={project?.brand_name || "Brand"}
            onDownload={() => toast({ title: "Rendering...", description: "Your video is being rendered for download." })}
            onAddToStrategy={() => navigate(`/strategy/${id}`)}
            overlaySettings={overlaySettings}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Scene Editor Dialog */}
      {scenes[currentSceneIndex] && (
        <SceneEditor
          scene={scenes[currentSceneIndex]}
          isOpen={isEditingScene}
          onClose={() => setIsEditingScene(false)}
          onSave={handleSaveScene}
          onRegenerateVisual={handleRegenerateVisual}
          onGenerateVideo={handleGenerateVideo}
          isRegenerating={isRegenerating}
        />
      )}
    </div>
  );
}
