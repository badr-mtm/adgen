import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Sparkles, RefreshCw, Clock, Edit3 } from "lucide-react";
import InlineEditField from "./InlineEditField";
import VoiceoverSection from "./VoiceoverSection";
import { SceneStrategyIndicators } from "./SceneStrategyIndicators";
import { TVAdStrategy } from "@/components/strategy/StrategyModule";

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
  audioUrl?: string;
  generatedAt?: string;
}

interface SceneCardProps {
  scene: Scene;
  totalScenes: number;
  strategy?: TVAdStrategy | null;
  isGenerating: boolean;
  onGenerateVisual: (sceneNumber: number, customPrompt?: string) => void;
  onUpdateScene: (sceneNumber: number, updates: Partial<Scene>) => void;
  onUploadAudio?: (sceneNumber: number, file: File) => void;
}

const SceneCard = ({
  scene,
  totalScenes,
  strategy,
  isGenerating,
  onGenerateVisual,
  onUpdateScene,
  onUploadAudio
}: SceneCardProps) => {
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Support both sceneNumber and number fields
  const sceneNum = scene.sceneNumber ?? scene.number ?? 1;
  const visualDesc = scene.visualDescription || scene.description || "";
  const suggestedVisuals = scene.suggestedVisuals || "";
  const voiceover = scene.voiceover || "";

  const handleGenerateWithPrompt = () => {
    onGenerateVisual(sceneNum, customPrompt);
    setDialogOpen(false);
    setCustomPrompt("");
  };

  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300">
      {/* Strategy Indicators */}
      {strategy && (
        <div className="mb-4">
          <SceneStrategyIndicators
            sceneNumber={sceneNum}
            totalScenes={totalScenes}
            sceneDuration={scene.duration}
            strategy={strategy}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Section */}
        <div className="space-y-4">
          {/* Scene Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary text-primary-foreground">
                Scene {sceneNum}
              </Badge>
              {isEditingDuration ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    defaultValue={scene.duration}
                    className="w-20 h-8"
                    placeholder="e.g., 5s"
                    onBlur={(e) => {
                      if (e.target.value !== scene.duration) {
                        onUpdateScene(sceneNum, { duration: e.target.value });
                      }
                      setIsEditingDuration(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onUpdateScene(sceneNum, { duration: e.currentTarget.value });
                        setIsEditingDuration(false);
                      }
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setIsEditingDuration(true)}
                >
                  {scene.duration}
                  <Edit3 className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>

          {/* Generated Visual */}
          {scene.visualUrl ? (
            <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
              <img 
                src={scene.visualUrl} 
                alt={`Scene ${sceneNum}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Regenerate Scene {sceneNum}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea
                        placeholder="Describe what you want to see in this scene..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button 
                        onClick={handleGenerateWithPrompt}
                        disabled={isGenerating}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Visual
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-muted/30 border-2 border-dashed border-border aspect-video flex flex-col items-center justify-center gap-3">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Visual
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Scene {sceneNum} Visual</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      Add a custom prompt or leave empty to use the default scene description.
                    </p>
                    <Textarea
                      placeholder="Describe what you want to see in this scene (optional)..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={handleGenerateWithPrompt}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Visual
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          {/* Visual Description */}
          <InlineEditField
            label="Visual"
            value={visualDesc}
            type="textarea"
            onSave={(value) => onUpdateScene(sceneNum, { visualDescription: value })}
          />

          {/* Camera & Composition */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <InlineEditField
              label="Camera & Composition"
              value={suggestedVisuals}
              type="textarea"
              onSave={(value) => onUpdateScene(sceneNum, { suggestedVisuals: value })}
            />
          </div>

          {/* Voiceover */}
          <VoiceoverSection
            voiceover={voiceover}
            voiceoverLines={scene.voiceoverLines}
            audioUrl={scene.audioUrl}
            onSave={(vo, voLines) => 
              onUpdateScene(sceneNum, { voiceover: vo, voiceoverLines: voLines })
            }
            onUploadAudio={(file) => onUploadAudio?.(sceneNum, file)}
          />
        </div>
      </div>
    </Card>
  );
};

export default SceneCard;
