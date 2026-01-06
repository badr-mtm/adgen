import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Camera, Music, Mic, Palette } from "lucide-react";

interface VisualDirectionValue {
  tone: "cinematic" | "lifestyle" | "premium" | "dynamic";
  cameraMovement: "static" | "subtle" | "dynamic" | "dramatic";
  musicMood: string;
  voiceoverStyle: "warm" | "authoritative" | "energetic" | "conversational";
}

interface VisualAudioDirectionProps {
  value?: VisualDirectionValue;
  onChange: (value: VisualDirectionValue) => void;
  disabled?: boolean;
}

const defaultValue: VisualDirectionValue = {
  tone: "cinematic",
  cameraMovement: "subtle",
  musicMood: "",
  voiceoverStyle: "warm"
};

const toneOptions = [
  { id: "cinematic" as const, label: "Cinematic", description: "Film-like, dramatic" },
  { id: "lifestyle" as const, label: "Lifestyle", description: "Natural, relatable" },
  { id: "premium" as const, label: "Premium", description: "Luxury, refined" },
  { id: "dynamic" as const, label: "Dynamic", description: "Energetic, fast-paced" },
];

const cameraOptions = [
  { id: "static" as const, label: "Static", description: "Fixed shots" },
  { id: "subtle" as const, label: "Subtle", description: "Gentle movement" },
  { id: "dynamic" as const, label: "Dynamic", description: "Active tracking" },
  { id: "dramatic" as const, label: "Dramatic", description: "Bold sweeps" },
];

const voiceoverOptions = [
  { id: "warm" as const, label: "Warm", description: "Friendly, inviting" },
  { id: "authoritative" as const, label: "Authoritative", description: "Confident, expert" },
  { id: "energetic" as const, label: "Energetic", description: "Exciting, dynamic" },
  { id: "conversational" as const, label: "Conversational", description: "Natural, casual" },
];

const musicMoodSuggestions = [
  "Uplifting & Inspirational",
  "Corporate & Professional",
  "Emotional & Moving",
  "Upbeat & Energetic",
  "Calm & Reassuring",
  "Modern & Trendy",
];

export function VisualAudioDirection({
  value,
  onChange,
  disabled,
}: VisualAudioDirectionProps) {
  const safeValue = value ?? defaultValue;
  
  return (
    <div className="space-y-6">
      {/* Visual Tone */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          Visual Tone
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {toneOptions.map((option) => {
            const isSelected = safeValue.tone === option.id;
            return (
              <button
                key={option.id}
                onClick={() => !disabled && onChange({ ...safeValue, tone: option.id })}
                disabled={disabled}
                className={cn(
                  "p-2 rounded-lg border text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera Movement */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          Camera Movement
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {cameraOptions.map((option) => {
            const isSelected = safeValue.cameraMovement === option.id;
            return (
              <button
                key={option.id}
                onClick={() =>
                  !disabled && onChange({ ...safeValue, cameraMovement: option.id })
                }
                disabled={disabled}
                className={cn(
                  "p-2 rounded-lg border text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Music Mood */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          Music Mood
        </Label>
        <Input
          value={safeValue.musicMood}
          onChange={(e) => onChange({ ...safeValue, musicMood: e.target.value })}
          placeholder="Describe the music mood..."
          disabled={disabled}
        />
        <div className="flex flex-wrap gap-2">
          {musicMoodSuggestions.map((mood) => (
            <button
              key={mood}
              onClick={() => !disabled && onChange({ ...safeValue, musicMood: mood })}
              disabled={disabled}
              className={cn(
                "text-xs px-2 py-1 rounded-full border border-border hover:border-primary/30 hover:bg-primary/5 transition-all",
                safeValue.musicMood === mood && "bg-primary/10 border-primary/30",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Voiceover Style */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          Voiceover Style
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {voiceoverOptions.map((option) => {
            const isSelected = safeValue.voiceoverStyle === option.id;
            return (
              <button
                key={option.id}
                onClick={() =>
                  !disabled && onChange({ ...safeValue, voiceoverStyle: option.id })
                }
                disabled={disabled}
                className={cn(
                  "p-2 rounded-lg border text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
