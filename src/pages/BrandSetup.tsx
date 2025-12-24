import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export default function BrandSetup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [colors, setColors] = useState<string[]>(["#000000"]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [brandData, setBrandData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const addColor = () => {
    setColors([...colors, "#000000"]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      let logoUrl = "";

      // Upload logo if provided
      if (logo) {
        const fileExt = logo.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("brand-assets")
          .upload(fileName, logo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("brand-assets")
          .getPublicUrl(fileName);
        
        logoUrl = publicUrl;
      }

      // Call brand ingestion edge function if landing page URL provided
      let extractedData = { colors: colors, fonts: { heading: "Inter", body: "Inter" } };
      if (landingPageUrl) {
        try {
          const { data: ingestData, error: ingestError } = await supabase.functions.invoke(
            "brand-ingest",
            {
              body: { landingPageUrl },
            }
          );
          if (!ingestError && ingestData) {
            extractedData = ingestData;
          }
        } catch (error) {
          console.log("Brand ingest failed, using manual inputs");
        }
      }

      // Create brand
      const { error: brandError } = await supabase.from("brands").insert({
        user_id: userId,
        name,
        email,
        logo_url: logoUrl,
        brand_voice: brandVoice,
        landing_page_url: landingPageUrl,
        colors: extractedData.colors || colors,
        fonts: extractedData.fonts || { heading: "Inter", body: "Inter" },
      });

      if (brandError) throw brandError;

      // Store brand data for preview
      setBrandData({
        name,
        email,
        logoUrl,
        colors: extractedData.colors || colors,
        fonts: extractedData.fonts || { heading: "Inter", body: "Inter" },
      });
      
      setShowPreview(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showPreview && brandData) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Your Business DNA</h1>
            <p className="text-muted-foreground">
              Here's a snapshot of your business that gets you to where you want to be using social media
            </p>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 p-8">
            <div className="space-y-8">
              {/* Brand Info */}
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-white">{brandData.name}</h2>
                <p className="text-muted-foreground">{brandData.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Logo Section */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">Logo</Label>
                  <div className="bg-zinc-800 rounded-lg p-6 flex items-center justify-center h-40">
                    {brandData.logoUrl ? (
                      <img src={brandData.logoUrl} alt="Brand logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="text-6xl font-bold text-white mb-2">
                          {brandData.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Images Section */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">Images</Label>
                  <div className="bg-zinc-800 rounded-lg p-4 h-40">
                    <div className="grid grid-cols-2 gap-2 h-full">
                      {brandData.logoUrl ? (
                        <>
                          <div className="bg-zinc-700 rounded flex items-center justify-center">
                            <img src={brandData.logoUrl} alt="Variant 1" className="max-h-full max-w-full object-contain p-2" />
                          </div>
                          <div className="bg-zinc-700 rounded flex items-center justify-center">
                            <img src={brandData.logoUrl} alt="Variant 2" className="max-h-full max-w-full object-contain p-2" />
                          </div>
                          <div className="bg-zinc-700 rounded flex items-center justify-center">
                            <img src={brandData.logoUrl} alt="Variant 3" className="max-h-full max-w-full object-contain p-2" />
                          </div>
                          <div className="bg-zinc-700 rounded flex items-center justify-center">
                            <img src={brandData.logoUrl} alt="Variant 4" className="max-h-full max-w-full object-contain p-2" />
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2 flex items-center justify-center text-muted-foreground text-sm">
                          Logo variants will appear here
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors Section */}
              <div>
                <Label className="text-sm text-muted-foreground mb-3 block">Colors</Label>
                <div className="flex gap-4">
                  {brandData.colors.map((color: string, index: number) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div 
                        className="w-16 h-16 rounded-lg border border-zinc-700"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-muted-foreground font-mono">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fonts Section */}
              <div>
                <Label className="text-sm text-muted-foreground mb-3 block">Fonts</Label>
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="bg-zinc-800 rounded-lg p-4 mb-2 w-24 h-24 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white" style={{ fontFamily: brandData.fonts.heading }}>
                        Aa
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{brandData.fonts.heading}</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-zinc-800 rounded-lg p-4 mb-2 w-24 h-24 flex items-center justify-center">
                      <span className="text-3xl text-white" style={{ fontFamily: brandData.fonts.body }}>
                        Aa
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{brandData.fonts.body}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="bg-primary hover:bg-primary/90"
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Create Your Brand</CardTitle>
                <CardDescription>
                  Set up your brand profile to personalize your ads, or skip to get started right away
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Brand Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@acme.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Brand Logo</Label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="logo"
                    className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                  </label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div className="text-sm text-muted-foreground">
                    Upload your logo (PNG, JPG, SVG)
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Colors</Label>
                <div className="space-y-2">
                  {colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addColor}>
                    Add Color
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandVoice">Brand Voice & Tone</Label>
                <Textarea
                  id="brandVoice"
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  placeholder="Describe your brand's personality, tone, and messaging style..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landingPageUrl">Landing Page URL</Label>
                <Input
                  id="landingPageUrl"
                  type="url"
                  value={landingPageUrl}
                  onChange={(e) => setLandingPageUrl(e.target.value)}
                  placeholder="https://yourbrand.com"
                />
                <p className="text-xs text-muted-foreground">
                  We'll extract colors, fonts, and design elements from your website
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Brand DNA..." : "Create Brand DNA"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
