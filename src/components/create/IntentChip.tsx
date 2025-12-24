import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntentChipProps {
  label: string;
  value: string;
  isOpen?: boolean;
  onClick?: () => void;
  className?: string;
}

const IntentChip = ({ label, value, isOpen, onClick, className }: IntentChipProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
        "bg-secondary/50 hover:bg-secondary text-secondary-foreground",
        "border border-border/50 hover:border-primary/30",
        "transition-all duration-200",
        isOpen && "bg-primary/10 border-primary/50 text-primary",
        className
      )}
    >
      <span className="text-muted-foreground">{label}:</span>
      <span>{value}</span>
      <ChevronDown className={cn(
        "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
        isOpen && "rotate-180 text-primary"
      )} />
    </button>
  );
};

export default IntentChip;
