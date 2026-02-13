import { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, X, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import OverlayElements from "@/components/video-editor/OverlayElements";
import EndScreen from "@/components/video-editor/EndScreen";
import type { VideoOverlaySettings } from "@/types/videoEditor";

interface VideoPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null;
  thumbnailUrl?: string | null;
  title?: string;
  onEditClick?: () => void;
  overlaySettings?: VideoOverlaySettings;
  brandName?: string;
  brandLogo?: string;
}

const VideoPreviewModal = ({
  open,
  onOpenChange,
  videoUrl,
  thumbnailUrl,
  title = "Video Preview",
  onEditClick,
  overlaySettings,
  brandName = "Brand",
  brandLogo,
}: VideoPreviewModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showEndScreen, setShowEndScreen] = useState(false);

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    if (!open) {
      setIsPlaying(false);
      setProgress(0);
      setShowEndScreen(false);
    }
  }, [open]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (overlaySettings?.endScreen?.enabled) {
      setShowEndScreen(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!videoUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-0 bg-black border-border/20 overflow-hidden">
        <div ref={containerRef} className="relative w-full aspect-video bg-black group">
          {/* Video Element - object-cover to fill frame */}
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl || undefined}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            onClick={togglePlay}
            loop={!overlaySettings?.endScreen?.enabled}
          />

          {/* Overlay Elements (QR, Banner, Title) */}
          {overlaySettings && !showEndScreen && (
            <div className="absolute inset-0 z-[15] pointer-events-none">
              <OverlayElements
                banner={overlaySettings.banner}
                qrCode={overlaySettings.qrCode}
                title={overlaySettings.title}
              />
            </div>
          )}

          {/* End Screen */}
          {overlaySettings && (
            <EndScreen
              settings={overlaySettings.endScreen}
              qrSettings={overlaySettings.qrCode}
              brandName={brandName}
              brandLogo={brandLogo}
              isActive={showEndScreen}
            />
          )}

          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg truncate">{title}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={togglePlay}
                className={cn(
                  "w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center transition-all pointer-events-auto hover:scale-110 shadow-2xl",
                  isPlaying && "opacity-0"
                )}
              >
                <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
              {/* Progress Bar */}
              <div
                className="h-1.5 bg-white/20 rounded-full cursor-pointer group/progress"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-primary rounded-full relative transition-all"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-9 w-9" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-9 w-9" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <span className="text-white/70 text-sm font-medium">
                    {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onEditClick && (
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 gap-2" onClick={() => { onOpenChange(false); onEditClick(); }}>
                      <Edit3 className="h-4 w-4" /> Edit Video
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-9 w-9" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPreviewModal;
