import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Search,
  Image,
  Video,
  FileText,
  Download,
  Trash2,
  FolderOpen,
  CloudUpload,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// File validation constants
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // 50MB in bytes
const MAX_VIDEO_SIZE_MB = 200;
const MAX_VIDEO_SIZE = MAX_VIDEO_SIZE_MB * 1024 * 1024; // 200MB for videos

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES];

interface Asset {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  url: string;
  size: number;
  created_at: string;
}

interface ValidationError {
  fileName: string;
  error: string;
}

const Assets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.storage
        .from("brand-assets")
        .list(session.user.id, { limit: 100 });

      if (data) {
        const formattedAssets: Asset[] = data.map((file) => ({
          id: file.id || file.name,
          name: file.name,
          type: file.name.match(/\.(mp4|mov|avi|webm)$/i)
            ? "video"
            : file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
            ? "image"
            : "document",
          url: supabase.storage
            .from("brand-assets")
            .getPublicUrl(`${session.user.id}/${file.name}`).data.publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at || new Date().toISOString(),
        }));
        setAssets(formattedAssets);
      }
      setLoading(false);
    };

    fetchAssets();
  }, [navigate]);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return `"${file.name}" has an unsupported file type (.${extension}). Allowed: images, videos, PDF, DOC.`;
    }

    // Check file size based on type
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
    const maxSizeMB = isVideo ? MAX_VIDEO_SIZE_MB : MAX_FILE_SIZE_MB;

    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `"${file.name}" is too large (${fileSizeMB}MB). Maximum size: ${maxSizeMB}MB${isVideo ? ' for videos' : ''}.`;
    }

    return null;
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    // Validate all files first
    const validationErrors: ValidationError[] = [];
    const validFiles: File[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        validationErrors.push({ fileName: file.name, error });
      } else {
        validFiles.push(file);
      }
    }

    // Show validation errors
    if (validationErrors.length > 0) {
      validationErrors.forEach(({ error }) => {
        toast({
          title: "Upload rejected",
          description: error,
          variant: "destructive",
        });
      });
    }

    if (validFiles.length === 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setIsUploading(true);

    let successCount = 0;
    let failCount = 0;

    for (const file of validFiles) {
      const { data, error } = await supabase.storage
        .from("brand-assets")
        .upload(`${session.user.id}/${file.name}`, file);

      if (error) {
        failCount++;
        toast({ title: "Upload failed", description: `${file.name}: ${error.message}`, variant: "destructive" });
      } else {
        successCount++;
        const newAsset: Asset = {
          id: data.path,
          name: file.name,
          type: file.type.startsWith("video/")
            ? "video"
            : file.type.startsWith("image/")
            ? "image"
            : "document",
          url: supabase.storage.from("brand-assets").getPublicUrl(data.path).data.publicUrl,
          size: file.size,
          created_at: new Date().toISOString(),
        };
        setAssets((prev) => [newAsset, ...prev]);
      }
    }

    if (successCount > 0) {
      toast({
        title: "Upload complete",
        description: `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      });
    }

    setIsUploading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) await uploadFiles(files);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFiles(files);
    }
  }, []);

  const handleDelete = async (asset: Asset) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.storage
      .from("brand-assets")
      .remove([`${session.user.id}/${asset.name}`]);

    if (error) {
      toast({ title: "Error", description: "Failed to delete asset", variant: "destructive" });
    } else {
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      toast({ title: "Deleted", description: "Asset deleted successfully" });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || a.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-6 w-6 text-blue-500" />;
      case "image":
        return <Image className="h-6 w-6 text-primary" />;
      default:
        return <FileText className="h-6 w-6 text-orange-500" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        className="p-6 space-y-6 relative min-h-full"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center rounded-lg border-2 border-dashed border-primary">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <CloudUpload className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">Drop files here</p>
                <p className="text-sm text-muted-foreground">Release to upload your files</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-lg font-medium text-foreground">Uploading...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assets</h1>
            <p className="text-muted-foreground">Manage your media files and brand assets</p>
          </div>
          <label>
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
            />
            <Button className="gap-2 cursor-pointer" asChild>
              <span>
                <Upload className="h-4 w-4" />
                Upload Files
              </span>
            </Button>
          </label>
        </div>

        {/* Drop Zone Hint */}
        <Card className="bg-muted/30 border-dashed border-2 border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <CloudUpload className="h-5 w-5 flex-shrink-0" />
              <div className="text-sm">
                <span>Drag and drop files anywhere on this page to upload</span>
                <span className="hidden sm:inline text-xs ml-2 opacity-70">
                  • Images up to {MAX_FILE_SIZE_MB}MB • Videos up to {MAX_VIDEO_SIZE_MB}MB • PDF, DOC
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Tabs */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="document">Documents</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Assets Grid */}
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredAssets.map((asset) => (
              <Card
                key={asset.id}
                className="bg-card border-border overflow-hidden group hover:border-primary transition-all"
              >
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {asset.type === "image" ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : asset.type === "video" ? (
                    <video
                      src={asset.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getAssetIcon(asset.type)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(asset.url, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(asset)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-medium text-foreground truncate">
                    {asset.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(asset.size)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-2">No assets found</p>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop files here or click to upload
              </p>
              <label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button className="gap-2 cursor-pointer" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </span>
                </Button>
              </label>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assets;
