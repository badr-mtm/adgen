import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Radio, 
  Users, 
  Target, 
  CheckCircle2, 
  BarChart3,
  ArrowUpRight,
  Activity
} from "lucide-react";

interface NetworkPerformance {
  network: string;
  spots: number;
  grp: number;
  reach: string;
  cpp: string;
  status: "on-air" | "scheduled" | "completed";
}

interface CampaignPerformancePanelProps {
  totalGRP: number;
  reachPercent: number;
  avgFrequency: number;
  costPerPoint: string;
  spotCompletion: number;
  attributionLift: string;
  networks: NetworkPerformance[];
}

const defaultNetworks: NetworkPerformance[] = [
  { network: "Hulu", spots: 342, grp: 48.2, reach: "18.4%", cpp: "$1,240", status: "on-air" },
  { network: "Roku Channel", spots: 218, grp: 32.6, reach: "12.1%", cpp: "$980", status: "on-air" },
  { network: "Samsung TV Plus", spots: 186, grp: 28.4, reach: "10.8%", cpp: "$860", status: "on-air" },
  { network: "Peacock", spots: 154, grp: 22.1, reach: "8.6%", cpp: "$1,120", status: "scheduled" },
  { network: "Amazon Fire TV", spots: 128, grp: 18.7, reach: "7.2%", cpp: "$1,380", status: "completed" },
];

const defaultProps: CampaignPerformancePanelProps = {
  totalGRP: 150.0,
  reachPercent: 57.1,
  avgFrequency: 3.8,
  costPerPoint: "$1,096",
  spotCompletion: 94.2,
  attributionLift: "+12.4%",
  networks: defaultNetworks,
};

export function CampaignPerformancePanel(props: Partial<CampaignPerformancePanelProps>) {
  const data = { ...defaultProps, ...props };

  const kpis = [
    { label: "Total GRP", value: data.totalGRP.toFixed(1), icon: BarChart3, color: "text-primary" },
    { label: "Reach", value: `${data.reachPercent}%`, icon: Users, color: "text-blue-500" },
    { label: "Avg Frequency", value: data.avgFrequency.toFixed(1), icon: Radio, color: "text-amber-500" },
    { label: "CPP", value: data.costPerPoint, icon: Target, color: "text-purple-500" },
    { label: "Spot Completion", value: `${data.spotCompletion}%`, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Attribution Lift", value: data.attributionLift, icon: TrendingUp, color: "text-indigo-500" },
  ];

  const statusConfig: Record<string, { label: string; className: string }> = {
    "on-air": { 
      label: "On-Air", 
      className: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10" 
    },
    "scheduled": { 
      label: "Scheduled", 
      className: "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10" 
    },
    "completed": { 
      label: "Completed", 
      className: "text-muted-foreground border-border bg-muted/50" 
    },
  };

  return (
    <div className="bg-card/40 border border-border/50 rounded-2xl p-6 h-full space-y-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Campaign Performance
        </h2>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/30 text-primary">
          Live
        </Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-background/60 border border-border/50 rounded-xl p-3 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <kpi.icon className={`h-3.5 w-3.5 ${kpi.color} group-hover:scale-110 transition-transform`} />
              <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="text-lg font-black tracking-tight text-foreground">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Network Performance Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Performance by Network</h4>
        
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.8fr_0.8fr] gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
          <span>Network</span>
          <span className="text-right">Spots</span>
          <span className="text-right">GRP</span>
          <span className="text-right">Reach</span>
          <span className="text-right">CPP</span>
          <span className="text-right">Status</span>
        </div>

        {/* Table Rows */}
        {data.networks.map((network, i) => (
          <motion.div
            key={network.network}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.8fr_0.8fr] gap-2 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group items-center"
          >
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${network.status === 'on-air' ? 'bg-emerald-500 animate-pulse' : network.status === 'scheduled' ? 'bg-amber-500' : 'bg-muted-foreground/40'}`} />
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{network.network}</span>
            </div>
            <span className="text-sm text-right text-foreground font-medium tabular-nums">{network.spots}</span>
            <span className="text-sm text-right text-foreground font-medium tabular-nums">{network.grp}</span>
            <span className="text-sm text-right text-foreground font-medium tabular-nums">{network.reach}</span>
            <span className="text-sm text-right text-foreground font-medium tabular-nums">{network.cpp}</span>
            <div className="flex justify-end">
              <Badge 
                variant="outline" 
                className={`text-[9px] h-5 ${statusConfig[network.status]?.className || ''}`}
              >
                {network.status === 'on-air' && (
                  <span className="mr-1 relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                )}
                {statusConfig[network.status]?.label}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
