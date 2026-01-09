import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Cpu,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AISuggestions = () => {
  const [autoApply, setAutoApply] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const INSIGHTS = [
    {
      id: "1",
      title: "Scale Opportunity Detected",
      desc: "Roku audience saturation is low (12%). Increasing bid cap by $0.50 could unlock 450k new households.",
      impact: "+18% Reach",
      confidence: 96,
      type: "scale"
    },
    {
      id: "2",
      title: "Creative Fatigue Warning",
      desc: "'Summer Launch - Scene 3' has a 15% drop-off rate. Recommended Action: Swap with 'Lifestyle Variant B'.",
      impact: "+5% Retention",
      confidence: 88,
      type: "fix"
    },
    {
      id: "3",
      title: "Underserved Demographic",
      desc: "High conversion rate detected in 'Tech Professionals 35-44'. This segment is currently under-targeted.",
      impact: "+22% ROAS",
      confidence: 92,
      type: "opportunity"
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6 space-y-8 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Cpu className="h-8 w-8 text-primary" />
              Predictive Intelligence
            </h1>
            <p className="text-muted-foreground">Neural engine analyzing real-time campaign data.</p>
          </div>
          <div className="flex items-center gap-4 bg-card/50 border border-white/10 p-2 rounded-xl backdrop-blur-sm">
            <span className="text-sm font-medium text-white px-2">Auto-Optimization</span>
            <Switch checked={autoApply} onCheckedChange={setAutoApply} className="data-[state=checked]:bg-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Feed */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" /> Active Insights
            </h2>

            <div className="space-y-4">
              {INSIGHTS.map((insight) => (
                <motion.div
                  key={insight.id}
                  layoutId={insight.id}
                  onClick={() => setSelectedInsight(insight.id)}
                  className={`relative overflow-hidden rounded-2xl border bg-card/30 p-6 cursor-pointer group transition-all duration-300 ${selectedInsight === insight.id ? 'border-primary/50 bg-primary/5 shadow-2xl shadow-primary/10 ring-1 ring-primary/50' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${insight.type === 'scale' ? 'bg-green-500/20 text-green-400' : insight.type === 'fix' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {insight.type === 'scale' && <TrendingUp className="h-5 w-5" />}
                        {insight.type === 'fix' && <AlertTriangle className="h-5 w-5" />}
                        {insight.type === 'opportunity' && <Sparkles className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{insight.title}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Confidence:</span>
                          <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${insight.confidence}%` }} />
                          </div>
                          <span className="text-primary font-bold">{insight.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-white/10 hover:bg-white/20 border-0 text-white px-3 py-1">
                      {insight.impact}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{insight.desc}</p>

                  <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" className="bg-primary text-black hover:bg-primary/90">Apply Fix</Button>
                    <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10">Simulate Impact</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Simulation / Status */}
          <div className="space-y-6">
            <Card className="bg-card/20 border-white/10 backdrop-blur-md h-full min-h-[400px]">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                {selectedInsight ? (
                  <div key="sim" className="space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
                      <Brain className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Simulating Impact...</h3>
                      <p className="text-muted-foreground text-sm">Projecting outcomes for "{INSIGHTS.find(i => i.id === selectedInsight)?.title}"</p>
                    </div>

                    <div className="w-full bg-black/40 rounded-xl p-4 border border-white/5 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Reach</span>
                        <span className="text-white font-mono">1.2M</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-400 font-bold">
                        <span>Projected Reach</span>
                        <span className="font-mono">1.45M (+21%)</span>
                      </div>
                    </div>

                    <Button className="w-full bg-white text-black hover:bg-white/90 font-bold h-12">
                      Confirm & Apply
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 opacity-50">
                    <Brain className="h-16 w-16 mx-auto text-white/20" />
                    <p className="text-lg font-medium text-white/50">Select an insight to simulate its impact.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AISuggestions;
