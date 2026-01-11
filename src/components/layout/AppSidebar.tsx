import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  FolderOpen,
  Image,
  BarChart3,
  Plug,
  Wallet,
  Brain,
  Settings,
  LogOut,
  CalendarDays,
  Tv,
  Sparkles,
} from "lucide-react";
import adgenLogo from "@/assets/adgen-logo.jpeg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Create TV Ad", url: "/create", icon: Tv },
  { title: "AI Strategy", url: "/ai-suggestions", icon: Brain, badge: 3 },
  { title: "Campaigns", url: "/ad-operations", icon: FolderOpen },
  { title: "Broadcast Schedule", url: "/campaign-schedules", icon: CalendarDays },
  { title: "Assets", url: "/assets", icon: Image },
  { title: "Creatives", url: "/creatives", icon: Sparkles },
  { title: "Performance", url: "/reports", icon: BarChart3 },
];

const secondaryNavItems = [
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "Billing", url: "/billing", icon: Wallet },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/auth");
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Tv className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl text-sidebar-foreground">TV Ads AI</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all",
                      isActive(item.url)
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5",
                      isActive(item.url) ? "text-primary" : ""
                    )} />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground px-1.5">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-4 mx-3 border-t border-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all",
                      isActive(item.url)
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5",
                      isActive(item.url) ? "text-primary" : ""
                    )} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="w-full justify-start gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
