import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { EmailVerificationBanner } from "@/components/dashboard/EmailVerificationBanner";
import { BrandSetupPrompt } from "@/components/dashboard/BrandSetupPrompt";
import { PremiumMetricCard } from "@/components/dashboard/PremiumMetricCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { ReachBreakdownChart } from "@/components/dashboard/ReachBreakdownChart";
import { RecentCampaignsTable } from "@/components/dashboard/RecentCampaignsTable";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tv, Users, TrendingUp, Radio, BarChart3, Clock, Plus, FileText } from "lucide-react";

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
          .limit(10);

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

  // Generate sparkline data for each metric
  const generateSparkline = (base: number, variance: number = 10) => {
    return Array.from({ length: 8 }, () => base + Math.random() * variance - variance / 2);
  };

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
        className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Section */}
        <ScrollReveal direction="down" duration={0.3}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Dashboard / Overview</p>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard
              </h1>
            </div>
            <Button 
              onClick={() => navigate("/create")} 
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/20 rounded-xl"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </ScrollReveal>

        {/* Email Verification Banner */}
        {!emailVerified && userEmail && (
          <ScrollReveal direction="down" duration={0.35}>
            <EmailVerificationBanner email={userEmail} isVerified={emailVerified} />
          </ScrollReveal>
        )}

        {/* Brand setup prompt */}
        {!brandProfile && (
          <ScrollReveal direction="down" duration={0.4}>
            <BrandSetupPrompt />
          </ScrollReveal>
        )}

        {/* Premium Metrics Grid - 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <PremiumMetricCard
            label="Active Spots"
            value={tvMetrics.activeSpots.toLocaleString()}
            change={0.84}
            changeLabel="last year"
            icon={Tv}
            sparklineData={generateSparkline(tvMetrics.activeSpots, 3)}
            accentColor="hsl(var(--primary))"
            index={0}
          />
          <PremiumMetricCard
            label="Total GRP"
            value={tvMetrics.totalGRP.toLocaleString()}
            change={1.94}
            changeLabel="last year"
            icon={TrendingUp}
            sparklineData={generateSparkline(tvMetrics.totalGRP, 20)}
            accentColor="hsl(142, 76%, 36%)"
            index={1}
          />
          <PremiumMetricCard
            label="Reach Percentage"
            value={`${tvMetrics.reachPercentage.toLocaleString()}%`}
            change={1.21}
            changeLabel="last year"
            icon={Users}
            sparklineData={generateSparkline(tvMetrics.reachPercentage, 15)}
            accentColor="hsl(217, 91%, 60%)"
            index={2}
          />
          <PremiumMetricCard
            label="Total Impressions"
            value={(tvMetrics.spotsAired * 1247).toLocaleString()}
            change={1.02}
            changeLabel="last year"
            icon={BarChart3}
            sparklineData={generateSparkline(tvMetrics.spotsAired * 1247, 5000)}
            accentColor="hsl(280, 87%, 65%)"
            index={3}
          />
        </div>

        {/* Charts Row - Performance + Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart 
              title="Broadcast Performance" 
              subtitle="Reach vs Impressions over time"
            />
          </div>
          <div className="lg:col-span-1">
            <ReachBreakdownChart />
          </div>
        </div>

        {/* Recent Campaigns Table */}
        <RecentCampaignsTable campaigns={activeCampaigns} />
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
