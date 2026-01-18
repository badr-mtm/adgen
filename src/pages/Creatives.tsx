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
    PlusCircle,
    Maximize2,
    Copy,
    Check,
    Grid,
    List as ListIcon,
    Trash2,
    Share2,
    Eye,
    Sparkles,
    Tv
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreativeAsset {
    id: string;
    campaignId: string;
    campaignTitle: string;
    sceneIndex: number;
    type: "video" | "image";
    url: string;
    thumbnail?: string;
    hook: string;
    body: string;
    visualPrompt: string;
    createdAt: string;
}

const Creatives = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [assets, setAssets] = useState<CreativeAsset[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "video" | "image">("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<CreativeAsset | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchAssets = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
                return;
            }

            const { data: campaigns, error } = await supabase
                .from("campaigns")
                .select("id, title, storyboard, created_at")
                .eq("user_id", session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                toast({ title: "Fetch Failed", description: error.message, variant: "destructive" });
                return;
            }

            const flattenedAssets: CreativeAsset[] = [];
            campaigns?.forEach((campaign) => {
                const storyboard = campaign.storyboard as any;
                if (storyboard?.scenes) {
                    storyboard.scenes.forEach((scene: any, index: number) => {
                        // Support multiple scene property names used across the app
                        const assetUrl = scene.url || scene.mediaUrl || scene.visualUrl || scene.imageUrl;
                        const thumbUrl = scene.thumbnail || scene.thumb || assetUrl;

                        if (assetUrl) {
                            flattenedAssets.push({
                                id: `${campaign.id}-scene-${index}`,
                                campaignId: campaign.id,
                                campaignTitle: campaign.title,
                                sceneIndex: index,
                                type: (assetUrl.toLowerCase().includes(".mp4") || assetUrl.toLowerCase().includes(".mov")) ? "video" : "image",
                                url: assetUrl,
                                thumbnail: thumbUrl,
                                hook: scene.hook || scene.name || `Scene ${index + 1}`,
                                body: scene.body || scene.description || "",
                                visualPrompt: scene.visualPrompt || "",
                                createdAt: campaign.created_at
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

    const handleCopyLink = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast({ title: "Link Copied", description: "Asset URL copied to clipboard." });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast({ title: "Download Started", description: `Downloading ${filename}` });
        } catch (error) {
            window.open(url, '_blank');
            toast({ title: "Download Opening", description: "Opening asset in new tab for download." });
        }
    };

    const openPreview = (asset: CreativeAsset) => {
        setSelectedAsset(asset);
        setIsPreviewOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">Creatives Library</h1>
                        </div>
                        <p className="text-muted-foreground font-medium">Manage and export all your AI-generated broadcast assets from a single hub.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search by campaign or content..."
                                className="pl-10 w-full sm:w-[320px] bg-card/40 border-white/5 focus:border-primary/50 transition-all rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex bg-card/40 border border-white/5 p-1 rounded-xl backdrop-blur-md">
                            <Button
                                variant={typeFilter === 'all' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setTypeFilter('all')}
                                className="h-9 px-4 text-xs font-bold rounded-lg transition-all"
                            >
                                All
                            </Button>
                            <Button
                                variant={typeFilter === 'video' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setTypeFilter('video')}
                                className="h-9 px-4 text-xs font-bold gap-2 rounded-lg transition-all"
                            >
                                <Film className="h-3.5 w-3.5" /> Videos
                            </Button>
                            <Button
                                variant={typeFilter === 'image' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setTypeFilter('image')}
                                className="h-9 px-4 text-xs font-bold gap-2 rounded-lg transition-all"
                            >
                                <ImageIcon className="h-3.5 w-3.5" /> Images
                            </Button>
                        </div>

                        <div className="flex bg-card/40 border border-white/5 p-1 rounded-xl hidden sm:flex">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                                className="h-9 w-9 rounded-lg"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                                className="h-9 w-9 rounded-lg"
                            >
                                <ListIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-video rounded-2xl bg-card/40 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : filteredAssets.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAssets.map((asset) => (
                                <Card key={asset.id} className="group overflow-hidden border-white/5 bg-card/30 backdrop-blur-sm hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] rounded-2xl">
                                    <div className="aspect-video relative overflow-hidden bg-black">
                                        <img
                                            src={asset.thumbnail || asset.url}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                                            alt={asset.hook}
                                        />

                                        {/* Status & Type Badges */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <Badge className="bg-black/60 backdrop-blur-md border-white/10 uppercase tracking-widest text-[9px] py-1 px-2.5 font-bold">
                                                {asset.type}
                                            </Badge>
                                        </div>

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4">
                                            <div className="flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 gap-2 bg-primary hover:bg-primary/90 font-bold rounded-lg h-9"
                                                    onClick={() => openPreview(asset)}
                                                >
                                                    <Eye className="h-4 w-4" /> Preview
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="secondary" className="h-9 w-9 bg-white/10 border-white/20 backdrop-blur-md text-white hover:bg-white/20 rounded-lg">
                                                            <Share2 className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-xl border-white/10 rounded-xl">
                                                        <DropdownMenuItem onClick={() => handleCopyLink(asset.url, asset.id)} className="gap-2 cursor-pointer focus:bg-primary/10">
                                                            {copiedId === asset.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                            Copy URL
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDownload(asset.url, `${asset.campaignTitle}-scene-${asset.sceneIndex + 1}`)} className="gap-2 cursor-pointer focus:bg-primary/10">
                                                            <Download className="h-4 w-4" />
                                                            Download
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => navigate(`/video-editor/${asset.campaignId}`)} className="gap-2 cursor-pointer focus:bg-primary/10">
                                                            <Play className="h-4 w-4" />
                                                            Open in Editor
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black tracking-widest text-primary/80 mb-1 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                                                    {asset.campaignTitle}
                                                </span>
                                                <h3 className="text-sm font-bold text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                                                    {asset.hook || "Cinematic Masterpiece"}
                                                </h3>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center text-[10px] font-black text-muted-foreground border border-white/5">
                                                S{asset.sceneIndex + 1}
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed h-[36px]">
                                            {asset.body || asset.visualPrompt || "AI-generated visual concept for high-impact broadcast awareness."}
                                        </p>

                                        <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-5 h-5 rounded-full border-2 border-[#111] bg-muted/50 flex items-center justify-center overflow-hidden">
                                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tighter">Production Ready</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                                onClick={() => navigate(`/campaign/${asset.campaignId}`)}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/5 bg-card/30 overflow-hidden backdrop-blur-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5">
                                        <th className="p-4 text-[11px] uppercase font-black tracking-widest text-muted-foreground/60">Creative Preview</th>
                                        <th className="p-4 text-[11px] uppercase font-black tracking-widest text-muted-foreground/60">Title / Campaign</th>
                                        <th className="p-4 text-[11px] uppercase font-black tracking-widest text-muted-foreground/60">Type</th>
                                        <th className="p-4 text-[11px] uppercase font-black tracking-widest text-muted-foreground/60">Created At</th>
                                        <th className="p-4 text-[11px] uppercase font-black tracking-widest text-muted-foreground/60 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssets.map((asset) => (
                                        <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="w-24 aspect-video rounded-lg overflow-hidden border border-white/5 bg-black cursor-pointer" onClick={() => openPreview(asset)}>
                                                    <img src={asset.thumbnail || asset.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" alt="thumb" />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{asset.hook || "Scene " + (asset.sceneIndex + 1)}</p>
                                                    <p className="text-xs text-muted-foreground/60">{asset.campaignTitle}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="border-white/10 uppercase text-[9px] font-black">{asset.type}</Badge>
                                            </td>
                                            <td className="p-4 text-xs text-muted-foreground font-mono">
                                                {new Date(asset.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => openPreview(asset)}><Maximize2 className="h-4 w-4" /></Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => handleDownload(asset.url, asset.hook)}><Download className="h-4 w-4" /></Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => navigate(`/video-editor/${asset.campaignId}`)}><Play className="h-4 w-4" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div className="h-[460px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-card/20 backdrop-blur-xl animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <Film className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-3 italic">Vault is Empty</h3>
                        <p className="text-muted-foreground max-w-sm text-center font-medium leading-relaxed">
                            No creatives were found matching your criteria. Start a new production to see your assets here.
                        </p>
                        <Button className="mt-8 gap-3 h-12 px-8 rounded-xl font-black bg-primary text-primary-foreground hover:scale-105 transition-transform" onClick={() => navigate('/create')}>
                            <PlusCircle className="h-5 w-5" /> INITIALIZE PRODUCTION
                        </Button>
                    </div>
                )}

            </div>

            {/* High-Fidelity Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-5xl bg-[#0a0a0a]/95 backdrop-blur-2xl border-white/10 p-0 overflow-hidden rounded-3xl ring-1 ring-white/10">
                    {selectedAsset && (
                        <div className="flex flex-col h-full">
                            <div className="aspect-video bg-black relative group/modal">
                                {selectedAsset.type === 'video' ? (
                                    <video
                                        src={selectedAsset.url}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                    />
                                ) : (
                                    <img
                                        src={selectedAsset.url}
                                        className="w-full h-full object-contain"
                                        alt={selectedAsset.hook}
                                    />
                                )}

                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Badge className="bg-black/60 backdrop-blur-md border-white/10 uppercase font-black text-[10px] tracking-widest px-3">
                                        {selectedAsset.type} (HI-RES)
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-8 bg-gradient-to-b from-transparent to-black/40">
                                <DialogHeader className="mb-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <DialogTitle className="text-2xl font-black tracking-tight">{selectedAsset.hook}</DialogTitle>
                                            <DialogDescription className="text-primary font-bold uppercase tracking-widest text-[11px] flex items-center gap-2">
                                                <Tv className="h-3 w-3" /> {selectedAsset.campaignTitle} — Scene {selectedAsset.sceneIndex + 1}
                                            </DialogDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" className="gap-2 font-bold rounded-xl" onClick={() => handleCopyLink(selectedAsset.url, 'preview')}>
                                                <Copy className="h-4 w-4" /> Copy Link
                                            </Button>
                                            <Button className="gap-2 font-bold rounded-xl bg-primary hover:bg-primary/90" onClick={() => handleDownload(selectedAsset.url, selectedAsset.hook)}>
                                                <Download className="h-4 w-4" /> Export
                                            </Button>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-t border-white/5">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60">Creative Insight</h4>
                                        <p className="text-sm text-foreground leading-relaxed font-medium">
                                            {selectedAsset.body || "No narrative description provided for this scene."}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60">Visual Blueprint</h4>
                                        <p className="text-sm text-muted-foreground italic leading-relaxed">
                                            "{selectedAsset.visualPrompt || "Standard broadcast visual parameters applied."}"
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-black text-muted-foreground/40 tracking-wider">Storage ID</span>
                                            <span className="text-[10px] font-mono text-muted-foreground/60">{selectedAsset.campaignId.slice(0, 18)}...</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-black text-muted-foreground/40 tracking-wider">Format</span>
                                            <span className="text-[10px] font-mono text-muted-foreground/60">{selectedAsset.type === 'video' ? 'ProRes 4444' : 'TIFF Lossless'}</span>
                                        </div>
                                    </div>
                                    <Button variant="link" className="text-white/40 hover:text-white text-xs font-bold gap-2" onClick={() => navigate(`/video-editor/${selectedAsset.campaignId}`)}>
                                        Open in Production Suite <ExternalLink className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default Creatives;
