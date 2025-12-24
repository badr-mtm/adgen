import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Video, Image as ImageIcon, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GoalPopover from "./create/GoalPopover";
import AudiencePopover from "./create/AudiencePopover";
import StylePopover from "./create/StylePopover";
import FormatsPopover from "./create/FormatsPopover";
export interface AdCreationData {
  prompt: string;
  adType: "video" | "image" | "url";
  goal: string;
  targetAudience: {
    demographics: string;
    geography: string;
    interests: string;
  };
  creativeStyle: string;
  aspectRatios: string[];
  assets?: File[];
  assetUrls?: string[];
  productUrl?: string;
}
export interface AdCreationFormProps {
  onSubmit: (data: AdCreationData) => void;
  initialData?: {
    prompt?: string;
    adType?: "video" | "image";
    assetUrls?: string[];
    productUrl?: string;
  };
}
const AdCreationForm = ({
  onSubmit,
  initialData
}: AdCreationFormProps) => {
  const {
    toast
  } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState(initialData?.prompt || "");
  const [adType, setAdType] = useState<"video" | "image" | "url">(initialData?.adType || "video");
  const [goal, setGoal] = useState("conversions");
  const [audienceMode, setAudienceMode] = useState<"auto" | "manual">("auto");
  const [demographics, setDemographics] = useState("");
  const [geography, setGeography] = useState("");
  const [interests, setInterests] = useState("");
  const [creativeStyle, setCreativeStyle] = useState("performance");
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["9:16", "1:1"]);
  const [autoAdapt, setAutoAdapt] = useState(true);
  const [assets, setAssets] = useState<File[]>([]);
  const [assetUrls, setAssetUrls] = useState<string[]>(initialData?.assetUrls || []);
  const [productUrl] = useState<string | undefined>(initialData?.productUrl);

  // Popover states
  const [goalOpen, setGoalOpen] = useState(false);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [formatsOpen, setFormatsOpen] = useState(false);
  useEffect(() => {
    if (initialData?.prompt) setPrompt(initialData.prompt);
    if (initialData?.adType) setAdType(initialData.adType);
    if (initialData?.assetUrls) setAssetUrls(initialData.assetUrls);
  }, [initialData]);
  const getAcceptedFileTypes = () => adType === "video" ? "video/*,image/*" : "image/*";
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      return adType === "video" ? isVideo || isImage : isImage;
    });
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: adType === "video" ? "Only images and videos are allowed" : "Only images are allowed",
        variant: "destructive"
      });
    }
    setAssets(prev => [...prev, ...validFiles]);
  };
  const removeAsset = (index: number) => setAssets(prev => prev.filter((_, i) => i !== index));
  const removeAssetUrl = (index: number) => setAssetUrls(prev => prev.filter((_, i) => i !== index));
  const isVideoUrl = (url: string) => {
    const lower = url.toLowerCase();
    return lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com') || lower.match(/\.(mp4|webm|mov|m3u8)/i);
  };
  const getYoutubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };
  const handleSubmit = () => {
    // No validation required - AI handles defaults
    onSubmit({
      prompt: prompt || "Create an engaging ad",
      adType,
      goal: goal || "conversions",
      targetAudience: {
        demographics,
        geography,
        interests
      },
      creativeStyle: creativeStyle || "performance",
      aspectRatios: selectedFormats.length > 0 ? selectedFormats : ["9:16", "1:1"],
      assets: assets.length > 0 ? assets : undefined,
      assetUrls: assetUrls.length > 0 ? assetUrls : undefined,
      productUrl
    });
  };
  return <div className="px-2 space-y-5">
      {/* Prompt Input */}
      <div className="space-y-2">
        <div className="relative">
          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[140px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none pb-14 px-4 py-4 text-base" placeholder="Describe your Ad idea, or paste a product link... " />
          
          {/* Bottom Controls */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept={getAcceptedFileTypes()} multiple className="hidden" onChange={handleFileUpload} />
              <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                <Upload className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-1 border p-0.5 rounded-lg border-border">
                <Button type="button" variant={adType === "video" ? "default" : "ghost"} size="sm" onClick={() => setAdType("video")} className="h-7 px-2">
                  <Video className="h-3.5 w-3.5 mr-1" />
                  Video
                </Button>
                <Button type="button" variant={adType === "image" ? "default" : "ghost"} size="sm" onClick={() => setAdType("image")} className="h-7 px-2">
                  <ImageIcon className="h-3.5 w-3.5 mr-1" />
                  Image
                </Button>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Don't overthink it. AI will refine your message.</p>
      </div>

      {/* URL Assets Preview */}
      {assetUrls.length > 0 && <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Product Assets ({assetUrls.length})</Label>
          <div className="flex flex-wrap gap-2">
            {assetUrls.map((url, index) => {
          const isVideo = isVideoUrl(url);
          const thumbnail = isVideo ? getYoutubeThumbnail(url) : url;
          return <div key={index} className="relative group">
                  <div className="w-20 h-20 rounded-md border border-border bg-muted overflow-hidden">
                    {thumbnail ? <img src={thumbnail} alt={`Asset ${index + 1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Video className="h-8 w-8 text-muted-foreground" /></div>}
                    {isVideo && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Video className="h-6 w-6 text-white" /></div>}
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeAssetUrl(index)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </Button>
                </div>;
        })}
          </div>
        </div>}

      {/* Uploaded Assets Preview */}
      {assets.length > 0 && <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Uploaded Assets ({assets.length})</Label>
          <div className="flex flex-wrap gap-2">
            {assets.map((file, index) => <div key={index} className="relative group">
                <div className="w-20 h-20 rounded-md border border-border bg-muted overflow-hidden">
                  {file.type.startsWith('image/') ? <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Video className="h-8 w-8 text-muted-foreground" /></div>}
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeAsset(index)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </Button>
              </div>)}
          </div>
        </div>}

      {/* Intent Chips Row */}
      <div className="flex flex-wrap gap-2 items-center">
        <GoalPopover value={goal} onChange={setGoal} open={goalOpen} onOpenChange={setGoalOpen} />
        <AudiencePopover mode={audienceMode} demographics={demographics} geography={geography} interests={interests} onModeChange={setAudienceMode} onDemographicsChange={setDemographics} onGeographyChange={setGeography} onInterestsChange={setInterests} open={audienceOpen} onOpenChange={setAudienceOpen} />
        <StylePopover value={creativeStyle} onChange={setCreativeStyle} open={styleOpen} onOpenChange={setStyleOpen} />
        <FormatsPopover selectedFormats={selectedFormats} autoAdapt={autoAdapt} onChange={setSelectedFormats} onAutoAdaptChange={setAutoAdapt} open={formatsOpen} onOpenChange={setFormatsOpen} />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base" onClick={handleSubmit}>
          <Sparkles className="h-5 w-5 mr-2" />
          Generate Concepts
        </Button>
        <p className="text-xs text-muted-foreground">4 creative directions with predicted performance</p>
      </div>
    </div>;
};
export default AdCreationForm;