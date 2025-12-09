import { useState } from "react";
import { Search, Loader2, FileText, ArrowRight, Clock, Sparkles, Filter, X } from "lucide-react";
import { api } from "@/lib/api";

interface SearchResult {
  id: string;
  file_name: string;
  s3_url: string;
  content_chunk: string;
  score: number;
  match_type: "vector" | "keyword";
  metadata?: any;
}

interface SearchDiscoveryViewProps {
  onOpenDocument: (doc: any) => void;
}

export function SearchDiscoveryView({ onOpenDocument }: SearchDiscoveryViewProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setQuery(searchQuery);
    setHasSearched(true);
    
    try {
      const response = await api.hybridSearch(searchQuery);
      setResults(response.results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch(query);
    }
  };

  const sampleQueries = [
    "maintenance procedures for hydraulic pumps",
    "safety protocols for chemical handling",
    "Q3 financial performance summary",
    "compliance audit reports 2024"
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 animate-fade-in">
      {/* Header & Search */}
      <div className={`flex flex-col items-center text-center mb-12 transition-all duration-500 ${hasSearched ? "mb-8" : "mb-20 pt-20"}`}>
        {!hasSearched && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 glow-cyan animate-float">
              <Search className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Search & Discovery</h1>
            <p className="text-muted-foreground mb-8 max-w-xl">
              AI-powered semantic search across your entire document network. 
              Find exactly what you need with natural language.
            </p>
          </>
        )}

        <div className="w-full max-w-2xl relative group">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity" />
          <div className="relative flex items-center bg-card border border-primary/30 rounded-2xl shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all">
            <div className="pl-5 text-muted-foreground">
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
                 className="p-2 mr-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full"
               >
                 <X className="w-5 h-5" />
               </button>
            )}
            <button
              onClick={() => performSearch(query)}
              disabled={isSearching || !query.trim()}
              className="m-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </div>
        </div>

        {/* Suggested Queries */}
        {!hasSearched && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {sampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => performSearch(q)}
                className="px-4 py-2 bg-secondary/30 hover:bg-secondary border border-border/50 rounded-full text-sm text-muted-foreground hover:text-foreground transition-all flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3 text-primary" />
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Results found 
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm">
                {results.length}
              </span>
            </h2>
            <div className="flex gap-2">
               <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg hover:bg-secondary/80">
                 <Filter className="w-4 h-4" /> Filter
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => {
                  // Toggle expand for this result
                  const el = document.getElementById(`preview-page-${result.id}`);
                  if (el) el.classList.toggle('hidden');
                }}
                className="group p-6 glass-card hover:bg-secondary/40 transition-all border border-border/40 hover:border-primary/30 cursor-pointer rounded-xl"
              >
                <div className="flex gap-4">
                  <div className="p-3 bg-secondary rounded-lg h-min group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                          {result.file_name}
                        </h3>
                         <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                           <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                             result.match_type === "vector" 
                               ? "bg-primary/10 text-primary" 
                               : "bg-success/10 text-success"
                           }`}>
                             {result.match_type === "vector" ? "Semantic Match" : "Keyword Match"}
                           </span>
                           <span className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/50"/>
                              Relevance: {Math.round(result.score * 100)}%
                           </span>
                         </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed line-clamp-2">
                      {result.content_chunk}
                    </p>

                    {/* Expanded Preview (Start Hidden) */}
                    <div id={`preview-page-${result.id}`} className="hidden mt-4 pt-4 border-t border-dashed border-border/50">
                       <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4 bg-secondary/30 p-4 rounded-lg">
                        {result.content_chunk}
                      </p>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                             e.stopPropagation();
                             const docForViewer = {
                                id: result.id,
                                filename: result.file_name,
                                original_name: result.file_name,
                                file_type: "application/pdf",
                                status: "complete",
                                created_at: result.metadata?.upload_time || new Date().toISOString(),
                                uploaded_by: 1,
                                ocr_text: result.content_chunk,
                                s3_url: result.s3_url,
                              };
                              onOpenDocument(docForViewer);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                          <FileText className="w-4 h-4" />
                          Open in Document Viewer
                        </button>
                        
                        {result.s3_url && (
                          <a
                            href={result.s3_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-secondary/80 transition-colors"
                          >
                             View Original PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {results.length === 0 && !isSearching && hasSearched && (
               <div className="text-center py-12">
                 <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                   <Search className="w-8 h-8 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-medium">No results found</h3>
                 <p className="text-muted-foreground">Try adjusting your query or filters</p>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
