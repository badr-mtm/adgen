import { motion } from "framer-motion";
import { Play, Image, MousePointerClick, DollarSign } from "lucide-react";

interface SystemHealthStripProps {
  stats: {
    activeCampaigns: number;
    creativesGenerated: number;
    bestCtr: number;
    spendVsBudget: number;
  };
}

export function SystemHealthStrip({ stats }: SystemHealthStripProps) {
  const items = [
    {
      label: "Active Campaigns",
      value: stats.activeCampaigns.toString(),
      icon: Play,
    },
    {
      label: "Creatives Generated",
      value: stats.creativesGenerated.toString(),
      icon: Image,
    },
    {
      label: "Best Performing",
      value: `${stats.bestCtr}% CTR`,
      icon: MousePointerClick,
    },
    {
      label: "Spend vs Budget",
      value: `${stats.spendVsBudget}%`,
      icon: DollarSign,
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-center justify-between px-4 py-3 bg-card/50 border border-border rounded-lg backdrop-blur-sm"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2">
            <item.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item.label}:</span>
            <span className="text-sm font-semibold text-foreground">{item.value}</span>
          </div>
          {index < items.length - 1 && (
            <div className="w-px h-4 bg-border ml-4" />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
