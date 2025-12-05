import { Search, Bell, Moon, User, Sparkles } from "lucide-react";

export function TopNav() {
  return (
    <header className="h-16 border-b border-border bg-card/30 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents, people, or ask AI..."
            className="w-full h-11 pl-12 pr-12 bg-secondary/50 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-mono text-primary">AI</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-6">
        {/* Live Status */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 glass-card mr-4">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">
            SYSTEM <span className="text-success">ONLINE</span>
          </span>
          <span className="text-xs text-muted-foreground">|</span>
          <span className="text-xs font-mono text-muted-foreground">
            Nodes: <span className="text-primary">1,240</span>
          </span>
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-xl bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
            <span className="text-[10px] font-bold text-destructive-foreground">3</span>
          </span>
        </button>

        {/* Dark Mode */}
        <button className="w-10 h-10 rounded-xl bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary transition-colors">
          <Moon className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Profile */}
        <button className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center">
          <User className="w-5 h-5 text-background" />
        </button>
      </div>
    </header>
  );
}
