import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrategyModule, TVAdStrategy } from "@/components/strategy/StrategyModule";
import { StrategyComparison } from "./StrategyComparison";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Edit3, GitCompare, RefreshCw, Sparkles } from "lucide-react";

interface StrategyEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  initialStrategy: TVAdStrategy | null;
  onStrategySaved: (strategy: TVAdStrategy) => void;
  onStoryboardRegenerated?: () => void;
}

export const StrategyEditModal = ({
  open,
  onOpenChange,
  campaignId,
  initialStrategy,
  onStrategySaved,
  onStoryboardRegenerated,
}: StrategyEditModalProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [strategy, setStrategy] = useState<TVAdStrategy | null>(initialStrategy);
  const [originalStrategy, setOriginalStrategy] = useState<TVAdStrategy | null>(initialStrategy);
  const [activeTab, setActiveTab] = useState<"edit" | "compare">("edit");

  // Reset when modal opens
  useEffect(() => {
    if (open && initialStrategy) {
      setStrategy(initialStrategy);
      setOriginalStrategy(initialStrategy);
      setActiveTab("edit");
    }
  }, [open, initialStrategy]);

  const hasChanges = strategy && originalStrategy && 
    JSON.stringify(strategy) !== JSON.stringify(originalStrategy);

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

      setOriginalStrategy(strategy);
      onStrategySaved(strategy);
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

  const handleRegenerate = async () => {
    if (!strategy) return;
    
    setRegenerating(true);
    try {
      // First save the strategy
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

      await supabase
        .from("campaigns")
        .update({ storyboard: updatedStoryboard })
        .eq("id", campaignId);

      // Now regenerate the storyboard
      const { data, error } = await supabase.functions.invoke("regenerate-from-strategy", {
        body: { campaignId, strategy },
      });

      if (error) throw error;

      setOriginalStrategy(strategy);
      onStrategySaved(strategy);
      onOpenChange(false);
      
      toast({
        title: "Storyboard Regenerated",
        description: "Your scenes have been updated to match the new strategy.",
      });
      
      // Callback to refresh parent component
      onStoryboardRegenerated?.();
    } catch (error: any) {
      console.error("Error regenerating storyboard:", error);
      toast({
        title: "Regeneration Failed",
        description: error.message || "Failed to regenerate storyboard.",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Edit TV Ad Strategy</DialogTitle>
          <DialogDescription>
            Modify your advertising strategy. Use the comparison view to see what creative elements may need updating.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "compare")} className="flex-1">
          <div className="px-6">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="edit" className="gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Strategy
              </TabsTrigger>
              <TabsTrigger value="compare" className="gap-2" disabled={!hasChanges}>
                <GitCompare className="h-4 w-4" />
                Review Changes
                {hasChanges && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="edit" className="mt-0 flex-1">
            <ScrollArea className="max-h-[calc(90vh-260px)] px-6 py-4">
              {strategy && (
                <StrategyModule
                  strategy={strategy}
                  onStrategyChange={setStrategy}
                  isAIGenerated={false}
                  isLocked={false}
                />
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="compare" className="mt-0 flex-1">
            <ScrollArea className="max-h-[calc(90vh-260px)] px-6 py-4">
              {strategy && originalStrategy && (
                <StrategyComparison 
                  before={originalStrategy} 
                  after={strategy} 
                />
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between gap-3 p-6 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            ) : (
              <span>No changes</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving || regenerating}>
              Cancel
            </Button>
            {hasChanges && activeTab === "edit" && (
              <Button variant="outline" onClick={() => setActiveTab("compare")}>
                <GitCompare className="h-4 w-4 mr-2" />
                Review Changes
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleSave} 
              disabled={saving || regenerating || !hasChanges}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Only
                </>
              )}
            </Button>
            <Button 
              onClick={handleRegenerate} 
              disabled={saving || regenerating}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {regenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate from Strategy
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
