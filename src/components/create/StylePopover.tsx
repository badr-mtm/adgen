import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Sparkles, Zap, Film, MinusCircle, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import IntentChip from "./IntentChip";

interface StylePopoverProps {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const styles = [
  { 
    value: "performance", 
    label: "Performance", 
    hint: "Direct, benefit-led, proven structures",
    recommended: true,
    icon: Zap
  },
  { 
    value: "cinematic", 
    label: "Cinematic", 
    hint: "Emotional storytelling, premium feel",
    icon: Film
  },
  { 
    value: "minimalist", 
    label: "Minimal", 
    hint: "Clean, focused, modern",
    icon: MinusCircle
  },
  { 
    value: "playful", 
    label: "Playful", 
    hint: "Bold, expressive, energetic",
    icon: Smile
  },
];

const StylePopover = ({ value, onChange, open, onOpenChange }: StylePopoverProps) => {
  const selectedStyle = styles.find(s => s.value === value) || styles[0];
  
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div>
          <IntentChip 
            label="Style" 
            value={selectedStyle.label} 
            isOpen={open}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-0" align="start" sideOffset={8}>
        <div className="flex">
          {/* Left Column - Options */}
          <div className="w-[45%] p-4 border-r border-border space-y-1">
            {styles.map((style) => {
              const Icon = style.icon;
              return (
                <button
                  key={style.value}
                  onClick={() => {
                    onChange(style.value);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all duration-150",
                    "hover:bg-secondary/80",
                    value === style.value ? "bg-primary/10 border border-primary/30" : "border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{style.label}</span>
                    {style.recommended && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        Recommended
                      </span>
                    )}
                    {value === style.value && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-6">{style.hint}</p>
                </button>
              );
            })}
            
            <button
              onClick={() => {
                onChange("auto");
                onOpenChange(false);
              }}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-150 mt-2",
                "hover:bg-secondary/80 border-t border-border pt-4",
                value === "auto" ? "bg-primary/10" : ""
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Let AI decide</span>
              </div>
            </button>
          </div>
          
          {/* Right Column - Diagram */}
          <div className="w-[55%] p-4 bg-secondary/20">
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              {/* Style Lens Diagram */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-medium">Style Lens</span>
              </div>
              
              <div className="w-px h-4 bg-border" />
              
              {/* Same product, different treatments */}
              <div className="w-full space-y-2">
                <div className="text-[10px] text-center text-muted-foreground mb-2">Same product, different treatments:</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 border border-border/50">
                    <div className="w-full h-8 rounded bg-gradient-to-r from-muted to-muted-foreground/20" />
                    <span className="text-[9px] text-muted-foreground">Layout</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 border border-border/50">
                    <div className="w-full h-8 rounded bg-muted flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-primary/40 animate-pulse" />
                    </div>
                    <span className="text-[9px] text-muted-foreground">Motion</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 border border-border/50">
                    <div className="w-full h-8 rounded bg-muted flex items-center justify-center text-[10px] font-medium">
                      Aa
                    </div>
                    <span className="text-[9px] text-muted-foreground">Copy</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground text-center mt-4">
              Default is selected based on top-performing ads in your category.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StylePopover;
