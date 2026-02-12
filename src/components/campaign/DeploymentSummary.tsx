import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    Calendar,
    MapPin,
    Monitor,
    Layers,
    TrendingUp,
    Clock,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeploymentSummaryProps {
    strategy: any; // Using any for flexibility with merged strategy types
    className?: string;
}

export function DeploymentSummary({ strategy, className }: DeploymentSummaryProps) {
    if (!strategy) return null;

    const budget = strategy.budget || {};
    const targeting = strategy.targeting || {};
    const schedule = strategy.schedule || {};
    const placements = strategy.placements || [];

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
            {/* Financial Architecture */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground flex flex-row items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Financial Architecture
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-muted-foreground">Allocated Budget</p>
                            <h3 className="text-2xl font-bold text-foreground">
                                ${budget.amount?.toLocaleString() || '0'}
                                <span className="text-sm font-medium text-muted-foreground ml-1">
                                    {budget.currency || 'USD'}
                                </span>
                            </h3>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary capitalize">
                            {budget.interval || 'Lifetime'}
                        </Badge>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/50">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Est. Reach Coverage</span>
                            <span className="text-foreground font-medium">85% of DMAs</span>
                        </div>
                        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[85%] rounded-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Deployment Window */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground flex flex-row items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Deployment Window
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Start Sequence</p>
                            <p className="font-medium flex items-center gap-1.5 mt-1">
                                {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : 'Immediate'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Optimization</p>
                            <p className="font-medium capitalize flex items-center gap-1.5 mt-1">
                                {schedule.deliveryTime?.replace('_', ' ') || 'Anytime'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-purple-500/5 rounded-lg border border-purple-500/10 mt-2">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[11px] text-purple-400/80 font-medium tracking-wide">
                            PREMIUM TIME-SLOT ALIGNMENT ACTIVE
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Geographic Targeting */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground flex flex-row items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Geographic Perimeter
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {(targeting.locations && targeting.locations.length > 0) ? (
                            targeting.locations.map((loc: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-500/80">
                                    {loc}
                                </Badge>
                            ))
                        ) : (
                            <Badge variant="outline">Nationwide Target</Badge>
                        )}
                    </div>
                    <div className="mt-4 flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <div className="text-xs">
                                <p className="text-muted-foreground">Demographic Core</p>
                                <p className="font-medium">{targeting.ageRange ? `${targeting.ageRange[0]}-${targeting.ageRange[1]}` : '18-65'}</p>
                            </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-emerald-500/50" />
                    </div>
                </CardContent>
            </Card>

            {/* Network Architecture */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground flex flex-row items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Network Architecture
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {placements.length > 0 ? (
                                placements.map((p: string, i: number) => (
                                    <Badge key={i} variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-400">
                                        {p}
                                    </Badge>
                                ))
                            ) : (
                                <Badge variant="outline">Smart Network Selection</Badge>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                            <span className="flex items-center gap-1.5">
                                <Monitor className="w-3.5 h-3.5" />
                                CTV Focus
                            </span>
                            <span className="font-medium text-blue-400">Optimized</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
