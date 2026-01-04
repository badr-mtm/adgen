
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CampaignStrategy } from "@/types/videoEditor";

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

            if (data.strategy?.schedule?.startDate) {
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
                navigate('/ad-operations');
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
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl animate-fade-in pb-24">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur py-4 -mx-6 px-6 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Strategy Setup</h1>
                        <p className="text-sm text-muted-foreground">Configure your campaign strategy, budget, and targeting.</p>
                    </div>
                </div>
                <div className="space-x-4">
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Draft
                    </Button>
                    <Button onClick={() => handleSave(true)} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                        Publish Campaign
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
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

                {/* Sidebar Summary */}
                <div className="space-y-6">
                    <Card className="sticky top-28 border-primary/20 shadow-lg">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="flex justify-between items-center">
                                Strategy Estimate
                                <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">Fair</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Reach Meter */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Reach Strength</span>
                                    <span className="font-semibold text-primary">Good</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[70%] rounded-full"></div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Estimated Reach</div>
                                <div className="text-3xl font-bold tracking-tight">
                                    {strategy.budget.amount > 5000 ? '580K - 1.2M' : '250K - 450K'}
                                </div>
                                <div className="text-xs text-muted-foreground">Households per month</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Avg. CPM</div>
                                    <div className="text-xl font-semibold">$22.00</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Frequency</div>
                                    <div className="text-xl font-semibold">1.8x</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Daily Budget</span>
                                    <span className="font-medium">${strategy.budget.amount.toLocaleString()}.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="font-medium">30 Days</span>
                                </div>
                            </div>

                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg shadow" onClick={() => handleSave(true)} disabled={saving}>
                                Confirm Strategy
                                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground">Your ad will be reviewed within 24 hours.</p>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
