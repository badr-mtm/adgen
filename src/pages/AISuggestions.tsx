import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  Palette,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Suggestion {
  id: string;
  type: "performance" | "creative" | "timing" | "audience";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  campaign?: string;
  applied: boolean;
}

const AISuggestions = () => {
  const navigate = useNavigate();
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: "1",
      type: "performance",
      title: "Optimize CTR for Summer Sale Campaign",
      description: "Based on your audience engagement patterns, using action-oriented CTAs like 'Shop Now' instead of 'Learn More' could improve CTR by up to 23%.",
      impact: "high",
      campaign: "Summer Sale",
      applied: false,
    },
    {
      id: "2",
      type: "creative",
      title: "Update Visual Style",
      description: "Your brand's green color palette is performing 15% better than neutral tones. Consider applying this to your Product Launch campaign.",
      impact: "medium",
      campaign: "Product Launch",
      applied: false,
    },
    {
      id: "3",
      type: "timing",
      title: "Optimal Posting Schedule",
      description: "Your audience is most active between 7-9 PM on weekdays. Scheduling posts during this window could increase engagement by 40%.",
      impact: "high",
      applied: true,
    },
    {
      id: "4",
      type: "audience",
      title: "Expand Target Demographics",
      description: "Similar audiences in the 35-44 age group show high conversion potential. Consider expanding your targeting to include this segment.",
      impact: "medium",
      applied: false,
    },
    {
      id: "5",
      type: "creative",
      title: "Add Motion to Static Ads",
      description: "Converting your top-performing static ads to subtle motion graphics could increase engagement by 28% based on industry trends.",
      impact: "high",
      applied: false,
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <TrendingUp className="h-5 w-5" />;
      case "creative":
        return <Palette className="h-5 w-5" />;
      case "timing":
        return <Clock className="h-5 w-5" />;
      case "audience":
        return <Target className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-primary/10 text-primary border-primary/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "";
    }
  };

  const handleApply = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, applied: true } : s))
    );
  };

  const handleDismiss = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const activeSuggestions = suggestions.filter((s) => !s.applied);
  const appliedSuggestions = suggestions.filter((s) => s.applied);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Suggestions</h1>
            <p className="text-muted-foreground">
              Intelligent recommendations to improve your ad performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Auto-suggestions</span>
            <Switch checked={autoSuggestions} onCheckedChange={setAutoSuggestions} />
          </div>
        </div>

        {/* Overview Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {activeSuggestions.length} New Suggestions
                </h2>
                <p className="text-muted-foreground mt-1">
                  Our AI has analyzed your campaigns and found opportunities to improve performance.
                </p>
              </div>
              <Button onClick={() => navigate("/create")} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Create Optimized Ad
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeSuggestions.length})
            </TabsTrigger>
            <TabsTrigger value="applied">
              Applied ({appliedSuggestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeSuggestions.length > 0 ? (
              activeSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          suggestion.type === "performance"
                            ? "bg-primary/10 text-primary"
                            : suggestion.type === "creative"
                            ? "bg-purple-500/10 text-purple-500"
                            : suggestion.type === "timing"
                            ? "bg-orange-500/10 text-orange-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {suggestion.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getImpactColor(suggestion.impact)}
                          >
                            {suggestion.impact} impact
                          </Badge>
                        </div>
                        {suggestion.campaign && (
                          <p className="text-sm text-primary mb-2">
                            Campaign: {suggestion.campaign}
                          </p>
                        )}
                        <p className="text-muted-foreground">{suggestion.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismiss(suggestion.id)}
                        >
                          Dismiss
                        </Button>
                        <Button size="sm" onClick={() => handleApply(suggestion.id)}>
                          Apply
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-lg text-foreground mb-2">All caught up!</p>
                  <p className="text-muted-foreground">
                    No pending suggestions. We'll notify you when new insights are available.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="applied" className="space-y-4">
            {appliedSuggestions.length > 0 ? (
              appliedSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="bg-card border-border opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {suggestion.title}
                          </h3>
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Applied
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{suggestion.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-foreground mb-2">No applied suggestions yet</p>
                  <p className="text-muted-foreground">
                    Applied suggestions will appear here for your reference.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* AI Insights */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Industry Trends
            </CardTitle>
            <CardDescription>
              Stay ahead with the latest advertising trends powered by AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium text-foreground mb-2">Short-Form Video</h4>
                <p className="text-sm text-muted-foreground">
                  15-second videos are seeing 45% higher engagement rates this quarter.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium text-foreground mb-2">User-Generated Content</h4>
                <p className="text-sm text-muted-foreground">
                  UGC-style ads show 2.4x better conversion rates than polished content.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium text-foreground mb-2">Interactive Elements</h4>
                <p className="text-sm text-muted-foreground">
                  Ads with polls or quizzes increase time spent by 73%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AISuggestions;
