import { 
  Cpu, 
  LayoutDashboard, 
  Upload, 
  Search, 
  Share2, 
  Radio, 
  Glasses, 
  Shield,
  User,
  ChevronRight,
  FileText
} from "lucide-react";

type TabType = "dashboard" | "upload" | "search" | "graph" | "iot" | "ar" | "compliance" | "document";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const navItems: Array<{ id: string; label: string; icon: typeof LayoutDashboard; badge?: string }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "document", label: "Document Viewer", icon: FileText },
  { id: "upload", label: "Upload Documents", icon: Upload },
  { id: "search", label: "Search & Discovery", icon: Search },
  { id: "graph", label: "Knowledge Graph", icon: Share2, badge: "New" },
  { id: "iot", label: "IoT & UNS", icon: Radio, badge: "Live" },
  { id: "ar", label: "AR Preview", icon: Glasses, badge: "Beta" },
  { id: "compliance", label: "Compliance", icon: Shield },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card/30 backdrop-blur-xl border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-cyan">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient-cyan">K-LENS</h1>
            <p className="text-xs text-muted-foreground">Intelligence Nexus</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={`w-full nav-item ${activeTab === item.id ? "nav-item-active" : ""}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                item.badge === "Live" 
                  ? "bg-success/20 text-success" 
                  : item.badge === "New"
                  ? "bg-primary/20 text-primary"
                  : "bg-warning/20 text-warning"
              }`}>
                {item.badge}
              </span>
            )}
            {activeTab === item.id && (
              <ChevronRight className="w-4 h-4 text-primary" />
            )}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
            <User className="w-5 h-5 text-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Eng. Rajesh</p>
            <p className="text-xs text-muted-foreground truncate">Maintenance Lead</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
