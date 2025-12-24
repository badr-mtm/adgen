import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Sparkles, Clock, Tv, ArrowRight } from "lucide-react";

const DURATION_OPTIONS = [
  { value: "15s", label: "15 sec", description: "Quick impact" },
  { value: "30s", label: "30 sec", description: "Standard spot" },
  { value: "60s", label: "60 sec", description: "Story-driven" },
];

export function QuickTVAdCreation() {
  const navigate = useNavigate();
  const [concept, setConcept] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("30s");

  const handleQuickCreate = () => {
    const params = new URLSearchParams();
    if (concept) params.set("concept", concept);
    params.set("duration", selectedDuration);
    navigate(`/create?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Tv className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Create TV Ad</h3>
              <p className="text-xs text-muted-foreground">Script-first broadcast advertising</p>
            </div>
          </div>

          <div className="space-y-4">
            <Textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Describe your TV ad concept... What's the story you want to tell?"
              className="min-h-[80px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
            />

            <div>
              <label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Spot Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      selectedDuration === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <p className="text-lg font-bold">{option.label}</p>
                    <p className="text-[10px]">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleQuickCreate}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start with Script
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
