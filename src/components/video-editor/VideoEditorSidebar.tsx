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
  Film,
  PanelBottom,
  Square,
  QrCode,
  Music,
  Mic,
  Settings2,
  Upload,
  Sparkles,
  MoreVertical,
  Edit3,
  Plus,
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Link,
  Image,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  RefreshCw,
  HelpCircle,
  BarChart2,
  Zap,
  Layout,
  Activity,
  Tv,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
  onSceneSelect: (sceneId: number) => void;
  onSceneChange: (sceneId: number) => void;
  overlaySettings: VideoOverlaySettings;
  onOverlaySettingsChange: (settings: VideoOverlaySettings) => void;
  isPreviewingEndScreen?: boolean;
  onToggleEndScreenPreview?: () => void;
  onAIAction?: (action: string, context?: any) => void;
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
  scenes,
  activeTab,
  onTabChange,
  onSceneSelect,
  onSceneChange,
  overlaySettings,
  onOverlaySettingsChange,
  isPreviewingEndScreen = false,
  onToggleEndScreenPreview,
  onAIAction,
}: VideoEditorSidebarProps) => {
  const [aiInputSource, setAiInputSource] = useState("website");
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper functions to update nested settings
  const updateBanner = (updates: Partial<BannerSettings>) => {
    onOverlaySettingsChange({
      ...overlaySettings,
      banner: { ...overlaySettings.banner, ...updates },
    });
  };

  const updateEndScreen = (updates: Partial<EndScreenSettings>) => {
    onOverlaySettingsChange({
      ...overlaySettings,
      endScreen: { ...overlaySettings.endScreen, ...updates },
    });
  };

  const updateQRCode = (updates: Partial<QRCodeSettings>) => {
    onOverlaySettingsChange({
      ...overlaySettings,
      qrCode: { ...overlaySettings.qrCode, ...updates },
    });
  };

  const updateMusic = (updates: Partial<MusicSettings>) => {
    onOverlaySettingsChange({
      ...overlaySettings,
      music: { ...overlaySettings.music, ...updates },
    });
  };

  const updateVoice = (updates: Partial<VoiceSettings>) => {
    onOverlaySettingsChange({
      ...overlaySettings,
      voice: { ...overlaySettings.voice, ...updates },
    });
  };

  const updateNetwork = (network: string) => {
    onOverlaySettingsChange({
      ...overlaySettings,
      network: { selected: network as any },
    });
  };

  return (
    <div className="flex h-full min-h-0 bg-background transition-colors duration-300">
      {/* Icon Tabs - Slim & Elegant */}
      <div className="w-[60px] bg-card border-r border-border flex flex-col items-center py-4 gap-1 transition-colors duration-300">
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
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/10"
                }`}
            >
              <Icon className={`w-4 h-4 transition-transform ${isActive ? "scale-110" : ""}`} />
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 rounded-xl bg-primary/20 blur-md -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Tooltip on hover */}
              <div className="absolute left-[calc(100%+12px)] px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10 uppercase tracking-widest">
                {tab.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Content Panel - Semantic & Elegant */}
      <div className="w-[300px] bg-background border-r border-border flex flex-col transition-colors duration-300">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            {sidebarTabs.find(t => t.id === activeTab)?.label}
          </h2>
        </div>

        <ScrollArea className="flex-1">
          {/* Slideshow Tab */}
          {activeTab === "slideshow" && (
            <div className="p-3 space-y-2">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className={`group relative flex flex-col gap-1 p-2 rounded-lg transition-all border ${scene.isActive
                    ? "bg-accent/10 border-primary/40 shadow-lg"
                    : "bg-card border-transparent hover:bg-accent/5 hover:border-border"
                    }`}
                  onClick={() => onSceneSelect(scene.id)}
                >
                  <div className="flex gap-3">
                    <div className="relative w-20 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0 shadow-inner">
                      {scene.thumbnailUrl ? (
                        <img
                          src={scene.thumbnailUrl}
                          alt={scene.label}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <button
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSceneChange(scene.id);
                        }}
                      >
                        <div className="bg-white/20 p-2 rounded-full border border-white/20">
                          <Edit3 className="h-4 w-4 text-white" />
                        </div>
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-foreground truncate">{scene.label}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">{scene.duration}</p>
                      {scene.isActive && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">Currently visible</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drag Handle (Simulated) */}
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-0.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-0.5">
                          <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
                          <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 h-11 rounded-xl"
                onClick={() => {
                  // Logic to add a new scene
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Scene
              </Button>

              {/* AI Hook Library - NEW */}
              <div className="pt-6 border-t border-border mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-bold uppercase tracking-wider text-foreground">AI Hook Library</Label>
                  </div>
                  <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary uppercase font-bold px-2">Premium</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed italic">
                  The first 3 seconds determine 80% of your TV ad's success. Use these high-converting hooks.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'question', label: 'The Big Question', icon: HelpCircle, color: 'text-blue-500', desc: 'Engage audience instantly with a relatable pain point.' },
                    { id: 'stat', label: 'Shocking Stat', icon: BarChart2, color: 'text-orange-500', desc: 'Use data to build immediate authority.' },
                    { id: 'surprise', label: 'Visual Surprise', icon: Zap, color: 'text-yellow-500', desc: 'Stop viewers with an unexpected statement.' },
                    { id: 'problem-solution', label: 'Problem/Solution', icon: Layout, color: 'text-green-500', desc: 'Agitate the problem, then present your brand.' }
                  ].map((hook) => (
                    <button
                      key={hook.id}
                      onClick={() => onAIAction?.("apply_hook", { hookId: hook.id, label: hook.label })}
                      className="group flex items-start gap-3 p-3 rounded-xl border border-border bg-accent/5 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg bg-background border border-border group-hover:border-primary/30 ${hook.color}`}>
                        <hook.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">{hook.label}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 group-hover:text-muted-foreground/80">{hook.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-6">
                <div className="bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-xl border border-primary/10">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Need more visuals?
                  </p>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    Check out our recommended stock libraries for high-quality assets.
                  </p>
                  <Button variant="outline" size="sm" className="w-full h-9">
                    Discover Libraries
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Growth Tab - Performance Insights */}
          {activeTab === "growth" && (
            <PerformanceInsights />
          )}

          {/* Bottom Banner Tab */}
          {activeTab === "bottom-banner" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="banner-enabled" className="text-sm font-medium">
                  Enable Banner
                </Label>
                <Switch
                  id="banner-enabled"
                  checked={overlaySettings.banner.enabled}
                  onCheckedChange={(checked) => updateBanner({ enabled: checked })}
                />
              </div>

              {overlaySettings.banner.enabled && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Banner Text</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => onAIAction?.("improve_banner_text", { text: overlaySettings.banner.text })}
                      >
                        <Sparkles className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={overlaySettings.banner.text}
                      onChange={(e) => updateBanner({ text: e.target.value })}
                      placeholder="Enter banner text..."
                      className="bg-accent/5 border-border text-foreground focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Position</Label>
                    <RadioGroup
                      value={overlaySettings.banner.position}
                      onValueChange={(val) => updateBanner({ position: val as "top" | "bottom" })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="top" id="pos-top" />
                        <Label htmlFor="pos-top" className="text-sm cursor-pointer">Top</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bottom" id="pos-bottom" />
                        <Label htmlFor="pos-bottom" className="text-sm cursor-pointer">Bottom</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Text Alignment</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={overlaySettings.banner.alignment === "left" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateBanner({ alignment: "left" })}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={overlaySettings.banner.alignment === "center" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateBanner({ alignment: "center" })}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={overlaySettings.banner.alignment === "right" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateBanner({ alignment: "right" })}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={overlaySettings.banner.backgroundColor}
                        onChange={(e) => updateBanner({ backgroundColor: e.target.value })}
                        className="w-12 h-8 p-1 cursor-pointer"
                      />
                      <Input
                        value={overlaySettings.banner.backgroundColor}
                        onChange={(e) => updateBanner({ backgroundColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* End Screen Tab */}
          {activeTab === "end-screen" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="endscreen-enabled" className="text-sm font-medium">
                  Enable End Screen
                </Label>
                <Switch
                  id="endscreen-enabled"
                  checked={overlaySettings.endScreen.enabled}
                  onCheckedChange={(checked) => updateEndScreen({ enabled: checked })}
                />
              </div>

              {overlaySettings.endScreen.enabled && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">Duration (seconds)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[overlaySettings.endScreen.duration]}
                        onValueChange={([val]) => updateEndScreen({ duration: val })}
                        min={3}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-8">{overlaySettings.endScreen.duration}s</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-white/70">CTA Button Text</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-[#C1FF72] hover:text-[#C1FF72] hover:bg-[#C1FF72]/10"
                        onClick={() => onAIAction?.("improve_cta_text", { text: overlaySettings.endScreen.ctaText })}
                      >
                        <Sparkles className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={overlaySettings.endScreen.ctaText}
                      onChange={(e) => updateEndScreen({ ctaText: e.target.value })}
                      placeholder="e.g., Learn More, Shop Now"
                      className="bg-[#1A1A1A] border-[#333] text-white focus:border-[#C1FF72]/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">CTA Link URL</Label>
                    <div className="flex gap-2">
                      <Link className="h-4 w-4 text-muted-foreground mt-2" />
                      <Input
                        value={overlaySettings.endScreen.ctaUrl}
                        onChange={(e) => updateEndScreen({ ctaUrl: e.target.value })}
                        placeholder="https://..."
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-logo" className="text-sm">Show Logo</Label>
                    <Switch
                      id="show-logo"
                      checked={overlaySettings.endScreen.showLogo}
                      onCheckedChange={(checked) => updateEndScreen({ showLogo: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={overlaySettings.endScreen.backgroundColor}
                        onChange={(e) => updateEndScreen({ backgroundColor: e.target.value })}
                        className="w-12 h-8 p-1 cursor-pointer"
                      />
                      <Input
                        value={overlaySettings.endScreen.backgroundColor}
                        onChange={(e) => updateEndScreen({ backgroundColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <Button
                    variant={isPreviewingEndScreen ? "default" : "outline"}
                    className="w-full"
                    onClick={onToggleEndScreenPreview}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    {isPreviewingEndScreen ? "Hide End Screen" : "Preview End Screen"}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === "qr-code" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="qr-enabled" className="text-sm font-medium">
                  Enable QR Code
                </Label>
                <Switch
                  id="qr-enabled"
                  checked={overlaySettings.qrCode.enabled}
                  onCheckedChange={(checked) => updateQRCode({ enabled: checked })}
                />
              </div>

              {overlaySettings.qrCode.enabled && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">Destination URL</Label>
                    <Input
                      value={overlaySettings.qrCode.url}
                      onChange={(e) => updateQRCode({ url: e.target.value })}
                      placeholder="https://your-website.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Position</Label>
                    <RadioGroup
                      value={overlaySettings.qrCode.position}
                      onValueChange={(val) => updateQRCode({ position: val as QRCodeSettings["position"] })}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="top-left" id="qr-tl" />
                          <Label htmlFor="qr-tl" className="text-xs cursor-pointer">Top Left</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="top-right" id="qr-tr" />
                          <Label htmlFor="qr-tr" className="text-xs cursor-pointer">Top Right</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bottom-left" id="qr-bl" />
                          <Label htmlFor="qr-bl" className="text-xs cursor-pointer">Bottom Left</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bottom-right" id="qr-br" />
                          <Label htmlFor="qr-br" className="text-xs cursor-pointer">Bottom Right</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Size</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[overlaySettings.qrCode.size]}
                        onValueChange={([val]) => updateQRCode({ size: val })}
                        min={50}
                        max={200}
                        step={10}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-12">{overlaySettings.qrCode.size}px</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg flex items-center justify-center">
                    <div
                      className="bg-white rounded flex items-center justify-center"
                      style={{ width: overlaySettings.qrCode.size / 2, height: overlaySettings.qrCode.size / 2 }}
                    >
                      <QrCode className="w-full h-full p-2 text-foreground" />
                    </div>
                  </div>
                </>
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
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onAIAction?.("generate_music", { currentSettings: overlaySettings.music })}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Music Library</Label>
                <div className="space-y-2">
                  {musicLibrary.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => updateMusic({ selectedTrackId: track.id })}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${overlaySettings.music.selectedTrackId === track.id
                        ? "bg-accent/10 border border-primary/30"
                        : "bg-muted/50 hover:bg-muted"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPlaying(!isPlaying);
                            }}
                          >
                            {isPlaying && overlaySettings.music.selectedTrackId === track.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <p className="text-sm font-medium">{track.name}</p>
                            <p className="text-xs text-muted-foreground">{track.duration}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {track.mood}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {overlaySettings.music.selectedTrackId && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Volume</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateMusic({ isMuted: !overlaySettings.music.isMuted })}
                    >
                      {overlaySettings.music.isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Slider
                    value={[overlaySettings.music.volume]}
                    onValueChange={([val]) => updateMusic({ volume: val })}
                    min={0}
                    max={100}
                    step={1}
                    disabled={overlaySettings.music.isMuted}
                  />
                  <span className="text-xs text-muted-foreground">{overlaySettings.music.volume}%</span>
                </div>
              )}
            </div>
          )}

          {/* Voice & Script Tab */}
          {activeTab === "voice-script" && (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Script</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => onAIAction?.("improve_script", { script: overlaySettings.voice.script })}
                  >
                    <Sparkles className="h-3 w-3" />
                  </Button>
                </div>
                <Textarea
                  value={overlaySettings.voice.script}
                  onChange={(e) => updateVoice({ script: e.target.value })}
                  placeholder="Enter your voiceover script here..."
                  rows={6}
                  className="resize-none bg-accent/5 border-border text-foreground focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  {overlaySettings.voice.script.length} characters • ~{Math.ceil(overlaySettings.voice.script.split(' ').filter(w => w).length / 150)} min read
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Voice</Label>
                <RadioGroup
                  value={overlaySettings.voice.selectedVoice}
                  onValueChange={(val) => updateVoice({ selectedVoice: val })}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="professional" id="voice-pro" />
                      <Label htmlFor="voice-pro" className="flex-1 cursor-pointer">
                        <span className="text-sm">Professional</span>
                        <p className="text-xs text-muted-foreground">Clear, confident tone</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="friendly" id="voice-friend" />
                      <Label htmlFor="voice-friend" className="flex-1 cursor-pointer">
                        <span className="text-sm">Friendly</span>
                        <p className="text-xs text-muted-foreground">Warm, approachable tone</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="energetic" id="voice-energy" />
                      <Label htmlFor="voice-energy" className="flex-1 cursor-pointer">
                        <span className="text-sm">Energetic</span>
                        <p className="text-xs text-muted-foreground">Upbeat, dynamic tone</p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Speed</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[overlaySettings.voice.speed]}
                    onValueChange={([val]) => updateVoice({ speed: val })}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{overlaySettings.voice.speed}x</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Audio
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mic className="h-4 w-4 mr-2" />
                  Record
                </Button>
              </div>

              <Button
                className="w-full"
                disabled={!overlaySettings.voice.script.trim()}
                onClick={() => onAIAction?.("generate_voiceover", { script: overlaySettings.voice.script })}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Voiceover
              </Button>
            </div>
          )}

          {/* AI Settings Tab */}
          {activeTab === "ai-settings" && (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Select the input source you want the AI use to generate your creative.
                </p>
              </div>

              <RadioGroup
                value={aiInputSource}
                onValueChange={setAiInputSource}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="website" id="website" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="website" className="text-sm font-medium cursor-pointer">
                      Advertiser business website URL
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Generate from your business website URL
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="any-url" id="any-url" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="any-url" className="text-sm font-medium cursor-pointer">
                      Any website URL
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Generate from a website URL
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="business-place" id="business-place" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="business-place" className="text-sm font-medium cursor-pointer">
                      Business place
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Generate from a business on Google Maps
                    </p>
                  </div>
                </div>
              </RadioGroup>

              <Button className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate a creative
              </Button>
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === "settings" && (
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Network Compliance</p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Select a target network to auto-adjust creative for technical requirements.</p>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "none", label: "General", icon: Layout },
                      { id: "espn", label: "ESPN", icon: Activity },
                      { id: "hulu", label: "Hulu", icon: Play },
                      { id: "peacock", label: "Peacock", icon: Sparkles },
                      { id: "tubi", label: "Tubi", icon: Zap },
                    ].map((net) => (
                      <Button
                        key={net.id}
                        variant={overlaySettings.network?.selected === net.id ? "default" : "outline"}
                        className="h-auto py-3 flex-col gap-2 relative overflow-hidden group"
                        onClick={() => updateNetwork(net.id)}
                      >
                        <net.icon className="h-4 w-4" />
                        <span className="text-xs">{net.label}</span>
                        {overlaySettings.network?.selected === net.id && (
                          <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        )}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-foreground">Theme Preference</Label>
                    <p className="text-xs text-muted-foreground mt-1">Switch between light and dark modes</p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Editor Preferences</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-foreground/80">Auto-save changes</Label>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-foreground/80">High quality preview</Label>
                    <Switch checked={false} />
                  </div>
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
