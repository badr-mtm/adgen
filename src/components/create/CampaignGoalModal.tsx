import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  TrendingUp, 
  Sparkles, 
  ShoppingCart, 
  Users, 
  Smartphone,
  ArrowLeft,
  ArrowRight,
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
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="p-8"
        >
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What do you want your campaign to achieve?
              </h2>
              <p className="text-muted-foreground">
                Choose a goal that aligns with your business objectives
              </p>
            </motion.div>
          </div>

          {/* Content Grid */}
          <div className="flex gap-8">
            {/* Goals List - Left Panel */}
            <div className="w-56 space-y-2 flex-shrink-0">
              {GOALS.map((goal) => {
                const IconComponent = goal.icon;
                const isSelected = selectedGoal === goal.id;
                
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all
                      ${isSelected 
                        ? "border-primary bg-background shadow-sm" 
                        : "border-border hover:border-muted-foreground/50 bg-background"
                      }
                    `}
                  >
                    {/* Radio Circle */}
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${isSelected ? "border-primary" : "border-muted-foreground/50"}
                    `}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                      )}
                    </div>
                    
                    {/* Icon */}
                    <IconComponent className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    
                    {/* Label */}
                    <span className={`font-medium text-sm ${isSelected ? "text-foreground" : "text-foreground"}`}>
                      {goal.label}
                    </span>
                    
                    {/* New Badge */}
                    {goal.isNew && (
                      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-0">
                        New
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Goal Details - Right Panel */}
            <div className="flex-1 border-l border-border pl-8">
              <AnimatePresence mode="wait">
                {selectedGoalData && (
                  <motion.div
                    key={selectedGoalData.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-6"
                  >
                    {/* Illustration */}
                    <div className="flex justify-start py-4">
                      <div className="relative">
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                          <selectedGoalData.icon className="h-14 w-14 text-primary" />
                        </div>
                        <motion.div
                          animate={{ 
                            y: [0, -4, 0],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          className="absolute -top-1 -right-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-primary">
                            <path d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5L6 0Z" fill="currentColor" opacity="0.6"/>
                          </svg>
                        </motion.div>
                        <motion.div
                          animate={{ 
                            y: [0, -3, 0],
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 0.3
                          }}
                          className="absolute top-2 -right-4"
                        >
                          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" className="text-primary">
                            <path d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5L6 0Z" fill="currentColor" opacity="0.4"/>
                          </svg>
                        </motion.div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {selectedGoalData.label}
                      </h3>
                      <p className="text-muted-foreground text-sm">
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
                            <span className="text-sm text-primary">{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ad Delivery */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Ad delivery</h4>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-primary">{selectedGoalData.adDelivery}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Next Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-8 pt-6 border-t border-border"
          >
            <Button
              size="lg"
              onClick={() => onGenerate(selectedGoal)}
              disabled={isGenerating}
              className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 group transition-all duration-300"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}