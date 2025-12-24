import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit3, Check, X } from "lucide-react";

interface InlineEditFieldProps {
  value: string;
  onSave: (value: string) => void;
  type?: "text" | "textarea";
  label?: string;
  className?: string;
}

const InlineEditField = ({ 
  value, 
  onSave, 
  type = "text",
  label,
  className = ""
}: InlineEditFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className={`group relative ${className}`}>
        {label && (
          <h4 className="font-medium text-foreground text-sm uppercase tracking-wide mb-1">
            {label}
          </h4>
        )}
        <div className="flex items-start gap-2">
          <p className={`flex-1 text-foreground ${type === "textarea" ? "" : ""}`}>
            {value}
          </p>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <h4 className="font-medium text-foreground text-sm uppercase tracking-wide">
          {label}
        </h4>
      )}
      <div className="space-y-2">
        {type === "textarea" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[80px] bg-background text-foreground"
            autoFocus
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="bg-background text-foreground"
            autoFocus
          />
        )}
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InlineEditField;
