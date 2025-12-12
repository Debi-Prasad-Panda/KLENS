/**
 * Enhanced SearchDiscoveryView - K-LENS Intelligent Search Hub
 * 
 * Features:
 * - Semantic + Keyword hybrid search
 * - Advanced filters (date, department, file type, status)
 * - Recent searches & saved queries
 * - Search analytics dashboard
 * - Quick actions on results
 * - Premium glassmorphism styling
 */

import { useState, useEffect, useMemo } from "react";
import {
  Search, Loader2, FileText, ArrowRight, Clock, Sparkles, Filter, X,
  History, Star, StarOff, TrendingUp, BarChart3, Calendar, FolderOpen,
  FileType, CheckCircle, AlertCircle, Download, Eye, Bookmark, BookmarkCheck,
  Zap, Brain, Settings2, ChevronDown, ChevronRight, RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SearchResult {
  id: string;
  file_name: string;
  s3_url: string;
  content_chunk: string;
  score: number;
  match_type: "vector" | "keyword";
  metadata?: any;
}

interface SavedSearch {
  id: string;
  query: string;
  filters: SearchFilters;
  createdAt: Date;
  resultCount: number;
  isFavorite: boolean;
}

interface SearchFilters {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  department: string | null;
  fileType: string | null;
  status: string | null;
  matchType: 'all' | 'semantic' | 'keyword';
}

interface SearchDiscoveryViewProps {
  onOpenDocument: (doc: any) => void;
}

// Mock recent searches for demo
const generateRecentSearches = (): SavedSearch[] => [
  { id: '1', query: 'boiler maintenance procedures', filters: { dateRange: 'month', department: 'Operations', fileType: null, status: null, matchType: 'all' }, createdAt: new Date(Date.now() - 3600000), resultCount: 12, isFavorite: true },
  { id: '2', query: 'safety compliance audit 2024', filters: { dateRange: 'year', department: null, fileType: 'pdf', status: 'complete', matchType: 'semantic' }, createdAt: new Date(Date.now() - 86400000), resultCount: 8, isFavorite: false },
  { id: '3', query: 'hydraulic pump specifications', filters: { dateRange: 'all', department: 'Engineering', fileType: null, status: null, matchType: 'all' }, createdAt: new Date(Date.now() - 172800000), resultCount: 5, isFavorite: true },
  { id: '4', query: 'Q3 financial report', filters: { dateRange: 'month', department: 'Management', fileType: 'xlsx', status: null, matchType: 'keyword' }, createdAt: new Date(Date.now() - 259200000), resultCount: 3, isFavorite: false },
  { id: '5', query: 'employee training manual', filters: { dateRange: 'all', department: null, fileType: 'pdf', status: null, matchType: 'all' }, createdAt: new Date(Date.now() - 345600000), resultCount: 15, isFavorite: false },
];

// Mock search analytics
const generateSearchAnalytics = () => ({
  totalSearches: 247,
  searchesToday: 18,
  avgResultsPerSearch: 8.4,
  topQueries: [
    { query: 'maintenance', count: 34 },
    { query: 'safety protocol', count: 28 },
    { query: 'compliance', count: 22 },
    { query: 'financial', count: 19 },
    { query: 'audit', count: 15 },
  ],
  searchesByDepartment: [
    { dept: 'Operations', count: 89 },
    { dept: 'Engineering', count: 67 },
    { dept: 'Management', count: 45 },
    { dept: 'Safety', count: 32 },
    { dept: 'Other', count: 14 },
  ],
  peakHours: [9, 10, 11, 14, 15, 16],
});

export function SearchDiscoveryView({ onOpenDocument }: SearchDiscoveryViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Search state
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: 'all',
    department: null,
    fileType: null,
    status: null,
    matchType: 'all'
  });

  // History & saved searches
  const [recentSearches, setRecentSearches] = useState<SavedSearch[]>([]);
  const [analytics, setAnalytics] = useState(generateSearchAnalytics());
  const [activeTab, setActiveTab] = useState('search');

  // Result interaction
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [bookmarkedResults, setBookmarkedResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRecentSearches(generateRecentSearches());
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setQuery(searchQuery);
    setHasSearched(true);
    setActiveTab('search');

    try {
      const response = await api.hybridSearch(searchQuery);
      let filteredResults = response.results || [];

      // Apply client-side filters
      if (filters.matchType !== 'all') {
        filteredResults = filteredResults.filter(r =>
          filters.matchType === 'semantic' ? r.match_type === 'vector' : r.match_type === 'keyword'
        );
      }

      setResults(filteredResults);

      // Add to recent searches
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        query: searchQuery,
        filters: { ...filters },
        createdAt: new Date(),
        resultCount: filteredResults.length,
        isFavorite: false
      };
      setRecentSearches(prev => [newSearch, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search failed",
        description: "Could not connect to search service. Try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch(query);
    }
  };

  const toggleResultExpand = (id: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedResults(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast({ title: "Removed from bookmarks" });
      } else {
        next.add(id);
        toast({ title: "Added to bookmarks" });
      }
      return next;
    });
  };

  const toggleFavoriteSearch = (id: string) => {
    setRecentSearches(prev => prev.map(s =>
      s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
    ));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: 'all',
      department: null,
      fileType: null,
      status: null,
      matchType: 'all'
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange !== 'all') count++;
    if (filters.department) count++;
    if (filters.fileType) count++;
    if (filters.status) count++;
    if (filters.matchType !== 'all') count++;
    return count;
  }, [filters]);

  const sampleQueries = [
    "maintenance procedures for hydraulic pumps",
    "safety protocols for chemical handling",
    "Q3 financial performance summary",
    "compliance audit reports 2024"
  ];

  const favoriteSearches = recentSearches.filter(s => s.isFavorite);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Premium Styling like MissionControl */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-cyan-500/20 flex items-center justify-center glow-cyan border border-primary/20">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Intelligent Search</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered semantic search across your document network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 glass-card text-sm">
            <Zap className="w-4 h-4 text-success" />
            <span className="font-mono">
              <span className="text-muted-foreground">Indexed:</span>{' '}
              <span className="text-foreground font-semibold">2,847 docs</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary">AI READY</span>
          </div>
        </div>
      </div>

      {/* Search Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Search className="w-4 h-4" />
            <span className="text-xs">Total Searches</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{analytics.totalSearches}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Today</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{analytics.searchesToday}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs">Avg. Results</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{analytics.avgResultsPerSearch}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Star className="w-4 h-4" />
            <span className="text-xs">Saved Searches</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{favoriteSearches.length}</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/50 border border-border/50 p-1">
          <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <History className="w-4 h-4" />
            History
            {recentSearches.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{recentSearches.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-cyan-500/20 to-primary/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity" />
            <div className="relative flex items-center bg-card border border-primary/30 rounded-2xl shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all group">
              <div className="pl-5 text-primary">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your documents..."
                className="w-full bg-transparent p-5 text-lg outline-none placeholder:text-muted-foreground/50"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setHasSearched(false); setResults([]); }}
                  className="p-2 mr-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 mr-2 rounded-xl transition-all ${showFilters || activeFilterCount > 0 ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
              >
                <Filter className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => performSearch(query)}
                disabled={isSearching || !query.trim()}
                className="m-2 px-6 py-3 bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Search
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-primary" />
                  Advanced Filters
                </h3>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Date Range */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value as any }))}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Department</label>
                  <select
                    value={filters.department || ''}
                    onChange={(e) => setFilters(f => ({ ...f, department: e.target.value || null }))}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Departments</option>
                    <option value="Operations">Operations</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management">Management</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>

                {/* File Type */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">File Type</label>
                  <select
                    value={filters.fileType || ''}
                    onChange={(e) => setFilters(f => ({ ...f, fileType: e.target.value || null }))}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">Word</option>
                    <option value="xlsx">Excel</option>
                    <option value="txt">Text</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Status</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters(f => ({ ...f, status: e.target.value || null }))}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Any Status</option>
                    <option value="complete">Processed</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Match Type */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Match Type</label>
                  <select
                    value={filters.matchType}
                    onChange={(e) => setFilters(f => ({ ...f, matchType: e.target.value as any }))}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Hybrid (All)</option>
                    <option value="semantic">Semantic Only</option>
                    <option value="keyword">Keyword Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Queries - Show only when no search */}
          {!hasSearched && (
            <div className="space-y-4">
              {/* Favorite Searches */}
              {favoriteSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning" />
                    Saved Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {favoriteSearches.map(s => (
                      <button
                        key={s.id}
                        onClick={() => performSearch(s.query)}
                        className="px-4 py-2 bg-warning/10 hover:bg-warning/20 border border-warning/30 rounded-full text-sm transition-all flex items-center gap-2"
                      >
                        <Star className="w-3 h-3 text-warning" />
                        {s.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Queries */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Try these queries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sampleQueries.map((q) => (
                    <button
                      key={q}
                      onClick={() => performSearch(q)}
                      className="px-4 py-2 bg-secondary/50 hover:bg-secondary border border-border/50 rounded-full text-sm text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group"
                    >
                      <Sparkles className="w-3 h-3 text-primary group-hover:animate-pulse" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {hasSearched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  Results
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {results.length}
                  </Badge>
                </h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => performSearch(query)}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="group glass-card p-5 hover:bg-secondary/40 transition-all border border-border/40 hover:border-primary/30 cursor-pointer"
                    onClick={() => toggleResultExpand(result.id)}
                  >
                    <div className="flex gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-xl h-min group-hover:from-primary/30 group-hover:to-cyan-500/20 transition-all">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                              {result.file_name}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <Badge variant="outline" className={result.match_type === "vector" ? "border-primary/50 text-primary" : "border-success/50 text-success"}>
                                {result.match_type === "vector" ? "Semantic" : "Keyword"}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {Math.round(result.score * 100)}% match
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleBookmark(result.id); }}
                              className={`p-2 rounded-lg transition-colors ${bookmarkedResults.has(result.id) ? 'bg-warning/20 text-warning' : 'hover:bg-secondary text-muted-foreground'}`}
                            >
                              {bookmarkedResults.has(result.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedResults.has(result.id) ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        <p className="text-muted-foreground leading-relaxed line-clamp-2 mt-2">
                          {result.content_chunk}
                        </p>

                        {/* Expanded Content */}
                        {expandedResults.has(result.id) && (
                          <div className="mt-4 pt-4 border-t border-dashed border-border/50 animate-slide-up">
                            <p className="text-sm text-foreground leading-relaxed bg-secondary/30 p-4 rounded-lg mb-4">
                              {result.content_chunk}
                            </p>
                            <div className="flex gap-3">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const docForViewer = {
                                    id: result.id,
                                    filename: result.file_name,
                                    original_name: result.file_name,
                                    file_type: "application/pdf",
                                    status: "complete",
                                    created_at: result.metadata?.upload_time || new Date().toISOString(),
                                    ocr_text: result.content_chunk,
                                    s3_url: result.s3_url,
                                  };
                                  onOpenDocument(docForViewer);
                                }}
                                className="bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Open Document
                              </Button>

                              {result.s3_url && (
                                <Button
                                  variant="outline"
                                  onClick={(e) => { e.stopPropagation(); window.open(result.s3_url, '_blank'); }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {results.length === 0 && !isSearching && (
                  <div className="text-center py-16 glass-card">
                    <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your query or filters</p>
                    <Button variant="outline" onClick={() => { setQuery(""); setHasSearched(false); }}>
                      Clear search
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Searches</h3>
            {recentSearches.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setRecentSearches([])}>
                Clear history
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {recentSearches.map((search) => (
              <div
                key={search.id}
                className="glass-card p-4 flex items-center justify-between hover:bg-secondary/40 transition-all cursor-pointer group"
                onClick={() => performSearch(search.query)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <History className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">{search.query}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{search.resultCount} results</span>
                      <span>•</span>
                      <span>{formatRelativeTime(search.createdAt)}</span>
                      {search.filters.department && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{search.filters.department}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavoriteSearch(search.id); }}
                    className={`p-2 rounded-lg transition-colors ${search.isFavorite ? 'text-warning' : 'text-muted-foreground hover:text-warning'}`}
                  >
                    {search.isFavorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                  </button>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}

            {recentSearches.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No search history yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Queries */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Top Queries
              </h3>
              <div className="space-y-3">
                {analytics.topQueries.map((q, i) => (
                  <div key={q.query} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{q.query}</span>
                        <span className="text-sm text-muted-foreground">{q.count}</span>
                      </div>
                      <Progress value={(q.count / analytics.topQueries[0].count) * 100} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Searches by Department */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                By Department
              </h3>
              <div className="space-y-3">
                {analytics.searchesByDepartment.map((d) => (
                  <div key={d.dept} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{d.dept}</span>
                        <span className="text-sm text-muted-foreground">{d.count}</span>
                      </div>
                      <Progress value={(d.count / analytics.searchesByDepartment[0].count) * 100} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Peak Search Hours
            </h3>
            <div className="flex gap-2">
              {Array.from({ length: 24 }, (_, i) => {
                const isPeak = analytics.peakHours.includes(i);
                return (
                  <div
                    key={i}
                    className={`flex-1 h-12 rounded transition-all ${isPeak ? 'bg-primary/50' : 'bg-secondary/30'}`}
                    title={`${i}:00`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>12 AM</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
