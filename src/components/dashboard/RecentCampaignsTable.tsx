import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowRight, Play, Image, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Campaign {
  id: string;
  title: string;
  ad_type: string;
  goal: string;
  status: string;
  predicted_ctr?: number;
  created_at?: string;
}

interface RecentCampaignsTableProps {
  campaigns: Campaign[];
}

export function RecentCampaignsTable({ campaigns }: RecentCampaignsTableProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "completed":
        return "bg-muted text-muted-foreground border-border";
      case "concept":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
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
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg text-foreground">Recent Campaigns</CardTitle>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 h-9 bg-background/50"
                />
              </div>
              <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">ID</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Campaign</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Est. CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.slice(0, 6).map((campaign, index) => (
                    <motion.tr
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.03 }}
                      onClick={() => handleCampaignClick(campaign)}
                      className="border-border hover:bg-muted/30 cursor-pointer group transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{campaign.id.slice(0, 7).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            {campaign.ad_type === "video" ? (
                              <Play className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            ) : (
                              <Image className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{campaign.title}</p>
                            <p className="text-xs text-muted-foreground">{campaign.goal}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(campaign.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs capitalize ${getStatusStyle(campaign.status)}`}>
                          {campaign.status || "draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {campaign.predicted_ctr ? `${campaign.predicted_ctr}%` : "—"}
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No campaigns found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(6, filteredCampaigns.length)} of {campaigns.length} campaigns
            </p>
            <Button
              variant="link"
              className="text-primary p-0 h-auto font-medium"
              onClick={() => navigate("/ad-operations")}
            >
              View All Campaigns
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
