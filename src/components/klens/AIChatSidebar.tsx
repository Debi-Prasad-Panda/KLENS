import { X, Send, Sparkles, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm K-LENS AI Assistant. I can help you with document analysis, compliance checks, risk assessments, and more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: "I understand your query. Let me analyze that for you...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-[480px] bg-card border-l border-border z-30 flex flex-col transition-transform duration-300 ${
      isOpen ? "translate-x-0" : "translate-x-full"
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
              <div className={`max-w-[80%] ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary"
              } rounded-lg p-3`}>
                <p className="text-sm">{msg.content}</p>
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
              className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
  );
}
