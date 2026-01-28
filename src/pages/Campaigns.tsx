import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getCampaignRoute, getCampaignStageLabel, isCampaignComplete } from "@/lib/campaignNavigation";
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Play,
    Pause,
    AlertCircle,
    Tv,
    Users,
    TrendingUp,
    LayoutGrid,
    List as ListIcon,
    Signal,
    Calendar,
    ArrowUpRight,
    Pencil,
    Check,
    X,
    FileText,
    Layers
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Campaign {
    id: string;
    title: string;
    description: string;
    status: string;
    ad_type: string;
    goal: string;
    created_at: string;
    storyboard: any;
}

const Campaigns = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleStartEdit = (e: React.MouseEvent, campaign: Campaign) => {
        e.stopPropagation();
        setEditingId(campaign.id);
        setEditValue(campaign.title);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleSaveEdit = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editingId || !editValue.trim()) return;

        const { error } = await supabase
            .from("campaigns")
            .update({ title: editValue.trim() })
            .eq("id", editingId);

        if (error) {
            toast({ title: "Error", description: "Failed to rename campaign", variant: "destructive" });
        } else {
            setCampaigns(prev => prev.map(c => c.id === editingId ? { ...c, title: editValue.trim() } : c));
            toast({ title: "Renamed", description: "Campaign name updated" });
        }
        setEditingId(null);
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    useEffect(() => {
        const fetchCampaigns = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
                return;
            }

            const { data } = await supabase
                .from("campaigns")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false });

            if (data) setCampaigns(data);
            setLoading(false);
        };

        fetchCampaigns();
    }, [navigate]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((c) => {
            const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" ||
                (statusFilter === "active" && c.status === "active") ||
                (statusFilter === "draft" && c.status === "concept") ||
                (statusFilter === "paused" && c.status === "paused");
            return matchesSearch && matchesStatus;
        });
    }, [campaigns, searchQuery, statusFilter]);

    const getThumbnail = (c: Campaign) => {
        if (c.storyboard?.generatedImageUrl) return c.storyboard.generatedImageUrl;
        if (c.storyboard?.scenes?.[0]?.visualUrl) return c.storyboard.scenes[0].visualUrl;
        return null;
    };

    const getVideoUrl = (c: Campaign) => {
        return (
            c.storyboard?.selectedScript?.generatedVideoUrl ||
            c.storyboard?.generatedVideoUrl ||
            c.storyboard?.videoUrl ||
            null
        );
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background text-foreground p-6 space-y-8 max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
                        <p className="text-muted-foreground text-lg">Manage your TV ad spots and monitor performance.</p>
                    </div>
                    <Button size="lg" className="h-12" onClick={() => navigate("/create")}>
                        <Plus className="h-5 w-5 mr-2" />
                        New Campaign
                    </Button>
                </div>

                {/* Filters & Controls */}
                <div className="flex items-center gap-4 bg-card/40 border border-border/50 p-2 rounded-xl backdrop-blur-sm sticky top-4 z-10 shadow-sm">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background/50 border-transparent focus:border-border hover:bg-background transition-colors"
                        />
                    </div>

                    <div className="h-8 w-[1px] bg-border/50" />

                    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                        {['all', 'active', 'paused', 'draft'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${statusFilter === tab
                                        ? "bg-background shadow-sm text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto flex gap-2">
                        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                                <ListIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Campaign Grid/List */}
                {loading ? (
                    <div className="text-center py-20 text-muted-foreground animate-pulse">Loading campaigns...</div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-3xl">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Tv className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No campaigns found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">Create your first TV ad campaign to reach millions of households.</p>
                        <Button onClick={() => navigate("/create")}>Create Campaign</Button>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        <AnimatePresence>
                            {filteredCampaigns.map((campaign, i) => (
                                <motion.div
                                    layout
                                    key={campaign.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                    className={`group relative bg-card hover:bg-card/80 border border-border/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 ${viewMode === 'list' ? 'flex items-center p-4 gap-6' : ''}`}
                                    onClick={() => navigate(getCampaignRoute(campaign))}
                                >
                                    {/* Thumbnail / Video Preview */}
                                    <div className={`${viewMode === 'list' ? 'w-48 h-28' : 'w-full aspect-video'} bg-muted relative overflow-hidden shrink-0`}>
                                        {getVideoUrl(campaign) ? (
                                            <>
                                                <video
                                                    src={getVideoUrl(campaign)}
                                                    muted
                                                    loop
                                                    playsInline
                                                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                                                    onMouseEnter={(e) => e.currentTarget.play()}
                                                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                                />
                                                {/* Play button overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                                                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                        <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : getThumbnail(campaign) ? (
                                            <img src={getThumbnail(campaign)} alt="" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                                <Tv className="h-8 w-8 text-muted-foreground/30" />
                                            </div>
                                        )}

                                        {/* Live Status Badge */}
                                        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                                            {campaign.status === 'active' && (
                                                <Badge className="bg-green-500/90 hover:bg-green-600 text-white border-none shadow-sm backdrop-blur-sm pl-2 pr-3">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-pulse" />
                                                    LIVE
                                                </Badge>
                                            )}
                                            {campaign.status === 'paused' && <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm border-none"><Pause className="h-3 w-3 mr-1" /> PAUSED</Badge>}
                                            {campaign.status === 'concept' && !isCampaignComplete(campaign) && (
                                                <Badge variant="secondary" className="bg-amber-500/90 text-white backdrop-blur-sm border-none gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    {getCampaignStageLabel(campaign)}
                                                </Badge>
                                            )}
                                            {campaign.status === 'concept' && isCampaignComplete(campaign) && (
                                                <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm border-none">DRAFT</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 ${viewMode === 'grid' ? 'p-5' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 min-w-0">
                                                {editingId === campaign.id ? (
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <Input
                                                            ref={inputRef}
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="h-8 text-base font-semibold"
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") handleSaveEdit(e as any);
                                                                if (e.key === "Escape") handleCancelEdit(e as any);
                                                            }}
                                                        />
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleSaveEdit}>
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleCancelEdit}>
                                                            <X className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 group/title">
                                                        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1 mb-1">{campaign.title}</h3>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0"
                                                            onClick={(e) => handleStartEdit(e, campaign)}
                                                        >
                                                            <Pencil className="h-3 w-3 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(campaign.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {viewMode === 'grid' && editingId !== campaign.id && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Metrics (Grid Mode) */}
                                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Spend</div>
                                                <div className="text-sm font-medium tabular-nums">${Math.floor(Math.random() * 1000)}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Reach</div>
                                                <div className="text-sm font-medium tabular-nums">{(Math.random() * 50 + 1).toFixed(1)}K</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Lift</div>
                                                <div className="text-sm font-bold text-green-500">+{Math.floor(Math.random() * 15)}%</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* List Mode Actions */}
                                    {viewMode === 'list' && (
                                        <div className="flex items-center gap-3 pr-4 border-l border-border/50 pl-6 h-full">
                                            <div className="text-right mr-4">
                                                <div className="text-xs text-muted-foreground">Daily Budget</div>
                                                <div className="font-bold">$100.00</div>
                                            </div>
                                            <Button variant="outline" size="sm">Manage</Button>
                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Campaigns;
