import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";

interface NetworkSpend {
  network: string;
  amount: number;
  percentage: number;
}

interface DaypartSpend {
  daypart: string;
  amount: number;
  percentage: number;
}

interface SpendIntelligencePanelProps {
  totalSpend: number;
  totalBudget: number;
  pacingStatus: "on-track" | "overspending" | "underspending";
  cpmTrend: string;
  remainingBudget: number;
  daysRemaining: number;
  networkBreakdown: NetworkSpend[];
  daypartBreakdown: DaypartSpend[];
}

const defaultProps: SpendIntelligencePanelProps = {
  totalSpend: 24850,
  totalBudget: 31850,
  pacingStatus: "on-track",
  cpmTrend: "-4.2%",
  remainingBudget: 7000,
  daysRemaining: 8,
  networkBreakdown: [
    { network: "Hulu", amount: 8420, percentage: 34 },
    { network: "Roku Channel", amount: 5640, percentage: 23 },
    { network: "Samsung TV Plus", amount: 4280, percentage: 17 },
    { network: "Peacock", amount: 3960, percentage: 16 },
    { network: "Amazon Fire TV", amount: 2550, percentage: 10 },
  ],
  daypartBreakdown: [
    { daypart: "Primetime", amount: 11200, percentage: 45 },
    { daypart: "Daytime", amount: 6200, percentage: 25 },
    { daypart: "Late Night", amount: 4460, percentage: 18 },
    { daypart: "Early Morning", amount: 2990, percentage: 12 },
  ],
};

const pacingConfig = {
  "on-track": { 
    label: "On Track", 
    icon: CheckCircle2, 
    className: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    barColor: "bg-primary"
  },
  "overspending": { 
    label: "Overspending", 
    icon: AlertTriangle, 
    className: "text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10",
    barColor: "bg-red-500"
  },
  "underspending": { 
    label: "Underspending", 
    icon: TrendingDown, 
    className: "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10",
    barColor: "bg-amber-500"
  },
};

const networkColors = [
  "bg-primary",
  "bg-blue-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-emerald-500",
];

export function SpendIntelligencePanel(props: Partial<SpendIntelligencePanelProps>) {
  const data = { ...defaultProps, ...props };
  const budgetUsed = Math.round((data.totalSpend / data.totalBudget) * 100);
  const pacing = pacingConfig[data.pacingStatus];
  const PacingIcon = pacing.icon;
  const dailyBurn = data.daysRemaining > 0 ? data.remainingBudget / data.daysRemaining : 0;

  return (
    <div className="bg-card/40 border border-border/50 rounded-2xl p-6 h-full space-y-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Spend Intelligence
        </h3>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/30 text-primary">
          This Month
        </Badge>
      </div>

      {/* Total Spend */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background/60 border border-border/50 rounded-xl p-4"
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Spend</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-foreground">
            ${data.totalSpend.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">/ ${data.totalBudget.toLocaleString()}</span>
        </div>
      </motion.div>

      {/* Budget Pacing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget Pacing</span>
          <Badge variant="outline" className={`text-[9px] h-5 gap-1 ${pacing.className}`}>
            <PacingIcon className="h-3 w-3" />
            {pacing.label}
          </Badge>
        </div>
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${budgetUsed}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${pacing.barColor} rounded-full`} 
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{budgetUsed}% used</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {data.daysRemaining}d remaining · ${dailyBurn.toLocaleString(undefined, { maximumFractionDigits: 0 })}/day
          </span>
        </div>
      </div>

      {/* CPM Trend */}
      <div className="flex items-center justify-between bg-background/60 border border-border/50 rounded-xl px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CPM Trend</p>
          <p className="text-sm font-bold text-foreground mt-0.5">$18.42 avg</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${data.cpmTrend.startsWith('-') ? 'text-emerald-500' : 'text-red-500'}`}>
          {data.cpmTrend.startsWith('-') ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
          {data.cpmTrend}
        </div>
      </div>

      {/* Network Spend Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Spend by Network</h4>
        {data.networkBreakdown.map((item, i) => (
          <motion.div 
            key={item.network} 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.network}</span>
              <span className="font-semibold text-foreground">${item.amount.toLocaleString()}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                className={`h-full ${networkColors[i % networkColors.length]} rounded-full`} 
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daypart Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Spend by Daypart</h4>
        {data.daypartBreakdown.map((item, i) => (
          <motion.div
            key={item.daypart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${networkColors[i % networkColors.length]}`} />
              <span className="text-muted-foreground">{item.daypart}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">{item.percentage}%</span>
              <span className="font-semibold text-foreground w-16 text-right">${item.amount.toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
