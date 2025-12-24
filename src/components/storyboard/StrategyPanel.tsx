import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TVAdStrategy } from "@/components/strategy/StrategyModule";
import { 
  Target, 
  MessageSquare, 
  Users, 
  Film, 
  Clock, 
  MousePointer, 
  Palette,
  Edit3,
  Sparkles
} from "lucide-react";

interface StrategyPanelProps {
  strategy: TVAdStrategy;
  onEdit?: () => void;
  compact?: boolean;
}

const objectiveLabels: Record<string, string> = {
  awareness: "Brand Awareness",
  consideration: "Consideration",
  promotion: "Promotion",
  brand_launch: "Brand Launch",
};

const frameworkLabels: Record<string, string> = {
  problem_solution: "Problem → Solution",
  emotional_build: "Emotional Build",
  authority_proof: "Authority/Proof",
  offer_driven: "Offer Driven",
};

export const StrategyPanel = ({ strategy, onEdit, compact = false }: StrategyPanelProps) => {
  if (compact) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Strategy
            </CardTitle>
            {onEdit && (
              <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 px-2">
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">
              {objectiveLabels[strategy.objective]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {strategy.adLength}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {strategy.pacing}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs line-clamp-2">
            {strategy.coreMessage.primary}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            TV Ad Strategy
          </CardTitle>
          {onEdit && (
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Strategy
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Objective & Framework */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Target className="h-4 w-4" />
              Objective
            </div>
            <p className="font-medium">{objectiveLabels[strategy.objective]}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Film className="h-4 w-4" />
              Framework
            </div>
            <p className="font-medium">{frameworkLabels[strategy.storytellingFramework]}</p>
          </div>
        </div>

        {/* Core Message */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MessageSquare className="h-4 w-4" />
            Core Message
          </div>
          <div className="p-3 bg-muted/30 rounded-lg space-y-1">
            <p className="font-medium">{strategy.coreMessage.primary}</p>
            <p className="text-sm text-muted-foreground">{strategy.coreMessage.supporting}</p>
            <Badge variant="outline" className="mt-2 capitalize">
              {strategy.coreMessage.emotionalAngle}
            </Badge>
          </div>
        </div>

        {/* Audience */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users className="h-4 w-4" />
            Target Audience
          </div>
          <div className="p-3 bg-muted/30 rounded-lg space-y-2">
            <p className="text-sm"><strong>Primary:</strong> {strategy.audience.primary}</p>
            <p className="text-sm"><strong>Secondary:</strong> {strategy.audience.secondary}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">{strategy.audience.ageRange}</Badge>
              <Badge variant="secondary" className="text-xs">{strategy.audience.viewingContext}</Badge>
            </div>
          </div>
        </div>

        {/* Timing & Pacing */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              Length
            </div>
            <p className="font-medium">{strategy.adLength}</p>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-sm">Pacing</div>
            <p className="font-medium capitalize">{strategy.pacing}</p>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-sm">Hook @</div>
            <p className="font-medium">{strategy.hookTiming}s</p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MousePointer className="h-4 w-4" />
            Call to Action
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {strategy.cta.text}
            </Badge>
            <span className="text-sm text-muted-foreground capitalize">
              {strategy.cta.strength} • {strategy.cta.placement}
            </span>
          </div>
        </div>

        {/* Visual Direction */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Palette className="h-4 w-4" />
            Visual Direction
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">{strategy.visualDirection.tone}</Badge>
            <Badge variant="outline" className="capitalize">{strategy.visualDirection.cameraMovement} camera</Badge>
            <Badge variant="outline">{strategy.visualDirection.musicMood}</Badge>
            <Badge variant="outline" className="capitalize">{strategy.visualDirection.voiceoverStyle} VO</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
