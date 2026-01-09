import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VideoProject, Scene, VideoOverlaySettings, defaultOverlaySettings } from "@/types/videoEditor";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap } from "lucide-react";

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
  const location = useLocation();

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
        // Simulate "System Initialization" delay for cinematic effect
        // Cinematic initialization delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Optimistic Load from Transition State
        // @ts-ignore - location state is untyped but safe here
        const locationState = location.state as any;
        if (locationState?.preloadedScenes) {
          const mappedScenes = locationState.preloadedScenes.map((s: any) => ({
            id: s.id,
            name: s.name || `Scene ${s.number || '?'}`,
            duration: s.duration,
            thumbnail: s.imageUrl || s.thumbnail,
            description: s.description,
            type: "generated",
            url: s.imageUrl || s.url
          }));
          setScenes(mappedScenes);
        }

        if (id === 'demo') {
          setLoading(false);
          return;
        }

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

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [pendingAIAction, setPendingAIAction] = useState<{ action: string; message: string; timestamp: number } | null>(null);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
        {/* Cinematic Loading Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-80" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        <div className="z-10 flex flex-col items-center gap-6 max-w-md w-full px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)]"
          >
            <Zap className="w-10 h-10 text-blue-500 fill-blue-500/20" />
          </motion.div>

          <div className="space-y-2 text-center w-full">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40"
            >
              Initializing Studio
            </motion.h2>

            <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 bottom-0 left-0 bg-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-between text-xs text-white/30 font-mono"
            >
              <span>Asset Loader</span>
              <span>Online</span>
            </motion.div>
          </div>
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


  const handleAIAction = (action: string, context?: any) => {
    const actionMessages: Record<string, string> = {
      improve_banner_text: `Improve this banner text: "${context?.text || ''}"`,
      improve_cta_text: `Make this CTA more compelling: "${context?.text || ''}"`,
      improve_script: `Refine this script for better flow and impact: "${context?.script || ''}"`,
      generate_voiceover: `Generate a professional voiceover for this script: "${context?.script || ''}"`,
      generate_music: `Generate a background music track that matches this project's vibe.`,
    };

    setPendingAIAction({
      action,
      message: actionMessages[action] || action,
      timestamp: Date.now()
    });
    setIsAssistantOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <VideoEditorHeader
          title={project?.title || "Untitled Campaign"}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />

        <div className="flex-1 flex overflow-hidden min-h-0">
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
          <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
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
              currentTime={currentTime}
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

            {/* Assistant Toggle - now positioned relative effectively */}
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

            {/* Timeline - Ensuring it stays at bottom */}
            <div className="mt-auto z-20">
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
    </div>
  );
}
