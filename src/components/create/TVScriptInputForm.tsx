import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Tv, 
  FileText, 
  Sparkles, 
  ArrowRight,
  Upload,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Target,
  Users
} from "lucide-react";

const DURATION_OPTIONS = [
  { value: "15", label: "15 sec", description: "Quick impact, single message", icon: "⚡" },
  { value: "30", label: "30 sec", description: "Standard TV spot, story arc", icon: "📺" },
  { value: "60", label: "60 sec", description: "Full narrative, emotional journey", icon: "🎬" },
];

const DAYPART_OPTIONS = [
  { value: "early_morning", label: "Early Morning", time: "5AM - 9AM", icon: Sunrise, color: "text-amber-400" },
  { value: "daytime", label: "Daytime", time: "9AM - 4PM", icon: Sun, color: "text-yellow-400" },
  { value: "prime_time", label: "Prime Time", time: "8PM - 11PM", icon: Sunset, color: "text-orange-400" },
  { value: "late_night", label: "Late Night", time: "11PM - 2AM", icon: Moon, color: "text-indigo-400" },
];

const OBJECTIVE_OPTIONS = [
  { value: "awareness", label: "Brand Awareness", description: "Maximize reach & recall" },
  { value: "consideration", label: "Consideration", description: "Drive product interest" },
  { value: "action", label: "Direct Response", description: "Immediate action/purchase" },
];

export interface TVScriptFormData {
  script: string;
  duration: "15" | "30" | "60";
  dayparts: string[];
  objective: string;
  targetDemo: string;
}

interface TVScriptInputFormProps {
  onSubmit: (data: TVScriptFormData) => void;
  initialConcept?: string;
  initialDuration?: string;
}

export function TVScriptInputForm({ onSubmit, initialConcept, initialDuration }: TVScriptInputFormProps) {
  const [script, setScript] = useState(initialConcept || "");
  const [duration, setDuration] = useState<"15" | "30" | "60">((initialDuration?.replace("s", "") as "15" | "30" | "60") || "30");
  const [selectedDayparts, setSelectedDayparts] = useState<string[]>(["prime_time"]);
  const [objective, setObjective] = useState("awareness");
  const [targetDemo, setTargetDemo] = useState("");

  const toggleDaypart = (value: string) => {
    setSelectedDayparts(prev => 
      prev.includes(value) 
        ? prev.filter(d => d !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      script: script || "Create an engaging TV commercial",
      duration,
      dayparts: selectedDayparts.length > 0 ? selectedDayparts : ["prime_time"],
      objective,
      targetDemo
    });
  };

  const getCharacterCount = () => {
    const wordsPerSecond = 2.5;
    const maxWords = parseInt(duration) * wordsPerSecond;
    const currentWords = script.trim().split(/\s+/).filter(w => w).length;
    return { current: currentWords, max: Math.floor(maxWords) };
  };

  const wordCount = getCharacterCount();

  return (
    <div className="space-y-6">
      {/* Script Input - Hero Section */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">TV Script / Concept</h3>
              <p className="text-xs text-muted-foreground">Write your script or describe the story you want to tell</p>
            </div>
          </div>
          
          <div className="relative">
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder={`Write your ${duration}-second TV script or describe the concept...

Example for a 30-second spot:
"Open on a family at breakfast. Mom reaches for our cereal box. Cut to kids smiling. VO: 'Start every day the right way with...'"`}
              className="min-h-[180px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none text-base leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${wordCount.current > wordCount.max ? 'border-red-500/50 text-red-400' : 'border-border text-muted-foreground'}`}
              >
                ~{wordCount.current}/{wordCount.max} words
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duration Selection */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <Label className="text-base font-semibold text-foreground">Spot Duration</Label>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {DURATION_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDuration(option.value as "15" | "30" | "60")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  duration === option.value
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border bg-secondary/30 hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{option.icon}</span>
                  <Badge 
                    variant={duration === option.value ? "default" : "outline"}
                    className="text-xs"
                  >
                    {option.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column: Dayparts + Objective */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daypart Targeting */}
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tv className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-foreground">Target Dayparts</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {DAYPART_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                const isSelected = selectedDayparts.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleDaypart(option.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className={`h-4 w-4 ${option.color}`} />
                      <span className="text-xs font-medium text-foreground">{option.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{option.time}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Objective */}
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-foreground">Campaign Objective</Label>
            </div>
            
            <div className="space-y-2">
              {OBJECTIVE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setObjective(option.value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    objective === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-primary/50"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Audience */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold text-foreground">Target Audience (Optional)</Label>
          </div>
          <Textarea
            value={targetDemo}
            onChange={(e) => setTargetDemo(e.target.value)}
            placeholder="e.g., Adults 25-54, household income $75K+, interested in health & wellness"
            className="min-h-[60px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none text-sm"
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <motion.div 
        className="flex justify-center pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button 
          size="lg"
          onClick={handleSubmit}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Generate TV Strategy
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
