import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tv, ShieldCheck, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: email.split('@')[0],
                        }
                    }
                });
                if (error) throw error;
                toast({
                    title: "Registration successful",
                    description: "Please check your email to confirm your account.",
                });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate("/dashboard");
            }
        } catch (error: any) {
            toast({
                title: "Authentication Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
            {/* Cinematic Background Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background z-10" />
                <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat grayscale brightness-50"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop')" }}
                />
                {/* Animated Scanning Line */}
                <motion.div
                    initial={{ top: "-10%" }}
                    animate={{ top: "110%" }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[100px] bg-gradient-to-b from-transparent via-primary/10 to-transparent z-20 pointer-events-none"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-30 w-full max-w-md p-4"
            >
                {/* Logo/Brand Section */}
                <div className="flex flex-col items-center mb-8 space-y-3">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 backdrop-blur-xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                        <Tv className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">AdGen</h1>
                        <p className="text-xs font-bold tracking-[0.2em] text-primary/60 uppercase">Advanced Broadcast Engine</p>
                    </div>
                </div>

                <Card className="border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-px bg-gradient-to-b from-white/5 to-transparent rounded-[inherit] pointer-events-none" />

                    <CardHeader className="space-y-1 relative z-10">
                        <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            {isSignUp ? "Initialize Access" : "Secure Login"}
                        </CardTitle>
                        <CardDescription className="text-white/40">
                            {isSignUp
                                ? "Request credentials for the broadcast network"
                                : "Authorize your Command Center session"}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleAuth}>
                        <CardContent className="space-y-4 relative z-10">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-white/60">Registry Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@broadcast.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white/5 border-white/10 pl-10 focus:border-primary/50 focus:ring-primary/20 transition-all h-12"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-white/60">Access Cipher</Label>
                                    {!isSignUp && (
                                        <button type="button" className="text-[10px] font-bold uppercase text-primary/60 hover:text-primary transition-colors">
                                            Forgot?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white/5 border-white/10 pl-10 focus:border-primary/50 focus:ring-primary/20 transition-all h-12"
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4 relative z-10">
                            <Button
                                disabled={loading}
                                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all group/btn"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        {isSignUp ? "Apply for Access" : "Authorize Session"}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="text-white/40 hover:text-white text-xs transition-colors"
                                >
                                    {isSignUp
                                        ? "Already have a clearance? Log in"
                                        : "New to the network? Request access"}
                                </button>
                            </div>
                        </CardFooter>
                    </form>

                    {/* HUD Elements */}
                    <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-20">
                        <div className="text-[8px] font-mono text-primary flex flex-col items-end">
                            <span>SECURE_LAYER_ENTRY</span>
                            <span>TLS_VERSION_1.3</span>
                        </div>
                    </div>
                </Card>

                {/* Footer Attribution */}
                <p className="mt-8 text-center text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">
                    &copy; ADGEN BROADCAST SYSTEMS • GLOBAL NODE {Math.floor(Math.random() * 900) + 100}
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
