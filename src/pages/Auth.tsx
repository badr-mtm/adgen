import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Tv,
  Zap,
  Sparkles,
  Activity,
  Globe,
  Lock
} from "lucide-react";
import adgenLogo from "@/assets/adgen-logo.jpeg";

// Leaflet
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type AuthMode = "login" | "signup" | "forgot-password" | "reset-sent";

const CREATIVE_CARDS = [
  {
    id: 1,
    title: "Summer Collection",
    reach: "1.2M",
    cpm: "$14.20",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&q=80",
    x: "15%",
    y: "20%",
    delay: 0
  },
  {
    id: 2,
    title: "Tech Series",
    reach: "850K",
    cpm: "$18.50",
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=80",
    x: "55%",
    y: "35%",
    delay: 0.2
  },
  {
    id: 3,
    title: "Urban Pulse",
    reach: "2.4M",
    cpm: "$12.80",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&q=80",
    x: "25%",
    y: "65%",
    delay: 0.4
  },
  {
    id: 4,
    title: "Luxury Living",
    reach: "420K",
    cpm: "$22.00",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
    x: "65%",
    y: "75%",
    delay: 0.6
  }
];

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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

  const handleOAuth = async (provider: 'google' | 'azure') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          ...(provider === 'azure' && { scopes: "email profile openid" })
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
        return { title: "Sign up or sign in", subtitle: "Enter your details to access the Command Center" };
      case "signup":
        return { title: "Join the broadcast", subtitle: "Create your account to start generating" };
      case "forgot-password":
        return { title: "Reset credentials", subtitle: "We'll send a secure recovery link to your email" };
      case "reset-sent":
        return { title: "Check your inbox", subtitle: "A recovery link has been dispatched" };
      default:
        return { title: "Welcome back", subtitle: "Sign in to continue" };
    }
  };

  const { title, subtitle } = getHeadline();

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4 lg:p-8 overflow-hidden font-sans">

      {/* Main Rounded Cluster */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1100px] h-[700px] bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-white overflow-hidden flex flex-col md:flex-row relative z-10"
      >

        {/* Left side: Hybrid Powerhouse */}
        <div className="w-full md:w-[50%] h-[300px] md:h-full relative bg-[#1E3A8A] overflow-hidden">

          {/* Blurred Map Foundation */}
          <div className="absolute inset-0 z-0 opacity-40 grayscale blur-[2px]">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: "100%", width: "100%", background: '#1E3A8A' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            </MapContainer>
          </div>

          {/* Gradient Overlay for that deep blue feel */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/90 via-[#1E40AF]/80 to-[#172554] z-10" />

          {/* SVG Energy Trails */}
          <svg className="absolute inset-0 w-full h-full z-15 opacity-30 pointer-events-none" viewBox="0 0 400 600">
            <motion.path
              d="M -50 150 Q 150 180 450 120"
              stroke="url(#trail-gradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
            />
            <motion.path
              d="M -50 450 Q 200 420 450 480"
              stroke="url(#trail-gradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 1 }}
            />
            <defs>
              <linearGradient id="trail-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating Creative Cards with Parallax */}
          <div className="absolute inset-0 z-20">
            {CREATIVE_CARDS.map((card) => (
              <motion.div
                key={card.id}
                style={{
                  left: card.x,
                  top: card.y,
                  x: mousePosition.x * (card.id * 15),
                  y: mousePosition.y * (card.id * 15),
                }}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 0.4 + card.delay,
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                  // Add a slight hover float
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }
                }}
                className="absolute w-36 h-48 lg:w-44 lg:h-56 bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm group cursor-default"
              >
                <img src={card.image} className="w-full h-[65%] object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" alt={card.title} />
                <div className="p-3 bg-white/95 h-[35%] flex flex-col justify-center">
                  <h4 className="text-[10px] font-bold text-slate-800 truncate mb-1 uppercase tracking-tighter">{card.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[7px] text-slate-400 uppercase font-black tracking-widest">Reach</span>
                      <span className="text-[10px] font-black text-blue-600 tracking-tight">{card.reach}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[7px] text-slate-400 uppercase font-black tracking-widest">CPM</span>
                      <span className="text-[10px] font-black text-slate-800 tracking-tight">{card.cpm}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* HUD Overlays */}
          <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
            <img src={adgenLogo} alt="Logo" className="w-8 h-8 rounded-lg shadow-lg" />
            <span className="text-white font-black tracking-tighter text-lg">AdGen</span>
          </div>

          <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-blue-400" />
              <span className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em]">Global Telemetry Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-blue-400" />
              <span className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em]">Live Nodes: 842</span>
            </div>
          </div>
        </div>

        {/* Right side: Clean Form */}
        <div className="flex-1 h-full bg-white p-8 lg:p-14 flex flex-col relative">

          {/* Header */}
          <div className="mb-10">
            {authMode !== "login" && (
              <button
                onClick={() => setAuthMode("login")}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-800 text-sm mb-6 transition-colors font-medium border-b border-transparent hover:border-slate-800 pb-1 w-fit"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Entrance
              </button>
            )}
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-500 font-medium text-sm">{subtitle}</p>
          </div>

          {/* Social Buttons */}
          {(authMode === "login" || authMode === "signup") && (
            <div className="space-y-3 mb-8">
              <Button
                onClick={() => handleOAuth('google')}
                variant="outline"
                className="w-full h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold tracking-tight rounded-xl shadow-sm transition-all flex items-center justify-center gap-3"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </Button>
              <Button
                onClick={() => handleOAuth('azure')}
                className="w-full h-12 bg-[#0072C6] border-[#0072C6] text-white hover:bg-[#005A9E] font-bold tracking-tight rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-3"
              >
                <svg className="h-5 w-5" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#f25022" /><rect x="11" y="1" width="9" height="9" fill="#7fba00" /><rect x="1" y="11" width="9" height="9" fill="#00a4ef" /><rect x="11" y="11" width="9" height="9" fill="#ffb900" /></svg>
                Sign up with Microsoft
              </Button>
            </div>
          )}

          {/* Divider */}
          {(authMode === "login" || authMode === "signup") && (
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-300">
                <span className="bg-white px-4">or</span>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {authMode === "reset-sent" ? (
                  <div className="space-y-6 flex flex-col h-full justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-10 w-10 text-blue-500" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-slate-500 font-medium">Link dispatched to:</p>
                      <p className="font-black text-slate-900 text-lg">{email}</p>
                    </div>
                    <Button onClick={() => setAuthMode("login")} className="w-full h-12 bg-slate-950 text-white rounded-xl font-bold">Return to Entrance</Button>
                  </div>
                ) : (
                  <form
                    onSubmit={
                      authMode === "login" ? handleLogin :
                        authMode === "signup" ? handleSignUp :
                          handleForgotPassword
                    }
                    className="space-y-5"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email Address</Label>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500/30 rounded-xl transition-all font-medium text-slate-900"
                      />
                    </div>

                    {authMode !== "forgot-password" && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</Label>
                          {authMode === "login" && (
                            <button
                              type="button"
                              onClick={() => setAuthMode("forgot-password")}
                              className="text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500/30 rounded-xl transition-all font-medium text-slate-900 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {authMode === "signup" && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Confirm Identity</Label>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500/30 rounded-xl transition-all font-medium text-slate-900"
                        />
                      </div>
                    )}

                    <div className="pt-2">
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          disabled={loading}
                          className={`flex-1 h-12 rounded-xl font-bold tracking-tight shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] ${authMode === "login" ? "bg-[#5D5FEF] text-white hover:bg-[#4E50DE]" : "bg-slate-950 text-white hover:bg-slate-900"
                            }`}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                            authMode === "login" ? "Sign up" :
                              authMode === "signup" ? "Create Account" :
                                "Request Reset"}
                        </Button>
                        {authMode === "login" && (
                          <Button
                            type="button"
                            onClick={() => setAuthMode("signup")}
                            variant="outline"
                            className="flex-1 h-12 rounded-xl font-bold border-slate-100 text-slate-900 hover:bg-slate-50 tracking-tight"
                          >
                            Sign in
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 flex flex-col items-center">
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-6">
              <div className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> SSL Secured</div>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> SOC2 Compliant</div>
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              By continuing, you agree to our <a href="#" className="text-slate-600 hover:text-blue-500 underline">Terms of Service</a><br />
              and <a href="#" className="text-slate-600 hover:text-blue-500 underline">Privacy Policy</a>.
            </p>
          </div>
        </div>

      </motion.div>

      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/40 rounded-full blur-[120px] pointer-events-none" />

    </div>
  );
}
