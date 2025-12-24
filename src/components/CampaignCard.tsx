import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Pencil, Trash2, Video, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CampaignCardProps {
  image: string;
  title: string;
  description: string;
  status?: string;
  adType?: "video" | "image";
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "published":
    case "live":
      return { label: "Live", className: "bg-green-500/20 text-green-400 border-green-500/30" };
    case "ready":
    case "ready_to_publish":
      return { label: "Ready to Publish", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    case "concept":
    case "draft":
    default:
      return { label: "Draft", className: "bg-muted text-muted-foreground border-border" };
  }
};

const CampaignCard = ({ image, title, description, status, adType, onClick, onEdit, onDelete }: CampaignCardProps) => {
  const statusBadge = getStatusBadge(status);
  
  return (
    <Card 
      className="bg-card border-border shadow-card cursor-pointer overflow-hidden group transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/50 hover:bg-background/80 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Ad Type Badge */}
        {adType && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs gap-1">
              {adType === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
              {adType === "video" ? "Video" : "Image"}
            </Badge>
          </div>
        )}
        
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">{title}</h3>
          <Badge variant="outline" className={cn("text-[10px] shrink-0", statusBadge.className)}>
            {statusBadge.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>
    </Card>
  );
};

export default CampaignCard;
