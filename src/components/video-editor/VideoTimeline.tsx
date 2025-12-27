import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, Plus, SkipBack, SkipForward, Repeat, ZoomIn, ZoomOut, PanelBottom, QrCode, Music, Mic } from "lucide-react";
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
  return <div className="bg-card border-t border-border flex flex-col">
      {/* Main Timeline - scrollable */}
      <div className="px-4 py-3 flex-1 overflow-auto">
        {/* Controls Row */}
        <div className="flex items-center gap-3 mb-2">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSkipBack}>
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button variant="default" size="icon" className="h-10 w-10 rounded-full" onClick={onPlayPause}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSkipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button variant={isLooping ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setIsLooping(!isLooping)}>
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-1 text-sm font-mono">
            <span className="text-foreground min-w-[70px]">{formatTime(currentTime)}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground min-w-[70px]">{formatTime(totalDuration)}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Timeline Ruler */}
        <div ref={timelineRef} className="relative h-6 bg-muted/30 rounded cursor-pointer mb-2" onClick={handleTimelineClick}>
          {/* Time markers */}
          <div className="absolute inset-0 flex items-end">
            {Array.from({
            length: Math.ceil(totalDuration) + 1
          }).map((_, i) => <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{
            left: `${i / totalDuration * 100}%`
          }}>
                <div className="h-2 w-px bg-border" />
                {i % 5 === 0 && <span className="text-[8px] text-muted-foreground -translate-x-1/2">{i}s</span>}
              </div>)}
          </div>

          {/* Playhead */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 transition-all duration-100" style={{
          left: `${playheadPosition}%`
        }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </div>

        {/* Scene Thumbnails Track */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1" style={{
        transform: `scaleX(${zoom})`,
        transformOrigin: 'left'
      }}>
          {scenes.map((scene, index) => {
          const widthPercent = totalDuration > 0 ? (scene.endTime - scene.startTime) / totalDuration * 100 : 0;
          return <div key={scene.id} onClick={() => onSceneSelect(index)} className={`relative h-12 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all ${currentSceneIndex === index ? "ring-2 ring-primary ring-offset-1 ring-offset-card scale-105" : "opacity-80 hover:opacity-100 hover:scale-102"}`} style={{
            minWidth: `${Math.max(80, widthPercent * 8)}px`,
            width: `${Math.max(80, widthPercent * 8)}px`
          }}>
                {scene.thumbnailUrl ? <img src={scene.thumbnailUrl} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                  </div>}
                
                {/* Duration Badge */}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white">
                  {scene.duration}
                </div>
                
                {/* Current indicator */}
                {currentSceneIndex === index && <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" />}
              </div>;
        })}
        </div>

        {/* Track Lanes */}
        <div className="space-y-1 mt-2">
        {tracks.map(track => {
          const Icon = track.icon;
          return <div key={track.key} className="flex items-center gap-2 cursor-pointer group" onClick={() => handleTrackClick(track.key)}>
                <div className="flex items-center gap-1.5 w-24 truncate group-hover:text-foreground transition-colors">
                  <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
                  <span className="text-[10px] text-muted-foreground truncate uppercase group-hover:text-foreground transition-colors">{track.label}</span>
                </div>
                <div className={`h-5 flex-1 rounded flex items-center px-2 transition-all ${track.enabled ? `${track.color} opacity-80 hover:opacity-100` : "bg-muted/30 opacity-50 hover:opacity-70"}`}>
                  {track.enabled && track.content && <span className="text-[9px] text-white truncate">{track.content}</span>}
                  {!track.enabled && <span className="text-[9px] text-muted-foreground italic">Disabled</span>}
                </div>
              </div>;
        })}
        </div>
      </div>

      {/* Footer Bar - always visible */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-shrink-0 bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{brandName.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{brandName}</p>
            {brandUrl && <p className="text-xs text-muted-foreground">{brandUrl}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            size="sm" 
            onClick={onAddToStrategy}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Go to Strategy
          </Button>
        </div>
      </div>
    </div>;
};
export default VideoTimeline;