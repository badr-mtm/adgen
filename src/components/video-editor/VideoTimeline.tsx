import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, Plus, SkipBack, SkipForward, Repeat, ZoomIn, ZoomOut, PanelBottom, QrCode, Music, Mic } from "lucide-react";
import { motion } from "framer-motion";
import type { VideoOverlaySettings } from "@/types/videoEditor";
interface TimelineScene {
  id: number;
  thumbnailUrl?: string;
  duration: string;
  startTime: number;
  endTime: number;
}
interface TimelineTrack {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
  content?: string;
}
interface VideoTimelineProps {
  scenes: TimelineScene[];
  currentTime: number;
  totalDuration: number;
  currentSceneIndex: number;
  onSceneSelect: (index: number) => void;
  onPlayPause: () => void;
  onSeek?: (time: number) => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  isPlaying: boolean;
  brandName?: string;
  brandUrl?: string;
  onDownload: () => void;
  onAddToStrategy: () => void;
  overlaySettings?: VideoOverlaySettings;
  onTabChange?: (tab: string) => void;
}
const VideoTimeline = ({
  scenes,
  currentTime,
  totalDuration,
  currentSceneIndex,
  onSceneSelect,
  onPlayPause,
  onSeek,
  onSkipBack,
  onSkipForward,
  isPlaying,
  brandName = "Brand",
  brandUrl = "",
  onDownload,
  onAddToStrategy,
  overlaySettings,
  onTabChange
}: VideoTimelineProps) => {
  const [isLooping, setIsLooping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Map track keys to sidebar tab values
  const trackToTabMap: Record<string, string> = {
    bottomBanner: "banner",
    qrCode: "qr-code",
    music: "music",
    voiceScript: "voice-script"
  };

  // Build dynamic tracks based on overlay settings
  const tracks: TimelineTrack[] = useMemo(() => [{
    key: "bottomBanner",
    label: "Bottom Banner",
    icon: PanelBottom,
    color: "bg-pink-500/80",
    enabled: overlaySettings?.banner.enabled ?? false,
    content: overlaySettings?.banner.text || undefined
  }, {
    key: "qrCode",
    label: "QR Code",
    icon: QrCode,
    color: "bg-purple-500/80",
    enabled: overlaySettings?.qrCode.enabled ?? false,
    content: overlaySettings?.qrCode.url || undefined
  }, {
    key: "music",
    label: "Music",
    icon: Music,
    color: "bg-emerald-500/80",
    enabled: overlaySettings?.music.selectedTrackId !== null,
    content: overlaySettings?.music.selectedTrackId ? `Track ${overlaySettings.music.selectedTrackId}` : undefined
  }, {
    key: "voiceScript",
    label: "Voice & Script",
    icon: Mic,
    color: "bg-blue-500/80",
    enabled: !!overlaySettings?.voice.script,
    content: overlaySettings?.voice.selectedVoice || undefined
  }], [overlaySettings]);
  const handleTrackClick = (trackKey: string) => {
    if (onTabChange && trackToTabMap[trackKey]) {
      onTabChange(trackToTabMap[trackKey]);
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor(seconds % 1 * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
  };

  // Calculate playhead position
  const playheadPosition = totalDuration > 0 ? currentTime / totalDuration * 100 : 0;

  // Handle timeline click for seeking
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * totalDuration;
    onSeek(Math.max(0, Math.min(newTime, totalDuration)));
  };
  return <div className="bg-background border-t border-border flex flex-col transition-colors duration-300">
      {/* Main Timeline - scrollable */}
      <div className="px-3 py-1.5 flex-1 overflow-auto bg-background transition-colors duration-300">
        {/* Controls Row */}
        <div className="flex items-center gap-3 mb-1.5">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onSkipBack}>
              <SkipBack className="h-4 w-4" />
            </Button>

            <motion.div whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.95
          }}>
              <Button variant="default" size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_hsl(var(--primary)/0.2)]" onClick={onPlayPause}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
            </motion.div>

            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onSkipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button variant={isLooping ? "secondary" : "ghost"} size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsLooping(!isLooping)}>
              <Repeat className={`h-3.5 w-3.5 ${isLooping ? "text-primary" : ""}`} />
            </Button>
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/5 rounded-lg border border-border">
            <span className="text-foreground font-mono text-xs min-w-[60px] tabular-nums">{formatTime(currentTime)}</span>
            <span className="text-muted-foreground/30 text-xs">/</span>
            <span className="text-muted-foreground font-mono text-xs min-w-[60px] tabular-nums">{formatTime(totalDuration)}</span>
          </div>

          <div className="flex-1" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-accent/5 rounded-lg border border-border p-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] text-foreground w-10 text-center font-medium">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Timeline Ruler */}
        <div ref={timelineRef} className="relative h-5 bg-card rounded-md border border-border cursor-pointer mb-1.5 overflow-hidden transition-colors duration-300" onClick={handleTimelineClick}>
          {/* Time markers */}
          <div className="absolute inset-0 flex items-center pt-6 opacity-20">
            {Array.from({
            length: Math.ceil(totalDuration) + 1
          }).map((_, i) => <div key={i} className="absolute h-full flex flex-col items-center" style={{
            left: `${i / totalDuration * 100}%`
          }}>
                <div className={`w-px bg-foreground ${i % 5 === 0 ? "h-3" : "h-1.5"}`} />
                {i % 5 === 0 && <span className="text-[8px] text-foreground mt-1 uppercase font-bold tracking-tighter">{i}s</span>}
              </div>)}
          </div>

          {/* Playhead */}
          <div className="absolute top-0 bottom-0 w-[2px] bg-primary z-20 shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-100" style={{
          left: `${playheadPosition}%`
        }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-primary rounded-full border-2 border-background" />
          </div>
        </div>

        {/* Scene Thumbnails Track */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-0.5" style={{
        transform: `scaleX(${zoom})`,
        transformOrigin: 'left'
      }}>
          {scenes.map((scene, index) => {
          const widthPercent = totalDuration > 0 ? (scene.endTime - scene.startTime) / totalDuration * 100 : 0;
          const isActive = currentSceneIndex === index;
          return <div key={scene.id} onClick={() => onSceneSelect(index)} className={`relative h-10 flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all border-2 ${isActive ? "border-primary scale-102 z-10 shadow-[0_0_15px_hsl(var(--primary)/0.15)]" : "border-transparent opacity-60 hover:opacity-100"}`} style={{
            minWidth: `${Math.max(80, widthPercent * 8)}px`,
            width: `${Math.max(80, widthPercent * 8)}px`
          }}>
                {scene.thumbnailUrl ? <img src={scene.thumbnailUrl} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground/50">{index + 1}</span>
                  </div>}

                {/* Duration Badge */}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-white font-bold backdrop-blur-sm border border-white/10 uppercase">
                  {scene.duration}
                </div>
              </div>;
        })}
        </div>

        {/* Track Lanes */}
        <div className="space-y-1 mt-1.5">
          {tracks.map(track => {
          const Icon = track.icon;
          return;
        })}
        </div>
      </div>

      {/* Footer Bar - always visible */}
      <div className="px-3 py-1.5 border-t border-border flex items-center justify-between flex-shrink-0 bg-card transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-background flex items-center justify-center border border-border ring-1 ring-accent/5">
            <span className="text-xs font-black text-foreground">{brandName.charAt(0)}</span>
          </div>
          <div>
            <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Brand</p>
            <p className="text-[10px] font-black text-foreground leading-tight">{brandName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <Button variant="ghost" size="sm" onClick={onDownload} className="text-muted-foreground hover:text-foreground gap-1.5 font-bold px-2 h-7 text-[10px]">
              <Download className="h-3 w-3" />
              Download
            </Button>
          </motion.div>
          <motion.div whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <Button size="sm" onClick={onAddToStrategy} className="bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-wider px-4 h-8 rounded-lg shadow-[0_0_20px_hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] transition-all duration-300 text-[10px]">
              <Plus className="h-3 w-3 mr-1.5" />
              Go to Strategy
            </Button>
          </motion.div>
        </div>
      </div>
    </div>;
};
export default VideoTimeline;