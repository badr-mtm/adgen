import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, CheckCircle2, Clock, AlertTriangle, AlertCircle, Zap, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SpendIntelligencePanelProps {
  totalSpend: number;
  totalBudget: number;
  pacingStatus: "on-track" | "overspending" | "underspending";
  remainingBudget: number;
  daysRemaining: number;
}

const needsAttentionItems = [
  {
    title: "Budget pacing ahead of schedule",
    description: "Pre-Show Trailers flight overspending by 8%",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    badge: "Review",
    badgeClass: "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10",
    navigateTo: "/campaigns"
  },
  {
    title: "Low VCR on In-Stream spots",
    description: "Completion rate dropped below 85% threshold",
    icon: AlertCircle,
    iconColor: "text-destructive",
    badge: "Action",
    badgeClass: "text-destructive border-destructive/30 bg-destructive/10",
    navigateTo: "/reports"
  },
  {
    title: "Creative fatigue detected",
    description: "Spot 2 frequency exceeding 4.5x this week",
    icon: Zap,
    iconColor: "text-amber-500",
    badge: "Monitor",
    badgeClass: "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10",
    navigateTo: "/creatives"
  },
  {
    title: "Audience segment underperforming",
    description: "50+ cohort index dropped to 72 from 86",
    icon: TrendingDown,
    iconColor: "text-muted-foreground",
    badge: "Optimize",
    badgeClass: "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10",
    navigateTo: "/settings"
  }
];

const defaultProps: SpendIntelligencePanelProps = {
  totalSpend: 26150,
  totalBudget: 35000,
  pacingStatus: "on-track",
  remainingBudget: 8850,
  daysRemaining: 11,
};

const pacingConfig = {
  "on-track": {
    label: "On Track",
    icon: CheckCircle2,
    className: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    barColor: "bg-primary"
  },
  "overspending": {
    label: "Over Pacing",
    icon: TrendingUp,
    className: "text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10",
    barColor: "bg-red-500"
  },
  "underspending": {
    label: "Under Pacing",
    icon: TrendingDown,
    className: "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10",
    barColor: "bg-amber-500"
  }
};

export function SpendIntelligencePanel(props: Partial<SpendIntelligencePanelProps>) {
  const navigate = useNavigate();
  const data = { ...defaultProps, ...props };
  const budgetUsed = Math.round(data.totalSpend / data.totalBudget * 100);
  const pacing = pacingConfig[data.pacingStatus];
  const PacingIcon = pacing.icon;
  const dailyBurn = data.daysRemaining > 0 ? data.remainingBudget / data.daysRemaining : 0;

  const actionCount = needsAttentionItems.filter(i => i.badge === "Action").length;
  const reviewCount = needsAttentionItems.filter(i => i.badge === "Review" || i.badge === "Monitor").length;

  return (
    <div className="bg-card/40 border border-border/50 rounded-2xl p-6 h-full space-y-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Spend Intelligence
        </h3>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/30 text-primary">
          This Flight
        </Badge>
      </div>

      {/* Needs Attention — FIRST: Actionable alerts are highest priority for admin */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Needs Attention
          </h4>
          <div className="flex items-center gap-1.5">
            {actionCount > 0 && (
              <Badge variant="outline" className="text-[9px] h-5 text-destructive border-destructive/30 bg-destructive/10">
                {actionCount} Action
              </Badge>
            )}
            {reviewCount > 0 && (
              <Badge variant="outline" className="text-[9px] h-5 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10">
                {reviewCount} Review
              </Badge>
            )}
          </div>
        </div>
        {needsAttentionItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => navigate(item.navigateTo)}
            className="flex items-center justify-between bg-background/60 border border-border/50 rounded-lg px-3 py-2.5 hover:border-primary/30 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <item.icon className={`h-3.5 w-3.5 flex-shrink-0 ${item.iconColor}`} />
              <div className="min-w-0">
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate block">{item.title}</span>
                <span className="text-[10px] text-muted-foreground">{item.description}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Badge variant="outline" className={`text-[9px] h-5 ${item.badgeClass}`}>
                {item.badge}
              </Badge>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Budget Overview — Spend & pacing context */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Budget Overview</h4>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background/60 border border-border/50 rounded-xl p-4 space-y-3"
        >
          {/* Spend headline */}
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Total Spend</p>
              <span className="text-2xl font-black tracking-tight text-foreground">
                ${data.totalSpend.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground ml-1.5">/ ${data.totalBudget.toLocaleString()}</span>
            </div>
            <Badge variant="outline" className={`text-[9px] h-5 gap-1 ${pacing.className}`}>
              <PacingIcon className="h-3 w-3" />
              {pacing.label}
            </Badge>
          </div>

          {/* Pacing bar */}
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetUsed}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${pacing.barColor} rounded-full`}
            />
          </div>

          {/* Burn rate & remaining */}
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{budgetUsed}% used</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {data.daysRemaining}d remaining · ${dailyBurn.toLocaleString(undefined, { maximumFractionDigits: 0 })}/day
            </span>
          </div>
        </motion.div>

        {/* Quick spend stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-background/60 border border-border/50 rounded-lg px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Remaining</p>
            <div className="flex items-center gap-1">
              <span className="text-base font-black text-foreground">${data.remainingBudget.toLocaleString()}</span>
              <ArrowDownRight className="h-3 w-3 text-emerald-500" />
            </div>
          </div>
          <div className="bg-background/60 border border-border/50 rounded-lg px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Daily Burn</p>
            <div className="flex items-center gap-1">
              <span className="text-base font-black text-foreground">${dailyBurn.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
