import { X, Send, Sparkles, FileText, AlertCircle, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Source {
  file_name: string;
  s3_url: string;
  match_type: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm K-LENS AI Assistant with **Knowledge Hub access**. I can search your documents and provide informed answers. Try asking about pump stations, boilers, or any uploaded documents!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const data = await api.sendChatMessage(userInput, messages);

      const aiResponse: Message = {
        role: "assistant",
        content: data.message || "I apologize, I couldn't process that request.",
        timestamp: new Date(),
        sources: data.sources || undefined
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-[480px] bg-card border-l border-border z-30 flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-3 bg-secondary/50 rounded-lg text-left hover:bg-secondary transition-colors">
            <FileText className="w-4 h-4 text-primary mb-1" />
            <p className="text-xs font-medium">Analyze Document</p>
          </button>
          <button className="p-3 bg-secondary/50 rounded-lg text-left hover:bg-secondary transition-colors">
            <AlertCircle className="w-4 h-4 text-warning mb-1" />
            <p className="text-xs font-medium">Risk Assessment</p>
          </button>
          <button className="p-3 bg-secondary/50 rounded-lg text-left hover:bg-secondary transition-colors">
            <CheckCircle className="w-4 h-4 text-success mb-1" />
            <p className="text-xs font-medium">Compliance Check</p>
          </button>
          <button className="p-3 bg-secondary/50 rounded-lg text-left hover:bg-secondary transition-colors">
            <Sparkles className="w-4 h-4 text-primary mb-1" />
            <p className="text-xs font-medium">Summarize</p>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] ${msg.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary"
              } rounded-lg p-3`}>
              {msg.role === "assistant" ? (
                <div className="chat-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
              
              {/* RAG Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">📚 Sources:</p>
                  <div className="space-y-1">
                    {msg.sources.map((source, i) => (
                      <a
                        key={i}
                        href={source.s3_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <FileText className="w-3 h-3" />
                        {source.file_name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
