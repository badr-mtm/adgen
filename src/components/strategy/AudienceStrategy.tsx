import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Home } from "lucide-react";

interface AudienceValue {
  primary: string;
  secondary: string;
  viewingContext: string;
  ageRange: string;
  householdType: string;
  psychographicIntent: string;
}

interface AudienceStrategyProps {
  value: AudienceValue;
  onChange: (value: AudienceValue) => void;
  disabled?: boolean;
}

const viewingContexts = [
  "Prime Time",
  "Sports Events",
  "Family Viewing",
  "Late Night",
  "Morning Shows",
  "News Programming",
];

const householdTypes = [
  "Families with kids",
  "Young professionals",
  "Empty nesters",
  "Multi-generational",
  "Singles",
];

export function AudienceStrategy({
  value,
  onChange,
  disabled,
}: AudienceStrategyProps) {
  const toggleViewingContext = (context: string) => {
    if (disabled) return;
    const current = value.viewingContext.split(", ").filter(Boolean);
    const updated = current.includes(context)
      ? current.filter((c) => c !== context)
      : [...current, context];
    onChange({ ...value, viewingContext: updated.join(", ") });
  };

  return (
    <div className="space-y-4">
      {/* Primary & Secondary Audience */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Primary Audience
          </Label>
          <Textarea
            value={value.primary}
            onChange={(e) => onChange({ ...value, primary: e.target.value })}
            placeholder="e.g., Health-conscious parents aged 30-45..."
            className="min-h-[60px] resize-none"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Secondary Audience</Label>
          <Textarea
            value={value.secondary}
            onChange={(e) => onChange({ ...value, secondary: e.target.value })}
            placeholder="e.g., Fitness enthusiasts..."
            className="min-h-[60px] resize-none"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Viewing Context */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Viewing Context
        </Label>
        <div className="flex flex-wrap gap-2">
          {viewingContexts.map((context) => {
            const isSelected = value.viewingContext.includes(context);
            return (
              <Badge
                key={context}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary/10"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => toggleViewingContext(context)}
              >
                {context}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Age Range</Label>
          <Input
            value={value.ageRange}
            onChange={(e) => onChange({ ...value, ageRange: e.target.value })}
            placeholder="e.g., 25-54"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Home className="h-4 w-4 text-primary" />
            Household Type
          </Label>
          <select
            value={value.householdType}
            onChange={(e) =>
              onChange({ ...value, householdType: e.target.value })
            }
            disabled={disabled}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">Select household type...</option>
            {householdTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Psychographic Intent */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Psychographic Intent</Label>
        <Input
          value={value.psychographicIntent}
          onChange={(e) =>
            onChange({ ...value, psychographicIntent: e.target.value })
          }
          placeholder="e.g., Value-driven, quality-focused..."
          disabled={disabled}
        />
      </div>
    </div>
  );
}
