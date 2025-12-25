import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Check, 
  Clock,
  Film,
  Sparkles
} from "lucide-react";

interface StoryboardConcept {
  id: string;
  title: string;
  description: string;
  scenes: {
    number: number;
    description: string;
    duration: string;
  }[];
  tone: string;
  style: string;
}

interface StoryboardSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onSelect: (concept: StoryboardConcept) => void;
  concepts: StoryboardConcept[];
  duration: string;
}

export function StoryboardSelectionModal({
  open,
  onOpenChange,
  onBack,
  onSelect,
  concepts,
  duration
}: StoryboardSelectionModalProps) {
  const [selectedId, setSelectedId] = useState<string>(concepts[0]?.id || "");

  const selectedConcept = concepts.find(c => c.id === selectedId);

  const handleContinue = () => {
    if (selectedConcept) {
      onSelect(selectedConcept);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
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
                <Film className="h-5 w-5 text-primary" />
                Choose Your Storyboard
              </h2>
              <p className="text-sm text-muted-foreground">
                AI generated {concepts.length} unique concepts for your {duration} spot
              </p>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Generated
            </Badge>
          </div>

          <div className="flex gap-6">
            {/* Concepts List */}
            <div className="w-80 space-y-3 flex-shrink-0 max-h-[60vh] overflow-y-auto pr-2">
              {concepts.map((concept, index) => {
                const isSelected = selectedId === concept.id;
                
                return (
                  <motion.button
                    key={concept.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedId(concept.id)}
                    className={`
                      w-full p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-muted-foreground/30 bg-secondary/20"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                        ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}
                      `}>
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-primary-foreground" />
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{concept.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {concept.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {concept.scenes.length} scenes
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {concept.tone}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Storyboard Preview */}
            <div className="flex-1 bg-secondary/30 rounded-2xl p-6 max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {selectedConcept && (
                  <motion.div
                    key={selectedConcept.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Concept Header */}
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{selectedConcept.title}</h3>
                      <p className="text-muted-foreground mt-1">{selectedConcept.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="outline" className="border-border">
                          <Clock className="h-3 w-3 mr-1" />
                          {duration}
                        </Badge>
                        <Badge variant="outline" className="border-border">
                          Style: {selectedConcept.style}
                        </Badge>
                        <Badge variant="outline" className="border-border">
                          Tone: {selectedConcept.tone}
                        </Badge>
                      </div>
                    </div>

                    {/* Scene Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Scene Breakdown</h4>
                      <div className="space-y-3">
                        {selectedConcept.scenes.map((scene, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex gap-4 p-4 rounded-lg bg-card border border-border"
                          >
                            <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Play className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-primary">
                                  Scene {scene.number}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {scene.duration}
                                </span>
                              </div>
                              <p className="text-sm text-foreground">
                                {scene.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-6 pt-6 border-t border-border flex justify-end gap-3">
            <Button variant="ghost" onClick={onBack}>
              Generate More
            </Button>
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!selectedConcept}
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue with this Concept
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
