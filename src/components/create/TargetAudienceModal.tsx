import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  MapPin,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  ShoppingBag,
  Tv,
  Music,
  Dumbbell,
  Utensils,
  Plane,
  Car,
  Baby,
  PawPrint
} from "lucide-react";

export interface AudienceData {
  locations: string[];
  inMarketInterests: string[];
  customAudiences: string[];
  ageRanges: string[];
  genders: string[];
  householdIncome: string[];
  education: string[];
  parentalStatus: string[];
  homeOwnership: string[];
}

interface TargetAudienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onContinue: (audience: AudienceData) => void;
  campaignDescription?: string;
}

const LOCATIONS = [
  "Entire US", "California", "New York", "Texas", "Florida", "Illinois", 
  "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan"
];

const IN_MARKET_INTERESTS = [
  { id: "auto", label: "Auto & Vehicles", icon: Car },
  { id: "beauty", label: "Beauty & Personal Care", icon: Heart },
  { id: "business", label: "Business Services", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "entertainment", label: "Entertainment", icon: Tv },
  { id: "fitness", label: "Fitness & Wellness", icon: Dumbbell },
  { id: "food", label: "Food & Dining", icon: Utensils },
  { id: "home", label: "Home & Garden", icon: Home },
  { id: "music", label: "Music & Audio", icon: Music },
  { id: "parenting", label: "Parenting", icon: Baby },
  { id: "pets", label: "Pets", icon: PawPrint },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "travel", label: "Travel", icon: Plane },
];

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const GENDERS = ["All", "Male", "Female"];
const HOUSEHOLD_INCOME = ["Top 10%", "Top 25%", "Top 50%", "All"];
const EDUCATION = ["High School", "Some College", "Bachelor's Degree", "Graduate Degree"];
const PARENTAL_STATUS = ["Parents", "Not Parents", "All"];
const HOME_OWNERSHIP = ["Homeowners", "Renters", "All"];

export function TargetAudienceModal({
  open,
  onOpenChange,
  onBack,
  onContinue,
  campaignDescription = ""
}: TargetAudienceModalProps) {
  const [audienceData, setAudienceData] = useState<AudienceData>({
    locations: ["Entire US"],
    inMarketInterests: [],
    customAudiences: [],
    ageRanges: ["25-34", "35-44", "45-54"],
    genders: ["All"],
    householdIncome: ["All"],
    education: [],
    parentalStatus: ["All"],
    homeOwnership: ["All"]
  });

  const [expandedSections, setExpandedSections] = useState({
    locations: true,
    interests: true,
    demographics: false
  });

  // AI pre-fill based on campaign description
  useEffect(() => {
    if (campaignDescription && open) {
      // Simulate AI analysis
      const description = campaignDescription.toLowerCase();
      const suggestedInterests: string[] = [];
      
      if (description.includes("fitness") || description.includes("gym") || description.includes("workout")) {
        suggestedInterests.push("fitness");
      }
      if (description.includes("food") || description.includes("restaurant") || description.includes("dining")) {
        suggestedInterests.push("food");
      }
      if (description.includes("travel") || description.includes("vacation") || description.includes("hotel")) {
        suggestedInterests.push("travel");
      }
      if (description.includes("car") || description.includes("auto") || description.includes("vehicle")) {
        suggestedInterests.push("auto");
      }
      if (description.includes("baby") || description.includes("parent") || description.includes("family")) {
        suggestedInterests.push("parenting");
      }
      if (description.includes("pet") || description.includes("dog") || description.includes("cat")) {
        suggestedInterests.push("pets");
      }
      if (description.includes("beauty") || description.includes("skincare") || description.includes("makeup")) {
        suggestedInterests.push("beauty");
      }
      if (description.includes("home") || description.includes("garden") || description.includes("decor")) {
        suggestedInterests.push("home");
      }

      if (suggestedInterests.length > 0) {
        setAudienceData(prev => ({
          ...prev,
          inMarketInterests: suggestedInterests
        }));
      }
    }
  }, [campaignDescription, open]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleArrayItem = (key: keyof AudienceData, item: string) => {
    setAudienceData(prev => {
      const current = prev[key] as string[];
      if (current.includes(item)) {
        return { ...prev, [key]: current.filter(i => i !== item) };
      }
      return { ...prev, [key]: [...current, item] };
    });
  };

  const audienceSize = "13M - 15M";
  const estimatedImpressions = "47K - 93K";
  const estimatedHouseholds = "3.1K - 6.2K";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-full"
        >
          {/* Main Content */}
          <div className="flex-1 p-8 overflow-hidden flex flex-col">
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
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Who's your ideal audience?
                  </h2>
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Optimized
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  We'll automatically reach people most likely to respond. Fine-tune if needed.
                </p>
              </motion.div>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Locations */}
                <Collapsible open={expandedSections.locations} onOpenChange={() => toggleSection("locations")}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                          <h3 className="font-medium text-foreground">Locations</h3>
                          <p className="text-sm text-muted-foreground">
                            {audienceData.locations.join(", ")}
                          </p>
                        </div>
                      </div>
                      {expandedSections.locations ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 border border-t-0 border-border rounded-b-lg bg-background/50"
                    >
                      <div className="flex flex-wrap gap-2">
                        {LOCATIONS.map((location) => (
                          <Badge
                            key={location}
                            variant={audienceData.locations.includes(location) ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${
                              audienceData.locations.includes(location)
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => toggleArrayItem("locations", location)}
                          >
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>

                {/* In-Market & Interests */}
                <Collapsible open={expandedSections.interests} onOpenChange={() => toggleSection("interests")}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                          <h3 className="font-medium text-foreground">In-Market & Interests</h3>
                          <p className="text-sm text-muted-foreground">
                            {audienceData.inMarketInterests.length > 0
                              ? `${audienceData.inMarketInterests.length} segments included`
                              : "No segments selected"}
                          </p>
                        </div>
                      </div>
                      {expandedSections.interests ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 border border-t-0 border-border rounded-b-lg bg-background/50"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {IN_MARKET_INTERESTS.map((interest) => {
                          const IconComponent = interest.icon;
                          const isSelected = audienceData.inMarketInterests.includes(interest.id);
                          return (
                            <button
                              key={interest.id}
                              onClick={() => toggleArrayItem("inMarketInterests", interest.id)}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-muted-foreground/50"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isSelected ? "bg-primary/20" : "bg-muted"
                              }`}>
                                <IconComponent className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              </div>
                              <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                {interest.label}
                              </span>
                              {isSelected && (
                                <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Demographics */}
                <Collapsible open={expandedSections.demographics} onOpenChange={() => toggleSection("demographics")}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                          <h3 className="font-medium text-foreground">Demographics</h3>
                          <p className="text-sm text-muted-foreground">
                            Ages {audienceData.ageRanges.join(", ")} • {audienceData.genders[0]}
                          </p>
                        </div>
                      </div>
                      {expandedSections.demographics ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 border border-t-0 border-border rounded-b-lg bg-background/50 space-y-4"
                    >
                      {/* Age Ranges */}
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Age Ranges</label>
                        <div className="flex flex-wrap gap-2">
                          {AGE_RANGES.map((age) => (
                            <Badge
                              key={age}
                              variant={audienceData.ageRanges.includes(age) ? "default" : "outline"}
                              className={`cursor-pointer transition-all ${
                                audienceData.ageRanges.includes(age)
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => toggleArrayItem("ageRanges", age)}
                            >
                              {age}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Genders */}
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Gender</label>
                        <div className="flex gap-2">
                          {GENDERS.map((gender) => (
                            <Badge
                              key={gender}
                              variant={audienceData.genders.includes(gender) ? "default" : "outline"}
                              className={`cursor-pointer transition-all ${
                                audienceData.genders.includes(gender)
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => setAudienceData(prev => ({ ...prev, genders: [gender] }))}
                            >
                              {gender}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Household Income */}
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Household Income</label>
                        <div className="flex flex-wrap gap-2">
                          {HOUSEHOLD_INCOME.map((income) => (
                            <Badge
                              key={income}
                              variant={audienceData.householdIncome.includes(income) ? "default" : "outline"}
                              className={`cursor-pointer transition-all ${
                                audienceData.householdIncome.includes(income)
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => setAudienceData(prev => ({ ...prev, householdIncome: [income] }))}
                            >
                              {income}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </ScrollArea>

            {/* Next Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-6 pt-6 border-t border-border"
            >
              <Button
                size="lg"
                onClick={() => onContinue(audienceData)}
                className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 group transition-all duration-300"
              >
                Next
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </motion.div>
          </div>

          {/* Strategy Estimate Sidebar */}
          <div className="w-72 border-l border-border bg-background/50 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Strategy Estimate</h3>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Audience Size</p>
                <p className="text-2xl font-bold text-foreground">{audienceSize}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Impressions</p>
                  <p className="text-sm font-semibold text-foreground">{estimatedImpressions}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Households</p>
                  <p className="text-sm font-semibold text-foreground">{estimatedHouseholds}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deliverability</span>
                  <Badge className="bg-green-500/20 text-green-400 border-0">
                    Optimal
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
