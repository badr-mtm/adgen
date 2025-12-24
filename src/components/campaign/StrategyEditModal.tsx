import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StrategyModule, TVAdStrategy } from "@/components/strategy/StrategyModule";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface StrategyEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  initialStrategy: TVAdStrategy | null;
  onStrategySaved: (strategy: TVAdStrategy) => void;
}

export const StrategyEditModal = ({
  open,
  onOpenChange,
  campaignId,
  initialStrategy,
  onStrategySaved,
}: StrategyEditModalProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [strategy, setStrategy] = useState<TVAdStrategy | null>(initialStrategy);

  const handleSave = async () => {
    if (!strategy) return;
    
    setSaving(true);
    try {
      // Get current storyboard and update with new strategy
      const { data: campaign, error: fetchError } = await supabase
        .from("campaigns")
        .select("storyboard")
        .eq("id", campaignId)
        .single();

      if (fetchError) throw fetchError;

      const currentStoryboard = campaign?.storyboard as any || {};
      const updatedStoryboard = {
        ...currentStoryboard,
        strategy,
      };

      const { error } = await supabase
        .from("campaigns")
        .update({ storyboard: updatedStoryboard })
        .eq("id", campaignId);

      if (error) throw error;

      onStrategySaved(strategy);
      onOpenChange(false);
      toast({
        title: "Strategy Saved",
        description: "Your TV ad strategy has been updated.",
      });
    } catch (error: any) {
      console.error("Error saving strategy:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save strategy.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Edit TV Ad Strategy</DialogTitle>
          <DialogDescription>
            Modify your advertising strategy. Changes will be saved to this campaign.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          {strategy && (
            <StrategyModule
              strategy={strategy}
              onStrategyChange={setStrategy}
              isAIGenerated={false}
              isLocked={false}
            />
          )}
        </ScrollArea>

        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Strategy
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
