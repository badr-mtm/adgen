import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductUrlDialog } from "./ProductUrlDialog";
import {
  Plus,
  Play,
  Image,
  Link2,
  Sparkles,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Zap,
} from "lucide-react";

interface AIRecommendation {
  id: number;
  type: "scale" | "refresh" | "alert";
  message: string;
  confidence: number;
  action: string;
  actionLabel: string;
}

interface PrimaryActionZoneProps {
  recommendations: AIRecommendation[];
}

export function PrimaryActionZone({ recommendations }: PrimaryActionZoneProps) {
  const navigate = useNavigate();
  const [productUrlDialogOpen, setProductUrlDialogOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "scale":
        return TrendingUp;
      case "refresh":
        return RefreshCw;
      case "alert":
        return AlertTriangle;
      default:
        return Zap;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-primary";
    if (confidence >= 70) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Create New Ad - Dominant Left Side */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="lg:col-span-2"
      >
        <Card className="h-full bg-gradient-to-br from-primary/15 via-primary/5 to-card border-primary/30 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2 text-foreground">
              <Plus className="h-6 w-6 text-primary" />
              Create TV Ad
            </CardTitle>
            <p className="text-sm text-muted-foreground">Strategy-first, broadcast-ready</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="h-24 w-full flex-col gap-3 border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
                  onClick={() => navigate("/create?type=video")}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium">Video Ad</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="h-24 w-full flex-col gap-3 border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
                  onClick={() => navigate("/create?type=image")}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                    <Image className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium">Image Ad</span>
                </Button>
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                onClick={() => setProductUrlDialogOpen(true)}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Start from Product URL
              </Button>
            </motion.div>
            
            <ProductUrlDialog 
              open={productUrlDialogOpen} 
              onOpenChange={setProductUrlDialogOpen} 
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Recommendations - Right Side */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="lg:col-span-3"
      >
        <Card className="h-full bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Recommendations
              <Badge variant="secondary" className="ml-auto text-xs">
                {recommendations.length} actions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, index) => {
              const Icon = getIcon(rec.type);
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate("/ai-suggestions")}
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        rec.type === "scale" ? "bg-primary/20" : 
                        rec.type === "alert" ? "bg-destructive/20" : "bg-muted"
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Icon className={`h-5 w-5 ${
                        rec.type === "scale" ? "text-primary" : 
                        rec.type === "alert" ? "text-destructive" : "text-muted-foreground"
                      }`} />
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{rec.message}</p>
                      <p className={`text-xs ${getConfidenceColor(rec.confidence)}`}>
                        {rec.confidence}% confidence
                      </p>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      {rec.actionLabel}
                      <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </motion.div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}