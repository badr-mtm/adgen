import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, Mail } from "lucide-react";
import adgenLogo from "@/assets/adgen-logo.jpeg";
import tvLifestyleHero from "@/assets/tv-lifestyle-hero.jpg";

type AuthMode = "login" | "signup" | "forgot-password" | "reset-sent";

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/brand-setup");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/brand-setup");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    if (!email || !password || !confirmPassword) {
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
        },
      });
      if (error) throw error;
      toast({ 
        title: "Account created!", 
        description: "Check your email to verify your account." 
      });
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter your email address", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw error;
      setAuthMode("reset-sent");
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

  const handleMicrosoftAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: `${window.location.origin}/brand-setup`,
          scopes: "email profile openid",
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

  const getHeadline = () => {
    switch (authMode) {
      case "login":
        return { title: "Welcome back", subtitle: "Log in to continue" };
      case "signup":
        return { title: "Create your account", subtitle: "Sign up to get started" };
      case "forgot-password":
        return { title: "Reset your password", subtitle: "Enter your email to receive a reset link" };
      case "reset-sent":
        return { title: "Check your email", subtitle: "We've sent you a password reset link" };
      default:
        return { title: "Welcome back", subtitle: "Log in to continue" };
    }
  };

  const { title, subtitle } = getHeadline();

  return (
    <div className="min-h-screen flex">
      {/* Left Column — Authentication Panel (Functional Zone) */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center px-8 lg:px-12 xl:px-16 py-12 bg-background">
        <div className="w-full max-w-sm mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src={adgenLogo} 
                alt="AdGen Logo" 
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="text-xl font-semibold text-foreground">AdGen</span>
            </div>
            
            {/* Back button for forgot password */}
            {(authMode === "forgot-password" || authMode === "reset-sent") && (
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </button>
            )}
            
            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                {title}
              </h1>
              <p className="text-muted-foreground text-sm">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Reset Sent Confirmation */}
          {authMode === "reset-sent" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to:
                </p>
                <p className="font-medium text-foreground">{email}</p>
                <p className="text-sm text-muted-foreground pt-2">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("forgot-password")}
                    className="text-primary hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
              <Button 
                onClick={() => setAuthMode("login")}
                className="w-full h-11 font-medium"
              >
                Back to login
              </Button>
            </div>
          )}

          {/* Forgot Password Form */}
          {authMode === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-input border-border"
                  autoComplete="email"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 font-medium" 
                size="lg" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}

          {/* Login / Signup Forms */}
          {(authMode === "login" || authMode === "signup") && (
            <>
              {/* Social / SSO Login */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 bg-card border-border hover:bg-accent/50 font-medium"
                  onClick={handleGoogleAuth}
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
                  Continue with Google
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 bg-card border-border hover:bg-accent/50 font-medium"
                  onClick={handleMicrosoftAuth}
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                  </svg>
                  Continue with Microsoft
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted-foreground font-medium">or</span>
                </div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={authMode === "login" ? handleLogin : handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-input border-border"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 bg-input border-border pr-10"
                      autoComplete={authMode === "login" ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 bg-input border-border"
                      autoComplete="new-password"
                    />
                  </div>
                )}

                {authMode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot-password")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 font-medium" 
                  size="lg" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {authMode === "login" ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    authMode === "login" ? "Continue" : "Create account"
                  )}
                </Button>
              </form>

              {/* Secondary Action */}
              <div className="text-center text-sm text-muted-foreground">
                {authMode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className="text-foreground font-medium hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-foreground font-medium hover:underline"
                    >
                      Log in
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column — Brand & Context Visual (Emotional Zone) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Full-height immersive image */}
        <img
          src={tvLifestyleHero}
          alt="Family enjoying TV together"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-transparent" />
        
        {/* Bottom context text */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
          <div className="max-w-lg">
            <p className="text-white/90 text-lg font-medium mb-2">
              Your ads, on every screen
            </p>
            <p className="text-white/70 text-sm">
              Create TV-first advertising that reaches audiences where they're most engaged — in their living rooms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
