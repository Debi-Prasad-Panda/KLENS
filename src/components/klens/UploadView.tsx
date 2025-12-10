import { useState } from "react";
import { 
  Upload, 
  Cloud, 
  Mail, 
  MessageCircle, 
  Settings,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  Lock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "./PermissionGate";

const integrations = [
  { id: "sharepoint", label: "SharePoint", icon: Cloud, color: "primary" },
  { id: "outlook", label: "Outlook", icon: Mail, color: "primary" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "success" },
  { id: "maximo", label: "Maximo", icon: Settings, color: "warning" },
];

const recentUploads = [
  { name: "Safety_Manual_v2.pdf", size: "2.4 MB", status: "complete" },
  { name: "Boiler_Specs_Q4.docx", size: "1.1 MB", status: "complete" },
  { name: "Audit_Report_2024.xlsx", size: "856 KB", status: "processing" },
];

export function UploadView() {
  const [isDragging, setIsDragging] = useState(false);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const { can, role, roleDisplayName } = usePermissions();

  // Check if user has document upload permission
  const canUpload = can('DOC_UPLOAD');

  const handleIntegrationClick = (integration: typeof integrations[0]) => {
    if (!canUpload) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: `Your role (${roleDisplayName}) cannot connect enterprise integrations.`,
      });
      return;
    }
    
    setConnectingTo(integration.id);
    
    toast({
      title: "Authenticating...",
      description: `Connecting to ${integration.label}...`,
    });

    setTimeout(() => {
      setConnectingTo(null);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: `Error: Enterprise Credentials Missing in Environment (${integration.label})`,
      });
    }, 2000);
  };

  // Show access denied for users without upload permission
  if (!canUpload) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold">Upload Documents</h2>
          <p className="text-muted-foreground mt-1">
            Feed documents into the K-LENS intelligence network
          </p>
        </div>
        
        <div className="glass-card p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Upload Restricted</h3>
            <p className="text-slate-400 text-center max-w-md mb-4">
              Your role <span className="text-amber-400 font-medium">({role})</span> does not have permission to upload documents.
            </p>
            <p className="text-xs text-slate-500">
              Required permission: <code className="bg-slate-800 px-2 py-1 rounded">DOC_UPLOAD</code>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Allowed roles: <span className="text-blue-400">ADMIN</span>, <span className="text-purple-400">ENGINEER</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Upload Documents</h2>
        <p className="text-muted-foreground mt-1">
          Feed documents into the K-LENS intelligence network
        </p>
      </div>

      {/* Dropzone */}
      <div
        className={`dropzone text-center ${isDragging ? "dropzone-active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all ${
          isDragging ? "bg-primary/20 glow-cyan scale-110" : "bg-secondary/50"
        }`}>
          <Upload className={`w-10 h-10 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {isDragging ? "Release to Upload" : "Drag & Drop Files Here"}
        </h3>
        <p className="text-muted-foreground mb-6">
          or click to browse your computer
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>PDF</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>DOCX</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>XLSX</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>Images</span>
        </div>
      </div>

      {/* Enterprise Integrations */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Enterprise Integrations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {integrations.map((integration) => (
            <button
              key={integration.id}
              onClick={() => handleIntegrationClick(integration)}
              disabled={connectingTo !== null}
              className="integration-btn disabled:opacity-50"
            >
              {connectingTo === integration.id ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <integration.icon className={`w-6 h-6 text-${integration.color}`} />
              )}
              <span className="font-medium">{integration.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Connect to enterprise systems for automated document ingestion
        </p>
      </div>

      {/* Recent Uploads */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
        <div className="space-y-3">
          {recentUploads.map((file, index) => (
            <div key={index} className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{file.size}</p>
              </div>
              {file.status === "complete" ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Processing</span>
                </div>
              )}
              <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Pipeline */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">AI Processing Pipeline</h3>
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {["OCR Extraction", "Gemini Analysis", "Compliance Audit", "Graph Linking", "Complete"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                index < 4 ? "bg-primary/20 text-primary" : "bg-success/20 text-success"
              }`}>
                {index < 4 ? (
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{step}</span>
              </div>
              {index < 4 && (
                <div className="w-8 h-px bg-border mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

