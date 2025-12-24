import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet, Monitor } from "lucide-react";

interface AdPreviewProps {
  adData: {
    image: string;
    header: string;
    description: string;
    ctaText: string;
    backgroundColor: string;
  };
}

const AdPreview = ({ adData }: AdPreviewProps) => {
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");

  const aspectRatioClasses = {
    "9:16": "aspect-[9/16] max-w-[360px]",
    "1:1": "aspect-square max-w-[500px]",
    "16:9": "aspect-video max-w-full"
  };

  return (
    <div className="flex-1 bg-preview-bg p-8 flex flex-col items-center">
      {/* Aspect Ratio Controls */}
      <div className="mb-6 flex gap-2 bg-card rounded-lg p-1 shadow-card">
        <Button
          variant={aspectRatio === "9:16" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setAspectRatio("9:16")}
          className="transition-smooth"
        >
          <Smartphone className="h-4 w-4 mr-2" />
          9:16
        </Button>
        <Button
          variant={aspectRatio === "1:1" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setAspectRatio("1:1")}
          className="transition-smooth"
        >
          <Tablet className="h-4 w-4 mr-2" />
          1:1
        </Button>
        <Button
          variant={aspectRatio === "16:9" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setAspectRatio("16:9")}
          className="transition-smooth"
        >
          <Monitor className="h-4 w-4 mr-2" />
          16:9
        </Button>
      </div>

      {/* Ad Preview */}
      <div 
        className={`${aspectRatioClasses[aspectRatio]} w-full rounded-2xl shadow-soft overflow-hidden transition-smooth`}
        style={{ backgroundColor: adData.backgroundColor }}
      >
        <div className="h-full flex flex-col">
          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-8">
            <img 
              src={adData.image} 
              alt="Ad preview"
              className="max-w-full max-h-full object-contain rounded-full"
            />
          </div>
          
          {/* Content */}
          <div className="p-8 space-y-4 text-center">
            <h2 className="text-2xl font-bold text-white uppercase leading-tight">
              {adData.header}
            </h2>
            <p className="text-white/90 text-sm">
              {adData.description}
            </p>
            <Button 
              className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold transition-smooth"
            >
              {adData.ctaText}
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="transition-smooth">
          I'm done
        </Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth">
          Generate variations
        </Button>
      </div>
    </div>
  );
};

export default AdPreview;
