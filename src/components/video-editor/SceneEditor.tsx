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
  Mic,
  Loader2
} from "lucide-react";

interface Scene {
  sceneNumber: number;
  duration: string;
  visualDescription: string;
  suggestedVisuals: string;
  voiceover: string;
  visualUrl?: string;
  videoUrl?: string;
}

interface SceneEditorProps {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
  onSave: (scene: Scene) => void;
  onRegenerateVisual: (customPrompt?: string) => void;
  onGenerateVideo: (model: string, customPrompt?: string) => void;
  isRegenerating?: boolean;
}

const SceneEditor = ({
  scene,
  isOpen,
  onClose,
  onSave,
  onRegenerateVisual,
  onGenerateVideo,
  isRegenerating
}: SceneEditorProps) => {
  const [editedScene, setEditedScene] = useState<Scene>(scene);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("luma");
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
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="flex items-center gap-2">Edit Scene {scene.sceneNumber}</span>
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
              {/* Current Visual / Video */}
              <div className="space-y-3">
                <Label>Current Visual Assets</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground uppercase">Static Background</span>
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted border border-border">
                      {scene.visualUrl ? (
                        <img
                          src={scene.visualUrl}
                          alt={`Scene ${scene.sceneNumber}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No visual generated
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground uppercase">Cinematic Clip</span>
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted border border-border">
                      {scene.videoUrl ? (
                        <video
                          src={scene.videoUrl}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No video generated
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Visual Description</Label>
                <Textarea
                  value={editedScene.visualDescription}
                  onChange={(e) => setEditedScene({ ...editedScene, visualDescription: e.target.value })}
                  placeholder="Describe what should be shown..."
                  rows={3}
                  className="bg-accent/5 border-border focus:border-primary/50"
                />
              </div>

              {/* Generation Actions */}
              <div className="p-4 bg-muted/20 rounded-xl border border-border space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">AI Creative Direction</Label>
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Add specific instructions for generation..."
                    rows={2}
                    className="bg-background border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Button
                      onClick={() => onRegenerateVisual(customPrompt || undefined)}
                      disabled={isRegenerating}
                      className="w-full"
                      variant="outline"
                    >
                      {isRegenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Image className="h-4 w-4 mr-2" />
                          Regenerate Image
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-1 mb-2">
                      <Button
                        variant={selectedModel === "luma" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedModel("luma")}
                        className={`text-[10px] h-6 px-2 ${selectedModel === "luma" ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}`}
                      >
                        Luma (Cinematic)
                      </Button>
                      <Button
                        variant={selectedModel === "kling" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedModel("kling")}
                        className={`text-[10px] h-6 px-2 ${selectedModel === "kling" ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}`}
                      >
                        Kling (Realistic)
                      </Button>
                    </div>
                    <Button
                      onClick={() => onGenerateVideo(selectedModel, customPrompt || undefined)}
                      disabled={isRegenerating}
                      className="w-full bg-primary/90 hover:bg-primary"
                    >
                      {isRegenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Video...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Video
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "text" && (
            <>
              {/* Voiceover */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mic className="h-4 w-4" />
                  Voiceover Script
                </Label>
                <Textarea
                  value={editedScene.voiceover}
                  onChange={(e) => setEditedScene({ ...editedScene, voiceover: e.target.value })}
                  placeholder="Enter voiceover text..."
                  rows={4}
                  className="bg-accent/5 border-border focus:border-primary/50"
                />
              </div>

              {/* Tone of Voice Selection - Roadmap Milestone */}
              <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    Tone of Voice Strategy
                  </Label>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary" onClick={() => { }}>
                    AI Analyze Brand
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'premium', label: 'Premium', desc: 'Sleek & Sophisticated' },
                    { id: 'urgent', label: 'Urgent', desc: 'Fast & Direct' },
                    { id: 'educational', label: 'Educational', desc: 'Clear & Trustworthy' },
                    { id: 'emotional', label: 'Emotional', desc: 'Impactful & Soft' }
                  ].map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setEditedScene({ ...editedScene, suggestedVisuals: `[Tone: ${tone.label}] ${editedScene.suggestedVisuals}` })}
                      className="group p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                    >
                      <p className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">{tone.label}</p>
                      <p className="text-[9px] text-muted-foreground">{tone.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Visuals */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Camera & Composition Notes</Label>
                <Textarea
                  value={editedScene.suggestedVisuals}
                  onChange={(e) => setEditedScene({ ...editedScene, suggestedVisuals: e.target.value })}
                  placeholder="Camera angles, composition details..."
                  rows={3}
                  className="bg-accent/5 border-border focus:border-primary/50"
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
