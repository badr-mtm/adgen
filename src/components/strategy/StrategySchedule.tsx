
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, Calendar as CalendarIcon, Clock, Plus, Trash2, Globe, Briefcase, Moon, Sun, Monitor } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CampaignStrategy } from "@/types/videoEditor";

interface StrategyScheduleProps {
    strategy: CampaignStrategy;
    setStrategy: (s: CampaignStrategy) => void;
    date: Date | undefined;
    setDate: (d: Date | undefined) => void;
}

// 24 Hour options for dropdowns
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const ampm = hour < 12 ? "AM" : "PM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
        value: `${hour.toString().padStart(2, '0')}:${minute}`,
        label: `${displayHour}:${minute} ${ampm}`
    };
});

const DAYS = [
    { id: "sun", label: "Sunday" },
    { id: "mon", label: "Monday" },
    { id: "tue", label: "Tuesday" },
    { id: "wed", label: "Wednesday" },
    { id: "thu", label: "Thursday" },
    { id: "fri", label: "Friday" },
    { id: "sat", label: "Saturday" }
];

type ScheduleRange = { start: string; end: string };
type WeeklySchedule = Record<string, ScheduleRange[]>;

// Preset Definitions
const PRESETS = [
    {
        id: "all", label: "Any time, Any day", icon: Globe, ranges: {
            "sun": [{ start: "00:00", end: "23:30" }],
            "mon": [{ start: "00:00", end: "23:30" }],
            "tue": [{ start: "00:00", end: "23:30" }],
            "wed": [{ start: "00:00", end: "23:30" }],
            "thu": [{ start: "00:00", end: "23:30" }],
            "fri": [{ start: "00:00", end: "23:30" }],
            "sat": [{ start: "00:00", end: "23:30" }]
        }
    },
    {
        id: "business", label: "Business hours", icon: Briefcase, ranges: {
            "mon": [{ start: "09:00", end: "17:00" }],
            "tue": [{ start: "09:00", end: "17:00" }],
            "wed": [{ start: "09:00", end: "17:00" }],
            "thu": [{ start: "09:00", end: "17:00" }],
            "fri": [{ start: "09:00", end: "17:00" }]
        }
    },
    {
        id: "after_work", label: "After work", icon: Moon, ranges: {
            "mon": [{ start: "17:00", end: "23:30" }],
            "tue": [{ start: "17:00", end: "23:30" }],
            "wed": [{ start: "17:00", end: "23:30" }],
            "thu": [{ start: "17:00", end: "23:30" }],
            "fri": [{ start: "17:00", end: "23:30" }]
        }
    },
    {
        id: "work_hours", label: "Work hours", icon: Monitor, ranges: {
            "mon": [{ start: "08:00", end: "18:00" }],
            "tue": [{ start: "08:00", end: "18:00" }],
            "wed": [{ start: "08:00", end: "18:00" }],
            "thu": [{ start: "08:00", end: "18:00" }],
            "fri": [{ start: "08:00", end: "18:00" }]
        }
    },
    {
        id: "weekend", label: "Weekend", icon: Sun, ranges: {
            "sat": [{ start: "08:00", end: "22:00" }],
            "sun": [{ start: "08:00", end: "22:00" }]
        }
    }
];

export function StrategySchedule({ strategy, setStrategy, date, setDate }: StrategyScheduleProps) {
    // We'll manage local schedule state and sync to strategy on change
    // Initial state could be parsed from strategy.schedule.deliveryTime if complicated, 
    // but for now we default to "All Time" if empty
    const [schedule, setSchedule] = useState<WeeklySchedule>(PRESETS[0].ranges as any);
    const [activePreset, setActivePreset] = useState("all");

    const applyPreset = (presetId: string) => {
        const preset = PRESETS.find(p => p.id === presetId);
        if (preset) {
            setActivePreset(presetId);
            setSchedule(preset.ranges as any);
            // Sync with parent strategy object (simplified)
            setStrategy({ ...strategy, schedule: { ...strategy.schedule, deliveryTime: presetId } });
        }
    };

    const addRange = (dayId: string) => {
        setActivePreset("custom"); // Switch to custom if user edits
        setSchedule(prev => ({
            ...prev,
            [dayId]: [...(prev[dayId] || []), { start: "09:00", end: "17:00" }]
        }));
    };

    const removeRange = (dayId: string, index: number) => {
        setActivePreset("custom");
        setSchedule(prev => {
            const newRanges = [...(prev[dayId] || [])];
            newRanges.splice(index, 1);
            return { ...prev, [dayId]: newRanges };
        });
    };

    const updateRange = (dayId: string, index: number, field: 'start' | 'end', value: string) => {
        setActivePreset("custom");
        setSchedule(prev => {
            const newRanges = [...(prev[dayId] || [])];
            newRanges[index] = { ...newRanges[index], [field]: value };
            return { ...prev, [dayId]: newRanges };
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Budget & Schedule
                </CardTitle>
                <CardDescription>Set your spending limits and precise delivery schedule.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* Budget Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Budget Amount</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="number"
                                value={strategy.budget.amount}
                                onChange={(e) => setStrategy({ ...strategy, budget: { ...strategy.budget, amount: parseInt(e.target.value) || 0 } })}
                                className="pl-9 h-11"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Budget Type</Label>
                        <Select
                            value={strategy.budget.interval}
                            onValueChange={(val: any) => setStrategy({ ...strategy, budget: { ...strategy.budget, interval: val } })}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily Budget</SelectItem>
                                <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                    <Label>Schedule</Label>
                    <div className="flex gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal h-11", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "yyyy-MM-dd") : <span>Start date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <Input className="w-[240px] h-11" placeholder="End date (Optional)" disabled />
                    </div>
                </div>

                {/* Presets */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Delivery Time Slots</Label>
                        <span className="text-xs text-muted-foreground">Times are in local timezone</span>
                    </div>

                    <div className="bg-primary/5 rounded-lg p-1.5 flex flex-wrap gap-2">
                        {PRESETS.map(preset => {
                            const Icon = preset.icon;
                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => applyPreset(preset.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                        activePreset === preset.id
                                            ? "bg-background shadow-sm text-primary"
                                            : "text-muted-foreground hover:bg-background/50"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {preset.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Range List */}
                    <div className="border rounded-lg divide-y bg-card">
                        {DAYS.map(day => {
                            const ranges = schedule[day.id] || [];
                            const hasRanges = ranges.length > 0;

                            return (
                                <div key={day.id} className="grid grid-cols-[120px_1fr] group">
                                    <div className="p-4 flex flex-col justify-start">
                                        <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                                            <Clock className={cn("w-4 h-4", hasRanges ? "text-primary" : "text-muted-foreground/30")} />
                                            {day.label}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2 w-fit h-6 text-xs px-2 text-primary hover:text-primary hover:bg-primary/10 -ml-2"
                                            onClick={() => addRange(day.id)}
                                        >
                                            <Plus className="w-3 h-3 mr-1" /> Add
                                        </Button>
                                    </div>

                                    <div className="p-4 space-y-3 bg-muted/5">
                                        {ranges.length === 0 && (
                                            <div className="text-sm text-muted-foreground italic py-2">No delivery scheduled</div>
                                        )}
                                        {ranges.map((range, idx) => (
                                            <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                                <Select value={range.start} onValueChange={(v) => updateRange(day.id, idx, 'start', v)}>
                                                    <SelectTrigger className="w-[140px] h-9">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {TIME_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <span className="text-muted-foreground">-</span>
                                                <Select value={range.end} onValueChange={(v) => updateRange(day.id, idx, 'end', v)}>
                                                    <SelectTrigger className="w-[140px] h-9">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {TIME_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeRange(day.id, idx)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5 gap-2" onClick={() => applyPreset("all")}>
                        <Clock className="w-4 h-4" /> Reset to 24/7 Delivery
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}
