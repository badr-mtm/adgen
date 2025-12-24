import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, ChevronUp, Lock, Unlock } from "lucide-react";
import { CampaignObjective } from "./CampaignObjective";
import { CoreMessage } from "./CoreMessage";
import { AudienceStrategy } from "./AudienceStrategy";
import { StorytellingFramework } from "./StorytellingFramework";
import { AdLengthPacing } from "./AdLengthPacing";
import { CTAStrategy } from "./CTAStrategy";
import { VisualAudioDirection } from "./VisualAudioDirection";

export interface TVAdStrategy {
  objective: "awareness" | "consideration" | "promotion" | "brand_launch";
  coreMessage: {
    primary: string;
    supporting: string;
    emotionalAngle: "trust" | "aspiration" | "urgency" | "authority";
  };
  audience: {
    primary: string;
    secondary: string;
    viewingContext: string;
    ageRange: string;
    householdType: string;
    psychographicIntent: string;
  };
  storytellingFramework: "problem_solution" | "emotional_build" | "authority_proof" | "offer_driven";
  adLength: "15s" | "30s" | "45s";
  pacing: "fast" | "balanced" | "cinematic";
  hookTiming: number;
  logoRevealTiming: number;
  cta: {
    text: string;
    strength: "soft" | "direct";
    placement: "early" | "mid" | "end";
  };
  visualDirection: {
    tone: "cinematic" | "lifestyle" | "premium" | "dynamic";
    cameraMovement: "static" | "subtle" | "dynamic" | "dramatic";
    musicMood: string;
    voiceoverStyle: "warm" | "authoritative" | "energetic" | "conversational";
  };
}

interface StrategyModuleProps {
  strategy: TVAdStrategy;
  onStrategyChange: (strategy: TVAdStrategy) => void;
  isAIGenerated?: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export function StrategyModule({
  strategy,
  onStrategyChange,
  isAIGenerated = true,
  isLocked = false,
  onToggleLock,
}: StrategyModuleProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "objective",
    "message",
    "storytelling",
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const isSectionExpanded = (section: string) =>
    expandedSections.includes(section);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Strategy Header */}
      <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">TV Ad Strategy</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isAIGenerated
                    ? "AI-generated strategy • Fully editable"
                    : "Custom strategy"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAIGenerated && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  AI Built
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleLock}
                className="text-muted-foreground"
              >
                {isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Strategy Sections */}
      <div className="space-y-3">
        {/* Campaign Objective */}
        <StrategySection
          title="Campaign Objective"
          description="What do you want this TV ad to achieve?"
          expanded={isSectionExpanded("objective")}
          onToggle={() => toggleSection("objective")}
          locked={isLocked}
        >
          <CampaignObjective
            value={strategy.objective}
            onChange={(objective) =>
              onStrategyChange({ ...strategy, objective })
            }
            disabled={isLocked}
          />
        </StrategySection>

        {/* Core Message */}
        <StrategySection
          title="Core Message Definition"
          description="The narrative anchor for your TV ad"
          expanded={isSectionExpanded("message")}
          onToggle={() => toggleSection("message")}
          locked={isLocked}
        >
          <CoreMessage
            value={strategy.coreMessage}
            onChange={(coreMessage) =>
              onStrategyChange({ ...strategy, coreMessage })
            }
            disabled={isLocked}
          />
        </StrategySection>

        {/* Audience Strategy */}
        <StrategySection
          title="Audience Strategy"
          description="Who will see your TV ad and when"
          expanded={isSectionExpanded("audience")}
          onToggle={() => toggleSection("audience")}
          locked={isLocked}
        >
          <AudienceStrategy
            value={strategy.audience}
            onChange={(audience) =>
              onStrategyChange({ ...strategy, audience })
            }
            disabled={isLocked}
          />
        </StrategySection>

        {/* Storytelling Framework */}
        <StrategySection
          title="Storytelling Framework"
          description="The narrative structure for maximum impact"
          expanded={isSectionExpanded("storytelling")}
          onToggle={() => toggleSection("storytelling")}
          locked={isLocked}
        >
          <StorytellingFramework
            value={strategy.storytellingFramework}
            onChange={(storytellingFramework) =>
              onStrategyChange({ ...strategy, storytellingFramework })
            }
            disabled={isLocked}
          />
        </StrategySection>

        {/* Ad Length & Pacing */}
        <StrategySection
          title="Ad Length & Pacing"
          description="Duration and rhythm of your TV spot"
          expanded={isSectionExpanded("pacing")}
          onToggle={() => toggleSection("pacing")}
          locked={isLocked}
        >
          <AdLengthPacing
            adLength={strategy.adLength}
            pacing={strategy.pacing}
            hookTiming={strategy.hookTiming}
            logoRevealTiming={strategy.logoRevealTiming}
            onChange={(updates) => onStrategyChange({ ...strategy, ...updates })}
            disabled={isLocked}
          />
        </StrategySection>

        {/* CTA Strategy */}
        <StrategySection
          title="Call-to-Action Strategy"
          description="Drive viewer response"
          expanded={isSectionExpanded("cta")}
          onToggle={() => toggleSection("cta")}
          locked={isLocked}
        >
          <CTAStrategy
            value={strategy.cta}
            onChange={(cta) => onStrategyChange({ ...strategy, cta })}
            disabled={isLocked}
          />
        </StrategySection>

        {/* Visual & Audio Direction */}
        <StrategySection
          title="Visual & Audio Direction"
          description="The look, feel, and sound of your TV ad"
          expanded={isSectionExpanded("visual")}
          onToggle={() => toggleSection("visual")}
          locked={isLocked}
        >
          <VisualAudioDirection
            value={strategy.visualDirection}
            onChange={(visualDirection) =>
              onStrategyChange({ ...strategy, visualDirection })
            }
            disabled={isLocked}
          />
        </StrategySection>
      </div>
    </motion.div>
  );
}

interface StrategySectionProps {
  title: string;
  description: string;
  expanded: boolean;
  onToggle: () => void;
  locked?: boolean;
  children: React.ReactNode;
}

function StrategySection({
  title,
  description,
  expanded,
  onToggle,
  locked,
  children,
}: StrategySectionProps) {
  return (
    <Card className="border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div>
          <h3 className="font-medium text-foreground flex items-center gap-2">
            {title}
            {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <CardContent className="pt-0 pb-4">{children}</CardContent>
        </motion.div>
      )}
    </Card>
  );
}
