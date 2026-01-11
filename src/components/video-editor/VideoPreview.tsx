import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Edit3, Film, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import OverlayElements from "./OverlayElements";
import EndScreen from "./EndScreen";
import type { VideoOverlaySettings } from "@/types/videoEditor";

interface VideoPreviewProps {
  scenes: Array<{
    id: number;
    visualUrl?: string;
    videoUrl?: string;
    duration: string;
    voiceover?: string;
  }>;
  currentSceneIndex: number;
  sceneProgress?: number;
  brandName?: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  phoneNumber?: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onEditScene?: (sceneIndex: number) => void;
  currentVoiceover?: string;
  overlaySettings?: VideoOverlaySettings;
  showEndScreen?: boolean;
  currentTime?: number;
}

const VideoPreview = ({
  scenes,
  currentSceneIndex,
  sceneProgress = 0,
  brandName = "Brand",
  headline = "Your Headline",
  description = "Your description here",
  ctaText = "Learn More",
  ctaUrl = "",
  phoneNumber = "",
  isPlaying = false,
  onPlayPause,
  onEditScene,
  currentVoiceover,
  overlaySettings,
  showEndScreen = false,
  currentTime = 0,
}: VideoPreviewProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"standard" | "cinema">("standard");
  const [showVoiceover, setShowVoiceover] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const voiceoverRef = useRef<HTMLAudioElement>(null);
  const currentScene = scenes[currentSceneIndex];

  // Placeholder music tracks
  const musicTracks: Record<number, string> = {
    1: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3", // Upbeat Corporate
    2: "https://cdn.pixabay.com/audio/2021/11/25/audio_1abc4a6568.mp3", // Calm Ambient
    3: "https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a7343e.mp3", // Tech Innovation
    4: "https://cdn.pixabay.com/audio/2022/10/25/audio_3c3c7e0f2f.mp3", // Inspiring Journey
    5: "https://cdn.pixabay.com/audio/2022/05/24/audio_9b9b9b9b9b.mp3", // Minimal Electronic
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Animate scene transitions
  const [displayedImage, setDisplayedImage] = useState(currentScene?.visualUrl);
  const [displayedVideo, setDisplayedVideo] = useState(currentScene?.videoUrl);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (currentScene?.visualUrl !== displayedImage || currentScene?.videoUrl !== displayedVideo) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setDisplayedImage(currentScene?.visualUrl);
        setDisplayedVideo(currentScene?.videoUrl);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [currentScene?.visualUrl, currentScene?.videoUrl, displayedImage, displayedVideo]);

  // Handle Video Playback & Sync
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Playback interrupted or protected:", error);
        });
      }

      // Force sync if drifted too much
      const sceneOffset = currentTime - (scenes.slice(0, currentSceneIndex).reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0));
      if (Math.abs(videoRef.current.currentTime - sceneOffset) > 0.3) {
        videoRef.current.currentTime = sceneOffset;
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, displayedVideo, currentSceneIndex]);

  // Handle Global Time Seek
  useEffect(() => {
    if (videoRef.current && !isPlaying) {
      const sceneOffset = currentTime - (scenes.slice(0, currentSceneIndex).reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0));
      videoRef.current.currentTime = sceneOffset;
    }
  }, [currentTime]);

  // Handle Music Sync
  useEffect(() => {
    if (musicRef.current) {
      if (isPlaying && overlaySettings?.music.selectedTrackId) {
        musicRef.current.play().catch(console.error);
        if (Math.abs(musicRef.current.currentTime - currentTime) > 0.5) {
          musicRef.current.currentTime = currentTime;
        }
      } else {
        musicRef.current.pause();
      }
    }
  }, [isPlaying, currentTime, overlaySettings?.music.selectedTrackId]);

  // Handle Music Volume
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = (overlaySettings?.music.volume || 0) / 100;
      musicRef.current.muted = isMuted || (overlaySettings?.music.isMuted || false);
    }
  }, [overlaySettings?.music.volume, overlaySettings?.music.isMuted, isMuted]);

  // Handle Voiceover Sync (Simplified for now - just plays the scene's voiceover if available)
  // In a real app, we'd have a global voiceover track or per-scene audio files
  useEffect(() => {
    if (voiceoverRef.current) {
      if (isPlaying && currentVoiceover) {
        // This is a placeholder since we don't have actual voiceover audio files yet
        // If we had them, we'd set the src here
      } else {
        voiceoverRef.current.pause();
      }
    }
  }, [isPlaying, currentVoiceover]);

  return (
    <div className={`flex-1 flex flex-col min-h-0 transition-all duration-700 ${viewMode === "cinema" ? "bg-black" : "bg-preview-bg"}`}>
      {/* Video Preview Area */}
      <div className={`flex-1 flex items-center justify-center p-2 md:p-4 lg:p-6 min-h-0 transition-all duration-700 ${viewMode === "cinema" ? "scale-90" : "scale-100"}`}>

        {/* Cinema Background (Simulated Living Room) */}
        {viewMode === "cinema" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-black" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_80%)]" />

            {/* Liquid Ambient TV Light - Reactive to Scene Content */}
            <motion.div
              key={`ambient-${currentSceneIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            >
              {currentScene?.videoUrl ? (
                <video
                  src={currentScene.videoUrl}
                  className="w-full h-full object-cover blur-[120px] scale-150 opacity-40 brightness-150 saturate-200"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : currentScene?.visualUrl ? (
                <img
                  src={currentScene.visualUrl}
                  alt="Ambient Glow"
                  className="w-full h-full object-cover blur-[120px] scale-150 opacity-40 brightness-150 saturate-200"
                />
              ) : (
                <div className="w-full h-full bg-blue-900/10 blur-[150px]" />
              )}
            </motion.div>
          </div>
        )}

        <motion.div
          ref={containerRef}
          layout
          initial={false}
          animate={{
            scale: viewMode === "cinema" ? 1.1 : 1,
            rotateX: viewMode === "cinema" ? 2 : 0,
            y: viewMode === "cinema" ? -20 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "relative w-full max-w-5xl aspect-video rounded-[32px] overflow-hidden shadow-2xl z-10",
            viewMode === "cinema"
              ? "ring-8 ring-zinc-800 shadow-[0_0_100px_rgba(0,0,0,1)]"
              : "bg-black ring-1 ring-white/10"
          )}
          style={{
            perspective: "1000px",
            maxHeight: "calc(100vh - 450px)", // Ensure space for timeline
            width: "auto",
            aspectRatio: "16/9"
          }}
        >
          {/* Background Media with AnimatePresence for Transitions */}
          <div className="absolute inset-0 bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={displayedVideo || displayedImage || currentSceneIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 w-full h-full"
              >
                {displayedVideo ? (
                  <video
                    ref={videoRef}
                    src={displayedVideo}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted={isMuted}
                    loop
                    playsInline
                  />
                ) : displayedImage ? (
                  <img
                    src={displayedImage}
                    alt={`Scene ${currentSceneIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Film className="h-10 w-10 text-neutral-800" />
                      <p className="text-neutral-700 text-sm font-bold uppercase tracking-widest">Awaiting Visual</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Hidden Audio Elements */}
          {overlaySettings?.music.selectedTrackId && (
            <audio
              ref={musicRef}
              src={musicTracks[overlaySettings.music.selectedTrackId]}
              loop
            />
          )}
          <audio ref={voiceoverRef} />

          {/* TOP HUD */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
            <div className="px-4 py-1.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-3 transition-transform hover:scale-105">
              <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Scene {currentSceneIndex + 1} / {scenes.length}</span>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", isPlaying ? "bg-red-500 animate-pulse" : "bg-white/40")} />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">LIVE PREVIEW</span>
              </div>
            </div>
          </div>

          {/* Scene Progress Bar - Slim & High-end */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-30">
            <div
              className="h-full bg-primary transition-all duration-100 ease-linear shadow-[0_0_10px_hsl(var(--primary))]"
              style={{ width: `${sceneProgress * 100}%` }}
            />
          </div>

          {/* Edit Button - Sleek floating */}
          {onEditScene && viewMode === "standard" && (
            <button
              onClick={() => onEditScene(currentSceneIndex)}
              className="absolute top-6 right-6 px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/20"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Scene
            </button>
          )}

          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none">
            {/* Overlay Elements (Banner & QR Code) */}
            {overlaySettings && !showEndScreen && (
              <div className="pointer-events-auto">
                <OverlayElements
                  banner={overlaySettings.banner}
                  qrCode={overlaySettings.qrCode}
                />
              </div>
            )}

            {/* End Screen */}
            {overlaySettings && (
              <div className="pointer-events-auto">
                <EndScreen
                  settings={overlaySettings.endScreen}
                  qrSettings={overlaySettings.qrCode}
                  brandName={brandName}
                  isActive={showEndScreen}
                />
              </div>
            )}

            {/* Center Play Button - Glassmorphism */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/20 shadow-2xl group/play"
                onClick={onPlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10 text-white fill-white" />
                ) : (
                  <Play className="h-10 w-10 text-white fill-white ml-2 transition-transform group-hover/play:scale-110" />
                )}
              </motion.button>
            </div>

            {/* Voiceover Subtitle - Refined typography */}
            {currentVoiceover && (
              <div className="absolute bottom-32 left-1/2 -translate-x-1/2 max-w-2xl px-8 z-30 pointer-events-auto">
                <p className="text-white text-center text-xl font-bold tracking-tight bg-black/80 rounded-2xl px-6 py-3 backdrop-blur-xl border border-white/10 shadow-2xl">
                  {currentVoiceover}
                </p>
              </div>
            )}

            {/* Bottom Content - High contrast headings */}
            <div className="absolute bottom-0 left-0 right-0 p-10 pointer-events-auto">
              <div className="flex items-end justify-between gap-12">
                <div className="space-y-4 flex-1">
                  {/* Headline */}
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                      {headline}
                    </h2>
                    <p className="text-white/70 text-base max-w-xl font-medium leading-relaxed drop-shadow-lg">
                      {description}
                    </p>
                  </div>

                  {/* CTA Button - DESIGN MATCH */}
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest px-8 h-12 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all flex items-center gap-3">
                    {ctaText}
                  </Button>
                </div>

                {/* Vertical Controls */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setViewMode(viewMode === "standard" ? "cinema" : "standard")}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all shadow-xl",
                      viewMode === "cinema"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                    )}
                    title={viewMode === "standard" ? "Switch to Cinema Mode" : "Switch to Standard View"}
                  >
                    <Tv className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/10 transition-all shadow-xl"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/10 transition-all shadow-xl"
                  >
                    {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoPreview;
