import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Download,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Variant {
  id: string;
  imageUrl: string;
  label: string;
  selected: boolean;
}

interface VariantsPanelProps {
  variants: Variant[];
  isGenerating: boolean;
  onClose: () => void;
  onSelectVariant: (id: string) => void;
  onDownloadSelected: () => void;
  onRegenerateVariants: () => void;
}

const VariantsPanel = ({
  variants,
  isGenerating,
  onClose,
  onSelectVariant,
  onDownloadSelected,
  onRegenerateVariants,
}: VariantsPanelProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const selectedCount = variants.filter(v => v.selected).length;

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(variants.length - 1, prev + 1));
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <Sparkles className="h-16 w-16 text-primary animate-pulse mx-auto" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-ping" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Generating Variants</h2>
            <p className="text-muted-foreground max-w-md">
              Creating multiple variations of your ad for A/B testing...
            </p>
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Ad Variants</h2>
            <p className="text-sm text-muted-foreground">
              {selectedCount} of {variants.length} selected
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onRegenerateVariants}>
            <Sparkles className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          <Button onClick={onDownloadSelected} disabled={selectedCount === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download Selected
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Large Preview */}
        <div className="flex-1 p-8 flex items-center justify-center relative">
          {variants[currentIndex] && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/50 hover:bg-background/80"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="relative max-w-3xl max-h-full">
                <img
                  src={variants[currentIndex].imageUrl}
                  alt={variants[currentIndex].label}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                />
                <Badge className="absolute top-4 left-4">
                  {variants[currentIndex].label}
                </Badge>
                <Button
                  variant={variants[currentIndex].selected ? "default" : "outline"}
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={() => onSelectVariant(variants[currentIndex].id)}
                >
                  {variants[currentIndex].selected ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Selected
                    </>
                  ) : (
                    "Select"
                  )}
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/50 hover:bg-background/80"
                onClick={handleNext}
                disabled={currentIndex === variants.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails Sidebar */}
        <div className="w-64 border-l border-border bg-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium">All Variants</h3>
          </div>
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-3 space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    index === currentIndex
                      ? "border-primary"
                      : variant.selected
                      ? "border-primary/50"
                      : "border-transparent hover:border-muted"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <img
                    src={variant.imageUrl}
                    alt={variant.label}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {variant.label}
                    </Badge>
                    {variant.selected && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default VariantsPanel;
