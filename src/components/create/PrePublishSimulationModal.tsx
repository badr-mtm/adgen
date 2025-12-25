import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  Rocket,
  Users,
  BarChart3,
  Calendar,
  Tv,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  Loader2
} from "lucide-react";

interface CampaignSimulation {
  estimatedReach: number;
  estimatedFrequency: number;
  estimatedImpressions: number;
  estimatedCPM: number;
  airingSchedule: {
    daypart: string;
    percentage: number;
  }[];
  networkBreakdown: {
    network: string;
    impressions: number;
  }[];
  riskWarnings: {
    level: "low" | "medium" | "high";
    message: string;
  }[];
}

interface PrePublishSimulationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onPublish: () => void;
  simulation: CampaignSimulation | null;
  isLoading: boolean;
  isPublishing: boolean;
  conceptTitle: string;
  duration: string;
}

export function PrePublishSimulationModal({
  open,
  onOpenChange,
  onBack,
  onPublish,
  simulation,
  isLoading,
  isPublishing,
  conceptTitle,
  duration
}: PrePublishSimulationModalProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-card border-border p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Campaign Preview
              </h2>
              <p className="text-sm text-muted-foreground">
                Review estimated performance before publishing
              </p>
            </div>
            <Badge variant="outline" className="border-border">
              <Clock className="h-3 w-3 mr-1" />
              {duration}
            </Badge>
          </div>

          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 animate-pulse">
                <BarChart3 className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <div>
                <p className="text-foreground font-medium">Simulating Campaign...</p>
                <p className="text-sm text-muted-foreground">Calculating reach and performance estimates</p>
              </div>
            </div>
          ) : simulation ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border text-center">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {formatNumber(simulation.estimatedReach)}
                  </div>
                  <div className="text-xs text-muted-foreground">Est. Reach</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border text-center">
                  <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {simulation.estimatedFrequency.toFixed(1)}x
                  </div>
                  <div className="text-xs text-muted-foreground">Avg. Frequency</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border text-center">
                  <Eye className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {formatNumber(simulation.estimatedImpressions)}
                  </div>
                  <div className="text-xs text-muted-foreground">Impressions</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border text-center">
                  <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    ${simulation.estimatedCPM.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Est. CPM</div>
                </div>
              </div>

              {/* Airing Schedule */}
              <div className="p-5 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Airing Schedule</span>
                </div>
                <div className="space-y-3">
                  {simulation.airingSchedule.map((slot, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{slot.daypart}</span>
                        <span className="text-foreground font-medium">{slot.percentage}%</span>
                      </div>
                      <Progress value={slot.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Network Breakdown */}
              <div className="p-5 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Tv className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Network Distribution</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {simulation.networkBreakdown.map((network, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                    >
                      <span className="text-foreground">{network.network}</span>
                      <Badge variant="secondary">
                        {formatNumber(network.impressions)} imp
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Warnings */}
              {simulation.riskWarnings.length > 0 && (
                <div className="space-y-3">
                  {simulation.riskWarnings.map((warning, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        flex items-start gap-3 p-4 rounded-xl border
                        ${warning.level === "high" 
                          ? "bg-destructive/10 border-destructive/30" 
                          : warning.level === "medium"
                            ? "bg-amber-500/10 border-amber-500/30"
                            : "bg-blue-500/10 border-blue-500/30"
                        }
                      `}
                    >
                      <AlertTriangle className={`
                        h-5 w-5 flex-shrink-0 mt-0.5
                        ${warning.level === "high" 
                          ? "text-destructive" 
                          : warning.level === "medium"
                            ? "text-amber-500"
                            : "text-blue-500"
                        }
                      `} />
                      <div>
                        <Badge 
                          variant="outline" 
                          className={`
                            text-xs mb-1
                            ${warning.level === "high" 
                              ? "border-destructive/30 text-destructive" 
                              : warning.level === "medium"
                                ? "border-amber-500/30 text-amber-500"
                                : "border-blue-500/30 text-blue-500"
                            }
                          `}
                        >
                          {warning.level.toUpperCase()} PRIORITY
                        </Badge>
                        <p className="text-sm text-foreground">{warning.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* All Clear */}
              {simulation.riskWarnings.length === 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <div>
                    <div className="font-medium text-foreground">Campaign Ready</div>
                    <p className="text-sm text-muted-foreground">
                      No issues detected. Your campaign is ready to publish.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button
              size="lg"
              onClick={onPublish}
              disabled={isLoading || isPublishing}
              className="h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5 mr-2" />
                  Publish Campaign
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
