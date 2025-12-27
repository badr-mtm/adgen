import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, Users, Palette, MapPin, DollarSign, Megaphone, TrendingUp, Rocket, Gift, Sparkles, Check, Tv, ShoppingCart, UserPlus, Smartphone, Radio } from "lucide-react";
export interface CampaignIntentData {
  goal: string;
  audienceDescription: string;
  audiencePreset: string | null;
  brandTone: string;
  geographicScope: string;
  budgetRange: string;
  timeframe: string;
  concept?: string;
  duration?: string;
  referenceFiles?: Array<{ name: string; type: string; preview: string }>;
}
interface CampaignIntentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (data: CampaignIntentData) => void;
  initialConcept?: string;
  initialDuration?: string;
  referenceFiles?: Array<{ file: File; preview: string }>;
}
const CAMPAIGN_GOALS = [{
  id: "awareness",
  label: "Awareness",
  icon: Megaphone,
  description: "Reach more viewers to grow your brand.",
  useCases: ["Boost your brand visibility", "Target high intent audiences on premium and live sports channels"],
  adDelivery: "Optimize for impressions"
}, {
  id: "traffic",
  label: "Traffic",
  icon: TrendingUp,
  isNew: true,
  description: "Drive viewers to your website or landing page.",
  useCases: ["Increase website visits", "Promote special offers and campaigns"],
  adDelivery: "Optimize for link clicks"
}, {
  id: "leads",
  label: "Leads",
  icon: UserPlus,
  isNew: true,
  description: "Capture customer information and inquiries.",
  useCases: ["Generate qualified leads", "Build your email subscriber list"],
  adDelivery: "Optimize for form submissions"
}, {
  id: "sales",
  label: "Sales",
  icon: ShoppingCart,
  isNew: true,
  description: "Drive purchases and conversions.",
  useCases: ["Increase product sales", "Promote limited-time offers"],
  adDelivery: "Optimize for conversions"
}, {
  id: "retargeting",
  label: "Retargeting",
  icon: Target,
  description: "Re-engage viewers who know your brand.",
  useCases: ["Reconnect with past customers", "Remind viewers of abandoned carts"],
  adDelivery: "Optimize for return visits"
}, {
  id: "app_promotion",
  label: "App Promotion",
  icon: Smartphone,
  description: "Drive app installs and engagement.",
  useCases: ["Increase app downloads", "Boost in-app engagement"],
  adDelivery: "Optimize for app installs"
}];
const AUDIENCE_PRESETS = [{
  id: "young_professionals",
  label: "Young Professionals",
  age: "25-34"
}, {
  id: "families",
  label: "Families with Kids",
  age: "30-45"
}, {
  id: "affluent_adults",
  label: "Affluent Adults",
  age: "35-54"
}, {
  id: "gen_z",
  label: "Gen Z",
  age: "18-24"
}, {
  id: "seniors",
  label: "Active Seniors",
  age: "55+"
}];
const BRAND_TONES = [{
  id: "premium",
  label: "Premium & Sophisticated"
}, {
  id: "friendly",
  label: "Friendly & Approachable"
}, {
  id: "bold",
  label: "Bold & Energetic"
}, {
  id: "trustworthy",
  label: "Trustworthy & Reliable"
}, {
  id: "innovative",
  label: "Innovative & Modern"
}];
const GEOGRAPHIC_SCOPES = [{
  id: "national",
  label: "National"
}, {
  id: "regional",
  label: "Regional"
}, {
  id: "local",
  label: "Local Market"
}, {
  id: "multi_market",
  label: "Multi-Market"
}];
const BUDGET_RANGES = [{
  id: "starter",
  label: "$10K - $50K",
  description: "Starter"
}, {
  id: "growth",
  label: "$50K - $200K",
  description: "Growth"
}, {
  id: "scale",
  label: "$200K - $500K",
  description: "Scale"
}, {
  id: "enterprise",
  label: "$500K+",
  description: "Enterprise"
}];
export function CampaignIntentModal({
  open,
  onOpenChange,
  onContinue,
  initialConcept,
  initialDuration,
  referenceFiles
}: CampaignIntentModalProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("awareness");
  const [audiencePreset, setAudiencePreset] = useState<string | null>(null);
  const [audienceDescription, setAudienceDescription] = useState("");
  const [brandTone, setBrandTone] = useState("premium");
  const [geographicScope, setGeographicScope] = useState("national");
  const [budgetRange, setBudgetRange] = useState("growth");
  const [timeframe, setTimeframe] = useState("");
  const selectedGoalData = CAMPAIGN_GOALS.find(g => g.id === goal);
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
        concept: initialConcept,
        duration: initialDuration,
        referenceFiles: referenceFiles?.map(f => ({
          name: f.file.name,
          type: f.file.type,
          preview: f.preview
        }))
      });
    }
  };
  const canContinue = () => {
    if (step === 1) return !!goal;
    if (step === 2) return audiencePreset || audienceDescription.trim().length > 0;
    return true;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
              <Tv className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Create TV Campaign</h2>
            <p className="text-muted-foreground mt-1">Tell us about your campaign goals</p>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {[1, 2, 3].map(s => <div key={s} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${s < step ? "bg-primary text-primary-foreground" : ""}
                    ${s === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
                    ${s > step ? "bg-muted text-muted-foreground" : ""}
                  `}>
                    {s < step ? <Check className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && <div className={`w-12 h-0.5 mx-1 ${s < step ? "bg-primary" : "bg-muted"}`} />}
                </div>)}
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[380px]">
            <AnimatePresence mode="wait">
              {/* Step 1: Campaign Goal - New Design */}
              {step === 1 && <motion.div key="step1" initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} className="space-y-4">
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-4 ml-[74px]">
                    <Radio className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold text-foreground">Campaign Goal</span>
                    <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">i</span>
                    </div>
                  </div>
                  
                  {/* Two-column layout */}
                  <div className="flex gap-6">
                    {/* Left: Goal Options */}
                    <div className="w-52 space-y-2 flex-shrink-0 mr-0 ml-[74px]">
                      {CAMPAIGN_GOALS.map(g => {
                    const Icon = g.icon;
                    const isSelected = goal === g.id;
                    return <button key={g.id} onClick={() => setGoal(g.id)} className={`
                              w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all
                              ${isSelected ? "border-primary bg-background shadow-sm" : "border-border hover:border-muted-foreground/50 bg-background"}
                            `}>
                            {/* Radio Circle */}
                            <div className={`
                              w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                              ${isSelected ? "border-primary" : "border-muted-foreground/50"}
                            `}>
                              {isSelected && <motion.div initial={{
                          scale: 0
                        }} animate={{
                          scale: 1
                        }} className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            
                            {/* Icon */}
                            <Icon className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            
                            {/* Label */}
                            <span className={`font-medium text-sm ${isSelected ? "text-foreground" : "text-foreground"}`}>
                              {g.label}
                            </span>
                            
                            {/* New Badge */}
                            {g.isNew && <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-0">
                                New
                              </Badge>}
                          </button>;
                  })}
                    </div>

                    {/* Right: Goal Details */}
                    <div className="flex-1 border-l border-border pl-6">
                      <AnimatePresence mode="wait">
                        {selectedGoalData && <motion.div key={selectedGoalData.id} initial={{
                      opacity: 0,
                      x: 20
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} exit={{
                      opacity: 0,
                      x: -20
                    }} transition={{
                      duration: 0.2
                    }} className="space-y-5">
                            {/* Illustration */}
                            <div className="flex justify-start py-2">
                              <div className="relative">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                                  <selectedGoalData.icon className="h-12 w-12 text-primary" />
                                </div>
                                <motion.div animate={{
                            y: [0, -4, 0]
                          }} transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }} className="absolute -top-1 -right-1">
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-primary">
                                    <path d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5L6 0Z" fill="currentColor" opacity="0.6" />
                                  </svg>
                                </motion.div>
                                <motion.div animate={{
                            y: [0, -3, 0]
                          }} transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 0.3
                          }} className="absolute top-2 -right-4">
                                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" className="text-primary">
                                    <path d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5L6 0Z" fill="currentColor" opacity="0.4" />
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
                              <h4 className="text-sm font-semibold text-foreground mb-2">Use cases</h4>
                              <ul className="space-y-1.5">
                                {selectedGoalData.useCases.map((useCase, index) => <li key={index} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-primary">{useCase}</span>
                                  </li>)}
                              </ul>
                            </div>

                            {/* Ad Delivery */}
                            <div>
                              <h4 className="text-sm font-semibold text-foreground mb-2">Ad delivery</h4>
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="text-sm text-primary">{selectedGoalData.adDelivery}</span>
                              </div>
                            </div>
                          </motion.div>}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>}

              {/* Step 2: Audience */}
              {step === 2 && <motion.div key="step2" initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} className="space-y-6">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Users className="h-5 w-5 text-primary" />
                    Who's your target audience?
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {AUDIENCE_PRESETS.map(preset => <Badge key={preset.id} variant={audiencePreset === preset.id ? "default" : "outline"} className={`
                            cursor-pointer py-2 px-3 transition-all
                            ${audiencePreset === preset.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                          `} onClick={() => {
                    setAudiencePreset(audiencePreset === preset.id ? null : preset.id);
                  }}>
                          {preset.label} ({preset.age})
                        </Badge>)}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-x-0 top-0 flex items-center justify-center">
                        <span className="bg-card px-3 text-sm text-muted-foreground -translate-y-3">
                          or describe in your own words
                        </span>
                      </div>
                      <div className="border-t border-border pt-6">
                        <Textarea value={audienceDescription} onChange={e => setAudienceDescription(e.target.value)} placeholder="E.g., Health-conscious millennials living in urban areas who are interested in sustainable products..." className="min-h-[100px] bg-secondary/50 border-border resize-none" />
                      </div>
                    </div>
                  </div>
                </motion.div>}

              {/* Step 3: Brand & Constraints */}
              {step === 3 && <motion.div key="step3" initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} className="space-y-6">
                  {/* Brand Tone */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Palette className="h-5 w-5 text-primary" />
                      Brand Tone & Style
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {BRAND_TONES.map(tone => <Badge key={tone.id} variant={brandTone === tone.id ? "default" : "outline"} className={`
                            cursor-pointer py-2 px-3 transition-all
                            ${brandTone === tone.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                          `} onClick={() => setBrandTone(tone.id)}>
                          {tone.label}
                        </Badge>)}
                    </div>
                  </div>

                  {/* Geographic Scope */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <MapPin className="h-5 w-5 text-primary" />
                      Geographic Scope
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {GEOGRAPHIC_SCOPES.map(scope => <Badge key={scope.id} variant={geographicScope === scope.id ? "default" : "outline"} className={`
                            cursor-pointer py-2 px-3 transition-all
                            ${geographicScope === scope.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                          `} onClick={() => setGeographicScope(scope.id)}>
                          {scope.label}
                        </Badge>)}
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
                        {BUDGET_RANGES.map(budget => <button key={budget.id} onClick={() => setBudgetRange(budget.id)} className={`
                              p-3 rounded-lg border-2 text-left transition-all
                              ${budgetRange === budget.id ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground/30"}
                            `}>
                            <div className="text-xs text-muted-foreground">{budget.description}</div>
                            <div className="font-semibold text-foreground text-sm">{budget.label}</div>
                          </button>)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-foreground font-medium">
                        Timeframe (Optional)
                      </Label>
                      <Input value={timeframe} onChange={e => setTimeframe(e.target.value)} placeholder="E.g., Q1 2025, Next 3 months..." className="bg-secondary/50 border-border" />
                    </div>
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            {step > 1 ? <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button> : <div />}
            <Button size="lg" onClick={handleContinue} disabled={!canContinue()} className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              {step === 3 ? "Generate Strategy" : "Continue"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>;
}