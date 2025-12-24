import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  BarChart2,
  Link2,
  Check,
  ExternalLink,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "advertising" | "analytics";
  connected: boolean;
  features: string[];
}

const Integrations = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "google-ads",
      name: "Google Ads",
      description: "Publish and manage your video and display ads directly on Google Ads",
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      category: "advertising",
      connected: false,
      features: ["Auto-publish campaigns", "Performance sync", "Audience targeting"],
    },
    {
      id: "meta-ads",
      name: "Meta Ads",
      description: "Connect to Facebook and Instagram advertising platforms",
      icon: <Facebook className="h-8 w-8" />,
      category: "advertising",
      connected: true,
      features: ["Facebook Ads", "Instagram Ads", "Audience insights"],
    },
    {
      id: "tiktok-ads",
      name: "TikTok Ads",
      description: "Reach younger audiences with TikTok advertising",
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      ),
      category: "advertising",
      connected: false,
      features: ["Video ads", "Spark ads", "Branded effects"],
    },
    {
      id: "linkedin-ads",
      name: "LinkedIn Ads",
      description: "Professional B2B advertising on LinkedIn",
      icon: <Linkedin className="h-8 w-8" />,
      category: "advertising",
      connected: false,
      features: ["Sponsored content", "Lead gen forms", "Account targeting"],
    },
    {
      id: "youtube-ads",
      name: "YouTube Ads",
      description: "Video advertising on YouTube platform",
      icon: <Youtube className="h-8 w-8" />,
      category: "advertising",
      connected: false,
      features: ["In-stream ads", "Discovery ads", "Bumper ads"],
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Track and analyze your campaign performance",
      icon: <BarChart2 className="h-8 w-8" />,
      category: "analytics",
      connected: true,
      features: ["Traffic analysis", "Conversion tracking", "Audience insights"],
    },
  ]);

  const handleToggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
    const integration = integrations.find((i) => i.id === id);
    toast({
      title: integration?.connected ? "Disconnected" : "Connected",
      description: `${integration?.name} has been ${integration?.connected ? "disconnected" : "connected"}`,
    });
  };

  const advertisingIntegrations = integrations.filter((i) => i.category === "advertising");
  const analyticsIntegrations = integrations.filter((i) => i.category === "analytics");

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your advertising and analytics platforms
          </p>
        </div>

        {/* Connected Summary */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {integrations.filter((i) => i.connected).length} Active Connections
                </p>
                <p className="text-sm text-muted-foreground">
                  {integrations.filter((i) => !i.connected).length} available to connect
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advertising Platforms */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Advertising Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advertisingIntegrations.map((integration) => (
              <Card
                key={integration.id}
                className={`bg-card border-border transition-all ${
                  integration.connected ? "border-primary/50" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          integration.connected
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {integration.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        {integration.connected && (
                          <Badge variant="secondary" className="mt-1 gap-1">
                            <Check className="h-3 w-3" />
                            Connected
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={integration.connected}
                      onCheckedChange={() => handleToggleConnection(integration.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription>{integration.description}</CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {integration.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  {integration.connected && (
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Manage Settings
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Analytics Tools */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Analytics Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsIntegrations.map((integration) => (
              <Card
                key={integration.id}
                className={`bg-card border-border transition-all ${
                  integration.connected ? "border-primary/50" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          integration.connected
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {integration.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        {integration.connected && (
                          <Badge variant="secondary" className="mt-1 gap-1">
                            <Check className="h-3 w-3" />
                            Connected
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={integration.connected}
                      onCheckedChange={() => handleToggleConnection(integration.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription>{integration.description}</CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {integration.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  {integration.connected && (
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Manage Settings
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Integrations;
