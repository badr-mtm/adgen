import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TVAdStrategy } from "@/components/strategy/StrategyModule";
import { ArrowRight, AlertTriangle, Check, Minus } from "lucide-react";

interface StrategyComparisonProps {
  before: TVAdStrategy;
  after: TVAdStrategy;
}

type ChangeType = "added" | "removed" | "changed" | "unchanged";

interface Change {
  field: string;
  label: string;
  before: string;
  after: string;
  type: ChangeType;
  impactLevel: "high" | "medium" | "low";
  affectedElements?: string[];
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

export const StrategyComparison = ({ before, after }: StrategyComparisonProps) => {
  const changes: Change[] = [];

  // Compare objective
  if (before.objective !== after.objective) {
    changes.push({
      field: "objective",
      label: "Campaign Objective",
      before: objectiveLabels[before.objective],
      after: objectiveLabels[after.objective],
      type: "changed",
      impactLevel: "high",
      affectedElements: ["All scenes", "Script tone", "CTA messaging"]
    });
  }

  // Compare core message
  if (before.coreMessage.primary !== after.coreMessage.primary) {
    changes.push({
      field: "coreMessage.primary",
      label: "Primary Message",
      before: before.coreMessage.primary,
      after: after.coreMessage.primary,
      type: "changed",
      impactLevel: "high",
      affectedElements: ["Voiceover scripts", "On-screen text", "Mid-ad scene"]
    });
  }

  if (before.coreMessage.emotionalAngle !== after.coreMessage.emotionalAngle) {
    changes.push({
      field: "coreMessage.emotionalAngle",
      label: "Emotional Angle",
      before: before.coreMessage.emotionalAngle,
      after: after.coreMessage.emotionalAngle,
      type: "changed",
      impactLevel: "high",
      affectedElements: ["Opening scene", "Visual tone", "Music selection"]
    });
  }

  // Compare storytelling framework
  if (before.storytellingFramework !== after.storytellingFramework) {
    changes.push({
      field: "storytellingFramework",
      label: "Storytelling Framework",
      before: frameworkLabels[before.storytellingFramework],
      after: frameworkLabels[after.storytellingFramework],
      type: "changed",
      impactLevel: "high",
      affectedElements: ["Scene order", "Narrative arc", "All scene descriptions"]
    });
  }

  // Compare ad length
  if (before.adLength !== after.adLength) {
    changes.push({
      field: "adLength",
      label: "Ad Length",
      before: before.adLength,
      after: after.adLength,
      type: "changed",
      impactLevel: "high",
      affectedElements: ["Scene count", "Scene durations", "Pacing"]
    });
  }

  // Compare pacing
  if (before.pacing !== after.pacing) {
    changes.push({
      field: "pacing",
      label: "Pacing",
      before: before.pacing,
      after: after.pacing,
      type: "changed",
      impactLevel: "medium",
      affectedElements: ["Scene transitions", "Cut timing", "Visual rhythm"]
    });
  }

  // Compare hook timing
  if (before.hookTiming !== after.hookTiming) {
    changes.push({
      field: "hookTiming",
      label: "Hook Timing",
      before: `${before.hookTiming}s`,
      after: `${after.hookTiming}s`,
      type: "changed",
      impactLevel: "medium",
      affectedElements: ["Opening scene", "Scene 1-2 content"]
    });
  }

  // Compare logo reveal timing
  if (before.logoRevealTiming !== after.logoRevealTiming) {
    changes.push({
      field: "logoRevealTiming",
      label: "Logo Reveal",
      before: `${before.logoRevealTiming}s`,
      after: `${after.logoRevealTiming}s`,
      type: "changed",
      impactLevel: "low",
      affectedElements: ["Brand reveal scene"]
    });
  }

  // Compare CTA
  if (before.cta.text !== after.cta.text) {
    changes.push({
      field: "cta.text",
      label: "CTA Text",
      before: before.cta.text,
      after: after.cta.text,
      type: "changed",
      impactLevel: "medium",
      affectedElements: ["End card", "Voiceover", "On-screen text"]
    });
  }

  if (before.cta.placement !== after.cta.placement) {
    changes.push({
      field: "cta.placement",
      label: "CTA Placement",
      before: before.cta.placement,
      after: after.cta.placement,
      type: "changed",
      impactLevel: "medium",
      affectedElements: ["CTA scene position"]
    });
  }

  // Compare visual direction
  if (before.visualDirection.tone !== after.visualDirection.tone) {
    changes.push({
      field: "visualDirection.tone",
      label: "Visual Tone",
      before: before.visualDirection.tone,
      after: after.visualDirection.tone,
      type: "changed",
      impactLevel: "high",
      affectedElements: ["All scene visuals", "Color grading", "Lighting"]
    });
  }

  if (before.visualDirection.musicMood !== after.visualDirection.musicMood) {
    changes.push({
      field: "visualDirection.musicMood",
      label: "Music Mood",
      before: before.visualDirection.musicMood,
      after: after.visualDirection.musicMood,
      type: "changed",
      impactLevel: "medium",
      affectedElements: ["Background music", "Audio mix"]
    });
  }

  if (before.visualDirection.voiceoverStyle !== after.visualDirection.voiceoverStyle) {
    changes.push({
      field: "visualDirection.voiceoverStyle",
      label: "Voiceover Style",
      before: before.visualDirection.voiceoverStyle,
      after: after.visualDirection.voiceoverStyle,
      type: "changed",
      impactLevel: "medium",
      affectedElements: ["All voiceover recordings"]
    });
  }

  // Compare audience
  if (before.audience.primary !== after.audience.primary) {
    changes.push({
      field: "audience.primary",
      label: "Primary Audience",
      before: before.audience.primary,
      after: after.audience.primary,
      type: "changed",
      impactLevel: "medium",
      affectedElements: ["Messaging tone", "Visual style", "CTA approach"]
    });
  }

  const highImpactChanges = changes.filter(c => c.impactLevel === "high");
  const mediumImpactChanges = changes.filter(c => c.impactLevel === "medium");
  const lowImpactChanges = changes.filter(c => c.impactLevel === "low");

  if (changes.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-muted-foreground">No changes detected</p>
        </CardContent>
      </Card>
    );
  }

  const allAffectedElements = [...new Set(changes.flatMap(c => c.affectedElements || []))];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {highImpactChanges.length > 0 && (
              <Badge className="bg-red-500/10 text-red-500 border-red-500/30">
                {highImpactChanges.length} High Impact
              </Badge>
            )}
            {mediumImpactChanges.length > 0 && (
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                {mediumImpactChanges.length} Medium Impact
              </Badge>
            )}
            {lowImpactChanges.length > 0 && (
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                {lowImpactChanges.length} Low Impact
              </Badge>
            )}
          </div>
          
          <div className="text-sm">
            <p className="text-muted-foreground mb-2">Elements that may need updating:</p>
            <div className="flex flex-wrap gap-1.5">
              {allAffectedElements.map((element, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {element}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Changes */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Detailed Changes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {changes.map((change, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-lg border ${
                change.impactLevel === "high" 
                  ? "border-red-500/30 bg-red-500/5" 
                  : change.impactLevel === "medium"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-blue-500/30 bg-blue-500/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{change.label}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    change.impactLevel === "high" 
                      ? "text-red-500" 
                      : change.impactLevel === "medium"
                      ? "text-amber-500"
                      : "text-blue-500"
                  }`}
                >
                  {change.impactLevel}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground line-through flex-1 truncate">
                  {change.before}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground flex-1 truncate font-medium">
                  {change.after}
                </span>
              </div>
              {change.affectedElements && change.affectedElements.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Affects: {change.affectedElements.join(", ")}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
