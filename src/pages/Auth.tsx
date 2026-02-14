import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, ShieldCheck, Tv, Zap } from "lucide-react";
import aurumLogo from "@/assets/aurum-logo.png";
import tvFamilyHero from "@/assets/tv-family-hero.png";

type AuthMode = "login" | "signup" | "forgot-password" | "reset-sent";

const taglines = [
  "Your ads, on every screen.",
  "TV-first advertising, reimagined.",
  "Reach audiences in their living rooms.",
  "Broadcast-quality, made simple.",
];

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Tagline Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          sessionStorage.removeItem("brand-setup-prompt-dismissed");
          navigate("/dashboard");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
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
          emailRedirectTo: `${window.location.origin}/dashboard`,
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
          redirectTo: `${window.location.origin}/dashboard`,
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
          redirectTo: `${window.location.origin}/dashboard`,
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
        return { title: "Welcome back", subtitle: "Sign in to your command center" };
      case "signup":
        return { title: "Join the broadcast", subtitle: "Create your account to get started" };
      case "forgot-password":
        return { title: "Reset credentials", subtitle: "We'll send a secure recovery link" };
      case "reset-sent":
        return { title: "Check your inbox", subtitle: "A password reset link has been dispatched" };
      default:
        return { title: "Welcome back", subtitle: "Sign in to continue" };
    }
  };

  const { title, subtitle } = getHeadline();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Column — Authentication Panel */}
      <div className="w-full lg:w-[520px] xl:w-[560px] flex flex-col justify-center px-8 lg:px-14 xl:px-16 py-12 bg-card relative overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')] pointer-events-none" />

        <div className="w-full max-w-sm mx-auto space-y-8 relative z-10">
          {/* Header */}
          <div className="space-y-6">
            {/* Logo & Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={aurumLogo}
                  alt="AURUM Logo"
                  className="h-11 w-11 rounded-lg object-cover ring-1 ring-border/50"
                />
                <span className="text-xl font-semibold text-foreground">AURUM</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-primary font-mono uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3" />
                Secure
              </div>
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
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
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
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                   <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-2">
               <p className="text-sm text-muted-foreground">
                   Recovery link sent to:
                 </p>
                 <p className="font-medium text-foreground font-mono">{email}</p>
                 <p className="text-sm text-muted-foreground pt-2">
                   Didn't receive it?{" "}
                   <button
                     type="button"
                     onClick={() => setAuthMode("forgot-password")}
                     className="text-primary hover:underline"
                   >
                    Resend
                  </button>
                </p>
              </div>
              <Button
                onClick={() => setAuthMode("login")}
                className="w-full h-11 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Return to Login
              </Button>
            </div>
          )}

          {/* Forgot Password Form */}
          {authMode === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                 <Label htmlFor="reset-email" className="text-sm font-medium text-muted-foreground">
                   Email Address
                 </Label>
                 <Input
                   id="reset-email"
                   type="email"
                   placeholder="you@company.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
                  autoComplete="email"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Recovery Link"
                )}
              </Button>
            </form>
          )}

          {/* Login / Signup Forms */}
          {(authMode === "login" || authMode === "signup") && (
            <>
              {/* Social / SSO Login */}
              <div className="flex gap-3">
                 <Button
                   type="button"
                   variant="outline"
                   className="flex-1 h-12 bg-muted/50 border-border hover:bg-muted hover:border-border text-foreground font-medium"
                   onClick={handleGoogleAuth}
                 >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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

                 <Button
                   type="button"
                   variant="outline"
                   className="flex-1 h-12 bg-muted/50 border-border hover:bg-muted hover:border-border text-foreground font-medium"
                   onClick={handleMicrosoftAuth}
                 >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                  Microsoft
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                   <span className="w-full border-t border-border" />
                 </div>
                 <div className="relative flex justify-center text-xs uppercase">
                   <span className="bg-card px-4 text-muted-foreground font-medium tracking-widest">or</span>
                 </div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={authMode === "login" ? handleLogin : handleSignUp} className="space-y-4">
                <div className="space-y-2">
                 <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                     Email
                   </Label>
                   <Input
                     id="email"
                     type="email"
                     placeholder="you@company.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                   <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                     Password
                   </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pr-10 focus:border-primary/50 focus:ring-primary/20"
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
                     <Label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground">
                       Confirm Password
                     </Label>
                     <Input
                       id="confirmPassword"
                       type={showPassword ? "text" : "password"}
                       placeholder="••••••••"
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       className="h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
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
                  className="w-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {authMode === "login" ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    authMode === "login" ? "Sign In" : "Create Account"
                  )}
                </Button>
              </form>

              {/* Secondary Action */}
               <div className="text-center text-sm text-muted-foreground">
                {authMode === "login" ? (
                  <>
                    New to AURUM?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className="text-foreground font-medium hover:underline"
                    >
                      Create an account
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
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column — Cinematic Hero Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Immersive Image with Ken Burns Effect */}
        <motion.img
          src={tvFamilyHero}
          alt="Family watching TV advertisement"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Tech Overlay - Scanlines */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] pointer-events-none" />

        {/* Header - Broadcast Status */}
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">Live Preview</span>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="absolute top-8 left-8 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
            <Tv className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-white/80 font-medium">CTV Networks</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-white/80 font-medium">AI-Powered Creatives</span>
          </div>
        </div>

        {/* Bottom Tagline Carousel */}
        <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black via-black/70 to-transparent">
          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-white/90 text-2xl font-semibold tracking-tight"
              >
                {taglines[taglineIndex]}
              </motion.p>
            </AnimatePresence>
            <p className="text-white/50 text-sm mt-3">
              Create TV-first advertising that reaches audiences where they're most engaged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


