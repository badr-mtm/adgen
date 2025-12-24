import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  Download, 
  Copy, 
  MoreVertical,
  RefreshCw,
  Sparkles,
  Film,
  PlusSquare,
  Loader2,
  Wand2,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ImageEditorControls from "./ImageEditorControls";

interface ImageEditorSidebarProps {
  prompt: string;
  aspectRatio: string;
  generatedAt?: string;
  imageUrl: string;
  onRecreate: (customPrompt?: string) => void;
  onDownload: () => void;
  onClose: () => void;
  onAIAction: (action: string, params?: any) => Promise<void>;
  onGenerateVariants: () => Promise<void>;
  onImageSwap: (file: File) => void;
  onRemoveBackground: () => Promise<void>;
  isRegenerating?: boolean;
  isProcessing?: boolean;
  processingAction?: string;
}

const ImageEditorSidebar = ({
  prompt,
  aspectRatio,
  generatedAt,
  imageUrl,
  onRecreate,
  onDownload,
  onClose,
  onAIAction,
  onGenerateVariants,
  onImageSwap,
  onRemoveBackground,
  isRegenerating = false,
  isProcessing = false,
  processingAction = "",
}: ImageEditorSidebarProps) => {
  const [zoom, setZoom] = useState([100]);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <span className="text-sm text-muted-foreground">{formatDate(generatedAt)}</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Copy image URL</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="edit" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Fine-tune
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Fine-tune Tab */}
        <TabsContent value="edit" className="flex-1 mt-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <ImageEditorControls
                imageUrl={imageUrl}
                onAIAction={onAIAction}
                onGenerateVariants={onGenerateVariants}
                onImageSwap={onImageSwap}
                onRemoveBackground={onRemoveBackground}
                isProcessing={isProcessing}
                processingAction={processingAction}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 mt-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* Prompt Section */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Prompt
                </label>
                {isEditingPrompt ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="Describe your desired changes..."
                      className="min-h-[100px] bg-secondary border-border resize-none text-sm"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setIsEditingPrompt(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          onRecreate(editPrompt);
                          setIsEditingPrompt(false);
                          setEditPrompt("");
                        }}
                        disabled={isRegenerating}
                      >
                        {isRegenerating ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-1" />
                        )}
                        Generate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p 
                    className="text-sm text-foreground leading-relaxed cursor-pointer hover:bg-muted/30 p-2 rounded-md transition-colors"
                    onClick={() => {
                      setEditPrompt(prompt);
                      setIsEditingPrompt(true);
                    }}
                  >
                    {prompt || "No prompt available"}
                  </p>
                )}
              </div>

              {/* Reference Image Section */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Reference
                </label>
                <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                  <span className="text-xs text-muted-foreground">None</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </label>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-10"
                  onClick={() => onRecreate()}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {isRegenerating ? "Recreating..." : "Recreate"}
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-10">
                  <Sparkles className="h-4 w-4" />
                  Upscale
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-10">
                  <Film className="h-4 w-4" />
                  Create video
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-10">
                  <PlusSquare className="h-4 w-4" />
                  Add to video project
                </Button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-4">
        {/* Zoom Control */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{zoom[0]}%</span>
          <Slider
            value={zoom}
            onValueChange={setZoom}
            min={25}
            max={200}
            step={5}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground">1920×1080 px</span>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorSidebar;
