import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Image, 
  Play,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  Clock,
  Zap,
  AlertCircle,
  Eye,
} from "lucide-react";

interface Creative {
  id: string;
  name: string;
  type: "image" | "video";
  platform: string;
  metric: string;
  trend: "up" | "down" | "neutral";
  thumbnail?: string;
}

interface CreativePerformanceIntelligenceProps {
  topCreatives: Creative[];
  underperformingCreatives: Creative[];
  newCreatives: Creative[];
}

type CategoryKey = "top" | "attention" | "new";

interface Category {
  key: CategoryKey;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  accentColor: string;
  actionLabel: string;
  actionVariant: "scale" | "iterate" | "replace" | "default";
  emptyMessage: string;
}

const categories: Category[] = [
  {
    key: "top",
    label: "Top Performers",
    icon: Zap,
    iconColor: "text-primary",
    accentColor: "bg-primary/20",
    actionLabel: "Scale",
    actionVariant: "scale",
    emptyMessage: "No top performers yet",
  },
  {
    key: "attention",
    label: "Needs Attention",
    icon: AlertCircle,
    iconColor: "text-yellow-500",
    accentColor: "bg-yellow-500/20",
    actionLabel: "Iterate",
    actionVariant: "iterate",
    emptyMessage: "All creatives performing well",
  },
  {
    key: "new",
    label: "New Creatives",
    icon: Eye,
    iconColor: "text-muted-foreground",
    accentColor: "bg-muted-foreground/20",
    actionLabel: "View",
    actionVariant: "default",
    emptyMessage: "No new creatives",
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" }
  }),
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
};

export function CreativePerformanceIntelligence({
  topCreatives,
  underperformingCreatives,
  newCreatives,
}: CreativePerformanceIntelligenceProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("top");

  const getCreatives = (key: CategoryKey): Creative[] => {
    switch (key) {
      case "top": return topCreatives;
      case "attention": return underperformingCreatives;
      case "new": return newCreatives;
    }
  };

  const activeConfig = categories.find(c => c.key === activeCategory)!;
  const activeCreatives = getCreatives(activeCategory);

  const CreativeCard = ({ 
    creative, 
    actionLabel, 
    actionVariant = "default",
    accentColor,
    index
  }: { 
    creative: Creative; 
    actionLabel: string;
    actionVariant?: "scale" | "iterate" | "replace" | "default";
    accentColor: string;
    index: number;
  }) => {
    const actionStyles = {
      scale: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
      iterate: "bg-yellow-500 text-yellow-950 hover:bg-yellow-400 shadow-lg shadow-yellow-500/25",
      replace: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/25",
      default: "bg-muted/80 text-foreground hover:bg-muted border border-border/50",
    };

    const actionIcons = {
      scale: <ArrowUpRight className="h-3.5 w-3.5" />,
      iterate: <RefreshCw className="h-3.5 w-3.5" />,
      replace: <Sparkles className="h-3.5 w-3.5" />,
      default: <Eye className="h-3.5 w-3.5" />,
    };

    return (
      <motion.div 
        className="group relative"
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Border highlight on hover */}
        
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-card via-card to-muted/30 border border-border group-hover:border-primary backdrop-blur-sm overflow-hidden transition-colors duration-300">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          
          {/* Thumbnail */}
          <div className="relative w-full aspect-video rounded-lg bg-gradient-to-br from-muted to-muted/50 mb-4 flex items-center justify-center overflow-hidden ring-1 ring-border/30 group-hover:ring-primary/30 transition-all duration-300">
            {creative.thumbnail ? (
              <img 
                src={creative.thumbnail} 
                alt={creative.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-muted-foreground/10 group-hover:bg-primary/10 transition-colors duration-300">
                  {creative.type === "video" ? (
                    <Play className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  ) : (
                    <Image className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  )}
                </div>
              </div>
            )}
            
            {/* Type badge overlay */}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-background/80 backdrop-blur-sm border-0 shadow-sm">
                {creative.type === "video" ? "Video" : "Image"}
              </Badge>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors duration-300">
                  {creative.name}
                </h4>
                <Badge variant="outline" className="text-[10px] mt-1.5 bg-transparent border-border/50">
                  {creative.platform}
                </Badge>
              </div>
            </div>

            {/* Metric with enhanced styling */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/30">
              <div className={`p-1 rounded-md ${
                creative.trend === "up" 
                  ? "bg-primary/10 text-primary" 
                  : creative.trend === "down" 
                    ? "bg-destructive/10 text-destructive" 
                    : "bg-muted-foreground/10 text-muted-foreground"
              }`}>
                {creative.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : creative.trend === "down" ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
              </div>
              <span className="text-sm font-medium text-foreground">{creative.metric}</span>
            </div>

            {/* Action button */}
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="sm"
                className={`w-full ${actionStyles[actionVariant]} font-medium transition-all duration-300`}
                onClick={() => navigate("/editor")}
              >
                {actionIcons[actionVariant]}
                <span className="ml-1.5">{actionLabel}</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Section Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm shadow-primary/10">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Creative Performance Intelligence</h2>
            <p className="text-sm text-muted-foreground">Track, optimize, and scale your best performing creatives</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border/50">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.key;
            const count = getCreatives(category.key).length;
            
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg
                  text-sm font-medium transition-all duration-300
                  ${isActive 
                    ? "bg-background text-foreground shadow-sm border border-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${isActive ? category.iconColor : ""}`} />
                <span className="hidden md:inline">{category.label}</span>
                {count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`
                      text-[10px] px-1.5 py-0 min-w-5 h-5 flex items-center justify-center
                      ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
                    `}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[300px] rounded-2xl bg-gradient-to-br from-card via-card to-muted/20 border border-border/50 overflow-hidden">
        {/* Top accent gradient */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          activeCategory === "top" 
            ? "from-primary via-primary/80 to-primary/50" 
            : activeCategory === "attention"
              ? "from-yellow-500 via-yellow-500/80 to-yellow-500/50"
              : "from-muted-foreground via-muted-foreground/80 to-muted-foreground/50"
        }`} />
        
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeCreatives.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCreatives.map((creative, index) => (
                    <CreativeCard
                      key={creative.id}
                      creative={creative}
                      actionLabel={activeConfig.actionLabel}
                      actionVariant={activeConfig.actionVariant}
                      accentColor={activeConfig.accentColor}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <activeConfig.icon className={`h-8 w-8 ${activeConfig.iconColor}`} />
                  </div>
                  <p className="text-muted-foreground">{activeConfig.emptyMessage}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}