import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Heart, Sparkles, Zap, Shield } from "lucide-react";

type EmotionalAngle = "trust" | "aspiration" | "urgency" | "authority";

interface CoreMessageValue {
  primary: string;
  supporting: string;
  emotionalAngle: EmotionalAngle;
}

const emotionalAngles = [
  { id: "trust" as const, label: "Trust", icon: Shield, color: "text-blue-500" },
  { id: "aspiration" as const, label: "Aspiration", icon: Sparkles, color: "text-amber-500" },
  { id: "urgency" as const, label: "Urgency", icon: Zap, color: "text-red-500" },
  { id: "authority" as const, label: "Authority", icon: Heart, color: "text-purple-500" },
];

interface CoreMessageProps {
  value?: CoreMessageValue;
  onChange: (value: CoreMessageValue) => void;
  disabled?: boolean;
}

const defaultValue: CoreMessageValue = {
  primary: "",
  supporting: "",
  emotionalAngle: "trust"
};

export function CoreMessage({ value, onChange, disabled }: CoreMessageProps) {
  const safeValue = value ?? defaultValue;
  
  return (
    <div className="space-y-4">
      {/* Primary Message */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Primary Message</Label>
        <Textarea
          value={safeValue.primary}
          onChange={(e) => onChange({ ...safeValue, primary: e.target.value })}
          placeholder="One sentence that captures your core value proposition..."
          className="min-h-[80px] resize-none"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          This message will anchor the narrative arc of your TV ad.
        </p>
      </div>

      {/* Supporting Message */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Supporting Message</Label>
        <Input
          value={safeValue.supporting}
          onChange={(e) => onChange({ ...safeValue, supporting: e.target.value })}
          placeholder="Additional context or proof point..."
          disabled={disabled}
        />
      </div>

      {/* Emotional Angle */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Emotional Angle</Label>
        <div className="grid grid-cols-4 gap-2">
          {emotionalAngles.map((angle) => {
            const Icon = angle.icon;
            const isSelected = safeValue.emotionalAngle === angle.id;

            return (
              <button
                key={angle.id}
                onClick={() =>
                  !disabled && onChange({ ...safeValue, emotionalAngle: angle.id })
                }
                disabled={disabled}
                className={cn(
                  "p-3 rounded-lg border text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 mx-auto mb-1",
                    isSelected ? angle.color : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs",
                    isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {angle.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
