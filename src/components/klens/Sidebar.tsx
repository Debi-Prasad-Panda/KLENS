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
  FileText,
  Sparkles,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import React from "react";

type TabType = "dashboard" | "search" | "graph" | "iot" | "ar" | "compliance" | "documents" | "document-view" | "features" | "profile";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const navItems: Array<{ id: string; label: string; icon: typeof LayoutDashboard; badge?: string }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "features", label: "Advanced Features", icon: Sparkles, badge: "New" },
  { id: "search", label: "Search & Discovery", icon: Search },
  { id: "graph", label: "Knowledge Graph", icon: Share2 },
  { id: "iot", label: "IoT & UNS", icon: Radio, badge: "Live" },
  { id: "ar", label: "AR Preview", icon: Glasses, badge: "Beta" },
  { id: "compliance", label: "Compliance", icon: Shield },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Listen for profile navigation from TopNav
  React.useEffect(() => {
    const handleNavigateProfile = () => setActiveTab('profile');
    window.addEventListener('navigate-profile', handleNavigateProfile);
    return () => window.removeEventListener('navigate-profile', handleNavigateProfile);
  }, [setActiveTab]);

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
        <div className="glass-card p-3">
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-3 mb-3 w-full hover:bg-secondary/50 p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
              <User className="w-5 h-5 text-background" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.department || 'Department'}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
