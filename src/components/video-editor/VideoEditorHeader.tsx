import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, RotateCw, Search, Bell, Wifi, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";

interface VideoEditorHeaderProps {
    title: string;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export default function VideoEditorHeader({
    title,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}: VideoEditorHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="h-14 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-4 z-20 transition-colors duration-300">
            <div className="flex items-center gap-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="text-white/60 hover:text-white hover:bg-white/5 gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="flex items-center gap-1 border-l pl-6 border-white/10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30"
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex justify-center px-12 items-center gap-4">
                <h1 className="text-sm font-semibold truncate max-w-[400px] text-white tracking-tight">{title}</h1>
                <Badge variant="outline" className="hidden lg:flex items-center gap-1.5 bg-black/40 border-green-500/30 text-green-400 text-[10px] px-2 h-5">
                    <Activity className="w-3 h-3 animate-pulse" />
                    LIVE EDIT
                </Badge>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center text-[10px] text-white/30 gap-2 border-r border-white/10 pr-4 mr-1">
                    <div className="flex items-center gap-1">
                        <Wifi className="w-3 h-3" />
                        <span className="hidden sm:inline">CONNECTED</span>
                    </div>
                </div>

                <div className="relative group hidden sm:block">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 group-hover:text-white transition-colors" />
                    <div className="flex items-center gap-1 pl-7 pr-3 py-1.5 bg-white/5 rounded-md border border-white/5 group-hover:border-white/20 transition-all cursor-text">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest hidden lg:inline">Search...</span>
                        <span className="text-[10px] bg-black/20 border border-white/10 px-1 rounded text-white/40 group-hover:text-white/60">⌘K</span>
                    </div>
                </div>

                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/5">
                    <Bell className="w-4 h-4" />
                </Button>

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/10 shadow-inner" />
            </div>
        </div>
    );
}
