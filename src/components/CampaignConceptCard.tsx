import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight } from "lucide-react";

interface CampaignConceptCardProps {
  title: string;
  description: string;
  script: string;
  ctaText: string;
  predictedCtr: number;
  predictedEngagement: string;
  onClick: () => void;
}

const CampaignConceptCard = ({
  title,
  description,
  script,
  ctaText,
  predictedCtr,
  predictedEngagement,
  onClick
}: CampaignConceptCardProps) => {
  const engagementColor = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-accent/20 text-accent-foreground",
    high: "bg-primary/20 text-primary"
  }[predictedEngagement] || "bg-muted text-muted-foreground";

  return (
    <Card className="bg-card border-border cursor-pointer group overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
              {title}
            </h3>
            <Badge className={`${engagementColor} transition-transform duration-200 group-hover:scale-105`} variant="secondary">
              {predictedEngagement}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Script Preview */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border transition-colors duration-200 group-hover:border-primary/20 group-hover:bg-muted/40">
          <p className="text-sm text-foreground/80 line-clamp-3 italic">
            "{script}"
          </p>
        </div>

        {/* Metrics & CTA */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span className="text-sm font-medium text-foreground">
              {predictedCtr.toFixed(1)}% CTR
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            CTA: <span className="font-medium text-foreground">{ctaText}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onClick}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 group-hover:shadow-lg active:scale-[0.98]"
        >
          Expand Concept
          <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
};

export default CampaignConceptCard;
