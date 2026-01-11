import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Search,
    Film,
    Image as ImageIcon,
    Play,
    Download,
    ExternalLink,
    ChevronRight,
    Filter,
    PlusCircle
} from "lucide-react";

interface CreativeAsset {
    id: string;
    campaignId: string;
    campaignTitle: string;
    sceneIndex: number;
    type: "video" | "image";
    url: string;
    hook: string;
    body: string;
    visualPrompt: string;
}

const Creatives = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [assets, setAssets] = useState<CreativeAsset[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "video" | "image">("all");

    useEffect(() => {
        const fetchAssets = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
                return;
            }

            const { data: campaigns, error } = await supabase
                .from("campaigns")
                .select("id, title, storyboard")
                .eq("user_id", session.user.id);

            if (error) {
                toast({ title: "Fetch Failed", description: error.message, variant: "destructive" });
                return;
            }

            const flattenedAssets: CreativeAsset[] = [];
            campaigns?.forEach((campaign) => {
                const storyboard = campaign.storyboard as any;
                if (storyboard?.scenes) {
                    storyboard.scenes.forEach((scene: any, index: number) => {
                        if (scene.visualUrl || scene.mediaUrl) {
                            flattenedAssets.push({
                                id: `${campaign.id}-scene-${index}`,
                                campaignId: campaign.id,
                                campaignTitle: campaign.title,
                                sceneIndex: index,
                                type: (scene.mediaUrl || scene.visualUrl)?.includes(".mp4") ? "video" : "image",
                                url: scene.mediaUrl || scene.visualUrl,
                                hook: scene.hook || "",
                                body: scene.body || "",
                                visualPrompt: scene.visualPrompt || ""
                            });
                        }
                    });
                }
            });

            setAssets(flattenedAssets);
            setLoading(false);
        };

        fetchAssets();
    }, [navigate, toast]);

    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            const matchesSearch =
                asset.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.hook.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.body.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = typeFilter === "all" || asset.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [assets, searchQuery, typeFilter]);

    return (
        <DashboardLayout>
            <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Creatives Library</h1>
                        <p className="text-muted-foreground">Unified access to all AI-generated broadcast assets.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search assets..."
                                className="pl-10 w-[300px] bg-card/50 border-white/5"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-card/50 border border-white/5 p-1 rounded-lg">
                            <Button
                                variant={typeFilter === 'all' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setTypeFilter('all')}
                                className="h-8 text-xs"
                            >
                                All
                            </Button>
                            <Button
                                variant={typeFilter === 'video' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setTypeFilter('video')}
                                className="h-8 text-xs gap-2"
                            >
                                <Film className="h-3 w-3" /> Videos
                            </Button>
                            <Button
                                variant={typeFilter === 'image' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setTypeFilter('image')}
                                className="h-8 text-xs gap-2"
                            >
                                <ImageIcon className="h-3 w-3" /> Images
                            </Button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-video rounded-xl bg-card/40 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : filteredAssets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAssets.map((asset) => (
                            <Card key={asset.id} className="group overflow-hidden border-white/5 bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
                                <div className="aspect-video relative overflow-hidden bg-black">
                                    {asset.type === 'video' ? (
                                        <video
                                            src={asset.url}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            muted
                                            onMouseOver={(e) => e.currentTarget.play()}
                                            onMouseOut={(e) => e.currentTarget.pause()}
                                        />
                                    ) : (
                                        <img
                                            src={asset.url}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            alt={asset.hook}
                                        />
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="gap-2"
                                            onClick={() => navigate(`/video-editor/${asset.campaignId}`)}
                                        >
                                            <Play className="h-4 w-4 fill-current" /> Edit Scene
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-white/10 border-white/20 text-white"
                                            onClick={() => window.open(asset.url, '_blank')}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border-white/10 uppercase tracking-widest text-[9px] py-0.5 px-2">
                                        {asset.type}
                                    </Badge>
                                </div>

                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                                        <span className="flex items-center gap-1.5 truncate max-w-[150px]">
                                            <span className="w-1 h-1 rounded-full bg-primary" />
                                            {asset.campaignTitle}
                                        </span>
                                        <span>Scene {asset.sceneIndex + 1}</span>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-foreground line-clamp-1">{asset.hook || "Generated Content"}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">{asset.body || asset.visualPrompt}</p>
                                    </div>

                                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                                        <Button
                                            variant="link"
                                            className="text-primary text-[11px] p-0 h-auto gap-1 group/btn"
                                            onClick={() => navigate(`/campaign/${asset.campaignId}`)}
                                        >
                                            View Campaign <ChevronRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                                        </Button>
                                        <div className="flex gap-1.5">
                                            <div className="w-4 h-1 rounded-full bg-green-500/50" />
                                            <div className="w-2 h-1 rounded-full bg-white/10" />
                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-card/20">
                        <Film className="h-12 w-12 text-muted-foreground/20 mb-4" />
                        <h3 className="text-xl font-bold text-foreground/80 mb-2">No creatives found</h3>
                        <p className="text-muted-foreground max-w-sm text-center">Start generating campaign videos to populate your creative library.</p>
                        <Button className="mt-6 gap-2" onClick={() => navigate('/create')}>
                            <PlusCircle className="h-4 w-4" /> Launch Production
                        </Button>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Creatives;
