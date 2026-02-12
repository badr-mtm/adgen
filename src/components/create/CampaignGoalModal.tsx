import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Megaphone,
  TrendingUp,
  Sparkles,
  ShoppingCart,
  Users,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Target
} from "lucide-react";

interface CampaignGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onGenerate: (goal: string) => void;
  isGenerating: boolean;
}

const GOALS = [
  { id: "awareness", label: "Awareness", icon: Megaphone, description: "Maximize brand visibility across premium networks." },
  { id: "traffic", label: "Traffic", icon: TrendingUp, description: "Drive high-intent viewers to your landing page." },
  { id: "sales", label: "Conversions", icon: ShoppingCart, description: "Optimize for sales and lower-funnel actions." },
  { id: "retargeting", label: "Retargeting", icon: Users, description: "Re-engage users who visited but didn't convert." },
];

export function CampaignGoalModal({
  open,
  onOpenChange,
  onBack,
  onGenerate,
  isGenerating
}: CampaignGoalModalProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>("awareness");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl bg-background border-border p-0 overflow-hidden h-[600px] shadow-2xl">
        <div className="flex h-full">

          {/* Left Sidebar: Goal Selection */}
          <div className="w-[320px] border-r border-border p-6 flex flex-col bg-card">
            <div className="mb-6">
              <button onClick={onBack} className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2 text-sm transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Vision
              </button>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Select Objective</h2>
              <p className="text-muted-foreground text-sm mt-1">What defines success?</p>
            </div>

            <RadioGroup value={selectedGoal} onValueChange={setSelectedGoal} className="space-y-2 flex-1 overflow-y-auto">
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                const isSelected = selectedGoal === goal.id;
                return (
                  <label
                    key={goal.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 ${isSelected
                        ? "border-primary bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                        : "border-border hover:border-primary bg-muted/30"
                      }`}
                  >
                    <RadioGroupItem value={goal.id} id={goal.id} className="shrink-0" />
                    <div className={`p-2 rounded-lg transition-all duration-200 ${isSelected ? "bg-primary/20" : "bg-muted group-hover:bg-primary/20 group-hover:scale-110"}`}>
                      <Icon className={`h-5 w-5 transition-colors ${isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>{goal.label}</div>
                    </div>
                  </label>
                )
              })}
            </RadioGroup>
          </div>

          {/* Right Content: Visualization & Confirmation */}
          <div className="flex-1 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <AnimatePresence mode="wait">
              {GOALS.filter(g => g.id === selectedGoal).map(goal => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 h-full flex flex-col p-10 justify-center items-start"
                >
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
                    <goal.icon className="h-10 w-10 text-primary-foreground" />
                  </div>

                  <h2 className="text-4xl font-black text-foreground mb-3 tracking-tight">{goal.label} Campaign</h2>
                  <p className="text-lg text-muted-foreground max-w-lg leading-relaxed mb-8">{goal.description}</p>

                  <div className="space-y-4 mb-10 w-full max-w-md">
                    <div className="flex items-center gap-3 text-muted-foreground p-3 rounded-lg bg-muted/50 border border-border">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="text-sm">Optimizes for <strong className="text-foreground">Bottom Funnel</strong> actions</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground p-3 rounded-lg bg-muted/50 border border-border">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="text-sm">AI Suggested Bid Strategy: <strong className="text-foreground">Maximize Conversions</strong></span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={() => onGenerate(selectedGoal)}
                    disabled={isGenerating}
                    className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all w-full max-w-xs shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                  >
                    {isGenerating ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Configuring AI...</>
                    ) : (
                      <>Next Step <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
