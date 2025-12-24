import { useState } from "react";
import { ChevronDown, ChevronUp, Upload, Palette, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CustomizationPanelProps {
  adData: any;
  onUpdate: (data: any) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const CustomizationPanel = ({ adData, onUpdate, onRegenerate, isRegenerating }: CustomizationPanelProps) => {
  const [openSections, setOpenSections] = useState({
    image: true,
    header: false,
    description: false,
    cta: false,
    colors: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const Section = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: any; 
    children: React.ReactNode 
  }) => (
    <Collapsible
      open={openSections[id as keyof typeof openSections]}
      onOpenChange={() => toggleSection(id)}
      className="border-b border-border"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-smooth">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">{title}</span>
        </div>
        {openSections[id as keyof typeof openSections] ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 space-y-4 bg-editor-panel">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="w-96 bg-card border-l border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Customize</h2>
      </div>

      <Section id="image" title="Image" icon={Upload}>
        <div className="space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img src={adData.image} alt="Preview" className="w-full h-full object-cover" />
          </div>
          {onRegenerate && (
            <Button 
              variant="default" 
              className="w-full transition-smooth"
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate with AI'}
            </Button>
          )}
          <Button variant="outline" className="w-full transition-smooth">
            <Upload className="h-4 w-4 mr-2" />
            Upload new image
          </Button>
        </div>
      </Section>

      <Section id="header" title="Header" icon={Palette}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="header-text">Header text</Label>
            <Input
              id="header-text"
              value={adData.header}
              onChange={(e) => onUpdate({ ...adData, header: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="font-size">Font size</Label>
              <Input
                id="font-size"
                type="number"
                defaultValue="32"
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="line-height">Line height</Label>
              <Input
                id="line-height"
                type="number"
                defaultValue="40"
                className="bg-secondary border-border"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section id="description" title="Description" icon={Palette}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={adData.description}
              onChange={(e) => onUpdate({ ...adData, description: e.target.value })}
              className="bg-secondary border-border"
              rows={3}
            />
          </div>
        </div>
      </Section>

      <Section id="cta" title="Call to action" icon={Palette}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="cta-text">Button text</Label>
            <Input
              id="cta-text"
              value={adData.ctaText}
              onChange={(e) => onUpdate({ ...adData, ctaText: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
        </div>
      </Section>

      <Section id="colors" title="Colors" icon={Palette}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="bg-color">Background color</Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={adData.backgroundColor}
                onChange={(e) => onUpdate({ ...adData, backgroundColor: e.target.value })}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                value={adData.backgroundColor}
                onChange={(e) => onUpdate({ ...adData, backgroundColor: e.target.value })}
                className="bg-secondary border-border flex-1"
              />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default CustomizationPanel;
