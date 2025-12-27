import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useState } from "react";

interface PerformanceChartProps {
  title?: string;
  subtitle?: string;
}

const generateMockData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => ({
    month,
    reach: Math.floor(20000 + Math.random() * 50000 + i * 3000),
    impressions: Math.floor(40000 + Math.random() * 80000 + i * 5000),
  }));
};

export function PerformanceChart({ title = "Broadcast Performance", subtitle }: PerformanceChartProps) {
  const [period, setPeriod] = useState("monthly");
  const data = generateMockData();
  
  const totalReach = data.reduce((sum, d) => sum + d.reach, 0);
  const totalImpressions = data.reduce((sum, d) => sum + d.impressions, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <CardTitle className="text-lg text-foreground">{title}</CardTitle>
                {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
              
              {/* Legend values */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Reach</p>
                    <p className="text-lg font-semibold text-foreground">${(totalReach / 1000).toFixed(2)}k</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Impressions</p>
                    <p className="text-lg font-semibold text-foreground">${(totalImpressions / 1000).toFixed(2)}k</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  formatter={(value: number) => [`$${(value / 1000).toFixed(2)}k`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  fill="url(#impressionsGradient)"
                  dot={false}
                  name="Impressions"
                />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#reachGradient)"
                  dot={false}
                  name="Reach"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
