import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, CheckCircle2, Clock, Play, Pause, SkipForward, Bookmark, Trophy } from "lucide-react";
interface AdFormatSpend {
  format: string;
  icon: React.ElementType;
  amount: number;
  percentage: number;
  cpm: string;
  cpmTrend: "up" | "down" | "flat";
}
interface TopTitle {
  title: string;
  vcr: string;
  impressions: string;
}
interface SpendIntelligencePanelProps {
  totalSpend: number;
  totalBudget: number;
  pacingStatus: "on-track" | "overspending" | "underspending";
  remainingBudget: number;
  daysRemaining: number;
  adFormats: AdFormatSpend[];
  topTitles: TopTitle[];
}
const defaultAdFormats: AdFormatSpend[] = [{
  format: "Pre-Show Trailers",
  icon: SkipForward,
  amount: 9840,
  percentage: 38,
  cpm: "$31.20",
  cpmTrend: "down"
}, {
  format: "In-Stream Spots",
  icon: Play,
  amount: 8620,
  percentage: 33,
  cpm: "$28.60",
  cpmTrend: "down"
}, {
  format: "Interstitial Ads",
  icon: Pause,
  amount: 4280,
  percentage: 16,
  cpm: "$18.40",
  cpmTrend: "up"
}, {
  format: "Title Sponsorship",
  icon: Bookmark,
  amount: 3410,
  percentage: 13,
  cpm: "$42.80",
  cpmTrend: "flat"
}];
const defaultTopTitles: TopTitle[] = [{
  title: "Mission: Impossible 8",
  vcr: "97.2%",
  impressions: "2.4M"
}, {
  title: "Avatar: Fire & Ash",
  vcr: "96.8%",
  impressions: "1.9M"
}, {
  title: "Jurassic World: Rebirth",
  vcr: "95.4%",
  impressions: "2.1M"
}, {
  title: "Captain America: New World",
  vcr: "94.1%",
  impressions: "1.2M"
}];
const defaultProps: SpendIntelligencePanelProps = {
  totalSpend: 26150,
  totalBudget: 35000,
  pacingStatus: "on-track",
  remainingBudget: 8850,
  daysRemaining: 11,
  adFormats: defaultAdFormats,
  topTitles: defaultTopTitles
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
const formatBarColors = ["bg-primary", "bg-blue-500", "bg-amber-500", "bg-purple-500"];
export function SpendIntelligencePanel(props: Partial<SpendIntelligencePanelProps>) {
  const data = {
    ...defaultProps,
    ...props
  };
  const budgetUsed = Math.round(data.totalSpend / data.totalBudget * 100);
  const pacing = pacingConfig[data.pacingStatus];
  const PacingIcon = pacing.icon;
  const dailyBurn = data.daysRemaining > 0 ? data.remainingBudget / data.daysRemaining : 0;
  return <div className="bg-card/40 border border-border/50 rounded-2xl p-6 h-full space-y-5 backdrop-blur-sm">
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

      {/* Total Spend */}
      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} className="bg-background/60 border border-border/50 rounded-xl p-4">
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
          <motion.div initial={{
          width: 0
        }} animate={{
          width: `${budgetUsed}%`
        }} transition={{
          duration: 1,
          ease: "easeOut"
        }} className={`h-full ${pacing.barColor} rounded-full`} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{budgetUsed}% used</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {data.daysRemaining}d remaining · ${dailyBurn.toLocaleString(undefined, {
            maximumFractionDigits: 0
          })}/day
          </span>
        </div>
      </div>

      {/* Ad Format Spend Breakdown */}
      

      {/* Top Performing Titles */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          Top Performing Movies
        </h4>
        {data.topTitles.map((title, i) => <motion.div key={title.title} initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.4 + i * 0.05
      }} className="flex items-center justify-between bg-background/60 border border-border/50 rounded-lg px-3 py-2.5 hover:border-primary/30 transition-all group">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-black text-muted-foreground w-4">{i + 1}</span>
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{title.title}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-[10px] text-muted-foreground">{title.impressions}</span>
              <Badge variant="outline" className="text-[9px] h-5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                {title.vcr}
              </Badge>
            </div>
          </motion.div>)}
      </div>
    </div>;
}