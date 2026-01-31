import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Image, ArrowRight, Plus, Settings } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  ad_type: string;
  goal: string;
  status: string;
  predicted_ctr?: number;
}

interface ActiveCampaignsSnapshotProps {
  campaigns: Campaign[];
}

export function ActiveCampaignsSnapshot({ campaigns }: ActiveCampaignsSnapshotProps) {
  const navigate = useNavigate();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/20 text-primary border-primary/30";
      case "completed":
        return "bg-muted text-muted-foreground border-border";
      case "concept":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPlatformBadge = (adType: string) => {
    return adType === "video" ? "Multi-platform" : "Display";
  };

  const handleCampaignClick = (campaign: Campaign) => {
    if (campaign.ad_type === "image") {
      navigate(`/editor/${campaign.id}`);
    } else {
      navigate(campaign.status === "concept" ? `/storyboard/${campaign.id}` : `/video-editor/${campaign.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-foreground">Active Campaigns</CardTitle>
          <Button
            variant="link"
            className="text-primary p-0 h-auto font-medium"
            onClick={() => navigate("/ad-operations")}
          >
            View All Campaigns
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {campaigns.length > 0 ? (
            <div className="space-y-2">
              {campaigns.slice(0, 5).map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-primary transition-all duration-300 cursor-pointer group"
                  onClick={() => handleCampaignClick(campaign)}
                >
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    {campaign.ad_type === "video" ? (
                      <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    ) : (
                      <Image className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </motion.div>
                  <div>
                    <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{campaign.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {getPlatformBadge(campaign.ad_type)} • {campaign.goal}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {campaign.predicted_ctr ? `${campaign.predicted_ctr}% CTR` : "—"}
                  </span>
                  <Badge variant="outline" className={`text-xs ${getStatusStyle(campaign.status)} transition-all duration-200`}>
                    {campaign.status || "draft"}
                  </Badge>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignClick(campaign);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No campaigns yet</p>
              <Button onClick={() => navigate("/create")} className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ad
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
