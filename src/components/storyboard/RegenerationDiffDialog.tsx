import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SceneDiffView } from "./SceneDiffView";
import { Check, ArrowRight } from "lucide-react";

interface Scene {
  sceneNumber?: number;
  number?: number;
  duration: string;
  description?: string;
  visualDescription?: string;
  suggestedVisuals?: string;
  voiceover?: string;
  voiceoverLines?: string[];
  visualUrl?: string;
  strategyAlignment?: string;
}

interface Storyboard {
  scriptVariants?: {
    "15s": string;
    "30s": string;
    "60s": string;
  };
  scenes: Scene[];
  musicMood?: string;
  duration?: string;
  tone?: string;
  style?: string;
}

interface RegenerationDiffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beforeStoryboard: Storyboard | null;
  afterStoryboard: Storyboard | null;
  onAccept: () => void;
}

export const RegenerationDiffDialog = ({
  open,
  onOpenChange,
  beforeStoryboard,
  afterStoryboard,
  onAccept,
}: RegenerationDiffDialogProps) => {
  if (!beforeStoryboard || !afterStoryboard) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Storyboard Regenerated
          </DialogTitle>
          <DialogDescription>
            Your scenes have been updated based on the new strategy. Review the changes below.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-6 pb-4">
          <SceneDiffView before={beforeStoryboard} after={afterStoryboard} />
        </ScrollArea>

        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onAccept} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Continue to Storyboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
