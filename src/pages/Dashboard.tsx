import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SystemHealthStrip } from "@/components/dashboard/SystemHealthStrip";
import { PrimaryActionZone } from "@/components/dashboard/PrimaryActionZone";
import { ActiveCampaignsSnapshot } from "@/components/dashboard/ActiveCampaignsSnapshot";
import { CreativePerformanceIntelligence } from "@/components/dashboard/CreativePerformanceIntelligence";
import { BrandSystemReadiness } from "@/components/dashboard/BrandSystemReadiness";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    creativesGenerated: 0,
    bestCtr: 0,
    spendVsBudget: 65,
  });

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: brands } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", session.user.id)
        .limit(1);

      if (!brands || brands.length === 0) {
        navigate("/brand-setup");
        return;
      }
      setBrandProfile(brands[0]);

      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(7);

      if (campaigns) {
        setActiveCampaigns(campaigns);
        setStats({
          activeCampaigns: campaigns.filter((c) => c.status !== "completed").length,
          creativesGenerated: campaigns.length * 3, // Assume ~3 creatives per campaign
          bestCtr: parseFloat((Math.random() * 3 + 2.5).toFixed(1)),
          spendVsBudget: Math.floor(Math.random() * 40) + 50,
        });
      }
      setLoading(false);
    };

    checkAuthAndFetch();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // AI Recommendations with confidence levels
  const aiRecommendations = [
    { 
      id: 1, 
      type: "scale" as const, 
      message: "Summer Sale creative is outperforming benchmarks — scale now", 
      confidence: 94,
      action: "scale",
      actionLabel: "Scale Now" 
    },
    { 
      id: 2, 
      type: "refresh" as const, 
      message: "2 campaigns need fresh creatives", 
      confidence: 87,
      action: "create",
      actionLabel: "Create" 
    },
    { 
      id: 3, 
      type: "alert" as const, 
      message: "High spend, low engagement detected on Brand Awareness", 
      confidence: 82,
      action: "view",
      actionLabel: "Optimize" 
    },
  ];

  // Creative performance data
  const topCreatives = [
    { id: "1", name: "Summer Hero Banner", type: "image" as const, platform: "Meta", metric: "4.2% CTR", trend: "up" as const },
    { id: "2", name: "Product Demo 30s", type: "video" as const, platform: "TikTok", metric: "3.8% CTR", trend: "up" as const },
  ];

  const underperformingCreatives = [
    { id: "3", name: "Brand Story Video", type: "video" as const, platform: "YouTube", metric: "1.2% CTR", trend: "down" as const },
  ];

  const newCreatives = [
    { id: "4", name: "Holiday Promo", type: "image" as const, platform: "Google", metric: "No data yet", trend: "neutral" as const },
  ];

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
        {/* 1. System Health Snapshot - Minimal top strip */}
        <ScrollReveal direction="down" duration={0.4}>
          <SystemHealthStrip stats={stats} />
        </ScrollReveal>

        {/* 2. Primary Action Zone - Hero area */}
        <ScrollReveal delay={0.1} duration={0.5}>
          <PrimaryActionZone recommendations={aiRecommendations} />
        </ScrollReveal>

        {/* 3. Active Campaigns Snapshot - Condensed */}
        <ScrollReveal delay={0.15} duration={0.5}>
          <ActiveCampaignsSnapshot campaigns={activeCampaigns} />
        </ScrollReveal>

        {/* 4. Creative Performance Intelligence - Visual-first */}
        <ScrollReveal delay={0.2} duration={0.5}>
          <CreativePerformanceIntelligence
            topCreatives={topCreatives}
            underperformingCreatives={underperformingCreatives}
            newCreatives={newCreatives}
          />
        </ScrollReveal>

        {/* 5. Brand & System Readiness - Quiet but critical */}
        <ScrollReveal delay={0.25} duration={0.5}>
          <BrandSystemReadiness brandProfile={brandProfile} />
        </ScrollReveal>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
