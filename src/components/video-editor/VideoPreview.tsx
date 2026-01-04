import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Edit3, Film } from "lucide-react";
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
}: VideoPreviewProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVoiceover, setShowVoiceover] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentScene = scenes[currentSceneIndex];

  // ... (lines 54-76)
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

  // Handle Video Playback
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, displayedVideo]);

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col">
      {/* Video Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12">
        <div ref={containerRef} className="relative w-full max-w-5xl aspect-video rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-black group ring-1 ring-white/10">
          {/* Background Media with Transition */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
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
              <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-black to-[#1A1A1A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Film className="h-10 w-10 text-[#222]" />
                  <p className="text-[#333] text-sm font-bold uppercase tracking-widest">Awaiting Visual</p>
                </div>
              </div>
            )}
          </div>

          {/* TOP HUD */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
            <div className="px-4 py-1.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-3">
              <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Scene {currentSceneIndex + 1} / {scenes.length}</span>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1.5">
                <Film className="h-3 w-3 text-[#C1FF72]" />
                <span className="text-[10px] font-black text-[#C1FF72] uppercase tracking-widest">Video</span>
              </div>
            </div>
          </div>

          {/* Scene Progress Bar - Slim & High-end */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-30">
            <div
              className="h-full bg-[#C1FF72] transition-all duration-100 ease-linear shadow-[0_0_10px_#C1FF72]"
              style={{ width: `${sceneProgress * 100}%` }}
            />
          </div>

          {/* Edit Button - Sleek floating */}
          {onEditScene && (
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
              <button
                className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all border border-white/20 shadow-2xl group/play"
                onClick={onPlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10 text-white fill-white" />
                ) : (
                  <Play className="h-10 w-10 text-white fill-white ml-2 transition-transform group-hover/play:scale-110" />
                )}
              </button>
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
                  <Button className="bg-[#C1FF72] hover:bg-[#D4FF9D] text-black font-black uppercase tracking-widest px-8 h-12 rounded-2xl shadow-[0_20px_40px_rgba(193,255,114,0.15)] transition-all flex items-center gap-3">
                    {ctaText}
                  </Button>
                </div>

                {/* Vertical Controls */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/10 transition-all"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/10 transition-all"
                  >
                    {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
