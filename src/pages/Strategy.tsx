
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
                ...(data.strategy as any || {})
            });

            if (data.strategy && (data.strategy as any).schedule?.startDate) {
                setDate(new Date((data.strategy as any).schedule.startDate));
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
            <div className="h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Cinematic Sticky Header */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white/60 hover:text-white hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Target className="h-5 w-5 text-blue-500" />
                                Strategy Command
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                                <span className={strategy.budget.amount > 10000 ? "text-green-400" : "text-yellow-400"}>●</span>
                                STATUS: CONFIGURING
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-6 mr-6 border-r border-white/10 pr-6">
                            <div className="text-right">
                                <div className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Est. Reach</div>
                                <div className="text-lg font-mono font-bold text-white">1.2M <span className="text-sm text-white/40">HH</span></div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Budget</div>
                                <div className="text-lg font-mono font-bold text-white">${strategy.budget.amount.toLocaleString()}</div>
                            </div>
                        </div>

                        <Button variant="ghost" onClick={() => handleSave(false)} disabled={saving} className="text-white/60 hover:text-white hover:bg-white/10">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Draft
                        </Button>
                        <Button
                            onClick={async () => {
                                await handleSave(false);
                                navigate('/script-selection', { state: { id, strategy } });
                            }}
                            disabled={saving}
                            className="bg-white text-black hover:bg-gray-200 font-semibold"
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
                        <Card className="sticky top-28 bg-zinc-900/50 border-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
                                <CardTitle className="flex justify-between items-center text-white">
                                    <span className="flex items-center gap-2 text-sm uppercase tracking-widest">
                                        <BarChart3 className="w-4 h-4 text-white/60" />
                                        Projection
                                    </span>
                                    <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10 text-[10px] uppercase">
                                        Optimization Active
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Reach Meter */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/60">
                                        <span>Reach Strength</span>
                                        <span className="text-blue-400">Excellent</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 w-[85%] rounded-full shadow-[0_0_10px_#3b82f6]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="text-[10px] text-white/40 uppercase mb-1">Impressions</div>
                                        <div className="text-xl font-bold text-white">2.4M</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="text-[10px] text-white/40 uppercase mb-1">CPM</div>
                                        <div className="text-xl font-bold text-white">$18.50</div>
                                    </div>
                                </div>

                                {/* Checklist */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-sm text-white/80">
                                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                            <ShieldCheck className="h-3 w-3 text-green-400" />
                                        </div>
                                        Brand Safety Verified
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/80">
                                        <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                                            <Globe className="h-3 w-3 text-blue-400" />
                                        </div>
                                        Global CDN Ready
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/80">
                                        <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50">
                                            <Zap className="h-3 w-3 text-purple-400" />
                                        </div>
                                        AI Optimization On
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold h-12 shadow-[0_0_20px_rgba(255,255,255,0.1)]" onClick={() => handleSave(true)} disabled={saving}>
                                        Confirm & Launch
                                    </Button>
                                    <p className="text-[10px] text-center text-white/30 mt-3 font-mono">
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
