import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Megaphone, 
  TrendingUp, 
  Sparkles, 
  ShoppingCart, 
  Users, 
  Smartphone,
  ArrowLeft,
  Check,
  Loader2
} from "lucide-react";

interface CampaignGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onGenerate: (goal: string) => void;
  isGenerating: boolean;
}

const GOALS = [
  {
    id: "awareness",
    label: "Awareness",
    icon: Megaphone,
    description: "Reach more viewers to grow your brand.",
    useCases: [
      "Boost your brand visibility",
      "Target high intent audiences on premium and live sports channels"
    ],
    adDelivery: "Optimize for impressions"
  },
  {
    id: "traffic",
    label: "Traffic",
    icon: TrendingUp,
    isNew: true,
    description: "Drive viewers to your website or landing page.",
    useCases: [
      "Increase website visits",
      "Promote special offers and campaigns"
    ],
    adDelivery: "Optimize for link clicks"
  },
  {
    id: "leads",
    label: "Leads",
    icon: Sparkles,
    isNew: true,
    description: "Capture customer information and inquiries.",
    useCases: [
      "Generate qualified leads",
      "Build your email subscriber list"
    ],
    adDelivery: "Optimize for form submissions"
  },
  {
    id: "sales",
    label: "Sales",
    icon: ShoppingCart,
    isNew: true,
    description: "Drive purchases and conversions.",
    useCases: [
      "Increase product sales",
      "Promote limited-time offers"
    ],
    adDelivery: "Optimize for conversions"
  },
  {
    id: "retargeting",
    label: "Retargeting",
    icon: Users,
    description: "Re-engage viewers who know your brand.",
    useCases: [
      "Reconnect with past customers",
      "Remind viewers of abandoned carts"
    ],
    adDelivery: "Optimize for return visits"
  },
  {
    id: "app_promotion",
    label: "App Promotion",
    icon: Smartphone,
    description: "Drive app installs and engagement.",
    useCases: [
      "Increase app downloads",
      "Boost in-app engagement"
    ],
    adDelivery: "Optimize for app installs"
  },
];

export function CampaignGoalModal({ 
  open, 
  onOpenChange, 
  onBack,
  onGenerate,
  isGenerating 
}: CampaignGoalModalProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>("awareness");

  const selectedGoalData = GOALS.find(g => g.id === selectedGoal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Campaign Goal
              </h2>
              <p className="text-sm text-muted-foreground">
                What do you want this TV ad to achieve?
              </p>
            </div>
          </div>

          {/* Content Grid */}
          <div className="flex gap-8">
            {/* Goals List */}
            <div className="w-64 space-y-2 flex-shrink-0">
              {GOALS.map((goal) => {
                const IconComponent = goal.icon;
                const isSelected = selectedGoal === goal.id;
                
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`
                      w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-muted-foreground/30 bg-secondary/20"
                      }
                    `}
                  >
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}
                    `}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-primary-foreground"
                        />
                      )}
                    </div>
                    <IconComponent className={`h-5 w-5 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                      {goal.label}
                    </span>
                    {goal.isNew && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        New
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Goal Details */}
            <div className="flex-1 space-y-6">
              <AnimatePresence mode="wait">
                {selectedGoalData && (
                  <motion.div
                    key={selectedGoalData.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Illustration */}
                    <div className="flex justify-center py-6">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <selectedGoalData.icon className="h-16 w-16 text-primary" />
                        </div>
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center"
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {selectedGoalData.label}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedGoalData.description}
                      </p>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Use cases</h4>
                      <ul className="space-y-2">
                        {selectedGoalData.useCases.map((useCase, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ad Delivery */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Ad delivery</h4>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{selectedGoalData.adDelivery}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 pt-6 border-t border-border">
            <Button
              size="lg"
              onClick={() => onGenerate(selectedGoal)}
              disabled={isGenerating}
              className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Concepts...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Concepts
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
