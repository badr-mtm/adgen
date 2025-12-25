import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Tv, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ScheduledSpot {
  id: string;
  campaignTitle: string;
  duration: "15s" | "30s" | "60s";
  channel: string;
  daypart: string;
  scheduledTime: string;
  status: "upcoming" | "live" | "completed";
}

interface BroadcastScheduleWidgetProps {
  spots: ScheduledSpot[];
}

export function BroadcastScheduleWidget({ spots }: BroadcastScheduleWidgetProps) {
  const navigate = useNavigate();

  const getDaypartColor = (daypart: string) => {
    switch (daypart.toLowerCase()) {
      case "prime time":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "daytime":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "early morning":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "late night":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse";
      case "upcoming":
        return "bg-primary/20 text-primary border-primary/30";
      case "completed":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg text-foreground">Broadcast Schedule</CardTitle>
          </div>
          <Button
            variant="link"
            className="text-primary p-0 h-auto font-medium"
            onClick={() => navigate("/campaign-schedules")}
          >
            View Full Schedule
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {spots.length > 0 ? (
            <div className="space-y-3">
              {spots.slice(0, 5).map((spot, index) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-secondary">
                      <Tv className="h-4 w-4 text-primary mb-0.5" />
                      <span className="text-xs font-bold text-foreground">{spot.duration}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{spot.campaignTitle}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{spot.channel}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{spot.scheduledTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getDaypartColor(spot.daypart)}`}>
                      {spot.daypart}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(spot.status)}`}>
                      {spot.status === "live" ? "● LIVE" : spot.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No scheduled broadcasts</p>
              <p className="text-xs text-muted-foreground mt-1">Create a TV ad to schedule airtime</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
