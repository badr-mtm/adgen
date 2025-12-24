import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Sparkles, 
  RefreshCw, 
  Save,
  Clock,
  Type,
  Image,
  Mic
} from "lucide-react";

interface Scene {
  sceneNumber: number;
  duration: string;
  visualDescription: string;
  suggestedVisuals: string;
  voiceover: string;
  visualUrl?: string;
}

interface SceneEditorProps {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
  onSave: (scene: Scene) => void;
  onRegenerateVisual: (customPrompt?: string) => void;
  isRegenerating?: boolean;
}

const SceneEditor = ({
  scene,
  isOpen,
  onClose,
  onSave,
  onRegenerateVisual,
  isRegenerating
}: SceneEditorProps) => {
  const [editedScene, setEditedScene] = useState<Scene>(scene);
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"visual" | "text" | "timing">("visual");

  const handleSave = () => {
    onSave(editedScene);
    onClose();
  };

  const durationSeconds = parseInt(editedScene.duration) || 4;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Edit Scene {scene.sceneNumber}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border pb-2">
          {[
            { id: "visual", label: "Visual", icon: Image },
            { id: "text", label: "Text & Copy", icon: Type },
            { id: "timing", label: "Timing", icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        <div className="space-y-6 py-4">
          {activeTab === "visual" && (
            <>
              {/* Current Visual */}
              <div className="space-y-3">
                <Label>Current Visual</Label>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {scene.visualUrl ? (
                    <img
                      src={scene.visualUrl}
                      alt={`Scene ${scene.sceneNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No visual generated
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Description */}
              <div className="space-y-2">
                <Label>Visual Description</Label>
                <Textarea
                  value={editedScene.visualDescription}
                  onChange={(e) => setEditedScene({ ...editedScene, visualDescription: e.target.value })}
                  placeholder="Describe what should be shown..."
                  rows={3}
                />
              </div>

              {/* Custom Prompt for Regeneration */}
              <div className="space-y-2">
                <Label>Custom Prompt (optional)</Label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add specific instructions for regeneration..."
                  rows={2}
                />
                <Button
                  onClick={() => onRegenerateVisual(customPrompt || undefined)}
                  disabled={isRegenerating}
                  className="w-full"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Regenerate Visual
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {activeTab === "text" && (
            <>
              {/* Voiceover */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Voiceover Script
                </Label>
                <Textarea
                  value={editedScene.voiceover}
                  onChange={(e) => setEditedScene({ ...editedScene, voiceover: e.target.value })}
                  placeholder="Enter voiceover text..."
                  rows={4}
                />
              </div>

              {/* Suggested Visuals */}
              <div className="space-y-2">
                <Label>Camera & Composition Notes</Label>
                <Textarea
                  value={editedScene.suggestedVisuals}
                  onChange={(e) => setEditedScene({ ...editedScene, suggestedVisuals: e.target.value })}
                  placeholder="Camera angles, composition details..."
                  rows={3}
                />
              </div>
            </>
          )}

          {activeTab === "timing" && (
            <>
              {/* Duration Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Scene Duration</Label>
                  <span className="text-2xl font-bold text-primary">{durationSeconds}s</span>
                </div>
                <Slider
                  value={[durationSeconds]}
                  onValueChange={([value]) => setEditedScene({ ...editedScene, duration: `${value}s` })}
                  min={1}
                  max={15}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1s</span>
                  <span>15s</span>
                </div>
              </div>

              {/* Quick Duration Presets */}
              <div className="space-y-2">
                <Label>Quick Presets</Label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 8].map(sec => (
                    <Button
                      key={sec}
                      variant={durationSeconds === sec ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setEditedScene({ ...editedScene, duration: `${sec}s` })}
                    >
                      {sec}s
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SceneEditor;
