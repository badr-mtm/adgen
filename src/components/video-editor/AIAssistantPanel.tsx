import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Send, 
  X, 
  Loader2,
  MessageSquare,
  Wand2,
  Image,
  Type,
  Clock,
  Music,
  Mic
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantPanelProps {
  campaignId: string;
  storyboard: any;
  currentSceneIndex: number;
  onStoryboardUpdate: (storyboard: any) => void;
  onActionComplete: (action: string) => void;
}

const quickActions = [
  { icon: Image, label: "Regenerate visual", action: "regenerate_visual" },
  { icon: Type, label: "Improve headline", action: "improve_headline" },
  { icon: Clock, label: "Adjust timing", action: "adjust_timing" },
  { icon: Music, label: "Suggest music", action: "suggest_music" },
  { icon: Mic, label: "Generate voiceover", action: "generate_voiceover" },
];

const AIAssistantPanel = ({
  campaignId,
  storyboard,
  currentSceneIndex,
  onStoryboardUpdate,
  onActionComplete
}: AIAssistantPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI video assistant. I can help you edit scenes, generate visuals, improve copy, and more. What would you like to do?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("video-ai-assistant", {
        body: {
          campaignId,
          message: input,
          currentSceneIndex,
          storyboard
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.updatedStoryboard) {
        onStoryboardUpdate(data.updatedStoryboard);
      }

      if (data.action) {
        onActionComplete(data.action);
      }
    } catch (error: any) {
      console.error("AI Assistant error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error. Please try again or rephrase your request.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    const actionMessages: Record<string, string> = {
      regenerate_visual: `Regenerate the visual for scene ${currentSceneIndex + 1} with a fresh perspective`,
      improve_headline: "Suggest a more engaging headline for the current scene",
      adjust_timing: "Optimize the timing of scenes for better pacing",
      suggest_music: "Suggest background music that matches the video's mood",
      generate_voiceover: "Generate a voiceover script for the current scene"
    };

    setInput(actionMessages[action] || "");
    
    // Auto-send for quick actions
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: actionMessages[action],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("video-ai-assistant", {
        body: {
          campaignId,
          message: actionMessages[action],
          action,
          currentSceneIndex,
          storyboard
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.updatedStoryboard) {
        onStoryboardUpdate(data.updatedStoryboard);
      }

      if (data.action) {
        onActionComplete(data.action);
      }
    } catch (error: any) {
      console.error("Quick action error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I couldn't complete that action. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Scene {currentSceneIndex + 1}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-b border-border flex gap-1 overflow-x-auto scrollbar-hide">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.action}
              variant="outline"
              size="sm"
              className="flex-shrink-0 h-7 text-xs gap-1"
              onClick={() => handleQuickAction(action.action)}
              disabled={isLoading}
            >
              <Icon className="h-3 w-3" />
              {action.label}
            </Button>
          );
        })}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
