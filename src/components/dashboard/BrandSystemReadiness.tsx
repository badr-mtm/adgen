import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  AlertCircle, 
  Link2,
  Palette,
  Type,
  MessageSquare,
  Image,
} from "lucide-react";

interface BrandProfile {
  name?: string;
  logo_url?: string;
  colors?: string[];
  brand_voice?: string;
  landing_page_url?: string;
}

interface BrandSystemReadinessProps {
  brandProfile: BrandProfile | null;
}

export function BrandSystemReadiness({ brandProfile }: BrandSystemReadinessProps) {
  const navigate = useNavigate();

  const getBrandCompleteness = () => {
    if (!brandProfile) return 0;
    let score = 0;
    if (brandProfile.name) score += 20;
    if (brandProfile.logo_url) score += 20;
    if (brandProfile.colors && brandProfile.colors.length > 0) score += 20;
    if (brandProfile.brand_voice) score += 20;
    if (brandProfile.landing_page_url) score += 20;
    return score;
  };

  const completeness = getBrandCompleteness();

  const brandChecklist = [
    { 
      label: "Logo uploaded", 
      complete: !!brandProfile?.logo_url,
      icon: Image,
    },
    { 
      label: "Brand colors defined", 
      complete: brandProfile?.colors && brandProfile.colors.length > 0,
      icon: Palette,
    },
    { 
      label: "Brand voice set", 
      complete: !!brandProfile?.brand_voice,
      icon: MessageSquare,
    },
    { 
      label: "Landing page linked", 
      complete: !!brandProfile?.landing_page_url,
      icon: Link2,
    },
  ];

  const connectedPlatforms = [
    { name: "Meta Ads", code: "M", color: "bg-blue-500/20 text-blue-500", connected: false },
    { name: "Google Ads", code: "G", color: "bg-red-500/20 text-red-500", connected: false },
    { name: "TikTok Ads", code: "T", color: "bg-foreground/20 text-foreground", connected: false },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Brand Profile Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
      >
        <Card className="h-full bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-foreground">Brand Profile</CardTitle>
            <Badge 
              variant="outline" 
              className={`text-xs ${completeness === 100 ? 'text-primary border-primary/30' : 'text-muted-foreground'}`}
            >
              {completeness}% complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={completeness} className="h-1.5" />
          
          <div className="grid grid-cols-2 gap-2">
            {brandChecklist.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 2 }}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${
                  item.complete ? 'bg-primary/5 hover:border-primary' : 'bg-muted/30 hover:border-primary'
                }`}
              >
                {item.complete ? (
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={`text-xs ${item.complete ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
          
          {completeness < 100 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/settings")}
            >
              Improve Brand Accuracy
            </Button>
          )}
        </CardContent>
        </Card>
      </motion.div>

      {/* Connected Platforms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
      >
        <Card className="h-full bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-foreground">Ad Platforms</CardTitle>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              0 connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {connectedPlatforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-transparent hover:border-primary cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <span className="text-xs font-bold">{platform.code}</span>
                  </motion.div>
                  <span className="text-sm text-foreground">{platform.name}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] ${platform.connected ? 'text-primary border-primary/30' : 'text-muted-foreground'}`}
                >
                  {platform.connected ? "Connected" : "Not connected"}
                </Badge>
              </motion.div>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/integrations")}
          >
            <Link2 className="h-3 w-3 mr-2" />
            Connect Ad Account
          </Button>
        </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
