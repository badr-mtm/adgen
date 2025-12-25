import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  ArrowRight, 
  Palette,
  Volume2,
  Type,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Film
} from "lucide-react";

export interface ProductionSettings {
  visualStyle: string;
  paceLevel: number;
  hasVoiceover: boolean;
  hasCaptions: boolean;
  ctaVariant: string;
}

interface CreativeProductionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onContinue: (settings: ProductionSettings) => void;
  conceptTitle: string;
  duration: string;
}

const VISUAL_STYLES = [
  { id: "cinematic", label: "Cinematic", description: "Film-like quality" },
  { id: "modern", label: "Modern Minimal", description: "Clean & sleek" },
  { id: "vibrant", label: "Vibrant", description: "Bold & colorful" },
  { id: "documentary", label: "Documentary", description: "Authentic feel" },
];

const CTA_VARIANTS = [
  { id: "url", label: "Visit Website" },
  { id: "phone", label: "Call Now" },
  { id: "qr", label: "Scan QR Code" },
  { id: "social", label: "Follow Us" },
];

const COMPLIANCE_CHECKS = [
  { id: "safe_frames", label: "Safe Frames", status: "pass" },
  { id: "text_size", label: "Text Size (≥24pt)", status: "pass" },
  { id: "duration", label: "Duration Compliance", status: "pass" },
  { id: "audio_levels", label: "Audio Levels", status: "warning" },
];

export function CreativeProductionModal({
  open,
  onOpenChange,
  onBack,
  onContinue,
  conceptTitle,
  duration
}: CreativeProductionModalProps) {
  const [visualStyle, setVisualStyle] = useState("cinematic");
  const [paceLevel, setPaceLevel] = useState([50]);
  const [hasVoiceover, setHasVoiceover] = useState(true);
  const [hasCaptions, setHasCaptions] = useState(true);
  const [ctaVariant, setCtaVariant] = useState("url");

  const handleContinue = () => {
    onContinue({
      visualStyle,
      paceLevel: paceLevel[0],
      hasVoiceover,
      hasCaptions,
      ctaVariant,
    });
  };

  const getPaceLabel = (value: number) => {
    if (value < 33) return "Slow & Deliberate";
    if (value < 66) return "Balanced";
    return "Fast & Dynamic";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Film className="h-5 w-5 text-primary" />
                Creative Production
              </h2>
              <p className="text-sm text-muted-foreground">
                Customize your "{conceptTitle}" ({duration})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Controls */}
            <div className="col-span-2 space-y-6">
              {/* Visual Style */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Palette className="h-5 w-5 text-primary" />
                  Visual Style
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {VISUAL_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setVisualStyle(style.id)}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all
                        ${visualStyle === style.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-muted-foreground/30"
                        }
                      `}
                    >
                      <div className="font-semibold text-foreground">{style.label}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Zap className="h-5 w-5 text-primary" />
                    Pacing
                  </div>
                  <Badge variant="secondary">{getPaceLabel(paceLevel[0])}</Badge>
                </div>
                <Slider
                  value={paceLevel}
                  onValueChange={setPaceLevel}
                  max={100}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slow</span>
                  <span>Balanced</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Audio Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Volume2 className="h-5 w-5 text-primary" />
                  Audio & Text
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                    <Label htmlFor="voiceover" className="text-foreground cursor-pointer">
                      Professional Voiceover
                    </Label>
                    <Switch
                      id="voiceover"
                      checked={hasVoiceover}
                      onCheckedChange={setHasVoiceover}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                    <Label htmlFor="captions" className="text-foreground cursor-pointer">
                      On-Screen Captions
                    </Label>
                    <Switch
                      id="captions"
                      checked={hasCaptions}
                      onCheckedChange={setHasCaptions}
                    />
                  </div>
                </div>
              </div>

              {/* CTA Variant */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Type className="h-5 w-5 text-primary" />
                  Call-to-Action Style
                </div>
                <div className="flex flex-wrap gap-2">
                  {CTA_VARIANTS.map((cta) => (
                    <Badge
                      key={cta.id}
                      variant={ctaVariant === cta.id ? "default" : "outline"}
                      className={`
                        cursor-pointer py-2 px-4 transition-all
                        ${ctaVariant === cta.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-secondary"
                        }
                      `}
                      onClick={() => setCtaVariant(cta.id)}
                    >
                      {cta.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Preview & Compliance */}
            <div className="space-y-4">
              {/* Preview Placeholder */}
              <div className="aspect-video rounded-xl bg-muted flex items-center justify-center border border-border">
                <div className="text-center space-y-2">
                  <Play className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Preview</p>
                </div>
              </div>

              {/* Compliance Checks */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
                <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  TV Compliance Check
                </div>
                <div className="space-y-2">
                  {COMPLIANCE_CHECKS.map((check) => (
                    <div key={check.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{check.label}</span>
                      {check.status === "pass" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cut-down Suggestions */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="text-sm font-medium text-foreground mb-2">
                  AI Suggestions
                </div>
                <p className="text-xs text-muted-foreground">
                  Your {duration} spot can be automatically cut down to 15s and 6s versions for higher frequency campaigns.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleContinue}
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm Strategy
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
