import { motion } from "framer-motion";
import { Tv, Users, Clock, Radio, TrendingUp, BarChart3 } from "lucide-react";

interface TVMetricsStripProps {
  stats: {
    activeSpots: number;
    totalGRP: number;
    reachPercentage: number;
    avgFrequency: number;
    spotsAired: number;
    upcomingSpots: number;
  };
}

export function TVMetricsStrip({ stats }: TVMetricsStripProps) {
  const metrics = [
    { 
      label: "Active Spots", 
      value: stats.activeSpots.toString(), 
      icon: Tv,
      color: "text-primary"
    },
    { 
      label: "Total GRP", 
      value: stats.totalGRP.toFixed(1), 
      icon: TrendingUp,
      color: "text-emerald-400"
    },
    { 
      label: "Reach", 
      value: `${stats.reachPercentage}%`, 
      icon: Users,
      color: "text-blue-400"
    },
    { 
      label: "Avg Frequency", 
      value: stats.avgFrequency.toFixed(1), 
      icon: Radio,
      color: "text-amber-400"
    },
    { 
      label: "Spots Aired", 
      value: stats.spotsAired.toString(), 
      icon: BarChart3,
      color: "text-purple-400"
    },
    { 
      label: "Upcoming", 
      value: stats.upcomingSpots.toString(), 
      icon: Clock,
      color: "text-cyan-400"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <metric.icon className={`h-4 w-4 ${metric.color} group-hover:scale-110 transition-transform`} />
            <span className="text-xs text-muted-foreground">{metric.label}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metric.value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
