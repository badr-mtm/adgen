import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, Heart, Award, Gift } from "lucide-react";

type FrameworkType =
  | "problem_solution"
  | "emotional_build"
  | "authority_proof"
  | "offer_driven";

const frameworks = [
  {
    id: "problem_solution" as const,
    label: "Problem → Solution → Brand",
    description: "Show the pain point, reveal your solution, and close with brand recall.",
    icon: ArrowRight,
    diagram: ["Problem", "→", "Solution", "→", "Brand"],
    whenToUse: "Best for products that solve clear, relatable problems.",
    tvAdvantage: "Creates emotional tension that keeps viewers watching.",
  },
  {
    id: "emotional_build" as const,
    label: "Emotional Build → Brand Reveal",
    description: "Build an emotional story arc, then reveal the brand as the resolution.",
    icon: Heart,
    diagram: ["Story", "→", "Emotion", "→", "Reveal"],
    whenToUse: "Ideal for brand awareness and emotional connection.",
    tvAdvantage: "Maximizes the cinematic power of TV storytelling.",
  },
  {
    id: "authority_proof" as const,
    label: "Authority / Proof-Led",
    description: "Lead with credibility, testimonials, or expertise.",
    icon: Award,
    diagram: ["Authority", "→", "Proof", "→", "Trust"],
    whenToUse: "Great for healthcare, finance, or premium brands.",
    tvAdvantage: "Builds instant credibility with broadcast reach.",
  },
  {
    id: "offer_driven" as const,
    label: "Offer-Driven",
    description: "Lead with a compelling offer or promotion.",
    icon: Gift,
    diagram: ["Offer", "→", "Value", "→", "Action"],
    whenToUse: "Perfect for seasonal campaigns and limited-time offers.",
    tvAdvantage: "Drives immediate response and measurable action.",
  },
];

interface StorytellingFrameworkProps {
  value: FrameworkType;
  onChange: (value: FrameworkType) => void;
  disabled?: boolean;
}

export function StorytellingFramework({
  value,
  onChange,
  disabled,
}: StorytellingFrameworkProps) {
  return (
    <div className="space-y-3">
      {frameworks.map((framework) => {
        const Icon = framework.icon;
        const isSelected = value === framework.id;

        return (
          <motion.button
            key={framework.id}
            onClick={() => !disabled && onChange(framework.id)}
            whileHover={disabled ? {} : { scale: 1.01 }}
            whileTap={disabled ? {} : { scale: 0.99 }}
            disabled={disabled}
            className={cn(
              "w-full p-4 rounded-xl border text-left transition-all",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-primary/20" : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">{framework.label}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {framework.description}
                </p>

                {/* Flow Diagram */}
                <div className="flex items-center gap-2 mt-3 text-xs">
                  {framework.diagram.map((step, i) => (
                    <span
                      key={i}
                      className={cn(
                        step === "→" ? "text-muted-foreground" : "",
                        step !== "→" && isSelected
                          ? "px-2 py-1 rounded bg-primary/10 text-primary font-medium"
                          : step !== "→"
                          ? "px-2 py-1 rounded bg-muted text-muted-foreground"
                          : ""
                      )}
                    >
                      {step}
                    </span>
                  ))}
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-border"
                  >
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">When to use:</span>
                        <p className="text-foreground mt-0.5">{framework.whenToUse}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">TV Advantage:</span>
                        <p className="text-foreground mt-0.5">{framework.tvAdvantage}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
