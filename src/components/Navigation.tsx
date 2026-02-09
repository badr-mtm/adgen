import { ArrowLeft, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isEditor = location.pathname.startsWith("/editor");
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully"
    });
    navigate("/auth");
  };
  return <nav className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {isEditor && <Button variant="ghost" size="icon" onClick={() => navigate(-1 as any)} className="transition-smooth hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>}
        <span className="font-bold text-2xl">AdGenius  </span>
      </div>
      
      <div className="flex items-center gap-2">
        {isAuthenticated ? <>
            <Button variant="ghost" size="icon" className="transition-smooth hover:bg-muted">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="transition-smooth hover:bg-muted">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="transition-smooth hover:bg-muted">
              <LogOut className="h-5 w-5" />
            </Button>
          </> : <Button variant="default" onClick={() => navigate("/auth")}>
            Sign In
          </Button>}
      </div>
    </nav>;
};
export default Navigation;