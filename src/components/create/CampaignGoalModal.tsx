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
      <DialogContent className="sm:max-w-5xl bg-black/90 border-white/10 p-0 overflow-hidden h-[600px] backdrop-blur-2xl shadow-2xl">
        <div className="flex h-full">

          {/* Left Sidebar: Goal Selection */}
          <div className="w-[320px] border-r border-white/10 p-6 flex flex-col bg-card/20">
            <div className="mb-6">
              <button onClick={onBack} className="text-muted-foreground hover:text-white mb-4 flex items-center gap-2 text-sm transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Vision
              </button>
              <h2 className="text-xl font-bold text-white tracking-tight">Select Objective</h2>
              <p className="text-muted-foreground text-sm mt-1">What defines success?</p>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                const isSelected = selectedGoal === goal.id;
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-300 group ${isSelected
                        ? "bg-primary text-white border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                        : "bg-white/5 border-transparent hover:bg-white/10 text-muted-foreground hover:text-white"
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-white/20" : "bg-black/20 group-hover:bg-black/40"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{goal.label}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Content: Visualization & Confirmation */}
          <div className="flex-1 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-indigo-950/30" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

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
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
                    <goal.icon className="h-10 w-10 text-white" />
                  </div>

                  <h2 className="text-4xl font-black text-white mb-3 tracking-tight">{goal.label} Campaign</h2>
                  <p className="text-lg text-white/70 max-w-lg leading-relaxed mb-8">{goal.description}</p>

                  <div className="space-y-4 mb-10 w-full max-w-md">
                    <div className="flex items-center gap-3 text-white/80 p-3 rounded-lg bg-white/5 border border-white/5">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="text-sm">Optimizes for <strong className="text-white">Bottom Funnel</strong> actions</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/80 p-3 rounded-lg bg-white/5 border border-white/5">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="text-sm">AI Suggested Bid Strategy: <strong className="text-white">Maximize Conversions</strong></span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={() => onGenerate(selectedGoal)}
                    disabled={isGenerating}
                    className="h-14 px-8 text-lg bg-white text-black hover:bg-white/90 hover:scale-105 transition-all w-full max-w-xs shadow-[0_0_30px_rgba(255,255,255,0.2)]"
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