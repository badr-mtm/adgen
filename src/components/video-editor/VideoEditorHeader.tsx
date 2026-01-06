import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, RotateCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        <div className="h-14 border-b bg-card flex items-center justify-between px-4 z-20 transition-colors duration-300">
            <div className="flex items-center gap-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="text-muted-foreground hover:text-foreground gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="flex items-center gap-1 border-l pl-6 border-border">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="h-8 w-8 text-muted-foreground disabled:opacity-30"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="h-8 w-8 text-muted-foreground disabled:opacity-30"
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex justify-center px-12">
                <h1 className="text-sm font-semibold truncate max-w-[400px] text-foreground">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative group">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <div className="flex items-center gap-1 pl-7 pr-3 py-1.5 bg-accent/5 rounded-md border border-transparent group-hover:border-border transition-all cursor-text">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Search in editor...</span>
                        <span className="text-[10px] bg-background border border-border px-1 rounded text-muted-foreground">⌘K</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
