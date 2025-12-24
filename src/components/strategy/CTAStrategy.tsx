import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MousePointer, Volume2, Clock } from "lucide-react";

interface CTAValue {
  text: string;
  strength: "soft" | "direct";
  placement: "early" | "mid" | "end";
}

interface CTAStrategyProps {
  value: CTAValue;
  onChange: (value: CTAValue) => void;
  disabled?: boolean;
}

const ctaExamples = [
  "Visit your nearest location",
  "Discover the difference",
  "Book your free consultation",
  "Learn more at [brand].com",
  "Available now at leading retailers",
];

const strengthOptions = [
  { id: "soft" as const, label: "Soft", description: "Suggestive, brand-focused" },
  { id: "direct" as const, label: "Direct", description: "Clear action request" },
];

const placementOptions = [
  { id: "early" as const, label: "Early", timing: "First third" },
  { id: "mid" as const, label: "Mid", timing: "Center" },
  { id: "end" as const, label: "End", timing: "Final moments" },
];

export function CTAStrategy({ value, onChange, disabled }: CTAStrategyProps) {
  return (
    <div className="space-y-5">
      {/* CTA Text */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MousePointer className="h-4 w-4 text-primary" />
          Call-to-Action Text
        </Label>
        <Input
          value={value.text}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          placeholder="Enter your CTA..."
          disabled={disabled}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {ctaExamples.map((example) => (
            <button
              key={example}
              onClick={() => !disabled && onChange({ ...value, text: example })}
              disabled={disabled}
              className={cn(
                "text-xs px-2 py-1 rounded-full border border-border hover:border-primary/30 hover:bg-primary/5 transition-all",
                value.text === example && "bg-primary/10 border-primary/30",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Strength */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-primary" />
          CTA Strength
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {strengthOptions.map((option) => {
            const isSelected = value.strength === option.id;
            return (
              <button
                key={option.id}
                onClick={() => !disabled && onChange({ ...value, strength: option.id })}
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

      {/* CTA Placement */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          CTA Placement
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {placementOptions.map((option) => {
            const isSelected = value.placement === option.id;
            return (
              <button
                key={option.id}
                onClick={() => !disabled && onChange({ ...value, placement: option.id })}
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
                    "text-sm font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {option.label}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {option.timing}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
