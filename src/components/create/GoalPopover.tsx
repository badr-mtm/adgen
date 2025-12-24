import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Sparkles, Target, Users, MousePointer } from "lucide-react";
import { cn } from "@/lib/utils";
import IntentChip from "./IntentChip";

interface GoalPopoverProps {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const goals = [
  { 
    value: "awareness", 
    label: "Awareness", 
    hint: "Maximize reach and attention",
    icon: Users
  },
  { 
    value: "consideration", 
    label: "Consideration", 
    hint: "Encourage engagement and interest",
    icon: Target
  },
  { 
    value: "conversions", 
    label: "Conversions", 
    hint: "Optimize creative for action",
    recommended: true,
    icon: MousePointer
  },
];

const GoalPopover = ({ value, onChange, open, onOpenChange }: GoalPopoverProps) => {
  const selectedGoal = goals.find(g => g.value === value) || goals[2];
  
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div>
          <IntentChip 
            label="Goal" 
            value={selectedGoal.label} 
            isOpen={open}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-0" align="start" sideOffset={8}>
        <div className="flex">
          {/* Left Column - Options */}
          <div className="w-[45%] p-4 border-r border-border space-y-1">
            {goals.map((goal) => (
              <button
                key={goal.value}
                onClick={() => {
                  onChange(goal.value);
                  onOpenChange(false);
                }}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all duration-150",
                  "hover:bg-secondary/80",
                  value === goal.value ? "bg-primary/10 border border-primary/30" : "border border-transparent"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{goal.label}</span>
                  {goal.recommended && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      Recommended
                    </span>
                  )}
                  {value === goal.value && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{goal.hint}</p>
              </button>
            ))}
            
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
              {/* Simple Flow Diagram */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-medium">AI</span>
              </div>
              
              <div className="w-px h-4 bg-border" />
              
              <div className="flex gap-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-xs">H1</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Headline</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-xs">CTA</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">CTA</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-xs">%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Offer</span>
                </div>
              </div>
              
              <div className="w-px h-4 bg-border" />
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <MousePointer className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">User Action</span>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground text-center mt-4">
              Used to optimize creative structure and messaging—not platform setup.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default GoalPopover;
