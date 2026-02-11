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
    color: "bg-blue-500/10 text-blue-600 border-blue-500/50 dark:text-blue-400",
    selectedColor: "bg-blue-50 border-blue-500 ring-blue-500/20 dark:bg-blue-500/20 dark:border-blue-400",
  },
  {
    id: "consideration" as const,
    label: "Consideration",
    description: "Drive interest and evaluation",
    icon: Target,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/50 dark:text-amber-400",
    selectedColor: "bg-amber-50 border-amber-500 ring-amber-500/20 dark:bg-amber-500/20 dark:border-amber-400",
  },
  {
    id: "promotion" as const,
    label: "Promotion",
    description: "Highlight offers and drive action",
    icon: Tag,
    color: "bg-green-500/10 text-green-600 border-green-500/50 dark:text-green-400",
    selectedColor: "bg-green-50 border-green-500 ring-green-500/20 dark:bg-green-500/20 dark:border-green-400",
  },
  {
    id: "brand_launch" as const,
    label: "Brand Launch",
    description: "Introduce a new brand to market",
    icon: Rocket,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/50 dark:text-purple-400",
    selectedColor: "bg-purple-50 border-purple-500 ring-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400",
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
              "p-4 rounded-xl border text-left transition-all relative overflow-hidden group",
              isSelected
                ? cn("border-2 shadow-md ring-1", objective.selectedColor)
                : "bg-card border-border shadow-sm hover:shadow-md hover:border-primary/30 hover:bg-accent/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-start gap-3 relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  isSelected ? "bg-white/50 dark:bg-black/20" : "bg-muted group-hover:bg-background"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isSelected ? objective.color.split(" ")[1] : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
              </div>
              <div>
                <h4 className={cn("font-medium", isSelected ? objective.color.split(" ")[1] : "text-foreground")}>{objective.label}</h4>
                <p className={cn("text-xs mt-0.5", isSelected ? "text-foreground/80" : "text-muted-foreground")}>
                  {objective.description}
                </p>
              </div>
            </div>

            {/* Background Gradient decoration for selected state */}
            {isSelected && (
              <div className={cn("absolute inset-0 opacity-10 pointer-events-none", objective.color.split(" ")[0])} />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
