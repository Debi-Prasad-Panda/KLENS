import { useState, useEffect } from "react";
import { FileText, Folder, Clock, User, Filter, Search, Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import { DocumentProcessor } from "./DocumentProcessor";
import { EnterpriseConnectors } from "./EnterpriseConnectors";

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

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await api.getDocuments({ limit: 50 });
      if (docs.length === 0) {
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
      } else {
        setDocuments(docs);
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

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.original_name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const categories = [
    { id: "all", label: "All Documents", count: documents.length },
    { id: "uploaded", label: "Uploaded by Me", count: documents.filter(d => d.uploaded_by === 1).length },
    { id: "shared", label: "Shared with Me", count: 0 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Library</h2>
          <p className="text-muted-foreground">Browse and manage your documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id as any)}
            className={`p-4 rounded-lg border transition-all ${
              filter === cat.id
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      doc.status === "complete" ? "bg-success/20 text-success" :
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
              <DocumentProcessor />
              <EnterpriseConnectors />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
