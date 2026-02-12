import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft, Send, Target, BarChart3, Clock, Globe, ShieldCheck, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CampaignStrategy } from "@/types/videoEditor";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

// Sub-components
import { StrategySchedule } from "@/components/strategy/StrategySchedule";
import { StrategyAudience } from "@/components/strategy/StrategyAudience";
import { StrategyPlacements } from "@/components/strategy/StrategyPlacements";

const defaultStrategy: CampaignStrategy = {
  id: "",
  campaignId: "",
  intent: {
    idea: "",
    goal: "awareness",
    targetAudience: ""
  },
  budget: {
    amount: 5000,
    currency: "USD",
    interval: "lifetime"
  },
  schedule: {
    startDate: new Date(),
    deliveryTime: "any"
  },
  targeting: {
    locations: ["United States"],
    ageRange: [18, 65],
    genders: ["all"],
    interests: [],
    deviceTypes: ["tv", "mobile", "desktop"]
  },
  placements: []
};

export default function Strategy() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [strategy, setStrategy] = useState<CampaignStrategy>(defaultStrategy);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!id) return;
    loadCampaignData();
  }, [id]);

  const loadCampaignData = async () => {
    try {
      const {
        data,
        error
      } = (await supabase.from('campaigns').select('*').eq('id', id).single()) as any;
      if (error) throw error;

      // Process audience data for strategy
      const targetAudience = data.target_audience as any;
      const initialLocations = targetAudience?.locations || ["United States"];
      const initialInterests = targetAudience?.inMarketInterests || [];

      // Parse age ranges if available
      let ageRange: [number, number] = [18, 65];
      if (targetAudience?.ageRanges?.length > 0) {
        const ages = targetAudience.ageRanges.map((r: string) => r.split('-')).flat().map(Number).filter((n: number) => !isNaN(n));
        if (ages.length > 0) {
          ageRange = [Math.min(...ages), Math.max(...ages)];
        }
      }

      setStrategy({
        ...defaultStrategy,
        id: id || "temp-id",
        campaignId: data.id,
        intent: {
          idea: data.description || "",
          goal: data.goal || "awareness",
          targetAudience: typeof data.target_audience === 'string' ? data.target_audience : JSON.stringify(data.target_audience)
        },
        targeting: {
          ...defaultStrategy.targeting,
          locations: initialLocations,
          interests: initialInterests,
          ageRange: ageRange
        },
        ...((data.storyboard as any)?.strategy || {}),
        ...(data.strategy || {})
      });

      const storyboardData = data.storyboard as {
        strategy?: {
          schedule?: {
            startDate?: string;
          };
        };
      } | null;
      if (storyboardData?.strategy?.schedule?.startDate) {
        setDate(new Date(storyboardData.strategy.schedule.startDate));
      } else if (data.strategy?.schedule?.startDate) {
        setDate(new Date(data.strategy.schedule.startDate));
      }
    } catch (error: any) {
      console.error("Error loading campaign:", error);
      toast({
        title: "Error loading campaign",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const updatedStrategy = {
        ...strategy,
        schedule: {
          ...strategy.schedule,
          startDate: date
        }
      };

      // Perform a schema-aware update
      const { error } = await supabase.
      from('campaigns').
      update({
        strategy: updatedStrategy as any,
        status: publish ? 'scheduled' : 'draft',
        updated_at: new Date().toISOString()
      }).
      eq('id', id);

      if (error) {
        // If the 'strategy' column is literally missing, it might fall back to storyboard
        if (error.message.includes('column "strategy" of relation "campaigns" does not exist')) {
          const { error: fallbackError } = await supabase.
          from('campaigns').
          update({
            storyboard: {
              ...((await supabase.from('campaigns').select('storyboard').eq('id', id).single()).data?.storyboard as any),
              strategy: updatedStrategy
            } as any,
            status: publish ? 'scheduled' : 'draft',
            updated_at: new Date().toISOString()
          }).
          eq('id', id);
          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }

      toast({
        title: publish ? "Campaign Published!" : "Strategy Saved",
        description: publish ? "Your campaign is now live." : "Your strategy has been updated."
      });
      if (publish) {
        navigate('/campaigns');
      }
    } catch (error: any) {
      console.error("Error saving strategy:", error);
      toast({
        title: "Error saving strategy",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent animate-pulse" />
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>);

  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px] animate-pulse-slow" />
      </div>

      {/* Cinematic Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-0 shadow-none">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-2xl transition-all">

              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-0.5">
              <h1 className="text-xl font-black tracking-tighter flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Target className="h-4 w-4" />
                </div>
                STRATEGY COMMAND
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_hsl(142,70%,45%)]" />
                  Live Sync
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-[0.2em]">{strategy.intent.goal} objective active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-8 mr-6 border-r border-white/5 pr-8">
              <div className="text-right">
                <div className="text-[9px] uppercase text-muted-foreground font-black tracking-[0.2em] mb-1 opacity-60">Estimated Reach</div>
                <div className="text-xl font-black text-foreground tracking-tighter">1.2M <span className="text-xs font-medium text-muted-foreground">HH</span></div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase text-muted-foreground font-black tracking-[0.2em] mb-1 opacity-60">Allocated Budget</div>
                <div className="text-xl font-black text-primary tracking-tighter">${strategy.budget.amount.toLocaleString()}</div>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="rounded-2xl text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-bold tracking-tight px-6">

              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>

            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black tracking-widest px-8 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">

              LAUNCH <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-12 pb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main Column - Strategy Modules */}
          <div className="lg:col-span-8 space-y-10">
            {/* Quick Actions / Status */}
            <div className="grid grid-cols-3 gap-4 pb-4">
              {[
              { label: 'Market Readiness', value: '94%', icon: Globe, color: 'text-blue-500' },
              { label: 'Audience Match', value: 'High', icon: Target, color: 'text-primary' },
              { label: 'Launch Window', value: 'Prime', icon: Clock, color: 'text-purple-500' }].
              map((stat, i) =>
              <div key={i} className="p-4 rounded-3xl bg-card/40 border border-white/5 backdrop-blur-xl flex flex-col gap-2 transition-all hover:border-white/10 group">
                  <div className={cn("p-2 rounded-xl w-fit bg-muted transition-all group-hover:scale-110", stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</div>
                  <div className="text-lg font-black tracking-tight">{stat.value}</div>
                </div>
              )}
            </div>

            {/* Modules Container with more aggressive fade-in */}
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Campaign Schedule</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <StrategySchedule strategy={strategy} setStrategy={setStrategy} date={date} setDate={setDate} />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Audience Architecture</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <StrategyAudience strategy={strategy} setStrategy={setStrategy} />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Platform Placements</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <StrategyPlacements strategy={strategy} setStrategy={setStrategy} />
              </section>
            </div>
          </div>

          {/* Sidebar - Mission Control Summary */}
          <div className="lg:col-span-4 lg:block space-y-8">
            <Card className="sticky top-28 bg-card/60 border-white/5 backdrop-blur-3xl overflow-hidden border-t-white/10 rounded-sm shadow-lg">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient-x" />
              <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="flex justify-between items-center text-foreground">
                  <span className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    <BarChart3 className="w-4 h-4" />
                    Live Projection
                  </span>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                    OPTIMIZED
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-0">
                {/* Reach Meter */}
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    <span>Performance Strength</span>
                    <span className="text-primary">Excellent</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full p-0.5 border border-white/5 relative group">
                    <div className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary w-[88%] rounded-full shadow-[0_0_25px_-5px_hsl(var(--primary))] animate-shimmer" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-[28px] bg-white/[0.03] border border-white/5 flex flex-col gap-1.5 hover:bg-white/[0.05] transition-all">
                    <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Impressions</div>
                    <div className="text-2xl font-black text-foreground tracking-tighter">2.8M</div>
                  </div>
                  <div className="p-5 rounded-[28px] bg-white/[0.03] border border-white/5 flex flex-col gap-1.5 hover:bg-white/[0.05] transition-all">
                    <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Est. CPM</div>
                    <div className="text-2xl font-black text-foreground tracking-tighter">$14.20</div>
                  </div>
                </div>

                {/* Checklist with premium icons */}
                <div className="space-y-4 border-t border-white/5 pt-px">
                  {[
                  { label: 'Brand Safety Verified', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'Global CDN Ready', icon: Globe, color: 'text-primary', bg: 'bg-primary/10' },
                  { label: 'AI Optimization Active', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' }].
                  map((item, i) =>
                  <div key={i} className="flex items-center gap-4 text-[11px] font-bold text-foreground/70 group cursor-default">
                      <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center border border-white/5 transition-all group-hover:scale-110", item.bg, item.color)}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      {item.label}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-[16px]">
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black tracking-[0.2em] h-14 rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 text-xs"
                    onClick={() => handleSave(true)}
                    disabled={saving}>

                    DEPLOY CAMPAIGN
                  </Button>
                  <div className="flex flex-col items-center gap-2 mt-6">
                    <p className="text-[9px] font-black tracking-[0.4em] text-muted-foreground/40 animate-pulse">
                      SECURE LAUNCH PROTOCOL v4.0
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>);

}