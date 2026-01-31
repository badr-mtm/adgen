import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  Tv,
  BarChart2,
  Check,
  ExternalLink,
  Plus,
  Loader2,
  Settings2,
  MonitorPlay,
  Activity,
  Globe,
  Database,
  HelpCircle,
  FileKey
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Types ---

type IntegrationCategory = "dsp" | "analytics";

interface IntegrationField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "password";
  helpText?: string; // Short tooltip
  helpLink?: string; // External URL
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: IntegrationCategory;
  connected: boolean;
  features: string[];
  fields: IntegrationField[]; // Fields required to connect
  docLink?: string; // Main documentation link
}

// --- Data ---

const integrationData: Integration[] = [
  // --- TV DSPs ---
  {
    id: "roku",
    name: "Roku Ads Manager",
    description: "Direct inventory access to Roku's 70M+ active accounts.",
    icon: <Tv className="h-6 w-6 text-[#662D91]" />,
    category: "dsp",
    connected: false,
    features: ["OneView DSP", "Roku City Placements", "Automatic Content Recognition (ACR)"],
    docLink: "https://advertising.roku.com/support",
    fields: [
      {
        key: "seat_id",
        label: "Roku Seat ID",
        placeholder: "e.g. 1234-5678",
        type: "text",
        helpText: "Found in your Roku Ads Dashboard under Settings > Agency Accounts.",
        helpLink: "https://advertising.roku.com/onboarding"
      },
      {
        key: "api_key",
        label: "API Key",
        placeholder: "Enter your OneView API Key",
        type: "password",
        helpText: "Generate a read/write key in the API Access section of your profile."
      }
    ],
  },
  {
    id: "samsung-tv",
    name: "Samsung TV Plus",
    description: "Reach audiences on Samsung Smart TVs globally.",
    icon: <MonitorPlay className="h-6 w-6 text-[#1428A0]" />,
    category: "dsp",
    connected: false,
    features: ["Native UI Ads", "FAST Channel Insertion", "First-Screen Takeover"],
    fields: [
      {
        key: "partner_id",
        label: "Samsung Partner ID",
        placeholder: "e.g. SP-998877",
        type: "text",
        helpText: "Your unique 6-digit partner code."
      },
      {
        key: "client_secret",
        label: "Client Secret",
        placeholder: "Enter OAuth Client Secret",
        type: "password",
        helpLink: "https://developer.samsung.com/smarttv/develop/guides/smart-view/authentication.html"
      }
    ],
  },
  {
    id: "hulu",
    name: "Hulu Ad Manager",
    description: "Premium streaming inventory on Disney's Hulu platform.",
    icon: <div className="font-black text-[#1CE783] tracking-tighter text-lg">hulu</div>,
    category: "dsp",
    connected: false,
    features: ["Pause Ads", "Binge Ads", "Interactive Living Room"],
    docLink: "https://home.admanager.hulu.com/",
    fields: [
      {
        key: "account_id",
        label: "Hulu Account ID",
        placeholder: "e.g. HA-554433",
        type: "text",
        helpText: "Located in the top-right account dropdown menu."
      }
    ],
  },
  {
    id: "the-trade-desk",
    name: "The Trade Desk",
    description: "Global omnichannel DSP for open internet CTV buying.",
    icon: <Globe className="h-6 w-6 text-[#1F3A52]" />,
    category: "dsp",
    connected: false,
    features: ["Global Reach", "Unified ID 2.0", "Cross-Device Retargeting"],
    fields: [
      { key: "partner_id", label: "Partner ID", placeholder: "e.g. TTD-8899", type: "text" },
      { key: "api_token", label: "API Token", placeholder: "Paste your API Token", type: "password" }
    ],
  },

  // --- Analytics ---
  {
    id: "appsflyer",
    name: "AppsFlyer",
    description: "Cross-device attribution for mobile app conversions.",
    icon: <Activity className="h-6 w-6 text-[#00C2FF]" />,
    category: "analytics",
    connected: false,
    features: ["CTV-to-App Attribution", "Deep Linking", "Fraud Protection"],
    fields: [
      { key: "app_id", label: "App ID", placeholder: "e.g. id123456789", type: "text" },
      { key: "dev_key", label: "Dev Key", placeholder: "Enter Dev Key", type: "password" }
    ],
  },
  {
    id: "ispot",
    name: "iSpot.tv",
    description: "Real-time TV ad measurement and attribution.",
    icon: <BarChart2 className="h-6 w-6 text-[#29CC97]" />,
    category: "analytics",
    connected: false,
    features: ["Linear vs Streaming", "Attention Analytics", "Business Outcome Tracking"],
    fields: [
      { key: "client_id", label: "Client ID", placeholder: "e.g. IS-7766", type: "text" }
    ],
  },
  {
    id: "tvsquared",
    name: "TVSquared by Innovid",
    description: "Global converged TV measurement platform.",
    icon: <Database className="h-6 w-6 text-[#FF0055]" />,
    category: "analytics",
    connected: false,
    features: ["Incrementality", "Reach & Frequency", "Creative Performance"],
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Enter API Key", type: "password" }
    ],
  },
  {
    id: "ga4",
    name: "Google Analytics 4",
    description: "Enhanced web traffic analytics for TV attribution.",
    icon: <BarChart2 className="h-6 w-6 text-[#F9AB00]" />, // Placeholder color
    category: "analytics",
    connected: false,
    features: ["Web Traffic Spikes", "User Journey", "Conversion Events"],
    fields: [
      { key: "measurement_id", label: "Measurement ID", placeholder: "e.g. G-XXXXXXX", type: "text" }
    ],
  },
];

// --- Components ---

const Integrations = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>(integrationData);

  // Connection Modal State
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem("adgen_integrations_status");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIntegrations(prev => prev.map(i => ({
          ...i,
          connected: parsed[i.id] || false
        })));
      } catch (e) {
        console.error("Failed to load integration status", e);
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    const statusMap = integrations.reduce((acc, curr) => ({
      ...acc,
      [curr.id]: curr.connected
    }), {} as Record<string, boolean>);
    localStorage.setItem("adgen_integrations_status", JSON.stringify(statusMap));
  }, [integrations]);


  const handleOpenConnect = (integration: Integration) => {
    setFieldValues({});
    setSelectedIntegration(integration);
    setIsDialogOpen(true);
  };

  const handleDisconnect = (integration: Integration) => {
    setIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, connected: false } : i));
    toast({
      title: "Disconnected",
      description: `Successfully disconnected from ${integration.name}.`,
    });
  };

  const handleConnectSubmit = async () => {
    if (!selectedIntegration) return;

    // Simulate API call
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Fake realistic delay

    setIntegrations(prev => prev.map(i => i.id === selectedIntegration.id ? { ...i, connected: true } : i));
    setIsConnecting(false);
    setIsDialogOpen(false);

    toast({
      title: "Connection Successful",
      description: `${selectedIntegration.name} is now linked to your account.`,
      variant: "default",
    });
  };

  const dspIntegrations = integrations.filter(i => i.category === "dsp");
  const analyticsIntegrations = integrations.filter(i => i.category === "analytics");

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="p-8 space-y-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Tv className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Connectivity Hub</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Manage your seamless connections to major TV Networks, DSPs, and Attribution partners.
              All integrations are verified for automated creative delivery.
            </p>
          </div>

          {/* Section: Connected TV & DSPs */}
          <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Connected TV & DSPs
              </h2>
              <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-secondary rounded-md">
                {dspIntegrations.filter(i => i.connected).length} Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {dspIntegrations.map(integration => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={() => handleOpenConnect(integration)}
                  onDisconnect={() => handleDisconnect(integration)}
                />
              ))}
            </div>
          </section>

          {/* Section: Attribution */}
          <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-400" />
                TV Attribution & Analytics
              </h2>
              <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-secondary rounded-md">
                {analyticsIntegrations.filter(i => i.connected).length} Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {analyticsIntegrations.map(integration => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={() => handleOpenConnect(integration)}
                  onDisconnect={() => handleDisconnect(integration)}
                />
              ))}
            </div>
          </section>


          {/* Connection Modal */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-secondary rounded-lg">
                    {selectedIntegration?.icon}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      Connect {selectedIntegration?.name}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground bg-transparent border-border/50">
                        Secure Connection
                      </Badge>
                      {selectedIntegration?.docLink && (
                        <a
                          href={selectedIntegration.docLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          View Documentation <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <DialogDescription>
                  Enter your credentials below. This allows AdGen to securely sync campaigns and performance data.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 py-6">
                {selectedIntegration?.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.key} className="text-sm font-medium">
                        {field.label}
                      </Label>

                      {/* Contextual Help Links */}
                      {field.helpLink && (
                        <a
                          href={field.helpLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          Where do I find this? <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        id={field.key}
                        type={field.type}
                        placeholder={field.placeholder}
                        className="font-mono text-sm pl-9"
                        value={fieldValues[field.key] || ""}
                        onChange={(e) => setFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                        <FileKey className="h-4 w-4" />
                      </div>

                      {/* Contextual Validation/Help Tooltip */}
                      {field.helpText && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground/40 hover:text-primary/60 cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-[250px] text-xs">
                              {field.helpText}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="bg-primary/5 rounded-lg p-3 flex items-start gap-3 border border-primary/10">
                  <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Pre-Flight Check:</span> Connecting executes a read-only validation. We will verify permissions for <strong>Campaign Managment</strong> and <strong>Reporting</strong> immediately.
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isConnecting}>
                  Cancel
                </Button>
                <Button onClick={handleConnectSubmit} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Access...
                    </>
                  ) : (
                    <>Connect Platform</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

// --- Sub-Components ---

const IntegrationCard = ({
  integration,
  onConnect,
  onDisconnect
}: {
  integration: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`relative group bg-card border rounded-xl overflow-hidden transition-all duration-300 ${integration.connected
          ? "border-primary/40 shadow-[0_0_20px_-10px_hsl(var(--primary)/0.3)]"
          : "border-border hover:border-primary"
        }`}
    >
      {/* Top Banner Status */}
      {integration.connected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-indigo-500" />
      )}

      <div className="p-5 flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg transition-colors ${integration.connected ? "bg-primary/10" : "bg-muted group-hover:bg-accent"
            }`}>
            {integration.icon}
          </div>
          {integration.connected ? (
            <Badge variant="default" className="bg-primary/15 text-primary hover:bg-primary/20 border-primary/20 gap-1.5 pl-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              ActiveLink™
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2 flex-grow">
          <h3 className="font-semibold text-lg leading-none">{integration.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {integration.description}
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {integration.features.slice(0, 2).map(f => (
            <span key={f} className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground/70 bg-secondary/50 px-2 py-1 rounded-full border border-border/50">
              {f}
            </span>
          ))}
          {integration.features.length > 2 && (
            <span className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground/70 bg-secondary/50 px-2 py-1 rounded-full border border-border/50">
              +{integration.features.length - 2}
            </span>
          )}
        </div>

        {/* Action */}
        <div className="pt-2">
          {integration.connected ? (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
                <Settings2 className="h-4 w-4" />
                Configure
              </Button>
              <Button variant="ghost" size="icon" onClick={onDisconnect} className="text-muted-foreground hover:text-destructive transition-colors">
                <span className="sr-only">Disconnect</span>
                <div className="h-4 w-4 rounded-full border-2 border-current flex items-center justify-center">
                  <div className="h-0.5 w-2 bg-current rotate-45" />
                </div>
              </Button>
            </div>
          ) : (
            <Button className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" onClick={onConnect}>
              <Plus className="h-4 w-4" />
              Connect Platform
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Integrations;
