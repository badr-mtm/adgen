import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Tv, ArrowRight, FileText, X } from "lucide-react";

interface ConceptInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (data: { concept: string; duration: string; referenceFile?: File }) => void;
}

const DURATIONS = [
  { value: "15s", label: "15 seconds", description: "Quick brand reminder" },
  { value: "30s", label: "30 seconds", description: "Standard TV spot" },
  { value: "60s", label: "60 seconds", description: "Full storytelling" },
];

export function ConceptInputModal({ open, onOpenChange, onContinue }: ConceptInputModalProps) {
  const [concept, setConcept] = useState("");
  const [duration, setDuration] = useState("30s");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReferenceFile(e.target.files[0]);
    }
  };

  const handleContinue = () => {
    if (!concept.trim()) return;
    onContinue({ 
      concept: concept.trim(), 
      duration, 
      referenceFile: referenceFile || undefined 
    });
  };

  const handleRemoveFile = () => {
    setReferenceFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
              <Tv className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Create Your TV Ad</h2>
            <p className="text-muted-foreground">
              Describe your concept or paste your script to get started
            </p>
          </div>

          {/* Concept Input */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">
              Describe your TV Ad concept or start with a script
            </Label>
            <div className="relative">
              <Textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="E.g., A 30-second spot showcasing our new electric vehicle's zero-to-sixty acceleration, targeting young professionals who value sustainability and performance..."
                className="min-h-[140px] bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground resize-none pr-14"
              />
              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-3 p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors group"
                title="Upload reference file"
              >
                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Reference File Display */}
            {referenceFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
              >
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground flex-1 truncate">
                  {referenceFile.name}
                </span>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 rounded hover:bg-destructive/10 transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">Spot Duration</Label>
            <div className="grid grid-cols-3 gap-3">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all
                    ${duration === d.value 
                      ? "border-primary bg-primary/10" 
                      : "border-border bg-secondary/30 hover:border-muted-foreground/30"
                    }
                  `}
                >
                  <div className="font-bold text-lg text-foreground">{d.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{d.description}</div>
                  {duration === d.value && (
                    <motion.div
                      layoutId="duration-indicator"
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!concept.trim()}
            className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continue
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
