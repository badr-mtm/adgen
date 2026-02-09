import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ImagePreview from "@/components/editor/ImagePreview";
import ImageEditorSidebar from "@/components/editor/ImageEditorSidebar";
import VariantsPanel from "@/components/editor/VariantsPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { removeBackground, loadImageFromUrl } from "@/lib/backgroundRemoval";
import { EditorPageSkeleton } from "@/components/skeletons/EditorPageSkeleton";

interface Variant {
  id: string;
  imageUrl: string;
  label: string;
  selected: boolean;
}

const Editor = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);

  // Processing states for AI actions
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState("");

  // Variants state
  const [showVariants, setShowVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);

  const [adData, setAdData] = useState({
    image: "",
    prompt: "",
    aspectRatio: "16:9",
    generatedAt: ""
  });

  useEffect(() => {
    const loadCampaign = async () => {
      if (!campaignId) {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: campaignData, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("user_id", session.user.id)
        .single();

      if (error || !campaignData) {
        toast({
          title: "Error",
          description: "Campaign not found",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setCampaign(campaignData);

      // Check if we already have a generated image
      const storyboard = campaignData.storyboard as any;
      const existingImage = storyboard?.generatedImageUrl;

      setAdData({
        image: existingImage || "",
        prompt: campaignData.prompt || campaignData.description || "",
        aspectRatio: (campaignData.aspect_ratios as string[])?.[0] || "16:9",
        generatedAt: storyboard?.generatedAt || ""
      });

      // If it's an image ad without generated image, generate it
      if (campaignData.ad_type === 'image' && !existingImage) {
        setLoading(false);
        await generateImageAd(campaignId);
      } else {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [campaignId, navigate, toast]);

  const generateImageAd = async (id: string, customPrompt?: string) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image-ad', {
        body: {
          campaignId: id,
          ...(customPrompt && { customPrompt })
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setAdData(prev => ({
          ...prev,
          image: data.imageUrl,
          generatedAt: new Date().toISOString()
        }));
        toast({
          title: "Image Generated!",
          description: "Your ad image has been created successfully."
        });
      }
    } catch (error: any) {
      console.error('Error generating image ad:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!adData.image) return;

    try {
      const response = await fetch(adData.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign?.title || 'ad'}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({ title: "Image downloaded!" });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the image",
        variant: "destructive"
      });
    }
  };

  const handleAspectRatioChange = (ratio: string) => {
    setAdData(prev => ({ ...prev, aspectRatio: ratio }));
  };

  // AI Action handler - connected to edge function
  const handleAIAction = async (action: string, params?: any) => {
    if (!campaignId || !adData.image) {
      toast({
        title: "No image available",
        description: "Generate an image first before applying AI actions",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingAction(action);

    try {
      const { data, error } = await supabase.functions.invoke('image-ai-actions', {
        body: {
          action,
          imageUrl: adData.image,
          params,
          campaignId
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setAdData(prev => ({
          ...prev,
          image: data.imageUrl,
          generatedAt: new Date().toISOString()
        }));
      }

      toast({
        title: "AI Action Applied",
        description: `Successfully applied: ${action.replace(/_/g, ' ')}`
      });
    } catch (error: any) {
      console.error('AI action error:', error);
      toast({
        title: "AI Action Failed",
        description: error.message || "Failed to apply AI action",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingAction("");
    }
  };

  // Generate variants handler - connected to edge function
  const handleGenerateVariants = async () => {
    if (!campaignId || !adData.image) {
      toast({
        title: "No image available",
        description: "Generate an image first before creating variants",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingVariants(true);
    setShowVariants(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ad-variants', {
        body: {
          campaignId,
          imageUrl: adData.image,
          variantCount: 3
        }
      });

      if (error) throw error;

      if (data?.variants) {
        const variantsWithSelection = data.variants.map((v: any, index: number) => ({
          ...v,
          selected: index === 0 // Select first (original) by default
        }));
        setVariants(variantsWithSelection);
        toast({
          title: "Variants Generated",
          description: `${data.variants.length} ad variants have been created`
        });
      }
    } catch (error: any) {
      console.error('Variant generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate variants",
        variant: "destructive"
      });
      setShowVariants(false);
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  // Image swap handler
  const handleImageSwap = (file: File) => {
    const url = URL.createObjectURL(file);
    setAdData(prev => ({ ...prev, image: url }));
    toast({ title: "Image swapped successfully" });
  };

  // Remove background handler - in-browser AI processing
  const handleRemoveBackground = async () => {
    if (!adData.image) {
      toast({
        title: "No image available",
        description: "Generate an image first before removing background",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingAction("remove_background");

    try {
      toast({
        title: "Loading AI Model",
        description: "Downloading background removal model (first time may take a moment)..."
      });

      // Load image from URL
      const imageElement = await loadImageFromUrl(adData.image);

      // Process with in-browser AI
      const resultBlob = await removeBackground(imageElement, (progress, status) => {
        console.log(`Background removal: ${progress}% - ${status}`);
      });

      // Create object URL for the result
      const resultUrl = URL.createObjectURL(resultBlob);

      setAdData(prev => ({
        ...prev,
        image: resultUrl,
        generatedAt: new Date().toISOString()
      }));

      toast({
        title: "Background Removed!",
        description: "Background has been removed using in-browser AI"
      });
    } catch (error: any) {
      console.error('Background removal error:', error);
      toast({
        title: "Background Removal Failed",
        description: error.message || "Could not remove background. Try a different image.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingAction("");
    }
  };

  // Variant selection handler
  const handleSelectVariant = (id: string) => {
    setVariants(prev => prev.map(v =>
      v.id === id ? { ...v, selected: !v.selected } : v
    ));
  };

  // Download selected variants
  const handleDownloadSelected = async () => {
    const selected = variants.filter(v => v.selected);

    for (const variant of selected) {
      try {
        const response = await fetch(variant.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${campaign?.title || 'ad'}-${variant.label}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
      }
    }

    toast({
      title: "Downloaded",
      description: `Downloaded ${selected.length} variant(s)`
    });
  };

  if (loading) {
    return <EditorPageSkeleton />;
  }

  // Show variants panel if active
  if (showVariants) {
    return (
      <VariantsPanel
        variants={variants}
        isGenerating={isGeneratingVariants}
        onClose={() => setShowVariants(false)}
        onSelectVariant={handleSelectVariant}
        onDownloadSelected={handleDownloadSelected}
        onRegenerateVariants={handleGenerateVariants}
      />
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navigation />

      <div className="flex-1 flex overflow-hidden min-h-0 border-t border-border">
        {generating ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center p-8">
              <div className="relative">
                <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-ping" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">Generating Your Ad Image</h2>
                <p className="text-muted-foreground max-w-md">
                  Our AI is crafting a stunning visual based on your campaign brief...
                </p>
              </div>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        ) : (
          <>
            <ImagePreview
              imageUrl={adData.image}
              aspectRatio={adData.aspectRatio}
              onAspectRatioChange={handleAspectRatioChange}
            />
            <ImageEditorSidebar
              prompt={adData.prompt}
              aspectRatio={adData.aspectRatio}
              generatedAt={adData.generatedAt}
              imageUrl={adData.image}
              onRecreate={(customPrompt) => campaignId && generateImageAd(campaignId, customPrompt)}
              onDownload={handleDownload}
              onClose={() => navigate(-1 as any)}
              onAIAction={handleAIAction}
              onGenerateVariants={handleGenerateVariants}
              onImageSwap={handleImageSwap}
              onRemoveBackground={handleRemoveBackground}
              isRegenerating={generating}
              isProcessing={isProcessing}
              processingAction={processingAction}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Editor;
