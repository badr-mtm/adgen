import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, RotateCw, Search, Wifi, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    <div className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 z-20 transition-colors duration-300">
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-1 border-l pl-6 border-border">
          <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex justify-center px-12 items-center gap-4">
        <h1 className="text-sm font-semibold truncate max-w-[400px] text-foreground tracking-tight">{title}</h1>
        <Badge variant="outline" className="hidden lg:flex items-center gap-1.5 bg-card border-green-500/30 text-green-600 dark:text-green-400 text-[10px] px-2 h-5">
          <Activity className="w-3 h-3 animate-pulse" />
          LIVE EDIT
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center text-[10px] text-muted-foreground gap-2 border-r border-border pr-4 mr-1">
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span className="hidden sm:inline">CONNECTED</span>
          </div>
        </div>

        <div className="relative group hidden sm:block">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <div className="flex items-center gap-1 pl-7 pr-3 py-1.5 bg-muted/50 rounded-md border border-border group-hover:border-primary/30 transition-all cursor-text">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest hidden lg:inline">Search...</span>
            <span className="text-[10px] bg-background border border-border px-1 rounded text-muted-foreground group-hover:text-foreground">⌘K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
