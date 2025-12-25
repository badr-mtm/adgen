import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  ArrowRight, 
  Target, 
  Users, 
  Clock,
  Tv,
  Zap,
  BarChart3,
  Sparkles,
  Edit2,
  Check,
  Film,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export interface AIStrategy {
  campaignType: "brand" | "performance";
  recommendedLengths: string[];
  storytellingRequired: boolean;
  frequencyRange: string;
  airingWindows: string[];
  channelTypes: string[];
  budgetEfficiencyTier: "low" | "medium" | "high";
  messagingHierarchy: {
    hook: string;
    message: string;
    cta: string;
  };
}

interface StrategyReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onContinue: (strategy: AIStrategy, selectedLength: string) => void;
  strategy: AIStrategy | null;
  isLoading: boolean;
}

export function StrategyReviewModal({
  open,
  onOpenChange,
  onBack,
  onContinue,
  strategy,
  isLoading
}: StrategyReviewModalProps) {
  const [selectedLength, setSelectedLength] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  const handleContinue = () => {
    if (strategy && selectedLength) {
      onContinue(strategy, selectedLength);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                AI Strategy Draft
              </h2>
              <p className="text-sm text-muted-foreground">
                Review and customize your campaign strategy
              </p>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Auto-Generated
            </Badge>
          </div>

          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 animate-pulse">
                <Zap className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <div>
                <p className="text-foreground font-medium">Generating Strategy...</p>
                <p className="text-sm text-muted-foreground">Analyzing your campaign goals</p>
              </div>
            </div>
          ) : strategy ? (
            <div className="space-y-6">
              {/* Campaign Type Badge */}
              <div className="flex items-center gap-3">
                <Badge 
                  variant="secondary" 
                  className={`
                    py-2 px-4 text-sm
                    ${strategy.campaignType === "brand" 
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    }
                  `}
                >
                  <Target className="h-4 w-4 mr-2" />
                  {strategy.campaignType === "brand" ? "Brand Campaign" : "Performance Campaign"}
                </Badge>
                <Badge variant="outline" className="py-2 px-4">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {strategy.budgetEfficiencyTier.charAt(0).toUpperCase() + strategy.budgetEfficiencyTier.slice(1)} Pressure
                </Badge>
              </div>

              {/* Recommended Ad Lengths */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Clock className="h-5 w-5 text-primary" />
                  Recommended Ad Lengths
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {strategy.recommendedLengths.map((length) => (
                    <button
                      key={length}
                      onClick={() => setSelectedLength(length)}
                      className={`
                        p-4 rounded-xl border-2 text-center transition-all
                        ${selectedLength === length 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-muted-foreground/30"
                        }
                      `}
                    >
                      <div className="text-2xl font-bold text-foreground">{length}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {length === "6s" && "Bumper"}
                        {length === "15s" && "Standard"}
                        {length === "30s" && "Full Spot"}
                        {length === "60s" && "Extended"}
                      </div>
                      {selectedLength === length && (
                        <motion.div
                          layoutId="length-check"
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messaging Hierarchy */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Film className="h-5 w-5 text-primary" />
                  Messaging Hierarchy
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      Hook
                    </Badge>
                    <span className="text-sm text-foreground">{strategy.messagingHierarchy.hook}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Message
                    </Badge>
                    <span className="text-sm text-foreground">{strategy.messagingHierarchy.message}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      CTA
                    </Badge>
                    <span className="text-sm text-foreground">{strategy.messagingHierarchy.cta}</span>
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showDetails ? "Hide" : "Show"} detailed strategy
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Airing Windows</div>
                        <div className="flex flex-wrap gap-1">
                          {strategy.airingWindows.map((window) => (
                            <Badge key={window} variant="secondary" className="text-xs">
                              {window}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Channel Types</div>
                        <div className="flex flex-wrap gap-1">
                          {strategy.channelTypes.map((channel) => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Frequency Range</div>
                        <div className="font-medium text-foreground">{strategy.frequencyRange}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Storytelling</div>
                        <div className="font-medium text-foreground">
                          {strategy.storytellingRequired ? "Required" : "Repetition-based"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!selectedLength || isLoading}
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Generate Storyboards
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
