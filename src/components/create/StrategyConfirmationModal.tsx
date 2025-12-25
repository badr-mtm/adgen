import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft,
  ArrowRight, 
  DollarSign,
  Calendar,
  Clock,
  Target,
  BarChart3,
  Edit2,
  Lock,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from "lucide-react";

export interface StrategyConfirmationData {
  budgetAllocation: number;
  flightingPattern: string;
  deliveryTiming: string;
  placementStrategy: string;
  frequencyCap: number;
}

interface StrategyConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onContinue: (data: StrategyConfirmationData) => void;
  aiRecommendations: {
    budgetAllocation: number;
    flightingPattern: string;
    deliveryTiming: string;
    placementStrategy: string;
    frequencyCap: number;
  };
}

const FLIGHTING_PATTERNS = [
  { id: "continuous", label: "Continuous", description: "Steady presence" },
  { id: "pulsing", label: "Pulsing", description: "Peaks & valleys" },
  { id: "flighting", label: "Flighting", description: "On/off cycles" },
];

const DELIVERY_TIMINGS = [
  { id: "prime", label: "Prime Time", window: "8PM - 11PM" },
  { id: "fringe", label: "Fringe", window: "6PM - 8PM, 11PM - 1AM" },
  { id: "daytime", label: "Daytime", window: "9AM - 4PM" },
  { id: "mixed", label: "Mixed Dayparts", window: "All day" },
];

const PLACEMENT_STRATEGIES = [
  { id: "premium", label: "Premium Networks", cpm: "High CPM" },
  { id: "balanced", label: "Balanced Mix", cpm: "Medium CPM" },
  { id: "reach", label: "Reach Optimized", cpm: "Lower CPM" },
];

export function StrategyConfirmationModal({
  open,
  onOpenChange,
  onBack,
  onContinue,
  aiRecommendations
}: StrategyConfirmationModalProps) {
  const [budgetAllocation, setBudgetAllocation] = useState([aiRecommendations.budgetAllocation]);
  const [flightingPattern, setFlightingPattern] = useState(aiRecommendations.flightingPattern);
  const [deliveryTiming, setDeliveryTiming] = useState(aiRecommendations.deliveryTiming);
  const [placementStrategy, setPlacementStrategy] = useState(aiRecommendations.placementStrategy);
  const [frequencyCap, setFrequencyCap] = useState([aiRecommendations.frequencyCap]);

  const [editingField, setEditingField] = useState<string | null>(null);

  const handleContinue = () => {
    onContinue({
      budgetAllocation: budgetAllocation[0],
      flightingPattern,
      deliveryTiming,
      placementStrategy,
      frequencyCap: frequencyCap[0],
    });
  };

  const getImpactIndicator = (field: string) => {
    const isModified = (() => {
      switch (field) {
        case "budget": return budgetAllocation[0] !== aiRecommendations.budgetAllocation;
        case "flighting": return flightingPattern !== aiRecommendations.flightingPattern;
        case "timing": return deliveryTiming !== aiRecommendations.deliveryTiming;
        case "placement": return placementStrategy !== aiRecommendations.placementStrategy;
        case "frequency": return frequencyCap[0] !== aiRecommendations.frequencyCap;
        default: return false;
      }
    })();

    if (!isModified) return null;

    // Simplified impact indicators
    const impacts: Record<string, { positive: string; negative: string }> = {
      budget: { positive: "Higher reach", negative: "Lower frequency" },
      flighting: { positive: "Better peaks", negative: "Reduced consistency" },
      timing: { positive: "Different audience", negative: "Variable costs" },
      placement: { positive: "Adjusted CPM", negative: "Reach trade-off" },
      frequency: { positive: "More impressions", negative: "Ad fatigue risk" },
    };

    return impacts[field];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-card border-border p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
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
                <Target className="h-5 w-5 text-primary" />
                Confirm Strategy
              </h2>
              <p className="text-sm text-muted-foreground">
                Review AI recommendations and adjust as needed
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Budget Allocation */}
            <div className="p-5 rounded-xl bg-secondary/30 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Budget Allocation</span>
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    AI Optimized
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditingField(editingField === "budget" ? null : "budget")}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              
              {editingField === "budget" ? (
                <div className="space-y-3">
                  <Slider
                    value={budgetAllocation}
                    onValueChange={setBudgetAllocation}
                    max={100}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative</span>
                    <span className="font-medium text-foreground">{budgetAllocation[0]}%</span>
                    <span>Aggressive</span>
                  </div>
                  {getImpactIndicator("budget") && (
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-emerald-500">
                        <TrendingUp className="h-3 w-3" />
                        {getImpactIndicator("budget")?.positive}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <TrendingDown className="h-3 w-3" />
                        {getImpactIndicator("budget")?.negative}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {budgetAllocation[0]}% <span className="text-sm font-normal text-muted-foreground">of total budget</span>
                </div>
              )}
            </div>

            {/* Flighting Pattern */}
            <div className="p-5 rounded-xl bg-secondary/30 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Schedule & Flighting</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditingField(editingField === "flighting" ? null : "flighting")}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              
              {editingField === "flighting" ? (
                <div className="grid grid-cols-3 gap-3">
                  {FLIGHTING_PATTERNS.map((pattern) => (
                    <button
                      key={pattern.id}
                      onClick={() => setFlightingPattern(pattern.id)}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all
                        ${flightingPattern === pattern.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-muted-foreground/30"
                        }
                      `}
                    >
                      <div className="font-medium text-foreground text-sm">{pattern.label}</div>
                      <div className="text-xs text-muted-foreground">{pattern.description}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-lg font-medium text-foreground capitalize">
                  {flightingPattern} <span className="text-sm font-normal text-muted-foreground">pattern</span>
                </div>
              )}
            </div>

            {/* Delivery Timing */}
            <div className="p-5 rounded-xl bg-secondary/30 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Delivery Timing</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditingField(editingField === "timing" ? null : "timing")}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              
              {editingField === "timing" ? (
                <div className="grid grid-cols-2 gap-3">
                  {DELIVERY_TIMINGS.map((timing) => (
                    <button
                      key={timing.id}
                      onClick={() => setDeliveryTiming(timing.id)}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all
                        ${deliveryTiming === timing.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-muted-foreground/30"
                        }
                      `}
                    >
                      <div className="font-medium text-foreground text-sm">{timing.label}</div>
                      <div className="text-xs text-muted-foreground">{timing.window}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-lg font-medium text-foreground">
                  {DELIVERY_TIMINGS.find(t => t.id === deliveryTiming)?.label}
                </div>
              )}
            </div>

            {/* Frequency Cap */}
            <div className="p-5 rounded-xl bg-secondary/30 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Frequency Cap</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditingField(editingField === "frequency" ? null : "frequency")}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              
              {editingField === "frequency" ? (
                <div className="space-y-3">
                  <Slider
                    value={frequencyCap}
                    onValueChange={setFrequencyCap}
                    min={1}
                    max={15}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1x/week</span>
                    <span className="font-medium text-foreground">{frequencyCap[0]}x per week</span>
                    <span>15x/week</span>
                  </div>
                </div>
              ) : (
                <div className="text-lg font-medium text-foreground">
                  {frequencyCap[0]}x <span className="text-sm font-normal text-muted-foreground">per week per viewer</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleContinue}
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Preview Campaign
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
