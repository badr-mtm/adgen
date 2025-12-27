import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const channelData = [
  { name: "Cable Networks", value: 420, color: "hsl(var(--primary))" },
  { name: "Broadcast TV", value: 180, color: "hsl(142, 76%, 36%)" },
  { name: "Streaming", value: 120, color: "hsl(45, 93%, 47%)" },
  { name: "Local Stations", value: 80, color: "hsl(280, 87%, 65%)" },
];

const total = channelData.reduce((sum, item) => sum + item.value, 0);

export function ReachBreakdownChart() {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-card border-border h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground">Reach by Channel</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            {/* Donut chart */}
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold text-foreground">${(total * 100).toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                  <span>+8.2%</span>
                  <span className="text-muted-foreground">from last week</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full mt-4 space-y-2">
              {channelData.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </motion.div>
              ))}
            </div>
            
            <Button 
              variant="link" 
              className="text-primary mt-4 p-0 h-auto font-medium"
              onClick={() => navigate("/reports")}
            >
              View Detail
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
