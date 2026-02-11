import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Film, PanelBottom, Square, QrCode, Music, Mic, Settings2, Upload, Sparkles,
  MoreVertical, Edit3, Plus, Play, Pause, Volume2, VolumeX, Link, Palette,
  AlignLeft, AlignCenter, AlignRight, HelpCircle, BarChart2, Zap, Layout,
  Activity, UserCheck, Heart, ChevronUp, ChevronDown, Trash2
} from "lucide-react";
import { PerformanceInsights } from "./PerformanceInsights";
import type { VideoOverlaySettings, BannerSettings, EndScreenSettings, QRCodeSettings, MusicSettings, VoiceSettings } from "@/types/videoEditor";

interface SceneSlide {
  id: number;
  thumbnailUrl?: string;
  duration: string;
  label: string;
  isActive?: boolean;
}

interface VideoEditorSidebarProps {
  scenes: SceneSlide[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSceneSelect: (index: number) => void;
  onSceneChange: (index: number) => void;
  overlaySettings: VideoOverlaySettings;
  onOverlaySettingsChange: (settings: VideoOverlaySettings) => void;
  isPreviewingEndScreen?: boolean;
  onToggleEndScreenPreview?: () => void;
  onAIAction?: (action: string, context?: any) => void;
  onReorderScene?: (fromIndex: number, toIndex: number) => void;
  onDeleteScene?: (index: number) => void;
  onAddScene?: () => void;
}

const sidebarTabs = [
  { id: "slideshow", label: "Slideshow", icon: Film },
  { id: "growth", label: "Growth", icon: Activity },
  { id: "bottom-banner", label: "Bottom banner", icon: PanelBottom },
  { id: "end-screen", label: "End screen", icon: Square },
  { id: "qr-code", label: "QR code", icon: QrCode },
  { id: "music", label: "Music", icon: Music },
  { id: "voice-script", label: "Voice & Script", icon: Mic },
  { id: "ai-settings", label: "AI Input Settings", icon: Settings2 },
  { id: "settings", label: "General Settings", icon: Palette },
];

const musicLibrary = [
  { id: 1, name: "Upbeat Corporate", duration: "2:30", mood: "energetic" },
  { id: 2, name: "Calm Ambient", duration: "3:15", mood: "relaxed" },
  { id: 3, name: "Tech Innovation", duration: "2:45", mood: "modern" },
  { id: 4, name: "Inspiring Journey", duration: "3:00", mood: "motivational" },
  { id: 5, name: "Minimal Electronic", duration: "2:20", mood: "subtle" },
];

const VideoEditorSidebar = ({
  scenes, activeTab, onTabChange, onSceneSelect, onSceneChange,
  overlaySettings, onOverlaySettingsChange,
  isPreviewingEndScreen = false, onToggleEndScreenPreview, onAIAction,
  onReorderScene, onDeleteScene, onAddScene,
}: VideoEditorSidebarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const updateBanner = (updates: Partial<BannerSettings>) => {
    onOverlaySettingsChange({ ...overlaySettings, banner: { ...overlaySettings.banner, ...updates } });
  };
  const updateEndScreen = (updates: Partial<EndScreenSettings>) => {
    onOverlaySettingsChange({ ...overlaySettings, endScreen: { ...overlaySettings.endScreen, ...updates } });
  };
  const updateQRCode = (updates: Partial<QRCodeSettings>) => {
    onOverlaySettingsChange({ ...overlaySettings, qrCode: { ...overlaySettings.qrCode, ...updates } });
  };
  const updateMusic = (updates: Partial<MusicSettings>) => {
    onOverlaySettingsChange({ ...overlaySettings, music: { ...overlaySettings.music, ...updates } });
  };
  const updateVoice = (updates: Partial<VoiceSettings>) => {
    onOverlaySettingsChange({ ...overlaySettings, voice: { ...overlaySettings.voice, ...updates } });
  };

  return (
    <div className="flex h-full min-h-0 bg-card/50 backdrop-blur-xl border-r border-border transition-colors duration-300">
      {/* Icon Tabs */}
      <div className="w-[60px] bg-muted/50 border-r border-border flex flex-col items-center py-4 gap-1 transition-colors duration-300">
        {sidebarTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(tab.id)}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group
                ${isActive
                  ? "bg-primary/10 text-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)] border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
            >
              <Icon className={`w-4 h-4 transition-transform ${isActive ? "scale-110" : ""}`} />
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 rounded-xl bg-primary/5 blur-[8px] -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="absolute left-[calc(100%+12px)] px-2 py-1 bg-popover text-popover-foreground text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-border uppercase tracking-widest backdrop-blur-md">
                {tab.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Content Panel */}
      <div className="w-[300px] bg-transparent flex flex-col transition-colors duration-300">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            {sidebarTabs.find(t => t.id === activeTab)?.label}
          </h2>
          {activeTab === 'slideshow' && <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">{scenes.length} SCENES</Badge>}
        </div>

        <ScrollArea className="flex-1">
          {/* Slideshow Tab */}
          {activeTab === "slideshow" && (
            <div className="p-3 space-y-2">
              {scenes.map((scene, index) => (
                <div
                  key={`${scene.id}-${index}`}
                  className={`group relative flex flex-col gap-1 p-2 rounded-lg transition-all border ${scene.isActive
                    ? "bg-primary/5 border-primary/30 shadow-lg"
                    : "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border"
                    }`}
                  onClick={() => onSceneSelect(index)}
                >
                  <div className="flex gap-3">
                    <div className="relative w-24 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0 shadow-inner border border-border">
                      {scene.thumbnailUrl ? (
                        <img src={scene.thumbnailUrl} alt={scene.label} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                      <button
                        className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]"
                        onClick={(e) => { e.stopPropagation(); onSceneChange(index); }}
                      >
                        <div className="bg-primary/10 p-1.5 rounded-full border border-primary/20 hover:scale-110 transition-transform">
                          <Edit3 className="h-3.5 w-3.5 text-primary" />
                        </div>
                      </button>
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-background/80 text-[8px] text-foreground font-mono border border-border backdrop-blur-sm">
                        {scene.duration}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-xs font-semibold truncate ${scene.isActive ? 'text-primary' : 'text-foreground'}`}>{scene.label}</p>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
                            onClick={(e) => { e.stopPropagation(); onReorderScene?.(index, index - 1); }} disabled={index === 0}>
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
                            onClick={(e) => { e.stopPropagation(); onReorderScene?.(index, index + 1); }} disabled={index === scenes.length - 1}>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive/50 hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); onDeleteScene?.(index); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {scene.isActive && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[9px] text-primary font-medium uppercase tracking-wider">Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm"
                className="w-full mt-4 h-10 rounded-xl border-dashed border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                onClick={onAddScene}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Scene
              </Button>

              {/* AI Hook Library */}
              <div className="pt-6 border-t border-border mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">AI Hook Library</Label>
                  </div>
                  <Badge variant="secondary" className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20 uppercase font-bold px-1.5">Premium</Badge>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'question', label: 'The Big Question', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'Engage with relatable pain point' },
                    { id: 'stat', label: 'Shocking Stat', icon: BarChart2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Use data for authority' },
                    { id: 'surprise', label: 'Visual Surprise', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Unexpected statement' },
                    { id: 'problem-solution', label: 'Problem/Solution', icon: Layout, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', desc: 'Present brand as solution' }
                  ].map((hook) => (
                    <button key={hook.id}
                      onClick={() => onAIAction?.("apply_hook", { hookId: hook.id, label: hook.label })}
                      className="group flex items-start gap-3 p-2.5 rounded-xl border border-border bg-muted/30 hover:bg-accent hover:border-primary/20 transition-all text-left"
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg border ${hook.bg} ${hook.border} ${hook.color}`}>
                        <hook.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-foreground group-hover:text-foreground transition-colors">{hook.label}</p>
                        <p className="text-[9px] text-muted-foreground line-clamp-1 group-hover:text-muted-foreground">{hook.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Growth Tab */}
          {activeTab === "growth" && <PerformanceInsights />}

          {/* Bottom Banner Tab */}
          {activeTab === "bottom-banner" && (
            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <Label htmlFor="banner-enabled" className="text-sm font-medium text-foreground">Enable Banner</Label>
                <Switch id="banner-enabled" checked={overlaySettings.banner.enabled} onCheckedChange={(checked) => updateBanner({ enabled: checked })} />
              </div>

              {overlaySettings.banner.enabled && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Banner Text</Label>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-purple-500 hover:text-purple-400 hover:bg-purple-500/10"
                        onClick={() => onAIAction?.("improve_banner_text", { text: overlaySettings.banner.text })}>
                        <Sparkles className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea value={overlaySettings.banner.text} onChange={(e) => updateBanner({ text: e.target.value })}
                      placeholder="Enter banner text..." className="bg-muted/30 border-border text-foreground focus:border-primary/50 resize-none" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Position</Label>
                    <RadioGroup value={overlaySettings.banner.position} onValueChange={(val) => updateBanner({ position: val as "top" | "bottom" })} className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2 border border-border rounded-md p-2 hover:bg-accent cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary/30">
                        <RadioGroupItem value="top" id="pos-top" className="text-primary border-border" />
                        <Label htmlFor="pos-top" className="text-xs cursor-pointer text-foreground">Top</Label>
                      </div>
                      <div className="flex items-center space-x-2 border border-border rounded-md p-2 hover:bg-accent cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary/30">
                        <RadioGroupItem value="bottom" id="pos-bottom" className="text-primary border-border" />
                        <Label htmlFor="pos-bottom" className="text-xs cursor-pointer text-foreground">Bottom</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Alignment</Label>
                    <div className="flex gap-2 p-1 bg-muted/30 rounded-lg border border-border">
                      {['left', 'center', 'right'].map((align) => (
                        <Button key={align} variant="ghost" size="sm"
                          className={`flex-1 h-7 ${overlaySettings.banner.alignment === align ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                          onClick={() => updateBanner({ alignment: align as any })}>
                          {align === 'left' && <AlignLeft className="h-3.5 w-3.5" />}
                          {align === 'center' && <AlignCenter className="h-3.5 w-3.5" />}
                          {align === 'right' && <AlignRight className="h-3.5 w-3.5" />}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Background Color</Label>
                    <div className="flex gap-2">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border border-border shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <Input type="color" value={overlaySettings.banner.backgroundColor}
                          onChange={(e) => updateBanner({ backgroundColor: e.target.value })}
                          className="absolute -top-2 -left-2 w-[150%] h-[150%] p-0 border-0 cursor-pointer" />
                      </div>
                      <Input value={overlaySettings.banner.backgroundColor}
                        onChange={(e) => updateBanner({ backgroundColor: e.target.value })}
                        className="flex-1 bg-muted/30 border-border text-foreground font-mono text-xs uppercase" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* End Screen Tab */}
          {activeTab === "end-screen" && (
            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <Label htmlFor="endscreen-enabled" className="text-sm font-medium text-foreground">Enable End Screen</Label>
                <Switch id="endscreen-enabled" checked={overlaySettings.endScreen.enabled} onCheckedChange={(checked) => updateEndScreen({ enabled: checked })} />
              </div>

              {overlaySettings.endScreen.enabled && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Duration</Label>
                    <div className="flex items-center gap-3">
                      <Slider value={[overlaySettings.endScreen.duration]} onValueChange={([val]) => updateEndScreen({ duration: val })} min={3} max={10} step={1} className="flex-1" />
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">{overlaySettings.endScreen.duration}s</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">CTA Button Text</Label>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-purple-500 hover:text-purple-400 hover:bg-purple-500/10"
                        onClick={() => onAIAction?.("improve_cta_text", { text: overlaySettings.endScreen.ctaText })}>
                        <Sparkles className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input value={overlaySettings.endScreen.ctaText} onChange={(e) => updateEndScreen({ ctaText: e.target.value })}
                      placeholder="e.g., Learn More, Shop Now" className="bg-muted/30 border-border text-foreground focus:border-primary/50" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">CTA Link URL</Label>
                    <div className="flex gap-2 relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input value={overlaySettings.endScreen.ctaUrl} onChange={(e) => updateEndScreen({ ctaUrl: e.target.value })}
                        placeholder="https://..." className="pl-9 bg-muted/30 border-border text-foreground focus:border-primary/50" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-logo" className="text-sm text-foreground">Show Logo</Label>
                    <Switch id="show-logo" checked={overlaySettings.endScreen.showLogo} onCheckedChange={(checked) => updateEndScreen({ showLogo: checked })} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Background Color</Label>
                    <div className="flex gap-2">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border border-border shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <Input type="color" value={overlaySettings.endScreen.backgroundColor}
                          onChange={(e) => updateEndScreen({ backgroundColor: e.target.value })}
                          className="absolute -top-2 -left-2 w-[150%] h-[150%] p-0 border-0 cursor-pointer" />
                      </div>
                      <Input value={overlaySettings.endScreen.backgroundColor}
                        onChange={(e) => updateEndScreen({ backgroundColor: e.target.value })}
                        className="flex-1 bg-muted/30 border-border text-foreground font-mono text-xs uppercase" />
                    </div>
                  </div>

                  <Button
                    variant={isPreviewingEndScreen ? "secondary" : "outline"}
                    className="w-full"
                    onClick={onToggleEndScreenPreview}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    {isPreviewingEndScreen ? "Hide End Screen" : "Preview End Screen"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === "qr-code" && (
            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <Label htmlFor="qr-enabled" className="text-sm font-medium text-foreground">Enable QR Code</Label>
                <Switch id="qr-enabled" checked={overlaySettings.qrCode.enabled} onCheckedChange={(checked) => updateQRCode({ enabled: checked })} />
              </div>

              {overlaySettings.qrCode.enabled && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Destination URL</Label>
                    <Input value={overlaySettings.qrCode.url} onChange={(e) => updateQRCode({ url: e.target.value })}
                      placeholder="https://your-website.com" className="bg-muted/30 border-border text-foreground focus:border-primary/50" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Position</Label>
                    <RadioGroup value={overlaySettings.qrCode.position} onValueChange={(val) => updateQRCode({ position: val as QRCodeSettings["position"] })}>
                      <div className="grid grid-cols-2 gap-2">
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                          <div key={pos} className="flex items-center space-x-2 border border-border rounded-md p-2 hover:bg-accent cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary/30">
                            <RadioGroupItem value={pos} id={`qr-${pos}`} className="text-primary border-border" />
                            <Label htmlFor={`qr-${pos}`} className="text-[10px] cursor-pointer text-foreground uppercase">{pos.replace('-', ' ')}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Size</Label>
                    <div className="flex items-center gap-3">
                      <Slider value={[overlaySettings.qrCode.size]} onValueChange={([val]) => updateQRCode({ size: val })} min={50} max={200} step={10} className="flex-1" />
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">{overlaySettings.qrCode.size}px</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 border border-border rounded-lg flex items-center justify-center">
                    <div className="bg-background rounded flex items-center justify-center shadow-lg border border-border"
                      style={{ width: overlaySettings.qrCode.size / 2, height: overlaySettings.qrCode.size / 2 }}>
                      <QrCode className="w-full h-full p-2 text-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Music Tab */}
          {activeTab === "music" && (
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button variant="outline" className="flex-1 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300"
                  onClick={() => onAIAction?.("generate_music", { currentSettings: overlaySettings.music })}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Music Library</Label>
                <div className="space-y-2">
                  {musicLibrary.map((track) => (
                    <div key={track.id} onClick={() => updateMusic({ selectedTrackId: track.id })}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${overlaySettings.music.selectedTrackId === track.id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/30 border-transparent hover:bg-accent hover:border-border"
                        }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button variant="ghost" size="icon"
                            className={`h-8 w-8 rounded-full ${overlaySettings.music.selectedTrackId === track.id ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-foreground hover:bg-accent"}`}
                            onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}>
                            {isPlaying && overlaySettings.music.selectedTrackId === track.id ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                          </Button>
                          <div>
                            <p className="text-sm font-medium text-foreground">{track.name}</p>
                            <p className="text-xs text-muted-foreground">{track.duration}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{track.mood}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {overlaySettings.music.selectedTrackId && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Volume Mixer</Label>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => updateMusic({ isMuted: !overlaySettings.music.isMuted })}>
                      {overlaySettings.music.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider value={[overlaySettings.music.volume]} onValueChange={([val]) => updateMusic({ volume: val })} min={0} max={100} step={1}
                      disabled={overlaySettings.music.isMuted} className="flex-1" />
                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">{overlaySettings.music.volume}%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Voice & Script Tab */}
          {activeTab === "voice-script" && (
            <div className="p-4 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Script</Label>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-purple-500 hover:text-purple-400 hover:bg-purple-500/10"
                    onClick={() => onAIAction?.("improve_script", { script: overlaySettings.voice.script })}>
                    <Sparkles className="h-3 w-3" />
                  </Button>
                </div>
                <Textarea value={overlaySettings.voice.script} onChange={(e) => updateVoice({ script: e.target.value })}
                  placeholder="Enter your voiceover script here..." rows={6}
                  className="resize-none bg-muted/30 border-border text-foreground focus:border-primary/50" />
                <p className="text-[10px] text-muted-foreground text-right">
                  {overlaySettings.voice.script.length} chars • ~{Math.ceil(overlaySettings.voice.script.split(' ').filter(w => w).length / 150)} min read
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Voice Persona</Label>
                <RadioGroup value={overlaySettings.voice.selectedVoice} onValueChange={(val) => updateVoice({ selectedVoice: val })}>
                  <div className="space-y-2">
                    {[
                      { id: 'professional', label: 'Professional', desc: 'Clear, confident tone', icon: UserCheck },
                      { id: 'friendly', label: 'Friendly', desc: 'Warm, approachable tone', icon: Heart },
                      { id: 'energetic', label: 'Energetic', desc: 'Upbeat, dynamic tone', icon: Zap }
                    ].map((voice) => (
                      <div key={voice.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent border border-transparent hover:border-border has-[:checked]:bg-primary/10 has-[:checked]:border-primary/30 transition-all cursor-pointer">
                        <RadioGroupItem value={voice.id} id={`voice-${voice.id}`} className="text-primary border-border mt-1" />
                        <Label htmlFor={`voice-${voice.id}`} className="flex-1 cursor-pointer">
                          <span className="text-sm font-medium text-foreground block">{voice.label}</span>
                          <span className="text-xs text-muted-foreground">{voice.desc}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 pt-2 border-t border-border">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Playback Speed</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[overlaySettings.voice.speed]} onValueChange={([val]) => updateVoice({ speed: val })} min={0.5} max={2} step={0.1} className="flex-1" />
                  <span className="text-xs font-mono text-muted-foreground w-8 text-right">{overlaySettings.voice.speed}x</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" className="h-9 text-xs">
                  <Upload className="h-3.5 w-3.5 mr-2" />
                  Upload Audio
                </Button>
                <Button variant="outline" className="h-9 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20">
                  <Mic className="h-3.5 w-3.5 mr-2" />
                  Record
                </Button>
              </div>
            </div>
          )}

          {/* AI Input Settings Tab */}
          {activeTab === "ai-settings" && (
            <div className="p-4 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">AI Model</Label>
                <RadioGroup value={overlaySettings.aiSettings?.model || "balanced"} onValueChange={(val) => onOverlaySettingsChange({ ...overlaySettings, aiSettings: { ...overlaySettings.aiSettings, model: val, creativity: overlaySettings.aiSettings?.creativity ?? 70, autoEnhance: overlaySettings.aiSettings?.autoEnhance ?? true, style: overlaySettings.aiSettings?.style || "cinematic" } })}>
                  <div className="space-y-2">
                    {[
                      { id: 'speed', label: 'Speed Priority', desc: 'Faster generation, good quality' },
                      { id: 'balanced', label: 'Balanced', desc: 'Best mix of speed and quality' },
                      { id: 'quality', label: 'Quality Priority', desc: 'Highest fidelity, slower' },
                    ].map((m) => (
                      <div key={m.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent border border-transparent hover:border-border has-[:checked]:bg-primary/10 has-[:checked]:border-primary/30 transition-all cursor-pointer">
                        <RadioGroupItem value={m.id} id={`model-${m.id}`} className="text-primary border-border" />
                        <Label htmlFor={`model-${m.id}`} className="flex-1 cursor-pointer">
                          <span className="text-sm font-medium text-foreground block">{m.label}</span>
                          <span className="text-xs text-muted-foreground">{m.desc}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Creativity Level</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[overlaySettings.aiSettings?.creativity ?? 70]} onValueChange={([val]) => onOverlaySettingsChange({ ...overlaySettings, aiSettings: { ...overlaySettings.aiSettings, model: overlaySettings.aiSettings?.model || "balanced", creativity: val, autoEnhance: overlaySettings.aiSettings?.autoEnhance ?? true, style: overlaySettings.aiSettings?.style || "cinematic" } })} min={0} max={100} step={5} className="flex-1" />
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">{overlaySettings.aiSettings?.creativity ?? 70}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Higher values produce more creative and unexpected results</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Visual Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['cinematic', 'modern', 'vintage', 'minimal'].map((style) => (
                    <button key={style}
                      onClick={() => onOverlaySettingsChange({ ...overlaySettings, aiSettings: { ...overlaySettings.aiSettings, model: overlaySettings.aiSettings?.model || "balanced", creativity: overlaySettings.aiSettings?.creativity ?? 70, autoEnhance: overlaySettings.aiSettings?.autoEnhance ?? true, style } })}
                      className={`p-2.5 rounded-lg border text-xs font-semibold capitalize transition-all ${(overlaySettings.aiSettings?.style || "cinematic") === style ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div>
                  <Label className="text-sm font-medium text-foreground block">Auto-Enhance</Label>
                  <span className="text-[10px] text-muted-foreground">Automatically improve generated visuals</span>
                </div>
                <Switch checked={overlaySettings.aiSettings?.autoEnhance ?? true} onCheckedChange={(checked) => onOverlaySettingsChange({ ...overlaySettings, aiSettings: { ...overlaySettings.aiSettings, model: overlaySettings.aiSettings?.model || "balanced", creativity: overlaySettings.aiSettings?.creativity ?? 70, autoEnhance: checked, style: overlaySettings.aiSettings?.style || "cinematic" } })} />
              </div>
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === "settings" && (
            <div className="p-4 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Aspect Ratio</Label>
                <RadioGroup value={overlaySettings.generalSettings?.aspectRatio || "16:9"} onValueChange={(val) => onOverlaySettingsChange({ ...overlaySettings, generalSettings: { ...overlaySettings.generalSettings, aspectRatio: val, resolution: overlaySettings.generalSettings?.resolution || "1080p", fps: overlaySettings.generalSettings?.fps || 30, loop: overlaySettings.generalSettings?.loop ?? false, watermark: overlaySettings.generalSettings?.watermark ?? false } })}>
                  <div className="grid grid-cols-3 gap-2">
                    {['16:9', '4:3', '9:16', '1:1', '21:9'].map((ratio) => (
                      <div key={ratio} className="flex items-center justify-center p-2 border border-border rounded-lg hover:bg-accent cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary/30 transition-all">
                        <RadioGroupItem value={ratio} id={`ratio-${ratio}`} className="sr-only" />
                        <Label htmlFor={`ratio-${ratio}`} className="text-xs font-semibold cursor-pointer text-foreground">{ratio}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Resolution</Label>
                <RadioGroup value={overlaySettings.generalSettings?.resolution || "1080p"} onValueChange={(val) => onOverlaySettingsChange({ ...overlaySettings, generalSettings: { ...overlaySettings.generalSettings, aspectRatio: overlaySettings.generalSettings?.aspectRatio || "16:9", resolution: val, fps: overlaySettings.generalSettings?.fps || 30, loop: overlaySettings.generalSettings?.loop ?? false, watermark: overlaySettings.generalSettings?.watermark ?? false } })}>
                  <div className="grid grid-cols-3 gap-2">
                    {['720p', '1080p', '4K'].map((res) => (
                      <div key={res} className="flex items-center justify-center p-2 border border-border rounded-lg hover:bg-accent cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary/30 transition-all">
                        <RadioGroupItem value={res} id={`res-${res}`} className="sr-only" />
                        <Label htmlFor={`res-${res}`} className="text-xs font-semibold cursor-pointer text-foreground">{res}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Frame Rate</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[overlaySettings.generalSettings?.fps || 30]} onValueChange={([val]) => onOverlaySettingsChange({ ...overlaySettings, generalSettings: { ...overlaySettings.generalSettings, aspectRatio: overlaySettings.generalSettings?.aspectRatio || "16:9", resolution: overlaySettings.generalSettings?.resolution || "1080p", fps: val, loop: overlaySettings.generalSettings?.loop ?? false, watermark: overlaySettings.generalSettings?.watermark ?? false } })} min={24} max={60} step={6} className="flex-1" />
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">{overlaySettings.generalSettings?.fps || 30} fps</span>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <div>
                    <Label className="text-sm font-medium text-foreground block">Loop Playback</Label>
                    <span className="text-[10px] text-muted-foreground">Video loops continuously</span>
                  </div>
                  <Switch checked={overlaySettings.generalSettings?.loop ?? false} onCheckedChange={(checked) => onOverlaySettingsChange({ ...overlaySettings, generalSettings: { ...overlaySettings.generalSettings, aspectRatio: overlaySettings.generalSettings?.aspectRatio || "16:9", resolution: overlaySettings.generalSettings?.resolution || "1080p", fps: overlaySettings.generalSettings?.fps || 30, loop: checked, watermark: overlaySettings.generalSettings?.watermark ?? false } })} />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <div>
                    <Label className="text-sm font-medium text-foreground block">Watermark</Label>
                    <span className="text-[10px] text-muted-foreground">Add brand watermark overlay</span>
                  </div>
                  <Switch checked={overlaySettings.generalSettings?.watermark ?? false} onCheckedChange={(checked) => onOverlaySettingsChange({ ...overlaySettings, generalSettings: { ...overlaySettings.generalSettings, aspectRatio: overlaySettings.generalSettings?.aspectRatio || "16:9", resolution: overlaySettings.generalSettings?.resolution || "1080p", fps: overlaySettings.generalSettings?.fps || 30, loop: overlaySettings.generalSettings?.loop ?? false, watermark: checked } })} />
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default VideoEditorSidebar;
