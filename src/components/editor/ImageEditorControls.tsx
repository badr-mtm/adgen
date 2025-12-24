import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Type,
  ImagePlus,
  Eraser,
  Layout,
  Palette,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
  Wand2,
  Contrast,
  SunMedium,
  Droplets,
  Target,
  MessageSquare,
  Smartphone,
  Zap,
} from "lucide-react";

interface TextOverlay {
  id: string;
  text: string;
  fontSize: number;
  color: string;
  position: { x: number; y: number };
}

interface ImageEditorControlsProps {
  imageUrl: string;
  onAIAction: (action: string, params?: any) => Promise<void>;
  onGenerateVariants: () => Promise<void>;
  onImageSwap: (file: File) => void;
  onRemoveBackground: () => Promise<void>;
  isProcessing?: boolean;
  processingAction?: string;
}

const ImageEditorControls = ({
  imageUrl,
  onAIAction,
  onGenerateVariants,
  onImageSwap,
  onRemoveBackground,
  isProcessing = false,
  processingAction = "",
}: ImageEditorControlsProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    text: true,
    image: false,
    layout: false,
    color: false,
  });

  // Text controls state
  const [headlineText, setHeadlineText] = useState("");
  const [subheadlineText, setSubheadlineText] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [fontSize, setFontSize] = useState([24]);

  // Color & contrast state
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);

  // Layout state
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("center");
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">("center");

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const aiMicroActions = [
    { id: "increase_contrast", label: "Increase contrast", icon: Contrast },
    { id: "shorten_headline", label: "Shorten headline for mobile", icon: Smartphone },
    { id: "emphasize_cta", label: "Emphasize CTA", icon: Target },
    { id: "enhance_colors", label: "Enhance colors", icon: Palette },
    { id: "improve_composition", label: "Improve composition", icon: Layout },
    { id: "add_urgency", label: "Add urgency to copy", icon: Zap },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSwap(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Micro-Actions Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            AI Quick Actions
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {aiMicroActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9 text-xs"
              onClick={() => onAIAction(action.id)}
              disabled={isProcessing}
            >
              {isProcessing && processingAction === action.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <action.icon className="h-3 w-3" />
              )}
              <span className="truncate">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t border-border my-4" />

      {/* Text Edits Section */}
      <Collapsible open={openSections.text} onOpenChange={() => toggleSection("text")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/30 rounded-md px-2 transition-colors">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span className="text-sm font-medium">Text Edits</span>
          </div>
          {openSections.text ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Headline</Label>
            <Input
              placeholder="Enter headline text..."
              value={headlineText}
              onChange={(e) => setHeadlineText(e.target.value)}
              className="bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Subheadline</Label>
            <Input
              placeholder="Enter subheadline..."
              value={subheadlineText}
              onChange={(e) => setSubheadlineText(e.target.value)}
              className="bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">CTA Button Text</Label>
            <Input
              placeholder="Enter CTA text..."
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Font Size: {fontSize[0]}px</Label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              min={12}
              max={72}
              step={1}
            />
          </div>
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => onAIAction("apply_text", { headlineText, subheadlineText, ctaText, fontSize: fontSize[0] })}
            disabled={isProcessing}
          >
            {isProcessing && processingAction === "apply_text" ? (
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            ) : (
              <Wand2 className="h-3 w-3 mr-2" />
            )}
            Apply Text Changes
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Image Swap Section */}
      <Collapsible open={openSections.image} onOpenChange={() => toggleSection("image")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/30 rounded-md px-2 transition-colors">
          <div className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            <span className="text-sm font-medium">Image & Background</span>
          </div>
          {openSections.image ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Swap Image</Label>
            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <span>
                    <Upload className="h-3 w-3 mr-2" />
                    Upload New Image
                  </span>
                </Button>
              </label>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={onRemoveBackground}
            disabled={isProcessing || !imageUrl}
          >
            {isProcessing && processingAction === "remove_background" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Eraser className="h-3 w-3" />
            )}
            Remove Background
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => onAIAction("enhance_image")}
            disabled={isProcessing || !imageUrl}
          >
            {isProcessing && processingAction === "enhance_image" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            AI Enhance Image
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Layout Adjustments Section */}
      <Collapsible open={openSections.layout} onOpenChange={() => toggleSection("layout")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/30 rounded-md px-2 transition-colors">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span className="text-sm font-medium">Layout Adjustments</span>
          </div>
          {openSections.layout ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Text Position</Label>
            <div className="flex gap-2">
              {(["top", "center", "bottom"] as const).map((pos) => (
                <Badge
                  key={pos}
                  variant={textPosition === pos ? "default" : "outline"}
                  className="cursor-pointer capitalize flex-1 justify-center"
                  onClick={() => setTextPosition(pos)}
                >
                  {pos}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Text Alignment</Label>
            <div className="flex gap-2">
              {(["left", "center", "right"] as const).map((align) => (
                <Badge
                  key={align}
                  variant={textAlignment === align ? "default" : "outline"}
                  className="cursor-pointer capitalize flex-1 justify-center"
                  onClick={() => setTextAlignment(align)}
                >
                  {align}
                </Badge>
              ))}
            </div>
          </div>
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => onAIAction("apply_layout", { textPosition, textAlignment })}
            disabled={isProcessing}
          >
            {isProcessing && processingAction === "apply_layout" ? (
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            ) : (
              <Layout className="h-3 w-3 mr-2" />
            )}
            Apply Layout
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Color & Contrast Section */}
      <Collapsible open={openSections.color} onOpenChange={() => toggleSection("color")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/30 rounded-md px-2 transition-colors">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="text-sm font-medium">Color & Contrast</span>
          </div>
          {openSections.color ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <SunMedium className="h-3 w-3" />
                Brightness
              </Label>
              <span className="text-xs text-muted-foreground">{brightness[0]}%</span>
            </div>
            <Slider
              value={brightness}
              onValueChange={setBrightness}
              min={0}
              max={200}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <Contrast className="h-3 w-3" />
                Contrast
              </Label>
              <span className="text-xs text-muted-foreground">{contrast[0]}%</span>
            </div>
            <Slider
              value={contrast}
              onValueChange={setContrast}
              min={0}
              max={200}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <Droplets className="h-3 w-3" />
                Saturation
              </Label>
              <span className="text-xs text-muted-foreground">{saturation[0]}%</span>
            </div>
            <Slider
              value={saturation}
              onValueChange={setSaturation}
              min={0}
              max={200}
              step={1}
            />
          </div>
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => onAIAction("apply_color", { brightness: brightness[0], contrast: contrast[0], saturation: saturation[0] })}
            disabled={isProcessing}
          >
            {isProcessing && processingAction === "apply_color" ? (
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            ) : (
              <Palette className="h-3 w-3 mr-2" />
            )}
            Apply Adjustments
          </Button>
        </CollapsibleContent>
      </Collapsible>

      <div className="border-t border-border my-4" />

      {/* Generate Variants CTA */}
      <Button
        className="w-full h-12 text-base font-semibold gap-2"
        onClick={onGenerateVariants}
        disabled={isProcessing || !imageUrl}
      >
        {isProcessing && processingAction === "generate_variants" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        Generate Variants
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Create multiple variations for A/B testing
      </p>
    </div>
  );
};

export default ImageEditorControls;
