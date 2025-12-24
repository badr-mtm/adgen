import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Edit3 } from "lucide-react";
import OverlayElements from "./OverlayElements";
import EndScreen from "./EndScreen";
import type { VideoOverlaySettings } from "@/types/videoEditor";

interface VideoPreviewProps {
  scenes: Array<{
    id: number;
    visualUrl?: string;
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
  const currentScene = scenes[currentSceneIndex];

  // Handle fullscreen toggle
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

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Animate scene transitions
  const [displayedImage, setDisplayedImage] = useState(currentScene?.visualUrl);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (currentScene?.visualUrl !== displayedImage) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setDisplayedImage(currentScene?.visualUrl);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [currentScene?.visualUrl, displayedImage]);

  return (
    <div className="flex-1 bg-background/50 flex flex-col">
      {/* Video Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div ref={containerRef} className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-muted group">
          {/* Background Image with Transition */}
          <div 
            className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          >
            {displayedImage ? (
              <img
                src={displayedImage}
                alt={`Scene ${currentSceneIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-secondary/20 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No visual generated</p>
              </div>
            )}
          </div>

          {/* Scene Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${sceneProgress * 100}%` }}
            />
          </div>

          {/* Edit Button - Shows on Hover */}
          {onEditScene && (
            <button
              onClick={() => onEditScene(currentSceneIndex)}
              className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white text-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit3 className="h-3 w-3" />
              Edit Scene
            </button>
          )}

          {/* Scene Counter */}
          <div className="absolute top-4 right-28 px-2 py-1 bg-black/60 rounded text-white text-xs">
            Scene {currentSceneIndex + 1} / {scenes.length}
          </div>

          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30">
            {/* Top Left - Brand */}
            <div className="absolute top-4 left-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-primary font-bold text-sm shadow">
                {brandName.charAt(0)}
              </div>
              <span className="text-white font-medium text-sm drop-shadow">{brandName}</span>
            </div>

          {/* Overlay Elements (Banner & QR Code) */}
          {overlaySettings && !showEndScreen && (
            <OverlayElements 
              banner={overlaySettings.banner} 
              qrCode={overlaySettings.qrCode} 
            />
          )}

          {/* End Screen */}
          {overlaySettings && (
            <EndScreen
              settings={overlaySettings.endScreen}
              qrSettings={overlaySettings.qrCode}
              brandName={brandName}
              isActive={showEndScreen}
            />
          )}

            {/* Center Play Button */}
            <button 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all border border-white/20"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <Pause className="h-10 w-10 text-white" fill="white" />
              ) : (
                <Play className="h-10 w-10 text-white ml-1" fill="white" />
              )}
            </button>

            {/* Voiceover Subtitle */}
            {showVoiceover && currentVoiceover && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-2xl px-4">
                <p className="text-white text-center text-lg font-medium drop-shadow-lg bg-black/40 rounded-lg px-4 py-2 backdrop-blur-sm">
                  {currentVoiceover}
                </p>
              </div>
            )}

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end justify-between">
                <div className="space-y-2 flex-1">
                  {/* Headline */}
                  <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wide drop-shadow-lg">
                    {headline}
                  </h2>
                  <p className="text-white/90 text-sm max-w-lg drop-shadow">
                    {description}
                  </p>

                  {/* CTA Button */}
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
                    {ctaText}
                  </Button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <button 
                    onClick={toggleFullscreen}
                    className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
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
