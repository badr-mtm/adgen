import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

interface ImagePreviewProps {
  imageUrl: string;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const aspectRatios = [
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "1:1", value: "1:1" },
  { label: "4:5", value: "4:5" },
];

const ImagePreview = ({
  imageUrl,
  aspectRatio,
  onAspectRatioChange,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}: ImagePreviewProps) => {
  const [imageError, setImageError] = useState(false);

  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case "16:9":
        return { aspectRatio: "16/9" };
      case "9:16":
        return { aspectRatio: "9/16" };
      case "1:1":
        return { aspectRatio: "1/1" };
      case "4:5":
        return { aspectRatio: "4/5" };
      default:
        return { aspectRatio: "16/9" };
    }
  };

  const getMaxDimensions = () => {
    switch (aspectRatio) {
      case "9:16":
        return "max-h-[75vh] max-w-[42vh]";
      case "1:1":
        return "max-h-[70vh] max-w-[70vh]";
      case "4:5":
        return "max-h-[75vh] max-w-[60vh]";
      default:
        return "max-h-[70vh] max-w-[90%]";
    }
  };

  return (
    <div className="flex-1 bg-preview-bg flex flex-col items-center justify-center relative p-8">
      {/* Previous Button */}
      {hasPrevious && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm z-10"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      {/* Image Container */}
      <div 
        className={`relative ${getMaxDimensions()} w-full rounded-lg overflow-hidden shadow-2xl bg-muted`}
        style={getAspectRatioStyle()}
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt="Generated ad"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <ImageOff className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">No image generated yet</p>
          </div>
        )}
      </div>

      {/* Aspect Ratio Selector - Under Image */}
      <div className="mt-6 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Aspect Ratio:</span>
        <div className="flex gap-2">
          {aspectRatios.map((ratio) => (
            <Badge
              key={ratio.value}
              variant={aspectRatio === ratio.value ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent transition-colors px-3 py-1"
              onClick={() => onAspectRatioChange(ratio.value)}
            >
              {ratio.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Next Button */}
      {hasNext && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm z-10"
          onClick={onNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default ImagePreview;
