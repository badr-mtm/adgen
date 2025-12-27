import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface PremiumMetricCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  sparklineData?: number[];
  accentColor?: string;
  index?: number;
}

export function PremiumMetricCard({
  label,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  sparklineData = [],
  accentColor = "hsl(var(--primary))",
  index = 0,
}: PremiumMetricCardProps) {
  // Generate chart data from sparkline values
  const chartData = sparklineData.map((val, i) => ({ value: val, index: i }));

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="relative bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group overflow-hidden"
    >
      {/* Background gradient accent */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 blur-3xl group-hover:opacity-10 transition-opacity"
        style={{ background: accentColor }}
      />
      
      {/* Header with icon */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: accentColor }} />
          </div>
        </div>
        
        {/* Sparkline chart */}
        {chartData.length > 0 && (
          <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentColor} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={accentColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${label})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* Metric value */}
      <div className="relative z-10">
        <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              isPositive ? 'text-emerald-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              <span>{isPositive ? '+' : ''}{change.toFixed(2)}</span>
              <span className="text-muted-foreground font-normal">{changeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
