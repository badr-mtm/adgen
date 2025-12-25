import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  FileText, 
  Eye,
  ArrowRight,
  Tv,
  Sparkles
} from "lucide-react";

interface StoryboardScene {
  sceneNumber: number;
  duration: string;
  visual: string;
  audio: string;
  action: string;
}

interface TVStoryboardPreviewProps {
  title: string;
  duration: "15" | "30" | "60";
  scenes: StoryboardScene[];
  onProceed: () => void;
  onEdit: () => void;
}

export function TVStoryboardPreview({ 
  title, 
  duration, 
  scenes, 
  onProceed,
  onEdit 
}: TVStoryboardPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Tv className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Badge variant="outline" className="border-primary/30 text-primary">
            <Clock className="h-3 w-3 mr-1" />
            {duration} seconds
          </Badge>
          <Badge variant="outline" className="border-border">
            {scenes.length} scenes
          </Badge>
        </div>
      </div>

      {/* Storyboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map((scene, index) => (
          <motion.div
            key={scene.sceneNumber}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border hover:border-primary/30 transition-all group overflow-hidden">
              {/* Scene Visual Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-secondary to-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-10 w-10 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                </div>
                <div className="absolute top-2 left-2">
                  <Badge className="bg-black/60 text-white border-0 text-xs">
                    Scene {scene.sceneNumber}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-black/60 text-white border-0 text-xs">
                    {scene.duration}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4 space-y-3">
                {/* Visual Description */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Eye className="h-3 w-3 text-blue-400" />
                    <span className="text-xs font-medium text-muted-foreground">Visual</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{scene.visual}</p>
                </div>

                {/* Audio/VO */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText className="h-3 w-3 text-amber-400" />
                    <span className="text-xs font-medium text-muted-foreground">Audio/VO</span>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-2 italic">"{scene.audio}"</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <motion.div 
        className="flex items-center justify-center gap-4 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          variant="outline" 
          onClick={onEdit}
          className="h-12 px-6"
        >
          Edit Storyboard
        </Button>
        <Button 
          size="lg"
          onClick={onProceed}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Visuals
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
