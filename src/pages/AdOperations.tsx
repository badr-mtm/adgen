import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { startOfDay, subDays, startOfMonth, endOfMonth, subMonths, isAfter, isBefore, isEqual } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Calendar,
  Download,
  Trash2,
  Copy,
  Play,
  Pause,
  MoreHorizontal,
  Filter,
  Columns,
  RefreshCw,
  ChevronDown,
  Image,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string | null;
  ad_type: string;
  goal: string;
  created_at: string;
  updated_at: string;
  storyboard: any;
  predicted_ctr: number | null;
}

// Facebook-style delivery status
type DeliveryStatus = "Active" | "Off" | "Learning" | "Not Delivering" | "Completed" | "In Review" | "Draft";

const AdOperations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("last_30_days");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState({
    delivery: true,
    budget: true,
    amountSpent: true,
    results: true,
    costPerResult: true,
    reach: true,
    impressions: true,
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) setCampaigns(data);
      setLoading(false);
    };

    fetchCampaigns();
  }, [navigate]);

  // Map internal status to Facebook-style delivery status
  const getDeliveryStatus = (status: string | null): DeliveryStatus => {
    switch (status) {
      case "active": return "Active";
      case "paused": return "Off";
      case "in_progress": return "Learning";
      case "completed": return "Completed";
      case "concept": return "Draft";
      default: return "Draft";
    }
  };

  const getDeliveryBadge = (delivery: DeliveryStatus) => {
    const config: Record<DeliveryStatus, string> = {
      "Active": "bg-green-500/10 text-green-600 border-green-500/20",
      "Off": "bg-muted text-muted-foreground border-border",
      "Learning": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "Not Delivering": "bg-red-500/10 text-red-600 border-red-500/20",
      "Completed": "bg-muted text-muted-foreground border-border",
      "In Review": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      "Draft": "bg-muted text-muted-foreground border-border",
    };
    return config[delivery];
  };

  // Mock metrics for demo
  const getMockMetrics = (campaign: Campaign) => ({
    budget: Math.floor(Math.random() * 500 + 100),
    dailyBudget: Math.floor(Math.random() * 50 + 10),
    amountSpent: Math.floor(Math.random() * 300 + 20),
    results: Math.floor(Math.random() * 150 + 5),
    costPerResult: (Math.random() * 5 + 0.5).toFixed(2),
    reach: Math.floor(Math.random() * 50000 + 1000),
    impressions: Math.floor(Math.random() * 100000 + 5000),
  });

  const handleToggleCampaign = async (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = campaign.status === "active" ? "paused" : "active";
    const { error } = await supabase
      .from("campaigns")
      .update({ status: newStatus })
      .eq("id", campaign.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update campaign", variant: "destructive" });
    } else {
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c));
      toast({ title: newStatus === "active" ? "Campaign Activated" : "Campaign Paused" });
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (confirm(`Are you sure you want to delete ${ids.length} campaign(s)?`)) {
      for (const id of ids) {
        await supabase.from("campaigns").delete().eq("id", id);
      }
      setCampaigns(prev => prev.filter(c => !ids.includes(c.id)));
      setSelectedRows(new Set());
      toast({ title: "Deleted", description: `${ids.length} campaign(s) deleted` });
    }
  };

  const handleDuplicate = async (campaign: Campaign) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        user_id: session.user.id,
        brand_id: (campaign as any).brand_id,
        title: `${campaign.title} - Copy`,
        description: campaign.description,
        ad_type: campaign.ad_type,
        goal: campaign.goal,
        status: "concept",
        storyboard: campaign.storyboard,
        predicted_ctr: campaign.predicted_ctr,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to duplicate", variant: "destructive" });
    } else if (data) {
      setCampaigns(prev => [data, ...prev]);
      toast({ title: "Campaign Duplicated" });
    }
  };

  const handleExport = (format: "csv" | "xlsx") => {
    const dataToExport = selectedRows.size > 0 
      ? campaigns.filter(c => selectedRows.has(c.id))
      : campaigns;

    if (format === "csv") {
      const headers = ["Campaign Name", "Status", "Delivery", "Ad Type", "Goal", "Created", "Updated"];
      const rows = dataToExport.map(c => [
        c.title,
        c.status || "draft",
        getDeliveryStatus(c.status),
        c.ad_type,
        c.goal,
        new Date(c.created_at).toLocaleDateString(),
        new Date(c.updated_at).toLocaleDateString(),
      ]);
      
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campaigns_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({ title: "Export Complete", description: `${dataToExport.length} campaigns exported as ${format.toUpperCase()}` });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredCampaigns.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredCampaigns.map(c => c.id)));
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calculate date range boundaries
  const dateRangeBounds = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    
    switch (dateRange) {
      case "today":
        return { start: today, end: now };
      case "yesterday":
        const yesterday = subDays(today, 1);
        return { start: yesterday, end: today };
      case "last_7_days":
        return { start: subDays(today, 7), end: now };
      case "last_14_days":
        return { start: subDays(today, 14), end: now };
      case "last_30_days":
        return { start: subDays(today, 30), end: now };
      case "this_month":
        return { start: startOfMonth(now), end: now };
      case "last_month":
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case "maximum":
      default:
        return null; // No date filter
    }
  }, [dateRange]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      // Search filter
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && c.status === "active") ||
        (statusFilter === "inactive" && (c.status === "paused" || c.status === "concept")) ||
        c.status === statusFilter;
      
      // Date range filter
      let matchesDate = true;
      if (dateRangeBounds) {
        const campaignDate = new Date(c.created_at);
        matchesDate = (isAfter(campaignDate, dateRangeBounds.start) || isEqual(campaignDate, dateRangeBounds.start)) &&
                      (isBefore(campaignDate, dateRangeBounds.end) || isEqual(campaignDate, dateRangeBounds.end));
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [campaigns, searchQuery, statusFilter, dateRangeBounds]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading campaigns...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">Campaigns</h1>
            <Badge variant="secondary" className="rounded-full">
              {campaigns.length}
            </Badge>
          </div>
          <Button onClick={() => navigate("/create")} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>

        {/* Filter/Control Bar */}
        <div className="flex items-center justify-between gap-4 p-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            {/* Date Range */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40 h-8 text-sm bg-background">
                <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last_7_days">Last 7 days</SelectItem>
                <SelectItem value="last_14_days">Last 14 days</SelectItem>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="this_month">This month</SelectItem>
                <SelectItem value="last_month">Last month</SelectItem>
                <SelectItem value="maximum">Maximum</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Campaigns
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  Active only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  Inactive only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("paused")}>
                  Paused
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("concept")}>
                  Drafts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search campaigns"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-64 pl-8 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Columns className="h-3.5 w-3.5" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuCheckboxItem 
                  checked={visibleColumns.delivery}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, delivery: checked }))}
                >
                  Delivery
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={visibleColumns.budget}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, budget: checked }))}
                >
                  Budget
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={visibleColumns.amountSpent}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, amountSpent: checked }))}
                >
                  Amount Spent
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={visibleColumns.results}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, results: checked }))}
                >
                  Results
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={visibleColumns.costPerResult}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, costPerResult: checked }))}
                >
                  Cost per Result
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={visibleColumns.reach}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, reach: checked }))}
                >
                  Reach
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={visibleColumns.impressions}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, impressions: checked }))}
                >
                  Impressions
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh */}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.location.reload()}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar (visible when items selected) */}
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-4 px-4 py-2 bg-primary/5 border-b border-primary/20">
            <span className="text-sm font-medium text-foreground">
              {selectedRows.size} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground">
                <Play className="h-3.5 w-3.5" />
                Turn On
              </Button>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground">
                <Pause className="h-3.5 w-3.5" />
                Turn Off
              </Button>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => handleExport("csv")}>
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(Array.from(selectedRows))}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 ml-auto text-muted-foreground"
              onClick={() => setSelectedRows(new Set())}
            >
              Clear selection
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {filteredCampaigns.length > 0 ? (
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.size === filteredCampaigns.length && filteredCampaigns.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-14">Off/On</TableHead>
                  <TableHead className="min-w-[250px]">Campaign Name</TableHead>
                  {visibleColumns.delivery && <TableHead>Delivery</TableHead>}
                  {visibleColumns.budget && <TableHead className="text-right">Budget</TableHead>}
                  {visibleColumns.amountSpent && <TableHead className="text-right">Amount Spent</TableHead>}
                  {visibleColumns.results && <TableHead className="text-right">Results</TableHead>}
                  {visibleColumns.costPerResult && <TableHead className="text-right">Cost per Result</TableHead>}
                  {visibleColumns.reach && <TableHead className="text-right">Reach</TableHead>}
                  {visibleColumns.impressions && <TableHead className="text-right">Impressions</TableHead>}
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => {
                  const delivery = getDeliveryStatus(campaign.status);
                  const metrics = getMockMetrics(campaign);
                  const isSelected = selectedRows.has(campaign.id);
                  const isActive = campaign.status === "active";

                  return (
                    <TableRow 
                      key={campaign.id} 
                      className={`border-border cursor-pointer ${isSelected ? "bg-primary/5" : "hover:bg-muted/50"}`}
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(campaign.id)}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => {}}
                          onClick={(e) => handleToggleCampaign(campaign, e)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {campaign.storyboard?.generatedImageUrl ? (
                              <img src={campaign.storyboard.generatedImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : campaign.ad_type === "video" ? (
                              <Play className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <Image className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground truncate">{campaign.title}</div>
                            <div className="text-xs text-muted-foreground capitalize">{campaign.goal.replace("_", " ")}</div>
                          </div>
                        </div>
                      </TableCell>
                      {visibleColumns.delivery && (
                        <TableCell>
                          <Badge variant="outline" className={`font-normal ${getDeliveryBadge(delivery)}`}>
                            {delivery}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.budget && (
                        <TableCell className="text-right font-medium">
                          ${metrics.dailyBudget}/day
                        </TableCell>
                      )}
                      {visibleColumns.amountSpent && (
                        <TableCell className="text-right">
                          ${metrics.amountSpent.toLocaleString()}
                        </TableCell>
                      )}
                      {visibleColumns.results && (
                        <TableCell className="text-right">
                          {metrics.results.toLocaleString()}
                        </TableCell>
                      )}
                      {visibleColumns.costPerResult && (
                        <TableCell className="text-right">
                          ${metrics.costPerResult}
                        </TableCell>
                      )}
                      {visibleColumns.reach && (
                        <TableCell className="text-right">
                          {metrics.reach.toLocaleString()}
                        </TableCell>
                      )}
                      {visibleColumns.impressions && (
                        <TableCell className="text-right">
                          {metrics.impressions.toLocaleString()}
                        </TableCell>
                      )}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/campaign/${campaign.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete([campaign.id])}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No campaigns found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by creating your first campaign."}
              </p>
              <Button onClick={() => navigate("/create")} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          )}
        </div>

        {/* Footer with count */}
        {filteredCampaigns.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card text-sm text-muted-foreground">
            <span>
              Showing {filteredCampaigns.length} of {campaigns.length} campaigns
            </span>
            {selectedRows.size > 0 && (
              <span>{selectedRows.size} selected</span>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdOperations;
