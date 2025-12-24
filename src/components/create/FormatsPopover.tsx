import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Smartphone, Square, Monitor, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import IntentChip from "./IntentChip";

interface FormatsPopoverProps {
  selectedFormats: string[];
  autoAdapt: boolean;
  onChange: (formats: string[]) => void;
  onAutoAdaptChange: (value: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formats = [
  { 
    value: "9:16", 
    label: "9:16 (Vertical)", 
    recommended: true,
    icon: Smartphone
  },
  { 
    value: "1:1", 
    label: "1:1 (Square)", 
    icon: Square
  },
  { 
    value: "16:9", 
    label: "16:9 (Landscape)", 
    icon: Monitor
  },
];

const FormatsPopover = ({ 
  selectedFormats, 
  autoAdapt, 
  onChange, 
  onAutoAdaptChange,
  open, 
  onOpenChange 
}: FormatsPopoverProps) => {
  const displayValue = selectedFormats.length > 0 
    ? selectedFormats.join(" · ") 
    : "9:16 · 1:1";
  
  const toggleFormat = (format: string) => {
    if (selectedFormats.includes(format)) {
      if (selectedFormats.length > 1) {
        onChange(selectedFormats.filter(f => f !== format));
      }
    } else {
      onChange([...selectedFormats, format]);
    }
  };
  
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div>
          <IntentChip 
            label="Formats" 
            value={displayValue} 
            isOpen={open}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-0" align="start" sideOffset={8}>
        <div className="flex">
          {/* Left Column - Options */}
          <div className="w-[45%] p-4 border-r border-border space-y-1">
            {formats.map((format) => {
              const Icon = format.icon;
              const isSelected = selectedFormats.includes(format.value);
              return (
                <button
                  key={format.value}
                  onClick={() => toggleFormat(format.value)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all duration-150",
                    "hover:bg-secondary/80",
                    isSelected ? "bg-primary/10 border border-primary/30" : "border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center",
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{format.label}</span>
                    {format.recommended && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            
            <div className="border-t border-border pt-3 mt-3">
              <label className="flex items-center gap-2 p-2 cursor-pointer">
                <Checkbox 
                  checked={autoAdapt}
                  onCheckedChange={(checked) => onAutoAdaptChange(checked === true)}
                />
                <span className="text-sm text-muted-foreground">
                  Auto-adapt layouts per platform
                </span>
              </label>
            </div>
          </div>
          
          {/* Right Column - Diagram */}
          <div className="w-[55%] p-4 bg-secondary/20">
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              {/* Multi-format Output Diagram */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-16 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">Master</span>
                </div>
                <span className="text-xs font-medium">One Creative</span>
              </div>
              
              <div className="w-px h-4 bg-border" />
              
              <div className="flex gap-3 items-end">
                {/* Vertical */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-10 rounded bg-muted border border-border" />
                  <span className="text-[9px] text-muted-foreground">9:16</span>
                </div>
                {/* Square */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded bg-muted border border-border" />
                  <span className="text-[9px] text-muted-foreground">1:1</span>
                </div>
                {/* Landscape */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-7 rounded bg-muted border border-border" />
                  <span className="text-[9px] text-muted-foreground">16:9</span>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground text-center mt-4">
              Text, framing, and pacing are adjusted automatically.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FormatsPopover;
