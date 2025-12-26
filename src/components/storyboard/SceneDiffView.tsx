import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Clock, Film, Mic, AlertCircle, Check, Plus, Minus } from "lucide-react";

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

interface SceneDiffViewProps {
  before: Storyboard;
  after: Storyboard;
}

export const SceneDiffView = ({ before, after }: SceneDiffViewProps) => {
  const maxScenes = Math.max(before.scenes.length, after.scenes.length);
  
  const getChangeType = (beforeVal: string, afterVal: string): "added" | "removed" | "changed" | "unchanged" => {
    if (!beforeVal && afterVal) return "added";
    if (beforeVal && !afterVal) return "removed";
    if (beforeVal !== afterVal) return "changed";
    return "unchanged";
  };

  const getSceneChanges = (beforeScene: Scene | undefined, afterScene: Scene | undefined) => {
    if (!beforeScene && afterScene) return { type: "added" as const, count: 0 };
    if (beforeScene && !afterScene) return { type: "removed" as const, count: 0 };
    if (!beforeScene || !afterScene) return { type: "unchanged" as const, count: 0 };

    let changes = 0;
    if (beforeScene.duration !== afterScene.duration) changes++;
    if ((beforeScene.visualDescription || beforeScene.description) !== (afterScene.visualDescription || afterScene.description)) changes++;
    if (beforeScene.suggestedVisuals !== afterScene.suggestedVisuals) changes++;
    if (beforeScene.voiceover !== afterScene.voiceover) changes++;

    return { type: changes > 0 ? "changed" as const : "unchanged" as const, count: changes };
  };

  const highlightDiff = (before: string, after: string) => {
    if (before === after) return <span className="text-foreground">{after}</span>;
    return (
      <span className="bg-primary/10 text-foreground px-1 rounded">{after}</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Script Diff */}
      <Card className="p-4 bg-card border-border">
        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <Film className="h-4 w-4 text-primary" />
          Script Changes (30s version)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Badge variant="outline" className="text-muted-foreground">Before</Badge>
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 min-h-[100px]">
              {before.scriptVariants?.["30s"] || before.scenes?.map(s => s.voiceover || s.description || s.visualDescription).join('\n\n') || "No script"}
            </div>
          </div>
          <div className="space-y-2">
            <Badge className="bg-primary/20 text-primary border-0">After</Badge>
            <div className="text-sm text-foreground bg-primary/5 rounded-lg p-3 min-h-[100px] border border-primary/20">
              {after.scriptVariants?.["30s"] || after.scenes?.map(s => s.voiceover || s.description || s.visualDescription).join('\n\n') || "No script"}
            </div>
          </div>
        </div>
      </Card>

      {/* Music Mood Diff */}
      {before.musicMood && after.musicMood && before.musicMood !== after.musicMood && (
        <Card className="p-4 bg-card border-border">
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Mic className="h-4 w-4 text-primary" />
            Music Mood Changed
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-sm text-muted-foreground bg-muted/30 rounded-lg p-2 text-center">
              {before.musicMood}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 text-sm text-foreground bg-primary/5 rounded-lg p-2 text-center border border-primary/20">
              {after.musicMood}
            </div>
          </div>
        </Card>
      )}

      {/* Scene-by-Scene Diff */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          Scene-by-Scene Comparison
          <Badge variant="secondary" className="ml-2">
            {after.scenes.length} scenes
          </Badge>
        </h3>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4 pr-4">
            {Array.from({ length: maxScenes }).map((_, index) => {
              const beforeScene = before.scenes[index];
              const afterScene = after.scenes[index];
              const { type, count } = getSceneChanges(beforeScene, afterScene);

              return (
                <Card key={index} className="p-4 bg-card border-border">
                  {/* Scene Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        Scene {index + 1}
                      </Badge>
                      {type === "added" && (
                        <Badge className="bg-green-500/20 text-green-500 border-0">
                          <Plus className="h-3 w-3 mr-1" />
                          New Scene
                        </Badge>
                      )}
                      {type === "removed" && (
                        <Badge className="bg-red-500/20 text-red-500 border-0">
                          <Minus className="h-3 w-3 mr-1" />
                          Removed
                        </Badge>
                      )}
                      {type === "changed" && (
                        <Badge className="bg-amber-500/20 text-amber-500 border-0">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {count} change{count > 1 ? "s" : ""}
                        </Badge>
                      )}
                      {type === "unchanged" && (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Check className="h-3 w-3 mr-1" />
                          Unchanged
                        </Badge>
                      )}
                    </div>
                    
                    {/* Duration comparison */}
                    {beforeScene && afterScene && beforeScene.duration !== afterScene.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground line-through">{beforeScene.duration}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="text-primary font-medium">{afterScene.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Diff Content */}
                  {type !== "unchanged" && (
                    <div className="space-y-3">
                      {/* Visual Description */}
                      {afterScene && ((beforeScene?.visualDescription || beforeScene?.description) !== (afterScene.visualDescription || afterScene.description)) && (
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Visual</span>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-sm text-muted-foreground bg-muted/30 rounded p-2">
                              {beforeScene?.visualDescription || beforeScene?.description || <span className="italic">N/A</span>}
                            </div>
                            <div className="text-sm text-foreground bg-primary/5 rounded p-2 border border-primary/20">
                              {afterScene.visualDescription || afterScene.description}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Voiceover */}
                      {afterScene && (beforeScene?.voiceover !== afterScene.voiceover) && (
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Voiceover</span>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-sm text-muted-foreground bg-muted/30 rounded p-2 italic">
                              "{beforeScene?.voiceover || "N/A"}"
                            </div>
                            <div className="text-sm text-foreground bg-primary/5 rounded p-2 border border-primary/20 italic">
                              "{afterScene.voiceover}"
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Strategy Alignment (if available) */}
                      {afterScene?.strategyAlignment && (
                        <div className="mt-2 p-2 bg-primary/5 rounded border border-primary/20">
                          <span className="text-xs font-medium text-primary">Strategy Alignment: </span>
                          <span className="text-xs text-muted-foreground">{afterScene.strategyAlignment}</span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Summary */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Check className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Regeneration Complete</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {after.scenes.length} scenes generated based on your updated strategy. 
              Review the changes above and proceed to generate visuals for the new scenes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
