import { Search, Bell, Moon, User, Sparkles, LogOut, Settings, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function TopNav() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-xl bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
              <span className="text-[10px] font-bold text-destructive-foreground">3</span>
            </span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-card p-4 animate-fade-in">
              <h3 className="font-semibold mb-3">Notifications</h3>
              <div className="space-y-2">
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-sm font-medium text-destructive">Critical Alert</p>
                  <p className="text-xs text-muted-foreground mt-1">Boiler B7 pressure exceeds threshold</p>
                  <p className="text-xs text-muted-foreground mt-1">2 min ago</p>
                </div>
                <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                  <p className="text-sm font-medium text-warning">Compliance Alert</p>
                  <p className="text-xs text-muted-foreground mt-1">Station 12 audit pending</p>
                  <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                </div>
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm font-medium text-primary">New Document</p>
                  <p className="text-xs text-muted-foreground mt-1">Safety manual updated</p>
                  <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                </div>
              </div>
              <button className="w-full mt-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                View All Notifications
              </button>
            </div>
          )}
        </div>

        {/* Dark Mode */}
        <button className="w-10 h-10 rounded-xl bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary transition-colors">
          <Moon className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center hover:scale-105 transition-transform"
          >
            <User className="w-5 h-5 text-background" />
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 glass-card p-2 animate-fade-in">
              <div className="px-3 py-2 border-b border-border mb-2">
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/dashboard');
                  window.dispatchEvent(new CustomEvent('navigate-profile'));
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-lg transition-colors text-left"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Profile</span>
              </button>
              
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-lg transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Settings</span>
              </button>
              
              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-lg transition-colors text-left"
                >
                  <Shield className="w-4 h-4 text-warning" />
                  <span className="text-sm">Admin Panel</span>
                </button>
              )}
              
              <div className="border-t border-border my-2" />
              
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
