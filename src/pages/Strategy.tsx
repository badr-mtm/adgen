
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft, Send, Target, BarChart3, Clock, Globe, ShieldCheck, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CampaignStrategy } from "@/types/videoEditor";
import { Badge } from "@/components/ui/badge";

// Sub-components
import { StrategySchedule } from "@/components/strategy/StrategySchedule";
import { StrategyAudience } from "@/components/strategy/StrategyAudience";
import { StrategyPlacements } from "@/components/strategy/StrategyPlacements";

const defaultStrategy: CampaignStrategy = {
    id: "",
    campaignId: "",
    intent: { idea: "", goal: "awareness", targetAudience: "" },
    budget: { amount: 5000, currency: "USD", interval: "lifetime" },
    schedule: { startDate: new Date(), deliveryTime: "any" },
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
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
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
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Merge existing data with default strategy
            setStrategy({
                ...defaultStrategy,
                id: "temp-id",
                campaignId: data.id,
                intent: {
                    idea: data.description || "",
                    goal: data.goal || "awareness",
                    targetAudience: typeof data.target_audience === 'string' ? data.target_audience : JSON.stringify(data.target_audience)
                },
                ...((data.storyboard as any)?.strategy || {})
            });

            const storyboardData = data.storyboard as { strategy?: { schedule?: { startDate?: string } } } | null;
            if (storyboardData?.strategy?.schedule?.startDate) {
                setDate(new Date(storyboardData.strategy.schedule.startDate));
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

            const { error } = await supabase
                .from('campaigns')
                .update({
                    strategy: updatedStrategy as any,
                    status: publish ? 'scheduled' : 'draft',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: publish ? "Campaign Published!" : "Strategy Saved",
                description: publish ? "Your campaign is now live." : "Your strategy has been updated."
            });

            if (publish) {
                navigate('/campaigns'); // Updated route
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
            <div className="h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            {/* Cinematic Sticky Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Strategy Command
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                <span className={strategy.budget.amount > 10000 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>●</span>
                                STATUS: CONFIGURING
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-6 mr-6 border-r border-border pr-6">
                            <div className="text-right">
                                <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Est. Reach</div>
                                <div className="text-lg font-mono font-bold text-foreground">1.2M <span className="text-sm text-muted-foreground">HH</span></div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Budget</div>
                                <div className="text-lg font-mono font-bold text-foreground">${strategy.budget.amount.toLocaleString()}</div>
                            </div>
                        </div>

                        <Button variant="ghost" onClick={() => handleSave(false)} disabled={saving} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Draft
                        </Button>
                        <Button
                            onClick={async () => {
                                await handleSave(false);
                                navigate(`/script-selection/${id}`, { state: { id, strategy } });
                            }}
                            disabled={saving}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                        >
                            Continue to Creative
                            <Zap className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-8 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Column - Strategy Modules */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Modules Container with fade-in */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <StrategySchedule
                                strategy={strategy}
                                setStrategy={setStrategy}
                                date={date}
                                setDate={setDate}
                            />

                            <StrategyAudience
                                strategy={strategy}
                                setStrategy={setStrategy}
                            />

                            <StrategyPlacements
                                strategy={strategy}
                                setStrategy={setStrategy}
                            />
                        </div>

                    </div>

                    {/* Sidebar - Mission Control Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="sticky top-28 bg-card border-border backdrop-blur-md shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
                            <CardHeader className="pb-4 border-b border-border bg-muted/50">
                                <CardTitle className="flex justify-between items-center text-foreground">
                                    <span className="flex items-center gap-2 text-sm uppercase tracking-widest">
                                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                                        Projection
                                    </span>
                                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] uppercase">
                                        Optimization Active
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Reach Meter */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <span>Reach Strength</span>
                                        <span className="text-primary">Excellent</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary to-purple-500 w-[85%] rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                        <div className="text-[10px] text-muted-foreground uppercase mb-1">Impressions</div>
                                        <div className="text-xl font-bold text-foreground">2.4M</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                        <div className="text-[10px] text-muted-foreground uppercase mb-1">CPM</div>
                                        <div className="text-xl font-bold text-foreground">$18.50</div>
                                    </div>
                                </div>

                                {/* Checklist */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                                        <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                                            <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        Brand Safety Verified
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                                            <Globe className="h-3 w-3 text-primary" />
                                        </div>
                                        Global CDN Ready
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                                        <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50">
                                            <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        AI Optimization On
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 shadow-[0_0_20px_hsl(var(--primary)/0.2)]" onClick={() => handleSave(true)} disabled={saving}>
                                        Confirm & Launch
                                    </Button>
                                    <p className="text-[10px] text-center text-muted-foreground mt-3 font-mono">
                                        SECURE LAUNCH PROTOCOL INITIATED
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
