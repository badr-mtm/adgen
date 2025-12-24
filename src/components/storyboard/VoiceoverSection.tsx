import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Upload, 
  Plus, 
  X, 
  Edit3, 
  Check,
  Volume2 
} from "lucide-react";

interface VoiceoverSectionProps {
  voiceover: string;
  voiceoverLines?: string[];
  audioUrl?: string;
  onSave: (voiceover: string, voiceoverLines?: string[]) => void;
  onUploadAudio?: (file: File) => void;
}

const VoiceoverSection = ({ 
  voiceover, 
  voiceoverLines: initialLines,
  audioUrl,
  onSave,
  onUploadAudio 
}: VoiceoverSectionProps) => {
  // Convert single voiceover to array if needed
  const getInitialLines = () => {
    if (initialLines && initialLines.length > 0) {
      return initialLines;
    }
    // Split single voiceover by sentences or keep as single line
    const sentences = voiceover.split(/(?<=[.!?])\s+/).filter(s => s.trim());
    return sentences.length > 0 ? sentences : [voiceover];
  };

  const [lines, setLines] = useState<string[]>(getInitialLines());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditValue(lines[index]);
  };

  const handleEditSave = () => {
    if (editingIndex !== null) {
      const newLines = [...lines];
      newLines[editingIndex] = editValue.trim();
      setLines(newLines);
      onSave(newLines.join(" "), newLines);
      setEditingIndex(null);
      setEditValue("");
    }
  };

  const handleAddLine = () => {
    const newLines = [...lines, "New voiceover line..."];
    setLines(newLines);
    setEditingIndex(newLines.length - 1);
    setEditValue("New voiceover line...");
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length > 1) {
      const newLines = lines.filter((_, i) => i !== index);
      setLines(newLines);
      onSave(newLines.join(" "), newLines);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadAudio) {
      onUploadAudio(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          Voiceover Lines
        </h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={handleAddLine}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Line
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload Audio
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Audio Player if uploaded */}
      {audioUrl && (
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
          <Volume2 className="h-4 w-4 text-primary" />
          <audio controls className="h-8 flex-1">
            <source src={audioUrl} />
          </audio>
        </div>
      )}

      {/* Voiceover Lines List */}
      <div className="space-y-2">
        {lines.map((line, index) => (
          <div 
            key={index}
            className="group flex items-start gap-2 p-2 rounded-lg hover:bg-muted/20 transition-colors"
          >
            <Badge variant="outline" className="shrink-0 mt-0.5">
              {index + 1}
            </Badge>
            
            {editingIndex === index ? (
              <div className="flex-1 flex gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave();
                    if (e.key === 'Escape') {
                      setEditingIndex(null);
                      setEditValue("");
                    }
                  }}
                />
                <Button size="sm" variant="ghost" className="h-8" onClick={handleEditSave}>
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <p className="flex-1 text-foreground text-sm italic">"{line}"</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => handleEditStart(index)}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  {lines.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveLine(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceoverSection;
