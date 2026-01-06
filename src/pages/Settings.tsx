import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  User,
  Palette,
  Globe,
  Bell,
  Save,
  Upload,
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brand, setBrand] = useState<any>(null);

  const [preferences, setPreferences] = useState({
    defaultFormat: "1:1",
    language: "en",
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
  });

  useEffect(() => {
    const fetchBrand = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (data) setBrand(data);
      setLoading(false);
    };

    fetchBrand();
  }, [navigate]);

  const handleSaveBrand = async () => {
    if (!brand) return;
    setSaving(true);

    const { error } = await supabase
      .from("brands")
      .update({
        name: brand.name,
        brand_voice: brand.brand_voice,
        landing_page_url: brand.landing_page_url,
      })
      .eq("id", brand.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Brand settings updated successfully" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="brand" className="space-y-6">
          <TabsList>
            <TabsTrigger value="brand">
              <Palette className="h-4 w-4 mr-2" />
              Brand Profile
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <User className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brand" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Brand Information</CardTitle>
                <CardDescription>
                  Update your brand details used for generating ads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo */}
                <div className="space-y-2">
                  <Label>Brand Logo</Label>
                  <div className="flex items-center gap-4">
                    {brand?.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt="Brand logo"
                        className="w-20 h-20 rounded-lg object-cover bg-muted"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                        <Palette className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                </div>

                {/* Brand Name */}
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={brand?.name || ""}
                    onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                  />
                </div>

                {/* Landing Page URL */}
                <div className="space-y-2">
                  <Label htmlFor="landingUrl">Landing Page URL</Label>
                  <Input
                    id="landingUrl"
                    type="url"
                    value={brand?.landing_page_url || ""}
                    onChange={(e) =>
                      setBrand({ ...brand, landing_page_url: e.target.value })
                    }
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                {/* Brand Voice */}
                <div className="space-y-2">
                  <Label htmlFor="brandVoice">Brand Voice</Label>
                  <Textarea
                    id="brandVoice"
                    value={brand?.brand_voice || ""}
                    onChange={(e) => setBrand({ ...brand, brand_voice: e.target.value })}
                    placeholder="Describe your brand's tone and personality..."
                    rows={4}
                  />
                </div>

                {/* Colors */}
                {brand?.colors && (
                  <div className="space-y-2">
                    <Label>Brand Colors</Label>
                    <div className="flex items-center gap-2">
                      {(Array.isArray(brand.colors) ? brand.colors : []).map(
                        (color: string, index: number) => (
                          <div
                            key={index}
                            className="w-10 h-10 rounded-lg border border-border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

                <Button onClick={handleSaveBrand} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>
                  Set your default options for ad creation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Preference */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-border">
                  <div>
                    <Label className="text-sm font-semibold text-foreground">Theme Preference</Label>
                    <p className="text-xs text-muted-foreground mt-1">Switch between light, dark, and system themes</p>
                  </div>
                  <ThemeToggle />
                </div>

                {/* Default Format */}
                <div className="space-y-2">
                  <Label>Default Ad Format</Label>
                  <Select
                    value={preferences.defaultFormat}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, defaultFormat: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9:16">9:16 (Stories/Reels)</SelectItem>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                      <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, language: value })
                    }
                  >
                    <SelectTrigger>
                      <Globe className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your campaigns via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get real-time alerts in your browser
                    </p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Weekly Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Receive a summary of your campaign performance every week
                    </p>
                  </div>
                  <Switch
                    checked={preferences.weeklyReports}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, weeklyReports: checked })
                    }
                  />
                </div>

                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Notifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
