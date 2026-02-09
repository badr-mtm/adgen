import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Eye, 
  Users, 
  Target, 
  CheckCircle2, 
  BarChart3,
  Activity
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AudienceSegment {
  cohort: string;
  reach: string;
  index: number;
  trend: "up" | "down" | "flat";
}

interface DailyReach {
  day: string;
  spot1: number;
  spot2: number;
}

interface CampaignPerformancePanelProps {
  totalImpressions: string;
  vcr: number;
  uniqueReach: string;
  avgFrequency: number;
  cpm: string;
  brandLift: string;
  dailyReach: DailyReach[];
  audiences: AudienceSegment[];
}

const defaultDailyReach: DailyReach[] = [
  { day: "Mon", spot1: 1.8, spot2: 1.2 },
  { day: "Tue", spot1: 2.1, spot2: 1.5 },
  { day: "Wed", spot1: 2.4, spot2: 1.9 },
  { day: "Thu", spot1: 2.0, spot2: 2.2 },
  { day: "Fri", spot1: 2.8, spot2: 2.6 },
  { day: "Sat", spot1: 3.2, spot2: 3.0 },
  { day: "Sun", spot1: 3.6, spot2: 2.8 },
];

const defaultAudiences: AudienceSegment[] = [
  { cohort: "18–24", reach: "22.4%", index: 142, trend: "up" },
  { cohort: "25–34", reach: "31.8%", index: 128, trend: "up" },
  { cohort: "35–49", reach: "26.2%", index: 108, trend: "flat" },
  { cohort: "50+", reach: "14.6%", index: 86, trend: "down" },
];

const defaultProps: CampaignPerformancePanelProps = {
  totalImpressions: "14.6M",
  vcr: 93.4,
  uniqueReach: "8.2M",
  avgFrequency: 3.4,
  cpm: "$26.80",
  brandLift: "+8.6%",
  dailyReach: defaultDailyReach,
  audiences: defaultAudiences,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-muted-foreground">{entry.name}:</span>
          <span className="text-xs font-bold text-foreground">{entry.value}M</span>
        </div>
      ))}
    </div>
  );
};

export function CampaignPerformancePanel(props: Partial<CampaignPerformancePanelProps>) {
  const data = { ...defaultProps, ...props };

  const kpis = [
    { label: "Impressions", value: data.totalImpressions, icon: Eye, color: "text-primary" },
    { label: "VCR", value: `${data.vcr}%`, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Unique Reach", value: data.uniqueReach, icon: Users, color: "text-blue-500" },
    { label: "Avg Frequency", value: data.avgFrequency.toFixed(1), icon: Target, color: "text-amber-500" },
    { label: "CPM", value: data.cpm, icon: BarChart3, color: "text-purple-500" },
    { label: "Brand Lift", value: data.brandLift, icon: TrendingUp, color: "text-indigo-500" },
  ];

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

      {/* Reach per Day Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reach per Day</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
              <span className="text-[10px] text-muted-foreground font-medium">Spot 1 — Pre-Roll</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
              <span className="text-[10px] text-muted-foreground font-medium">Spot 2 — Mid-Roll</span>
            </div>
          </div>
        </div>

        <div className="h-[200px] w-full bg-background/40 rounded-xl border border-border/40 p-3 pr-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailyReach} barGap={3} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}M`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))", opacity: 0.3, radius: 6 }} />
              <Bar
                dataKey="spot1"
                name="Spot 1 — Pre-Roll"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="spot2"
                name="Spot 2 — Mid-Roll"
                fill="hsl(var(--primary) / 0.4)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Audience Segments */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Audience Segments</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {data.audiences.map((seg, i) => (
            <motion.div
              key={seg.cohort}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              className="bg-background/60 border border-border/50 rounded-xl p-3 hover:border-primary/30 transition-all"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{seg.cohort}</p>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-black text-foreground">{seg.reach}</span>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-bold ${seg.index >= 110 ? 'text-emerald-500' : seg.index >= 95 ? 'text-muted-foreground' : 'text-amber-500'}`}>
                    {seg.index}
                  </span>
                  {seg.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                  {seg.trend === "down" && <TrendingUp className="h-3 w-3 text-amber-500 rotate-180" />}
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">engagement idx</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
