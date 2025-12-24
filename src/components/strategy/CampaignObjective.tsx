import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Target, Eye, Tag, Rocket } from "lucide-react";

type ObjectiveType = "awareness" | "consideration" | "promotion" | "brand_launch";

const objectives = [
  {
    id: "awareness" as const,
    label: "Awareness",
    description: "Build broad recognition and recall",
    icon: Eye,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  },
  {
    id: "consideration" as const,
    label: "Consideration",
    description: "Drive interest and evaluation",
    icon: Target,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  },
  {
    id: "promotion" as const,
    label: "Promotion",
    description: "Highlight offers and drive action",
    icon: Tag,
    color: "bg-green-500/10 text-green-500 border-green-500/30",
  },
  {
    id: "brand_launch" as const,
    label: "Brand Launch",
    description: "Introduce a new brand to market",
    icon: Rocket,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  },
];

interface CampaignObjectiveProps {
  value: ObjectiveType;
  onChange: (value: ObjectiveType) => void;
  disabled?: boolean;
}

export function CampaignObjective({
  value,
  onChange,
  disabled,
}: CampaignObjectiveProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {objectives.map((objective) => {
        const Icon = objective.icon;
        const isSelected = value === objective.id;

        return (
          <motion.button
            key={objective.id}
            onClick={() => !disabled && onChange(objective.id)}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            disabled={disabled}
            className={cn(
              "p-4 rounded-xl border text-left transition-all",
              isSelected
                ? `${objective.color} border-2`
                : "border-border hover:border-primary/30 bg-muted/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isSelected ? objective.color : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isSelected ? "" : "text-muted-foreground"
                  )}
                />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{objective.label}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {objective.description}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
