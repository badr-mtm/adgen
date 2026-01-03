import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TVMetricsStrip } from "@/components/dashboard/TVMetricsStrip";
import { BroadcastScheduleWidget } from "@/components/dashboard/BroadcastScheduleWidget";
import { ActiveCampaignsSnapshot } from "@/components/dashboard/ActiveCampaignsSnapshot";
import { TVComplianceStatus } from "@/components/dashboard/TVComplianceStatus";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { EmailVerificationBanner } from "@/components/dashboard/EmailVerificationBanner";
import { BrandSetupPrompt } from "@/components/dashboard/BrandSetupPrompt";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Tv, Sparkles } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [emailVerified, setEmailVerified] = useState(true);
  
  // TV-specific metrics
  const [tvMetrics, setTvMetrics] = useState({
    activeSpots: 0,
    totalGRP: 0,
    reachPercentage: 0,
    avgFrequency: 0,
    spotsAired: 0,
    upcomingSpots: 0,
  });

  // Mock broadcast schedule data
  const [scheduledSpots, setScheduledSpots] = useState<any[]>([]);
  
  // Mock compliance data
  const [complianceItems, setComplianceItems] = useState<any[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      try {
        // Check email verification status
        setUserEmail(session.user.email || "");
        setUserName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || "");
        setEmailVerified(session.user.email_confirmed_at !== null);

        const { data: brands } = await supabase
          .from("brands")
          .select("*")
          .eq("user_id", session.user.id)
          .limit(1);

        if (brands && brands.length > 0) {
          setBrandProfile(brands[0]);
        } else {
          setBrandProfile(null);
        }

        const { data: campaigns } = await supabase
          .from("campaigns")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(7);

        if (campaigns) {
          setActiveCampaigns(campaigns);
          
          // Generate TV metrics based on campaigns
          const activeCount = campaigns.filter((c) => c.status !== "completed").length;
          setTvMetrics({
            activeSpots: activeCount,
            totalGRP: parseFloat((activeCount * 45.5 + Math.random() * 50).toFixed(1)),
            reachPercentage: Math.min(95, activeCount * 12 + Math.floor(Math.random() * 20)),
            avgFrequency: parseFloat((2.5 + Math.random() * 2).toFixed(1)),
            spotsAired: campaigns.length * 8,
            upcomingSpots: Math.max(0, activeCount * 3),
          });

          // Generate mock broadcast schedule
          if (campaigns.length > 0) {
            setScheduledSpots(
              campaigns.slice(0, 3).map((c, i) => ({
                id: c.id,
                campaignTitle: c.title,
                duration: ["15s", "30s", "60s"][i % 3] as "15s" | "30s" | "60s",
                channel: ["ABC", "NBC", "CBS", "FOX"][i % 4],
                daypart: ["Prime Time", "Daytime", "Early Morning", "Late Night"][i % 4],
                scheduledTime: `${8 + i * 3}:00 PM`,
                status: i === 0 ? "live" : "upcoming",
              }))
            );
          }

          // Generate mock compliance items
          if (campaigns.length > 0) {
            setComplianceItems(
              campaigns.slice(0, 3).map((c, i) => ({
                id: c.id,
                campaignTitle: c.title,
                status: ["approved", "pending", "approved"][i % 3] as "approved" | "pending" | "rejected",
                network: ["ABC Network", "NBC Universal", "CBS Broadcasting"][i % 3],
                submittedAt: "2 days ago",
              }))
            );
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        className="p-6 space-y-6 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* 1. Welcome Header */}
        <ScrollReveal direction="down" duration={0.3}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Tv className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Dashboard</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back{brandProfile?.name ? `, ${brandProfile.name}` : userName ? `, ${userName}` : ""}!
                </h1>
                <p className="text-muted-foreground mt-1">Ready to create your next broadcast-ready TV ad?</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/create")} 
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 shadow-lg shadow-primary/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Ad
            </Button>
          </div>
        </ScrollReveal>

        {/* Email Verification Banner */}
        {!emailVerified && userEmail && (
          <ScrollReveal direction="down" duration={0.35}>
            <EmailVerificationBanner email={userEmail} isVerified={emailVerified} />
          </ScrollReveal>
        )}

        {/* Brand setup prompt (optional) */}
        {!brandProfile && (
          <ScrollReveal direction="down" duration={0.4}>
            <BrandSetupPrompt />
          </ScrollReveal>
        )}

        {/* 2. TV Metrics Strip - Key broadcast KPIs */}
        <ScrollReveal direction="down" duration={0.45}>
          <TVMetricsStrip stats={tvMetrics} />
        </ScrollReveal>

        {/* 3. Broadcast Schedule */}
        <ScrollReveal delay={0.1} duration={0.5}>
          <BroadcastScheduleWidget spots={scheduledSpots} />
        </ScrollReveal>

        {/* 3. Active TV Campaigns */}
        <ScrollReveal delay={0.2} duration={0.5}>
          <ActiveCampaignsSnapshot campaigns={activeCampaigns} />
        </ScrollReveal>

        {/* 4. Compliance Status */}
        <ScrollReveal delay={0.25} duration={0.5}>
          <TVComplianceStatus items={complianceItems} />
        </ScrollReveal>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
