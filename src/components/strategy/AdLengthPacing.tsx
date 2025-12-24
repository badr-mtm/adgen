import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Clock, Zap, Scale, Film } from "lucide-react";

type AdLength = "15s" | "30s" | "45s";
type Pacing = "fast" | "balanced" | "cinematic";

interface AdLengthPacingProps {
  adLength: AdLength;
  pacing: Pacing;
  hookTiming: number;
  logoRevealTiming: number;
  onChange: (updates: Partial<{
    adLength: AdLength;
    pacing: Pacing;
    hookTiming: number;
    logoRevealTiming: number;
  }>) => void;
  disabled?: boolean;
}

const lengths = [
  { id: "15s" as const, label: "15 seconds", description: "Quick impact, high recall" },
  { id: "30s" as const, label: "30 seconds", description: "Standard TV spot length" },
  { id: "45s" as const, label: "45 seconds", description: "Extended storytelling" },
];

const pacingOptions = [
  { id: "fast" as const, label: "Fast", icon: Zap, description: "Quick cuts, high energy" },
  { id: "balanced" as const, label: "Balanced", icon: Scale, description: "Natural rhythm" },
  { id: "cinematic" as const, label: "Cinematic", icon: Film, description: "Slower, dramatic" },
];

export function AdLengthPacing({
  adLength,
  pacing,
  hookTiming,
  logoRevealTiming,
  onChange,
  disabled,
}: AdLengthPacingProps) {
  const maxSeconds = parseInt(adLength.replace("s", ""));

  return (
    <div className="space-y-6">
      {/* Ad Length Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Ad Length
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {lengths.map((length) => {
            const isSelected = adLength === length.id;
            return (
              <button
                key={length.id}
                onClick={() => !disabled && onChange({ adLength: length.id })}
                disabled={disabled}
                className={cn(
                  "p-3 rounded-xl border text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "text-lg font-bold",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {length.label}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {length.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pacing Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Pacing Profile</Label>
        <div className="grid grid-cols-3 gap-3">
          {pacingOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = pacing === option.id;
            return (
              <button
                key={option.id}
                onClick={() => !disabled && onChange({ pacing: option.id })}
                disabled={disabled}
                className={cn(
                  "p-3 rounded-xl border text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 mx-auto mb-1",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {option.label}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timing Sliders */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Hook Timing</Label>
            <span className="text-sm text-primary font-medium">{hookTiming}s</span>
          </div>
          <Slider
            value={[hookTiming]}
            onValueChange={([value]) => onChange({ hookTiming: value })}
            max={Math.min(5, maxSeconds)}
            min={1}
            step={0.5}
            disabled={disabled}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Grab attention within this window
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Logo Reveal</Label>
            <span className="text-sm text-primary font-medium">{logoRevealTiming}s</span>
          </div>
          <Slider
            value={[logoRevealTiming]}
            onValueChange={([value]) => onChange({ logoRevealTiming: value })}
            max={maxSeconds}
            min={Math.floor(maxSeconds * 0.5)}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            When to reveal your brand
          </p>
        </div>
      </div>
    </div>
  );
}
