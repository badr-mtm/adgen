import { useState } from "react";
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
  RefreshCw
} from "lucide-react";
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
}

const sidebarTabs = [
  { id: "slideshow", label: "Slideshow", icon: Film },
  { id: "bottom-banner", label: "Bottom banner", icon: PanelBottom },
  { id: "end-screen", label: "End screen", icon: Square },
  { id: "qr-code", label: "QR code", icon: QrCode },
  { id: "music", label: "Music", icon: Music },
  { id: "voice-script", label: "Voice & Script", icon: Mic },
  { id: "ai-settings", label: "AI Input Settings", icon: Settings2 },
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

  return (
    <div className="flex h-full min-h-0">
      {/* Icon Tabs */}
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-1">
        {sidebarTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex flex-col items-center gap-1 py-3 px-2 text-[10px] transition-colors ${
                isActive 
                  ? "text-primary bg-primary/10 border-r-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-center leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panel */}
      <div className="w-72 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {sidebarTabs.find(t => t.id === activeTab)?.label}
          </h2>
        </div>

        <ScrollArea className="flex-1">
          {/* Slideshow Tab */}
          {activeTab === "slideshow" && (
            <div className="p-4 space-y-3">
              {scenes.map((scene) => (
                <div 
                  key={scene.id}
                  className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    scene.isActive 
                      ? "bg-primary/10 border border-primary/30" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => onSceneSelect(scene.id)}
                >
                  <div className="relative w-20 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                    {scene.thumbnailUrl ? (
                      <img 
                        src={scene.thumbnailUrl} 
                        alt={scene.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <button 
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSceneChange(scene.id);
                      }}
                    >
                      <span className="text-[10px] text-white flex items-center gap-1">
                        <Edit3 className="h-3 w-3" />
                        Change
                      </span>
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{scene.label}</p>
                    <p className="text-xs text-muted-foreground">{scene.duration}</p>
                    {scene.isActive && (
                      <span className="text-[10px] text-primary">Currently visible</span>
                    )}
                  </div>

                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" size="sm" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Scene
              </Button>

              <div className="pt-4 border-t border-border mt-4">
                <p className="text-sm font-medium text-foreground mb-1">
                  Need more images or videos?
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Here is our recommended list of stock image libraries.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Discover
                </Button>
              </div>
            </div>
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
                    <Label className="text-sm">Banner Text</Label>
                    <Input 
                      value={overlaySettings.banner.text}
                      onChange={(e) => updateBanner({ text: e.target.value })}
                      placeholder="Enter banner text..."
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
                    <Label className="text-sm">CTA Button Text</Label>
                    <Input 
                      value={overlaySettings.endScreen.ctaText}
                      onChange={(e) => updateEndScreen({ ctaText: e.target.value })}
                      placeholder="e.g., Learn More, Shop Now"
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
                <Button variant="outline" className="flex-1">
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
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        overlaySettings.music.selectedTrackId === track.id 
                          ? "bg-primary/10 border border-primary/30" 
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
                <Label className="text-sm font-medium">Script</Label>
                <Textarea 
                  value={overlaySettings.voice.script}
                  onChange={(e) => updateVoice({ script: e.target.value })}
                  placeholder="Enter your voiceover script here..."
                  rows={6}
                  className="resize-none"
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

              <Button className="w-full" disabled={!overlaySettings.voice.script.trim()}>
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
        </ScrollArea>
      </div>
    </div>
  );
};

export default VideoEditorSidebar;
