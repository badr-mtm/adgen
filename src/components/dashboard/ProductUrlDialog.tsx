import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Link2,
  Loader2,
  Image,
  Video,
  Check,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface ScrapedProduct {
  title: string;
  description: string;
  images: string[];
  videos: string[];
  brand?: string;
  price?: string;
}

interface ProductUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductUrlDialog({ open, onOpenChange }: ProductUrlDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ScrapedProduct | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [step, setStep] = useState<"input" | "select">("input");

  const handleScrape = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-product-url", {
        body: { url: url.trim() },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Failed to analyze URL");
      }

      setProduct(data.product);
      setStep("select");
      
      // Auto-select first few images
      const autoSelect = data.product.images.slice(0, 3);
      setSelectedAssets(autoSelect);

      toast({
        title: "Product Analyzed!",
        description: `Found ${data.product.images.length} images and ${data.product.videos.length} videos`,
      });
    } catch (error: any) {
      console.error("Error scraping URL:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the product URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAsset = (assetUrl: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetUrl)
        ? prev.filter((a) => a !== assetUrl)
        : [...prev, assetUrl]
    );
  };

  const handleContinue = () => {
    if (selectedAssets.length === 0) {
      toast({
        title: "Select Assets",
        description: "Please select at least one image or video to continue",
        variant: "destructive",
      });
      return;
    }

    // Navigate to create page with scraped data
    const params = new URLSearchParams();
    params.set("productUrl", url);
    params.set("productTitle", product?.title || "");
    params.set("productDescription", product?.description || "");
    params.set("assets", JSON.stringify(selectedAssets));
    
    // Determine ad type based on selected assets
    const hasVideo = selectedAssets.some(a => 
      a.toLowerCase().match(/\.(mp4|webm|mov|m3u8)/i)
    );
    params.set("type", hasVideo ? "video" : "image");

    onOpenChange(false);
    navigate(`/create?${params.toString()}`);
  };

  const handleReset = () => {
    setUrl("");
    setProduct(null);
    setSelectedAssets([]);
    setStep("input");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            {step === "input" ? "Import from Product URL" : "Select Assets"}
          </DialogTitle>
          <DialogDescription>
            {step === "input"
              ? "Enter a product page URL to automatically extract images and videos for your ad"
              : "Choose the images and videos you want to use in your ad"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "input" ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/product-page"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={handleScrape} disabled={loading || !url.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Works best with e-commerce product pages (Amazon, Shopify, etc.)</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              {/* Product Info */}
              {product && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {product.title}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {product.brand && (
                      <Badge variant="secondary">{product.brand}</Badge>
                    )}
                    {product.price && (
                      <Badge variant="outline">{product.price}</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Assets Grid */}
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {/* Images */}
                  {product && product.images.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Images ({product.images.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {product.images.map((img, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleAsset(img)}
                            className={`
                              relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                              ${selectedAssets.includes(img)
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-border/50 hover:border-primary/50"
                              }
                            `}
                          >
                            <img
                              src={img}
                              alt={`Product ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            {selectedAssets.includes(img) && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="h-4 w-4 text-primary-foreground" />
                                </div>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {product && product.videos.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Videos ({product.videos.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {product.videos.map((video, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleAsset(video)}
                            className={`
                              relative aspect-video rounded-lg overflow-hidden border-2 transition-all bg-muted
                              ${selectedAssets.includes(video)
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-border/50 hover:border-primary/50"
                              }
                            `}
                          >
                            <video
                              src={video}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Video className="h-8 w-8 text-white" />
                            </div>
                            {selectedAssets.includes(video) && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary-foreground" />
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No assets found */}
                  {product && product.images.length === 0 && product.videos.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No images or videos found on this page</p>
                      <p className="text-sm">Try a different URL</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={handleReset}>
                  Try Different URL
                </Button>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedAssets.length} selected
                  </Badge>
                  <Button onClick={handleContinue} disabled={selectedAssets.length === 0}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
