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
  return (
    <div className="bg-[#0A0A0A] border-t border-[#1F1F1F] flex flex-col">
      {/* Main Timeline - scrollable */}
      <div className="px-6 py-4 flex-1 overflow-auto bg-[#0A0A0A]">
        {/* Controls Row */}
        <div className="flex items-center gap-6 mb-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-[#8E8E8E] hover:text-white" onClick={onSkipBack}>
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full bg-[#C1FF72] text-black hover:bg-[#D4FF9D] shadow-[0_0_20px_rgba(193,255,114,0.2)]"
              onClick={onPlayPause}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </Button>

            <Button variant="ghost" size="icon" className="h-9 w-9 text-[#8E8E8E] hover:text-white" onClick={onSkipForward}>
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button variant={isLooping ? "secondary" : "ghost"} size="icon" className="h-9 w-9 text-[#8E8E8E] hover:text-white" onClick={() => setIsLooping(!isLooping)}>
              <Repeat className={`h-4 w-4 ${isLooping ? "text-[#C1FF72]" : ""}`} />
            </Button>
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] rounded-lg border border-[#333]">
            <span className="text-white font-mono text-sm min-w-[70px] tabular-nums">{formatTime(currentTime)}</span>
            <span className="text-[#444]">/</span>
            <span className="text-[#8E8E8E] font-mono text-sm min-w-[70px] tabular-nums">{formatTime(totalDuration)}</span>
          </div>

          <div className="flex-1" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#1A1A1A] rounded-lg border border-[#333] p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8E8E8E] hover:text-white" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-white w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8E8E8E] hover:text-white" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline Ruler */}
        <div ref={timelineRef} className="relative h-10 bg-[#0F0F0F] rounded-xl border border-[#1F1F1F] cursor-pointer mb-6 overflow-hidden" onClick={handleTimelineClick}>
          {/* Time markers */}
          <div className="absolute inset-0 flex items-center pt-6 opacity-30">
            {Array.from({
              length: Math.ceil(totalDuration) + 1
            }).map((_, i) => (
              <div key={i} className="absolute h-full flex flex-col items-center" style={{ left: `${i / totalDuration * 100}%` }}>
                <div className={`w-px bg-white ${i % 5 === 0 ? "h-3" : "h-1.5"}`} />
                {i % 5 === 0 && <span className="text-[8px] text-white mt-1 uppercase font-bold tracking-tighter">{i}s</span>}
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div className="absolute top-0 bottom-0 w-[2px] bg-[#C1FF72] z-20 shadow-[0_0_10px_#C1FF72] transition-all duration-100" style={{ left: `${playheadPosition}%` }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#C1FF72] rounded-full border-2 border-[#0A0A0A]" />
          </div>
        </div>

        {/* Scene Thumbnails Track */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2" style={{ transform: `scaleX(${zoom})`, transformOrigin: 'left' }}>
          {scenes.map((scene, index) => {
            const widthPercent = totalDuration > 0 ? (scene.endTime - scene.startTime) / totalDuration * 100 : 0;
            const isActive = currentSceneIndex === index;
            return (
              <div
                key={scene.id}
                onClick={() => onSceneSelect(index)}
                className={`relative h-20 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${isActive
                    ? "border-[#C1FF72] scale-105 z-10 shadow-[0_0_20px_rgba(193,255,114,0.15)]"
                    : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                style={{ minWidth: `${Math.max(120, widthPercent * 12)}px`, width: `${Math.max(120, widthPercent * 12)}px` }}
              >
                {scene.thumbnailUrl ? (
                  <img src={scene.thumbnailUrl} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                    <span className="text-xl font-bold text-[#333]">{index + 1}</span>
                  </div>
                )}

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded-lg text-[10px] text-white font-bold backdrop-blur-sm border border-white/10">
                  {scene.duration}
                </div>
              </div>
            );
          })}
        </div>

        {/* Track Lanes */}
        <div className="space-y-3 mt-8">
          {tracks.map(track => {
            const Icon = track.icon;
            return (
              <div key={track.key} className="flex items-center gap-4 cursor-pointer group" onClick={() => handleTrackClick(track.key)}>
                <div className="flex items-center gap-3 w-32 truncate transition-colors">
                  <div className={`p-1.5 rounded-md ${track.enabled ? "bg-white/5 text-[#C1FF72]" : "bg-white/5 text-[#444]"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${track.enabled ? "text-[#8E8E8E] group-hover:text-white" : "text-[#444]"}`}>
                    {track.label}
                  </span>
                </div>
                <div className={`h-8 flex-1 rounded-xl flex items-center px-4 transition-all relative border ${track.enabled
                    ? `${track.color} border-white/10 shadow-lg shadow-black/20`
                    : "bg-[#0F0F0F] border-white/5 opacity-40 group-hover:opacity-60"
                  }`}>
                  {track.enabled && track.content && (
                    <span className="text-[10px] text-white font-semibold truncate uppercase tracking-tight">{track.content}</span>
                  )}
                  {!track.enabled && (
                    <span className="text-[10px] text-[#444] font-medium uppercase tracking-tight">Disabled</span>
                  )}
                  {track.enabled && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 rounded-l-xl" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Bar - always visible */}
      <div className="px-8 py-5 border-t border-[#1F1F1F] flex items-center justify-between flex-shrink-0 bg-[#0F0F0F]">
        <div className="flex items-center gap-4">
          <div className="w-[42px] h-[42px] rounded-[14px] bg-[#1A1A1A] flex items-center justify-center border border-white/10 ring-4 ring-black/20">
            <span className="text-lg font-black text-white">{brandName.charAt(0)}</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#8E8E8E] uppercase tracking-widest mb-0.5">Brand</p>
            <p className="text-sm font-black text-white">{brandName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onDownload} className="text-[#8E8E8E] hover:text-white gap-2 font-bold px-4">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            size="lg"
            onClick={onAddToStrategy}
            className="bg-[#C1FF72] text-black hover:bg-[#D4FF9D] font-black uppercase tracking-wider px-8 h-12 rounded-2xl shadow-[0_0_30px_rgba(193,255,114,0.1)] hover:shadow-[0_0_40px_rgba(193,255,114,0.2)] transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-3" />
            Go to Strategy
          </Button>
        </div>
      </div>
    </div>
  );
};
export default VideoTimeline;