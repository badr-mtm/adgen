import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  GripVertical,
  Video,
  Image,
  Globe,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO, isSameDay, addDays } from "date-fns";

interface Campaign {
  id: string;
  title: string;
  status: string;
  ad_type: string;
  goal: string;
  created_at: string;
  scheduled_start?: string;
  scheduled_end?: string;
  storyboard?: any;
}

const CampaignSchedules = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedCampaign, setDraggedCampaign] = useState<Campaign | null>(null);
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    open: boolean;
    campaign: Campaign | null;
    newDate: Date | null;
  }>({ open: false, campaign: null, newDate: null });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Parse storyboard for scheduled dates
      const processedCampaigns = (data || []).map((c) => {
        let scheduled_start = c.created_at;
        let scheduled_end = addDays(new Date(c.created_at), 14).toISOString();
        
        if (c.storyboard && typeof c.storyboard === 'object') {
          const sb = c.storyboard as any;
          if (sb.scheduledStart) scheduled_start = sb.scheduledStart;
          if (sb.scheduledEnd) scheduled_end = sb.scheduledEnd;
        }
        
        return { ...c, scheduled_start, scheduled_end };
      });

      setCampaigns(processedCampaigns);
    } catch (error: any) {
      toast({
        title: "Error fetching campaigns",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getCampaignsForDay = (day: Date) => {
    return campaigns.filter((campaign) => {
      const startDate = parseISO(campaign.scheduled_start || campaign.created_at);
      return isSameDay(startDate, day);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "scheduled":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "draft":
        return "bg-muted text-muted-foreground border-border";
      case "completed":
        return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      default:
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
    }
  };

  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-3 w-3" />;
      case "image":
        return <Image className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  const handleDragStart = (campaign: Campaign, e: React.DragEvent) => {
    setDraggedCampaign(campaign);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (day: Date, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedCampaign) {
      setRescheduleDialog({
        open: true,
        campaign: draggedCampaign,
        newDate: day,
      });
    }
    setDraggedCampaign(null);
  };

  const handleReschedule = async () => {
    if (!rescheduleDialog.campaign || !rescheduleDialog.newDate) return;

    try {
      const campaign = rescheduleDialog.campaign;
      const newStartDate = rescheduleDialog.newDate.toISOString();
      
      // Calculate duration and set new end date
      const originalStart = new Date(campaign.scheduled_start || campaign.created_at);
      const originalEnd = new Date(campaign.scheduled_end || addDays(originalStart, 14));
      const duration = originalEnd.getTime() - originalStart.getTime();
      const newEndDate = new Date(rescheduleDialog.newDate.getTime() + duration).toISOString();

      // Update storyboard with new dates
      const updatedStoryboard = {
        ...(campaign.storyboard || {}),
        scheduledStart: newStartDate,
        scheduledEnd: newEndDate,
      };

      const { error } = await supabase
        .from("campaigns")
        .update({ 
          storyboard: updatedStoryboard,
          updated_at: new Date().toISOString()
        })
        .eq("id", campaign.id);

      if (error) throw error;

      // Update local state
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id
            ? { ...c, scheduled_start: newStartDate, scheduled_end: newEndDate, storyboard: updatedStoryboard }
            : c
        )
      );

      toast({
        title: "Campaign rescheduled",
        description: `"${campaign.title}" moved to ${format(rescheduleDialog.newDate, "MMMM d, yyyy")}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to reschedule",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRescheduleDialog({ open: false, campaign: null, newDate: null });
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get first day of month to calculate offset
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startOffset = firstDayOfMonth.getDay();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campaign Schedules</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your campaign schedules. Drag campaigns to reschedule.
            </p>
          </div>
          <Button onClick={() => navigate("/create")}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                {/* Week day headers */}
                <div className="grid grid-cols-7 bg-muted/50">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-sm font-medium text-muted-foreground border-b"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {/* Empty cells for offset */}
                  {Array.from({ length: startOffset }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[120px] p-2 border-b border-r bg-muted/20"
                    />
                  ))}

                  {/* Days */}
                  {days.map((day) => {
                    const dayCampaigns = getCampaignsForDay(day);
                    const isCurrentDay = isToday(day);

                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[120px] p-2 border-b border-r transition-colors ${
                          isCurrentDay
                            ? "bg-primary/5"
                            : "hover:bg-muted/30"
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(day, e)}
                      >
                        <div
                          className={`text-sm font-medium mb-2 ${
                            isCurrentDay
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span
                            className={`${
                              isCurrentDay
                                ? "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center"
                                : ""
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {dayCampaigns.slice(0, 3).map((campaign) => (
                            <div
                              key={campaign.id}
                              draggable
                              onDragStart={(e) => handleDragStart(campaign, e)}
                              onClick={() => navigate(`/campaign/${campaign.id}`)}
                              className={`group cursor-grab active:cursor-grabbing p-1.5 rounded text-xs border transition-all hover:shadow-sm ${getStatusColor(
                                campaign.status || "concept"
                              )}`}
                            >
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50 flex-shrink-0" />
                                {getAdTypeIcon(campaign.ad_type)}
                                <span className="truncate font-medium">
                                  {campaign.title}
                                </span>
                              </div>
                            </div>
                          ))}
                          {dayCampaigns.length > 3 && (
                            <div className="text-xs text-muted-foreground pl-1">
                              +{dayCampaigns.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Legend */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor("live")}>
                  Live
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor("scheduled")}>
                  Scheduled
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor("concept")}>
                  Concept
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor("draft")}>
                  Draft
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor("completed")}>
                  Completed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming campaigns list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.filter((c) => c.status === "scheduled" || c.status === "live").length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No scheduled or live campaigns. Create a new campaign to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {campaigns
                  .filter((c) => c.status === "scheduled" || c.status === "live")
                  .slice(0, 5)
                  .map((campaign) => (
                    <div
                      key={campaign.id}
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {getAdTypeIcon(campaign.ad_type)}
                        </div>
                        <div>
                          <div className="font-medium">{campaign.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(parseISO(campaign.scheduled_start || campaign.created_at), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(campaign.status || "concept")}>
                        {campaign.status || "Concept"}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reschedule Confirmation Dialog */}
      <Dialog
        open={rescheduleDialog.open}
        onOpenChange={(open) =>
          setRescheduleDialog({ ...rescheduleDialog, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Campaign</DialogTitle>
            <DialogDescription>
              Move "{rescheduleDialog.campaign?.title}" to a new date
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Start Date</Label>
              <Input
                type="date"
                value={
                  rescheduleDialog.newDate
                    ? format(rescheduleDialog.newDate, "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  setRescheduleDialog({
                    ...rescheduleDialog,
                    newDate: new Date(e.target.value),
                  })
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              The campaign duration will be preserved when rescheduling.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setRescheduleDialog({ open: false, campaign: null, newDate: null })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleReschedule}>Confirm Reschedule</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CampaignSchedules;
