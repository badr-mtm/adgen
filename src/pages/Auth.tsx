import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import heroImage from "@/assets/onboarding-hero.png";

type BusinessType = "B2C Advertiser" | "B2B Advertiser" | "A marketing Agency" | "Small business";
type AdPlatform = "Google Ads" | "Meta ads" | "Tiktok Ads" | "Youtube Ads" | "AppLovin" | "Other" | "I don't advertise yet";

export default function Auth() {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [adPlatforms, setAdPlatforms] = useState<AdPlatform[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/brand-setup");
      }
    });
  }, [navigate]);

  const steps = [
    { number: 1, title: "Sign up your account", description: "Enter your company details" },
    { number: 2, title: "Set up your workspace", description: "Choose your business type" },
    { number: 3, title: "Set up your profile", description: "Complete your account" },
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!companyName || !email) {
        toast({ title: "Please fill in all fields", variant: "destructive" });
        return;
      }
    } else if (currentStep === 2) {
      if (!businessType) {
        toast({ title: "Please select a business type", variant: "destructive" });
        return;
      }
      // Skip step 3 if not B2C or B2B
      if (businessType !== "B2C Advertiser" && businessType !== "B2B Advertiser") {
        setCurrentStep(4);
        return;
      }
    } else if (currentStep === 3) {
      if (adPlatforms.length === 0) {
        toast({ title: "Please select at least one option", variant: "destructive" });
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 4 && businessType !== "B2C Advertiser" && businessType !== "B2B Advertiser") {
      setCurrentStep(2);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const toggleAdPlatform = (platform: AdPlatform) => {
    setAdPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast({ title: "Logged in successfully!" });
      navigate("/brand-setup");
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !password || !confirmPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/brand-setup`,
          data: {
            company_name: companyName,
            business_type: businessType,
            ad_platforms: adPlatforms,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) throw error;
      toast({ title: "Account created successfully!" });
      navigate("/brand-setup");
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

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/brand-setup`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const businessTypes: BusinessType[] = ["B2C Advertiser", "B2B Advertiser", "A marketing Agency", "Small business"];
  const platforms: AdPlatform[] = ["Google Ads", "Meta ads", "Tiktok Ads", "Youtube Ads", "AppLovin", "Other", "I don't advertise yet"];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero/Steps */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="space-y-12">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Get Started with Us</h1>
              <p className="text-lg text-muted-foreground">Complete these easy steps to register your account</p>
            </div>

            <div className="space-y-6">
              {steps.map((step) => (
                <Card
                  key={step.number}
                  className={`transition-smooth ${
                    currentStep >= step.number
                      ? "bg-card border-primary/50 shadow-card"
                      : "bg-card/50 border-border"
                  }`}
                >
                  <CardContent className="p-6 flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-smooth ${
                        currentStep > step.number
                          ? "bg-primary text-primary-foreground"
                          : currentStep === step.number
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? <Check className="w-6 h-6" /> : step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Design your future, one campaign at a time.</p>
            <p className="mt-1">Join a community of marketers creating exceptional ads.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Login Mode */}
          {isLoginMode ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
                <p className="text-muted-foreground">Sign in to your account to continue</p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-card border-border"
                  onClick={handleGoogleAuth}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button type="button" variant="outline" className="flex-1 bg-card border-border">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.5 0L0 12.5v11.3h11.3v-7.1h2.4v7.1H24V12.5L12.5 0z"/>
                  </svg>
                  Github
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="eg. john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(false)}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Company Name & Email */}
              {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Sign Up Account</h2>
                <p className="text-muted-foreground">Enter your company details to create your account</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company/Brand Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="eg. Acme Inc"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="eg. john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <Button onClick={handleNext} className="w-full" size="lg">
                  Continue
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(true)}
                  className="text-primary hover:underline"
                >
                  Log in
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Business Type */}
          {!isLoginMode && currentStep === 2 && (

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Choose Your Business Type</h2>
                <p className="text-muted-foreground">Select the option that best describes your business</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {businessTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setBusinessType(type)}
                    className={`p-4 rounded-lg border-2 text-left transition-smooth ${
                      businessType === type
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{type}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-smooth ${
                          businessType === type
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {businessType === type && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="outline" className="flex-1" size="lg">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1" size="lg">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Ad Platforms (Conditional) */}
          {!isLoginMode && currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Advertising Platforms</h2>
                <p className="text-muted-foreground">Are you running ads on these platforms?</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => toggleAdPlatform(platform)}
                    className={`p-4 rounded-lg border-2 text-left transition-smooth ${
                      adPlatforms.includes(platform)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{platform}</span>
                      <div
                        className={`w-5 h-5 rounded border-2 transition-smooth ${
                          adPlatforms.includes(platform)
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {adPlatforms.includes(platform) && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="outline" className="flex-1" size="lg">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1" size="lg">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Create Account */}
          {!isLoginMode && currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Create Your Account</h2>
                <p className="text-muted-foreground">Enter your personal data to create your account</p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-card border-border"
                  onClick={handleGoogleAuth}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button type="button" variant="outline" className="flex-1 bg-card border-border">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.5 0L0 12.5v11.3h11.3v-7.1h2.4v7.1H24V12.5L12.5 0z"/>
                  </svg>
                  Github
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="eg. John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="eg. Francisco"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Must be at least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" onClick={handleBack} variant="outline" className="flex-1" size="lg">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading} size="lg">
                    {loading ? "Creating..." : "Sign Up"}
                  </Button>
                </div>
              </form>

              <div className="text-center text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <span className="text-primary">Terms of Service</span> and{" "}
                <span className="text-primary">Privacy Policy</span>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
