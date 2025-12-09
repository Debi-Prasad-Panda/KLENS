import { Search, Bell, Moon, User, Sparkles, LogOut, Settings, Shield, FileText, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AIChatSidebar } from "./AIChatSidebar";

import { api } from "@/lib/api";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Languages } from "lucide-react";

interface SearchResult {
  id: string;
  file_name: string;
  s3_url: string;
  content_chunk: string;
  score: number;
  match_type: string;
}

interface TopNavProps {
  onAIChatToggle?: (isOpen: boolean) => void;
}

export function TopNav({ onAIChatToggle }: TopNavProps = {}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Manual search function
  const performSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await api.hybridSearch(searchQuery.trim(), 5);
      setSearchResults(response.results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Debounced auto-search (only when typing)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      // Don't clear results immediately - keep them visible
      return;
    }
    
    const timer = setTimeout(() => {
      performSearch();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleAIChat = () => {
    const newState = !showAIChat;
    setShowAIChat(newState);
    onAIChatToggle?.(newState);
  };

  const handleResultClick = (result: SearchResult) => {
    window.open(result.s3_url, "_blank");
    setShowSearchResults(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch();
    }
    if (e.key === "Escape") {
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setHasSearched(false);
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-card/30 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
        {/* Search Bar with Hybrid Search */}
        <div className="flex-1 max-w-2xl" ref={searchRef}>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => hasSearched && searchResults.length > 0 && setShowSearchResults(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder={`${t("Search", "Search")}...`}
                className="w-full h-11 pl-12 pr-10 bg-secondary/50 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Search Button */}
            <button
              onClick={performSearch}
              disabled={isSearching || searchQuery.trim().length < 2}
              className="h-11 px-4 bg-primary text-primary-foreground rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="text-sm font-medium hidden sm:inline">Search</span>
            </button>
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <>
                    <div className="p-3 border-b border-border bg-secondary/30">
                      <p className="text-xs text-muted-foreground font-medium">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} from Knowledge Hub
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full p-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{result.file_name}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {result.content_chunk.substring(0, 100)}...
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  result.match_type === "vector" 
                                    ? "bg-primary/20 text-primary" 
                                    : "bg-success/20 text-success"
                                }`}>
                                  {result.match_type === "vector" ? "Semantic" : "Keyword"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {(result.score * 100).toFixed(0)}% match
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : hasSearched ? (
                  <div className="p-6 text-center">
                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No documents found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try different keywords</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-6">
        {/* AI Assistant Button */}
        <button
          onClick={toggleAIChat}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            showAIChat
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-gradient-to-r from-primary/20 to-success/20 border-primary/30 hover:from-primary/30 hover:to-success/30"
          }`}
        >
          <Sparkles className={`w-4 h-4 ${showAIChat ? "text-primary-foreground" : "text-primary"}`} />
          <span className={`text-sm font-medium ${showAIChat ? "text-primary-foreground" : "text-primary"}`}>AI Assistant</span>
        </button>
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

        {/* Global Language Selector (Moved to Settings) */}


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
                <span className="text-sm">{t("Profile", "Profile")}</span>
              </button>
              
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-lg transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{t("Settings", "Settings")}</span>
              </button>
              
              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-lg transition-colors text-left"
                >
                  <Shield className="w-4 h-4 text-warning" />
                  <span className="text-sm">{t("Admin Panel", "Admin Panel")}</span>
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
                <span className="text-sm">{t("Logout", "Logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
      </header>

      {/* AI Chat Sidebar */}
      <AIChatSidebar isOpen={showAIChat} onClose={() => {
        setShowAIChat(false);
        onAIChatToggle?.(false);
      }} />
    </>
  );
}
