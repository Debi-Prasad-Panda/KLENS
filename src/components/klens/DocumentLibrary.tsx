import { useState, useEffect } from "react";
import { FileText, Folder, Clock, User, Filter, Search, Upload, X, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { DocumentProcessor } from "./DocumentProcessor";
import { EnterpriseConnectors } from "./EnterpriseConnectors";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "@/hooks/use-toast";

interface Document {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  status: string;
  created_at: string;
  uploaded_by: number;
}

interface DocumentLibraryProps {
  onOpenDocument: (doc: Document) => void;
}

export function DocumentLibrary({ onOpenDocument }: DocumentLibraryProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<"all" | "uploaded" | "shared">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Permission checks
  const { can, roleDisplayName } = usePermissions();
  const canUpload = can('DOC_UPLOAD');
  const canDelete = can('DOC_DELETE');
  const canViewAll = can('DOC_VIEW_ALL');

  // Handle unauthorized upload attempt
  const handleUploadClick = () => {
    if (!canUpload) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: `Your role (${roleDisplayName}) cannot upload documents.`,
      });
      return;
    }
    setShowUploadModal(true);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      // Fetch from Knowledge Hub (Supabase) instead of old documents table
      const knowledgeHubDocs = await api.getKnowledgeHubDocuments(50, 0);

      if (knowledgeHubDocs && knowledgeHubDocs.length > 0) {
        // Transform Knowledge Hub response to match Document interface
        // Knowledge Hub returns: id mod, file_name, s3_url, content_chunk, metadata
        // Group by file_name to get unique documents (since chunks share the same file_name)
        const uniqueDocsMap = new Map<string, Document>();

        for (const doc of knowledgeHubDocs) {
          const fileName = doc.file_name || doc.filename || "Unknown";
          if (!uniqueDocsMap.has(fileName)) {
            uniqueDocsMap.set(fileName, {
              id: doc.id,
              filename: fileName,
              original_name: fileName,
              file_type: "application/pdf",
              status: "complete",
              created_at: doc.metadata?.upload_time || doc.created_at || new Date().toISOString(),
              uploaded_by: 1,
              // Pass additional fields for document viewer
              ...doc,
              // Ensure content_chunk is explicitly available for DocumentViewer
              content_chunk: doc.content_chunk || "",
              ocr_text: doc.content_chunk || doc.ocr_text || ""
            });
          }
        }

        setDocuments(Array.from(uniqueDocsMap.values()));
      } else {
        // Show demo documents if no documents exist
        setDocuments([
          {
            id: 1,
            filename: "boiler_b7_specs.pdf",
            original_name: "Boiler B7 Specifications.pdf",
            file_type: "application/pdf",
            status: "complete",
            created_at: new Date().toISOString(),
            uploaded_by: 1
          },
          {
            id: 2,
            filename: "safety_manual.pdf",
            original_name: "Safety Manual v2.3.pdf",
            file_type: "application/pdf",
            status: "complete",
            created_at: new Date().toISOString(),
            uploaded_by: 1
          },
          {
            id: 3,
            filename: "maintenance_log.xlsx",
            original_name: "Maintenance Log 2024.xlsx",
            file_type: "application/vnd.ms-excel",
            status: "processing",
            created_at: new Date().toISOString(),
            uploaded_by: 1
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      // Show demo documents if API fails
      setDocuments([
        {
          id: 1,
          filename: "boiler_b7_specs.pdf",
          original_name: "Boiler B7 Specifications.pdf",
          file_type: "application/pdf",
          status: "complete",
          created_at: new Date().toISOString(),
          uploaded_by: 1
        },
        {
          id: 2,
          filename: "safety_manual.pdf",
          original_name: "Safety Manual v2.3.pdf",
          file_type: "application/pdf",
          status: "complete",
          created_at: new Date().toISOString(),
          uploaded_by: 1
        },
        {
          id: 3,
          filename: "maintenance_log.xlsx",
          original_name: "Maintenance Log 2024.xlsx",
          file_type: "application/vnd.ms-excel",
          status: "processing",
          created_at: new Date().toISOString(),
          uploaded_by: 1
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Get current user ID (for now using 1, but should come from auth context)
  const currentUserId = 1;

  // Filter documents based on selected category
  const filteredDocs = documents.filter(doc => {
    // First apply search filter
    if (search && !doc.original_name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Then apply category filter
    if (filter === "uploaded") {
      return doc.uploaded_by === currentUserId;
    } else if (filter === "shared") {
      return doc.uploaded_by !== currentUserId;
    }
    return true; // "all" shows everything
  });

  const categories = [
    { id: "all", label: "All Documents", count: documents.length },
    { id: "uploaded", label: "Uploaded by Me", count: documents.filter(d => d.uploaded_by === currentUserId).length },
    { id: "shared", label: "Shared with Me", count: documents.filter(d => d.uploaded_by !== currentUserId).length }
  ];

  // Knowledge Hub search
  const [knowledgeResults, setKnowledgeResults] = useState<any[]>([]);
  const [isSearchingKnowledge, setIsSearchingKnowledge] = useState(false);
  const [showKnowledgeResults, setShowKnowledgeResults] = useState(false);

  const searchKnowledgeHub = async () => {
    if (search.trim().length < 2) return;
    setIsSearchingKnowledge(true);
    try {
      const response = await api.hybridSearch(search.trim(), 10);
      setKnowledgeResults(response.results || []);
      setShowKnowledgeResults(true);
    } catch (error) {
      console.error("Knowledge Hub search failed:", error);
    } finally {
      setIsSearchingKnowledge(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Library</h2>
          <p className="text-muted-foreground">Browse and manage your documents</p>
        </div>
        <button
          onClick={handleUploadClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${canUpload
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
        >
          {canUpload ? <Upload className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          Upload
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowKnowledgeResults(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && searchKnowledgeHub()}
            placeholder="Search documents... (Enter for AI search)"
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          onClick={searchKnowledgeHub}
          disabled={isSearchingKnowledge || search.trim().length < 2}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSearchingKnowledge ? (
            <Clock className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">AI Search</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Knowledge Hub Results */}
      {showKnowledgeResults && knowledgeResults.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">📚 Knowledge Hub Results ({knowledgeResults.length})</h3>
            <button
              onClick={() => setShowKnowledgeResults(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕ Close
            </button>
          </div>
          <div className="space-y-3">
            {knowledgeResults.slice(0, 6).map((result: any) => (
              <div
                key={result.id}
                className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer border border-border/50"
                onClick={() => {
                  // Convert to Document format and open in DocumentViewer
                  const docForViewer = {
                    id: result.id,
                    filename: result.file_name,
                    original_name: result.file_name,
                    file_type: "application/pdf",
                    status: "complete",
                    created_at: result.metadata?.upload_time || new Date().toISOString(),
                    uploaded_by: 1,
                    ocr_text: result.content_chunk,
                    content_chunk: result.content_chunk, // Also pass as content_chunk for DocumentViewer compatibility
                    s3_url: result.s3_url, // Pass S3 URL for original view
                  };
                  onOpenDocument(docForViewer as any);
                }}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{result.file_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${result.match_type === "vector"
                        ? "bg-primary/20 text-primary"
                        : "bg-success/20 text-success"
                        }`}>
                        {result.match_type === "vector" ? "Semantic" : "Keyword"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {result.content_chunk?.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-primary mt-2">
                      Click to open in Document Viewer →
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Categories */}
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id as any)}
            className={`p-4 rounded-lg border transition-all ${filter === cat.id
              ? "bg-primary/10 border-primary/50"
              : "bg-secondary/50 border-border hover:bg-secondary"
              }`}
          >
            <div className="flex items-center gap-3">
              <Folder className={`w-5 h-5 ${filter === cat.id ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-left">
                <p className="font-medium text-sm">{cat.label}</p>
                <p className="text-xs text-muted-foreground">{cat.count} documents</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No documents available</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No documents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onOpenDocument(doc)}
              className="glass-card p-4 text-left hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.original_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === "complete" ? "bg-success/20 text-success" :
                      doc.status === "processing" ? "bg-warning/20 text-warning" :
                        "bg-muted text-muted-foreground"
                      }`}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold">Upload Documents</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <DocumentProcessor onUploadComplete={() => {
                loadDocuments();
                setShowUploadModal(false);
              }} />
              <EnterpriseConnectors />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
