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
  Play,
  Pause,
  Volume2,
  VolumeX,
  Link,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  HelpCircle,
  BarChart2,
  Zap,
  Layout,
  Activity,
  UserCheck,
  Heart,
  ChevronUp,
  ChevronDown,
  Trash2
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
  onReorderScene,
  onDeleteScene,
  onAddScene,
}: VideoEditorSidebarProps) => {
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

  return (
    <div className="flex h-full min-h-0 bg-black/20 backdrop-blur-xl border-r border-white/10 transition-colors duration-300">
      {/* Icon Tabs - Slim & Elegant */}
      <div className="w-[60px] bg-black/40 border-r border-white/10 flex flex-col items-center py-4 gap-1 transition-colors duration-300">
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
                  ? "bg-blue-600/20 text-blue-400 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] border border-blue-500/30"
                  : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
            >
              <Icon className={`w-4 h-4 transition-transform ${isActive ? "scale-110" : ""}`} />
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 rounded-xl bg-blue-500/10 blur-[8px] -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Tooltip on hover */}
              <div className="absolute left-[calc(100%+12px)] px-2 py-1 bg-black/90 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10 uppercase tracking-widest backdrop-blur-md">
                {tab.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Content Panel - Semantic & Elegant */}
      <div className="w-[300px] bg-transparent flex flex-col transition-colors duration-300">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            {sidebarTabs.find(t => t.id === activeTab)?.label}
          </h2>
          {activeTab === 'slideshow' && <Badge variant="outline" className="text-[10px] border-white/10 text-white/50">{scenes.length} SCENES</Badge>}
        </div>

        <ScrollArea className="flex-1">
          {/* Slideshow Tab */}
          {activeTab === "slideshow" && (
            <div className="p-3 space-y-2">
              {scenes.map((scene, index) => (
                <div
                  key={`${scene.id}-${index}`}
                  className={`group relative flex flex-col gap-1 p-2 rounded-lg transition-all border ${scene.isActive
                    ? "bg-white/10 border-blue-500/30 shadow-lg"
                    : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                    }`}
                  onClick={() => onSceneSelect(index)}
                >
                  <div className="flex gap-3">
                    <div className="relative w-24 h-14 rounded-md overflow-hidden bg-black/40 flex-shrink-0 shadow-inner border border-white/5">
                      {scene.thumbnailUrl ? (
                        <img
                          src={scene.thumbnailUrl}
                          alt={scene.label}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="h-6 w-6 text-white/20" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <button
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSceneChange(index);
                        }}
                      >
                        <div className="bg-white/10 p-1.5 rounded-full border border-white/20 hover:scale-110 transition-transform">
                          <Edit3 className="h-3.5 w-3.5 text-white" />
                        </div>
                      </button>

                      {/* Duration Badge */}
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/60 text-[8px] text-white font-mono border border-white/10 backdrop-blur-sm">
                        {scene.duration}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-xs font-semibold truncate ${scene.isActive ? 'text-blue-200' : 'text-white'}`}>{scene.label}</p>

                        {/* Reorder & Delete Controls */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-white/30 hover:text-white"
                            onClick={(e) => { e.stopPropagation(); onReorderScene?.(index, index - 1); }}
                            title="Move Up"
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-white/30 hover:text-white"
                            onClick={(e) => { e.stopPropagation(); onReorderScene?.(index, index + 1); }}
                            title="Move Down"
                            disabled={index === scenes.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                            onClick={(e) => { e.stopPropagation(); onDeleteScene?.(index); }}
                            title="Delete Scene"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {scene.isActive && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse box-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                          <span className="text-[9px] text-blue-400 font-medium uppercase tracking-wider">Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 h-10 rounded-xl bg-white/5 border-dashed border-white/20 hover:bg-white/10 hover:border-white/40 hover:text-white text-white/60"
                onClick={onAddScene}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Scene
              </Button>

              {/* AI Hook Library - NEW */}
              <div className="pt-6 border-t border-white/10 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-white">AI Hook Library</Label>
                  </div>
                  <Badge variant="secondary" className="text-[9px] bg-purple-500/10 text-purple-300 border-purple-500/20 uppercase font-bold px-1.5">Premium</Badge>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'question', label: 'The Big Question', icon: HelpCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'Engage with relatable pain point' },
                    { id: 'stat', label: 'Shocking Stat', icon: BarChart2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Use data for authority' },
                    { id: 'surprise', label: 'Visual Surprise', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Unexpected statement' },
                    { id: 'problem-solution', label: 'Problem/Solution', icon: Layout, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', desc: 'Present brand as solution' }
                  ].map((hook) => (
                    <button
                      key={hook.id}
                      onClick={() => onAIAction?.("apply_hook", { hookId: hook.id, label: hook.label })}
                      className="group flex items-start gap-3 p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left"
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg border ${hook.bg} ${hook.border} ${hook.color}`}>
                        <hook.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white group-hover:text-white/90 transition-colors">{hook.label}</p>
                        <p className="text-[9px] text-white/40 line-clamp-1 group-hover:text-white/60">{hook.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Growth Tab - Performance Insights */}
        {
          activeTab === "growth" && (
            <PerformanceInsights />
          )
        }

        {/* Bottom Banner Tab */}
        {
          activeTab === "bottom-banner" && (
            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <Label htmlFor="banner-enabled" className="text-sm font-medium text-white">
                  Enable Banner
                </Label>
                <Switch
                  id="banner-enabled"
                  checked={overlaySettings.banner.enabled}
                  onCheckedChange={(checked) => updateBanner({ enabled: checked })}
                />
              </div>

              {overlaySettings.banner.enabled && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Banner Text</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                        onClick={() => onAIAction?.("improve_banner_text", { text: overlaySettings.banner.text })}
                      >
                        <Sparkles className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={overlaySettings.banner.text}
                      onChange={(e) => updateBanner({ text: e.target.value })}
                      placeholder="Enter banner text..."
                      className="bg-black/20 border-white/10 text-white focus:border-blue-500/50 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Position</Label>
                    <RadioGroup
                      value={overlaySettings.banner.position}
                      onValueChange={(val) => updateBanner({ position: val as "top" | "bottom" })}
                      className="grid grid-cols-2 gap-2"
                    >
                      <div className="flex items-center space-x-2 border border-white/10 rounded-md p-2 hover:bg-white/5 cursor-pointer has-[:checked]:bg-blue-500/10 has-[:checked]:border-blue-500/30">
                        <RadioGroupItem value="top" id="pos-top" className="text-blue-500 border-white/20" />
                        <Label htmlFor="pos-top" className="text-xs cursor-pointer text-white">Top</Label>
                      </div>
                      <div className="flex items-center space-x-2 border border-white/10 rounded-md p-2 hover:bg-white/5 cursor-pointer has-[:checked]:bg-blue-500/10 has-[:checked]:border-blue-500/30">
                        <RadioGroupItem value="bottom" id="pos-bottom" className="text-blue-500 border-white/20" />
                        <Label htmlFor="pos-bottom" className="text-xs cursor-pointer text-white">Bottom</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Alignment</Label>
                    <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                      {['left', 'center', 'right'].map((align) => (
                        <Button
                          key={align}
                          variant="ghost"
                          size="sm"
                          className={`flex-1 h-7 ${overlaySettings.banner.alignment === align ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
                          onClick={() => updateBanner({ alignment: align as any })}
                        >
                          {align === 'left' && <AlignLeft className="h-3.5 w-3.5" />}
                          {align === 'center' && <AlignCenter className="h-3.5 w-3.5" />}
                          {align === 'right' && <AlignRight className="h-3.5 w-3.5" />}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Background Color</Label>
                    <div className="flex gap-2">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border border-white/20 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <Input
                          type="color"
                          value={overlaySettings.banner.backgroundColor}
                          onChange={(e) => updateBanner({ backgroundColor: e.target.value })}
                          className="absolute -top-2 -left-2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={overlaySettings.banner.backgroundColor}
                        onChange={(e) => updateBanner({ backgroundColor: e.target.value })}
                        className="flex-1 bg-white/5 border-white/10 text-white font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        }

        {/* End Screen Tab */}
        {
          activeTab === "end-screen" && (
            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <Label htmlFor="endscreen-enabled" className="text-sm font-medium text-white">
                  Enable End Screen
                </Label>
                <Switch
                  id="endscreen-enabled"
                  checked={overlaySettings.endScreen.enabled}
                  onCheckedChange={(checked) => updateEndScreen({ enabled: checked })}
                />
              </div>

              {overlaySettings.endScreen.enabled && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Duration</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[overlaySettings.endScreen.duration]}
                        onValueChange={([val]) => updateEndScreen({ duration: val })}
                        min={3}
                        max={10}
                        step={1}
                        className="flex-1 [&>.relative>.bg-primary]:bg-blue-500"
                      />
                      <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{overlaySettings.endScreen.duration}s</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">CTA Button Text</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                        onClick={() => onAIAction?.("improve_cta_text", { text: overlaySettings.endScreen.ctaText })}
                      >
                        <Sparkles className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={overlaySettings.endScreen.ctaText}
                      onChange={(e) => updateEndScreen({ ctaText: e.target.value })}
                      placeholder="e.g., Learn More, Shop Now"
                      className="bg-black/20 border-white/10 text-white focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">CTA Link URL</Label>
                    <div className="flex gap-2 relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                      <Input
                        value={overlaySettings.endScreen.ctaUrl}
                        onChange={(e) => updateEndScreen({ ctaUrl: e.target.value })}
                        placeholder="https://..."
                        className="pl-9 bg-black/20 border-white/10 text-white focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-logo" className="text-sm text-white/80">Show Logo</Label>
                    <Switch
                      id="show-logo"
                      checked={overlaySettings.endScreen.showLogo}
                      onCheckedChange={(checked) => updateEndScreen({ showLogo: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Background Color</Label>
                    <div className="flex gap-2">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border border-white/20 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <Input
                          type="color"
                          value={overlaySettings.endScreen.backgroundColor}
                          onChange={(e) => updateEndScreen({ backgroundColor: e.target.value })}
                          className="absolute -top-2 -left-2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={overlaySettings.endScreen.backgroundColor}
                        onChange={(e) => updateEndScreen({ backgroundColor: e.target.value })}
                        className="flex-1 bg-white/5 border-white/10 text-white font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <Button
                    variant={isPreviewingEndScreen ? "secondary" : "outline"}
                    className={`w-full ${isPreviewingEndScreen ? "bg-white text-black hover:bg-white/90" : "bg-transparent border-white/20 text-white hover:bg-white/5"}`}
                    onClick={onToggleEndScreenPreview}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    {isPreviewingEndScreen ? "Hide End Screen" : "Preview End Screen"}
                  </Button>
                </div>
              )}
            </div>
          )
        }

        {/* QR Code Tab */}
        {
          activeTab === "qr-code" && (
            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <Label htmlFor="qr-enabled" className="text-sm font-medium text-white">
                  Enable QR Code
                </Label>
                <Switch
                  id="qr-enabled"
                  checked={overlaySettings.qrCode.enabled}
                  onCheckedChange={(checked) => updateQRCode({ enabled: checked })}
                />
              </div>

              {overlaySettings.qrCode.enabled && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Destination URL</Label>
                    <Input
                      value={overlaySettings.qrCode.url}
                      onChange={(e) => updateQRCode({ url: e.target.value })}
                      placeholder="https://your-website.com"
                      className="bg-black/20 border-white/10 text-white focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Position</Label>
                    <RadioGroup
                      value={overlaySettings.qrCode.position}
                      onValueChange={(val) => updateQRCode({ position: val as QRCodeSettings["position"] })}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                          <div key={pos} className="flex items-center space-x-2 border border-white/10 rounded-md p-2 hover:bg-white/5 cursor-pointer has-[:checked]:bg-blue-500/10 has-[:checked]:border-blue-500/30">
                            <RadioGroupItem value={pos} id={`qr-${pos}`} className="text-blue-500 border-white/20" />
                            <Label htmlFor={`qr-${pos}`} className="text-[10px] cursor-pointer text-white uppercase">{pos.replace('-', ' ')}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Size</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[overlaySettings.qrCode.size]}
                        onValueChange={([val]) => updateQRCode({ size: val })}
                        min={50}
                        max={200}
                        step={10}
                        className="flex-1 [&>.relative>.bg-primary]:bg-blue-500"
                      />
                      <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{overlaySettings.qrCode.size}px</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                    <div
                      className="bg-white rounded flex items-center justify-center shadow-lg"
                      style={{ width: overlaySettings.qrCode.size / 2, height: overlaySettings.qrCode.size / 2 }}
                    >
                      <QrCode className="w-full h-full p-2 text-black" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        }

        {/* Music Tab */}
        {
          activeTab === "music" && (
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-200"
                  onClick={() => onAIAction?.("generate_music", { currentSettings: overlaySettings.music })}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Music Library</Label>
                <div className="space-y-2">
                  {musicLibrary.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => updateMusic({ selectedTrackId: track.id })}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${overlaySettings.music.selectedTrackId === track.id
                        ? "bg-blue-600/20 border-blue-500/30"
                        : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-full ${overlaySettings.music.selectedTrackId === track.id ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-white/10 text-white hover:bg-white/20"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPlaying(!isPlaying);
                            }}
                          >
                            {isPlaying && overlaySettings.music.selectedTrackId === track.id ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5 ml-0.5" />
                            )}
                          </Button>
                          <div>
                            <p className="text-sm font-medium text-white">{track.name}</p>
                            <p className="text-xs text-white/40">{track.duration}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] bg-white/10 text-white/60 hover:bg-white/20">
                          {track.mood}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {overlaySettings.music.selectedTrackId && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Volume Mixer</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-white/60 hover:text-white"
                      onClick={() => updateMusic({ isMuted: !overlaySettings.music.isMuted })}
                    >
                      {overlaySettings.music.isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[overlaySettings.music.volume]}
                      onValueChange={([val]) => updateMusic({ volume: val })}
                      min={0}
                      max={100}
                      step={1}
                      disabled={overlaySettings.music.isMuted}
                      className="flex-1 [&>.relative>.bg-primary]:bg-blue-500"
                    />
                    <span className="text-xs font-mono text-white/60 w-8 text-right">{overlaySettings.music.volume}%</span>
                  </div>
                </div>
              )}
            </div>
          )
        }

        {/* Voice & Script Tab */}
        {
          activeTab === "voice-script" && (
            <div className="p-4 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Script</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
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
                  className="resize-none bg-black/20 border-white/10 text-white focus:border-blue-500/50"
                />
                <p className="text-[10px] text-white/30 text-right">
                  {overlaySettings.voice.script.length} chars • ~{Math.ceil(overlaySettings.voice.script.split(' ').filter(w => w).length / 150)} min read
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Voice Persona</Label>
                <RadioGroup
                  value={overlaySettings.voice.selectedVoice}
                  onValueChange={(val) => updateVoice({ selectedVoice: val })}
                >
                  <div className="space-y-2">
                    {[
                      { id: 'professional', label: 'Professional', desc: 'Clear, confident tone', icon: UserCheck },
                      { id: 'friendly', label: 'Friendly', desc: 'Warm, approachable tone', icon: Heart },
                      { id: 'energetic', label: 'Energetic', desc: 'Upbeat, dynamic tone', icon: Zap }
                    ].map((voice) => (
                      <div key={voice.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 has-[:checked]:bg-blue-500/10 has-[:checked]:border-blue-500/30 transition-all cursor-pointer">
                        <RadioGroupItem value={voice.id} id={`voice-${voice.id}`} className="text-blue-500 border-white/20 mt-1" />
                        <Label htmlFor={`voice-${voice.id}`} className="flex-1 cursor-pointer">
                          <span className="text-sm font-medium text-white block">{voice.label}</span>
                          <span className="text-xs text-white/40">{voice.desc}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10">
                <Label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Playback Speed</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[overlaySettings.voice.speed]}
                    onValueChange={([val]) => updateVoice({ speed: val })}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="flex-1 [&>.relative>.bg-primary]:bg-blue-500"
                  />
                  <span className="text-xs font-mono text-white/60 w-8 text-right">{overlaySettings.voice.speed}x</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-9 text-xs">
                  <Upload className="h-3.5 w-3.5 mr-2" />
                  Upload Audio
                </Button>
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-white h-9 text-xs">
                  <Mic className="h-3.5 w-3.5 mr-2" />
                  Record
                </Button>
              </div>
            </div>
          )
        }
      </ScrollArea>
    </div>
  );
};

export default VideoEditorSidebar;
