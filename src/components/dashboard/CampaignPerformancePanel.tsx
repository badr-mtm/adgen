import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Eye, 
  Users, 
  Target, 
  CheckCircle2, 
  BarChart3,
  Activity,
  Film,
  Popcorn,
  Swords,
  Laugh,
  BookOpen,
  Sparkles
} from "lucide-react";

interface GenrePerformance {
  genre: string;
  icon: React.ElementType;
  impressions: string;
  vcr: string;
  reach: string;
  cpm: string;
}

interface AudienceSegment {
  cohort: string;
  reach: string;
  index: number;
  trend: "up" | "down" | "flat";
}

interface CampaignPerformancePanelProps {
  totalImpressions: string;
  vcr: number;
  uniqueReach: string;
  avgFrequency: number;
  cpm: string;
  brandLift: string;
  genres: GenrePerformance[];
  audiences: AudienceSegment[];
}

const defaultGenres: GenrePerformance[] = [
  { genre: "Drama", icon: Film, impressions: "4.2M", vcr: "94.8%", reach: "18.6%", cpm: "$28.40" },
  { genre: "Action", icon: Swords, impressions: "3.8M", vcr: "91.2%", reach: "16.1%", cpm: "$32.10" },
  { genre: "Comedy", icon: Laugh, impressions: "2.9M", vcr: "96.4%", reach: "12.8%", cpm: "$24.60" },
  { genre: "Documentary", icon: BookOpen, impressions: "1.6M", vcr: "97.1%", reach: "7.4%", cpm: "$22.80" },
  { genre: "Reality", icon: Sparkles, impressions: "2.1M", vcr: "89.6%", reach: "9.2%", cpm: "$19.40" },
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
  genres: defaultGenres,
  audiences: defaultAudiences,
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

      {/* Content Genre Performance Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Performance by Content Genre</h4>
        
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_0.8fr_0.6fr_0.7fr_0.7fr] gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
          <span>Genre</span>
          <span className="text-right">Impressions</span>
          <span className="text-right">VCR</span>
          <span className="text-right">Reach</span>
          <span className="text-right">CPM</span>
        </div>

        {/* Table Rows */}
        {data.genres.map((genre, i) => {
          const GenreIcon = genre.icon;
          return (
            <motion.div
              key={genre.genre}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="grid grid-cols-[1.5fr_0.8fr_0.6fr_0.7fr_0.7fr] gap-2 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group items-center"
            >
              <div className="flex items-center gap-2">
                <GenreIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{genre.genre}</span>
              </div>
              <span className="text-sm text-right text-foreground font-medium tabular-nums">{genre.impressions}</span>
              <span className="text-sm text-right text-foreground font-medium tabular-nums">{genre.vcr}</span>
              <span className="text-sm text-right text-foreground font-medium tabular-nums">{genre.reach}</span>
              <span className="text-sm text-right text-foreground font-medium tabular-nums">{genre.cpm}</span>
            </motion.div>
          );
        })}
      </div>

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
