import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, Brain, MessageSquare, Image, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import IntentChip from "./IntentChip";

interface AudiencePopoverProps {
  mode: "auto" | "manual";
  demographics: string;
  geography: string;
  interests: string;
  onModeChange: (mode: "auto" | "manual") => void;
  onDemographicsChange: (value: string) => void;
  onGeographyChange: (value: string) => void;
  onInterestsChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AudiencePopover = ({
  mode,
  demographics,
  geography,
  interests,
  onModeChange,
  onDemographicsChange,
  onGeographyChange,
  onInterestsChange,
  open,
  onOpenChange
}: AudiencePopoverProps) => {
  const displayValue = mode === "auto" ? "Auto" : 
    (demographics || geography || interests ? "Custom" : "Auto");
  
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div>
          <IntentChip 
            label="Audience" 
            value={displayValue} 
            isOpen={open}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-0" align="start" sideOffset={8}>
        <div className="flex">
          {/* Left Column - Options */}
          <div className="w-[45%] p-4 border-r border-border space-y-1">
            <button
              onClick={() => onModeChange("auto")}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-150",
                "hover:bg-secondary/80",
                mode === "auto" ? "bg-primary/10 border border-primary/30" : "border border-transparent"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Auto (AI Inferred)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                  Recommended
                </span>
                {mode === "auto" && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on product, intent, and historical patterns
              </p>
            </button>
            
            <button
              onClick={() => onModeChange("manual")}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-150",
                "hover:bg-secondary/80",
                mode === "manual" ? "bg-primary/10 border border-primary/30" : "border border-transparent"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Define Manually</span>
                {mode === "manual" && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Demographics, interests, locations
              </p>
            </button>
            
            {mode === "manual" && (
              <div className="space-y-3 pt-3 border-t border-border mt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="demographics" className="text-xs text-muted-foreground">
                    Demographics
                  </Label>
                  <Input
                    id="demographics"
                    placeholder="e.g., 25-45, professionals"
                    value={demographics}
                    onChange={(e) => onDemographicsChange(e.target.value)}
                    className="bg-input border-border h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="geography" className="text-xs text-muted-foreground">
                    Geography
                  </Label>
                  <Input
                    id="geography"
                    placeholder="e.g., United States, Europe"
                    value={geography}
                    onChange={(e) => onGeographyChange(e.target.value)}
                    className="bg-input border-border h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="interests" className="text-xs text-muted-foreground">
                    Interests
                  </Label>
                  <Input
                    id="interests"
                    placeholder="e.g., health, cooking"
                    value={interests}
                    onChange={(e) => onInterestsChange(e.target.value)}
                    className="bg-input border-border h-8 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Diagram */}
          <div className="w-[55%] p-4 bg-secondary/20">
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              {/* AI Analysis Diagram */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-medium">AI Analyzing</span>
              </div>
              
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                    <span className="text-[10px]">📦</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">Product</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                    <span className="text-[10px]">💬</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">Message</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                    <span className="text-[10px]">📊</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">Market</span>
                </div>
              </div>
              
              <div className="w-px h-4 bg-border" />
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Tone</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Visuals</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">CTA</span>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground text-center mt-4">
              You can refine or override this later without regenerating creatives.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AudiencePopover;
