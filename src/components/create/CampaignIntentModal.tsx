import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Target, 
  Users, 
  Palette, 
  MapPin, 
  DollarSign,
  Megaphone,
  TrendingUp,
  Rocket,
  Gift,
  Sparkles,
  Check,
  Tv
} from "lucide-react";

export interface CampaignIntentData {
  goal: string;
  audienceDescription: string;
  audiencePreset: string | null;
  brandTone: string;
  geographicScope: string;
  budgetRange: string;
  timeframe: string;
}

interface CampaignIntentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (data: CampaignIntentData) => void;
}

const CAMPAIGN_GOALS = [
  { id: "awareness", label: "Awareness", icon: Megaphone, description: "Build brand recognition" },
  { id: "recall", label: "Recall", icon: TrendingUp, description: "Stay top of mind" },
  { id: "launch", label: "Launch", icon: Rocket, description: "Introduce something new" },
  { id: "promo", label: "Promo", icon: Gift, description: "Drive limited offers" },
  { id: "brand_lift", label: "Brand Lift", icon: Sparkles, description: "Strengthen perception" },
];

const AUDIENCE_PRESETS = [
  { id: "young_professionals", label: "Young Professionals", age: "25-34" },
  { id: "families", label: "Families with Kids", age: "30-45" },
  { id: "affluent_adults", label: "Affluent Adults", age: "35-54" },
  { id: "gen_z", label: "Gen Z", age: "18-24" },
  { id: "seniors", label: "Active Seniors", age: "55+" },
];

const BRAND_TONES = [
  { id: "premium", label: "Premium & Sophisticated" },
  { id: "friendly", label: "Friendly & Approachable" },
  { id: "bold", label: "Bold & Energetic" },
  { id: "trustworthy", label: "Trustworthy & Reliable" },
  { id: "innovative", label: "Innovative & Modern" },
];

const GEOGRAPHIC_SCOPES = [
  { id: "national", label: "National" },
  { id: "regional", label: "Regional" },
  { id: "local", label: "Local Market" },
  { id: "multi_market", label: "Multi-Market" },
];

const BUDGET_RANGES = [
  { id: "starter", label: "$10K - $50K", description: "Starter" },
  { id: "growth", label: "$50K - $200K", description: "Growth" },
  { id: "scale", label: "$200K - $500K", description: "Scale" },
  { id: "enterprise", label: "$500K+", description: "Enterprise" },
];

export function CampaignIntentModal({ open, onOpenChange, onContinue }: CampaignIntentModalProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("awareness");
  const [audiencePreset, setAudiencePreset] = useState<string | null>(null);
  const [audienceDescription, setAudienceDescription] = useState("");
  const [brandTone, setBrandTone] = useState("premium");
  const [geographicScope, setGeographicScope] = useState("national");
  const [budgetRange, setBudgetRange] = useState("growth");
  const [timeframe, setTimeframe] = useState("");

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onContinue({
        goal,
        audienceDescription,
        audiencePreset,
        brandTone,
        geographicScope,
        budgetRange,
        timeframe,
      });
    }
  };

  const canContinue = () => {
    if (step === 1) return !!goal;
    if (step === 2) return audiencePreset || audienceDescription.trim().length > 0;
    return true;
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
              <Tv className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Create TV Campaign</h2>
            <p className="text-muted-foreground mt-1">Tell us about your campaign goals</p>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${s < step ? "bg-primary text-primary-foreground" : ""}
                    ${s === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
                    ${s > step ? "bg-muted text-muted-foreground" : ""}
                  `}>
                    {s < step ? <Check className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-12 h-0.5 mx-1 ${s < step ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[340px]">
            <AnimatePresence mode="wait">
              {/* Step 1: Campaign Goal */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Target className="h-5 w-5 text-primary" />
                    What's your campaign goal?
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CAMPAIGN_GOALS.map((g) => {
                      const Icon = g.icon;
                      const isSelected = goal === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setGoal(g.id)}
                          className={`
                            relative p-4 rounded-xl border-2 text-left transition-all
                            ${isSelected 
                              ? "border-primary bg-primary/10" 
                              : "border-border hover:border-muted-foreground/30 bg-secondary/20"
                            }
                          `}
                        >
                          <Icon className={`h-6 w-6 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="font-semibold text-foreground">{g.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{g.description}</div>
                          {isSelected && (
                            <motion.div
                              layoutId="goal-check"
                              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Audience */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Users className="h-5 w-5 text-primary" />
                    Who's your target audience?
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {AUDIENCE_PRESETS.map((preset) => (
                        <Badge
                          key={preset.id}
                          variant={audiencePreset === preset.id ? "default" : "outline"}
                          className={`
                            cursor-pointer py-2 px-3 transition-all
                            ${audiencePreset === preset.id 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-secondary"
                            }
                          `}
                          onClick={() => {
                            setAudiencePreset(audiencePreset === preset.id ? null : preset.id);
                          }}
                        >
                          {preset.label} ({preset.age})
                        </Badge>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-x-0 top-0 flex items-center justify-center">
                        <span className="bg-card px-3 text-sm text-muted-foreground -translate-y-3">
                          or describe in your own words
                        </span>
                      </div>
                      <div className="border-t border-border pt-6">
                        <Textarea
                          value={audienceDescription}
                          onChange={(e) => setAudienceDescription(e.target.value)}
                          placeholder="E.g., Health-conscious millennials living in urban areas who are interested in sustainable products..."
                          className="min-h-[100px] bg-secondary/50 border-border resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Brand & Constraints */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Brand Tone */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Palette className="h-5 w-5 text-primary" />
                      Brand Tone & Style
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {BRAND_TONES.map((tone) => (
                        <Badge
                          key={tone.id}
                          variant={brandTone === tone.id ? "default" : "outline"}
                          className={`
                            cursor-pointer py-2 px-3 transition-all
                            ${brandTone === tone.id 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-secondary"
                            }
                          `}
                          onClick={() => setBrandTone(tone.id)}
                        >
                          {tone.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Geographic Scope */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <MapPin className="h-5 w-5 text-primary" />
                      Geographic Scope
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {GEOGRAPHIC_SCOPES.map((scope) => (
                        <Badge
                          key={scope.id}
                          variant={geographicScope === scope.id ? "default" : "outline"}
                          className={`
                            cursor-pointer py-2 px-3 transition-all
                            ${geographicScope === scope.id 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-secondary"
                            }
                          `}
                          onClick={() => setGeographicScope(scope.id)}
                        >
                          {scope.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Budget & Timeframe */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Budget Range (Optional)
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {BUDGET_RANGES.map((budget) => (
                          <button
                            key={budget.id}
                            onClick={() => setBudgetRange(budget.id)}
                            className={`
                              p-3 rounded-lg border-2 text-left transition-all
                              ${budgetRange === budget.id 
                                ? "border-primary bg-primary/10" 
                                : "border-border hover:border-muted-foreground/30"
                              }
                            `}
                          >
                            <div className="text-xs text-muted-foreground">{budget.description}</div>
                            <div className="font-semibold text-foreground text-sm">{budget.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-foreground font-medium">
                        Timeframe (Optional)
                      </Label>
                      <Input
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        placeholder="E.g., Q1 2025, Next 3 months..."
                        className="bg-secondary/50 border-border"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!canContinue()}
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {step === 3 ? "Generate Strategy" : "Continue"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
