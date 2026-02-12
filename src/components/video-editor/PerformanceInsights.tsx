
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  MapPin,
  Target,
  Sparkles,
  Play,
  BarChart3,
  Activity,
  Globe,
  CheckCircle2,
  Volume2,
  Maximize,
  Watch,
  ArrowUpRight } from
"lucide-react";
import { cn } from "@/lib/utils";

export const PerformanceInsights = () => {
  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header Info */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Performance Engine</h3>
                </div>
                <p className="text-[10px] text-muted-foreground">AI-Powered Predictive Targeting for US TV Channels</p>
            </div>

            {/* Main Stats Grid */}
            



















            {/* Affinity Score Chart */}
            
























            {/* Regional Attribution Map (Visual) */}
            

































            {/* Auto-Compliance Checklist */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <LabelWithIcon icon={CheckCircle2} label="Network Compliance Status" />
                    <Badge variant="outline" className="text-[8px] border-emerald-500/50 text-emerald-500">SYSTEM READY</Badge>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                    {[
          { label: 'Audio Loudness (CALM Act)', status: 'Pass', sub: '-24.2 LKFS', icon: Volume2 },
          { label: 'Action Safe Zones', status: 'Pass', sub: '90% Title Safe', icon: Maximize },
          { label: 'Spot Duration', status: 'Pass', sub: '29.8s / 30.0s', icon: Watch }].
          map((check, i) =>
          <div key={i} className="flex items-center justify-between p-2 bg-accent/5 rounded-lg border border-border group hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded bg-background border border-border group-hover:bg-primary/5 transition-colors">
                                    <check.icon className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-foreground">{check.label}</p>
                                    <p className="text-[8px] text-muted-foreground">{check.sub}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[9px] tracking-widest">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                PASS
                            </div>
                        </div>
          )}
                </div>
            </div>

            {/* Strategy Recommendation */}
            <div className="mt-4 p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg border border-primary/20 relative overflow-hidden group">
                <Sparkles className="absolute -top-2 -right-2 h-12 w-12 text-white/10 rotate-12 transition-transform group-hover:scale-110" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">AI Recommendation</p>
                <p className="text-xs font-bold text-white leading-relaxed mb-3">
                    "Increase bid strategy on Hulu for 'Premium' tone scenes to capture high-intent evening audiences in the NY region."
                </p>
                <button className="w-full h-8 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all border border-white/20 flex items-center justify-center gap-2">
                    Apply Strategy Change
                </button>
            </div>
        </div>);

};

const LabelWithIcon = ({ icon: Icon, label }: {icon: any;label: string;}) =>
<div className="flex items-center gap-2">
        <div className="p-1 rounded bg-primary/10 border border-primary/10">
            <Icon className="h-3 w-3 text-primary" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>;


const RegionalPoint = ({ x, y, size, label, delay }: {x: string;y: string;size: string;label: string;delay: string;}) =>
<div
  className="absolute flex items-center justify-center"
  style={{ left: x, top: y }}>

        <div className={cn("absolute h-4 w-4 rounded-full animate-ping opacity-25", size)} style={{ animationDelay: delay }} />
        <div className={cn("relative h-2 w-2 rounded-full border border-white/40", size)} />
        <span className="absolute -bottom-3 text-[7px] font-black text-white/40">{label}</span>
    </div>;