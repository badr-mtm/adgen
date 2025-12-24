import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TVAdStrategy } from "@/components/strategy/StrategyModule";
import { Target, Clock, Heart, MousePointer, Palette, MessageSquare } from "lucide-react";

interface SceneStrategyIndicatorsProps {
  sceneNumber: number;
  totalScenes: number;
  sceneDuration: string;
  strategy: TVAdStrategy;
}

export const SceneStrategyIndicators = ({
  sceneNumber,
  totalScenes,
  sceneDuration,
  strategy,
}: SceneStrategyIndicatorsProps) => {
  const indicators: { icon: React.ReactNode; label: string; description: string; color: string }[] = [];
  
  // Parse scene duration to seconds
  const durationSeconds = parseInt(sceneDuration.replace('s', '')) || 5;
  
  // Calculate cumulative time to this scene (rough estimate)
  const avgSceneDuration = strategy.adLength === "15s" ? 3 : strategy.adLength === "30s" ? 5 : 7;
  const sceneStartTime = (sceneNumber - 1) * avgSceneDuration;
  const sceneEndTime = sceneStartTime + durationSeconds;
  
  // Check if this scene is the hook scene (based on hookTiming)
  if (sceneStartTime <= strategy.hookTiming && strategy.hookTiming < sceneEndTime) {
    indicators.push({
      icon: <Target className="h-3 w-3" />,
      label: "Hook",
      description: `Hook moment at ${strategy.hookTiming}s - Grab attention here`,
      color: "bg-amber-500/10 text-amber-500 border-amber-500/30"
    });
  }
  
  // Check if this is the first scene (emotional angle introduction)
  if (sceneNumber === 1) {
    const angleLabels = {
      trust: "Build Trust",
      aspiration: "Inspire Aspiration", 
      urgency: "Create Urgency",
      authority: "Establish Authority"
    };
    indicators.push({
      icon: <Heart className="h-3 w-3" />,
      label: angleLabels[strategy.coreMessage.emotionalAngle] || strategy.coreMessage.emotionalAngle,
      description: `Emotional angle: ${strategy.coreMessage.emotionalAngle} - Set the tone`,
      color: "bg-pink-500/10 text-pink-500 border-pink-500/30"
    });
  }
  
  // Check if this scene has the logo reveal
  if (sceneStartTime <= strategy.logoRevealTiming && strategy.logoRevealTiming < sceneEndTime) {
    indicators.push({
      icon: <Palette className="h-3 w-3" />,
      label: "Logo Reveal",
      description: `Logo reveal at ${strategy.logoRevealTiming}s - Brand moment`,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/30"
    });
  }
  
  // Check if this is the CTA scene (based on placement)
  const isCtaScene = 
    (strategy.cta.placement === "early" && sceneNumber === 1) ||
    (strategy.cta.placement === "mid" && sceneNumber === Math.ceil(totalScenes / 2)) ||
    (strategy.cta.placement === "end" && sceneNumber === totalScenes);
  
  if (isCtaScene) {
    indicators.push({
      icon: <MousePointer className="h-3 w-3" />,
      label: "CTA",
      description: `CTA: "${strategy.cta.text}" (${strategy.cta.strength})`,
      color: "bg-green-500/10 text-green-500 border-green-500/30"
    });
  }
  
  // Check if this scene should feature the core message
  if (sceneNumber === Math.ceil(totalScenes / 2)) {
    indicators.push({
      icon: <MessageSquare className="h-3 w-3" />,
      label: "Core Message",
      description: strategy.coreMessage.primary,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/30"
    });
  }
  
  // Visual tone indicator for first scene
  if (sceneNumber === 1) {
    indicators.push({
      icon: <Clock className="h-3 w-3" />,
      label: strategy.pacing,
      description: `Pacing: ${strategy.pacing} - ${strategy.visualDirection.tone} tone`,
      color: "bg-slate-500/10 text-slate-400 border-slate-500/30"
    });
  }

  if (indicators.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1.5">
        {indicators.map((indicator, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={`${indicator.color} text-xs py-0.5 px-2 cursor-help gap-1`}
              >
                {indicator.icon}
                {indicator.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{indicator.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
