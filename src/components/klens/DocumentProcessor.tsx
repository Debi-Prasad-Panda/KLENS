import { useState } from "react";
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle, Rocket } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { AccessSettingsPanel, AccessRules } from "./AccessSettingsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface ProcessingStage {
  name: string;
  status: "pending" | "processing" | "complete" | "error";
}

interface DocumentProcessorProps {
  onUploadComplete?: () => void;
}

// Map backend stage names to frontend stage indices
const STAGE_MAP: Record<string, number> = {
  "uploading": 0,
  "uploaded": 0,
  "ocr": 1,
  "ocr_extraction": 1,
  "analyzing": 2,
  "analysis": 2,
  "ai_analysis": 2,
  "linking": 3,
  "graph_linking": 3,
  "complete": 4,
  "error": -1
};

export function DocumentProcessor({ onUploadComplete }: DocumentProcessorProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [accessRules, setAccessRules] = useState<AccessRules>({
    access_level: "public",
  });
  const [stages, setStages] = useState<ProcessingStage[]>([
    { name: "Uploading", status: "pending" },
    { name: "OCR Extraction", status: "pending" },
    { name: "AI Analysis", status: "pending" },
    { name: "Graph Linking", status: "pending" },
    { name: "Complete", status: "pending" }
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError(null);
    // Don't auto-process - wait for user to configure access and click Start
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    setFile(droppedFile);
    setError(null);
    // Don't auto-process - wait for user to configure access and click Start
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const runFallbackProgress = async () => {
    // Used when backend does not provide realtime per-stage status updates.
    for (let i = 1; i < stages.length; i++) {
      setStages(prev => prev.map((s, idx) => {
        if (idx < i) return { ...s, status: "complete" };
        if (idx === i) return { ...s, status: "processing" };
        return s;
      }));

      await new Promise(resolve => setTimeout(resolve, 900));

      setStages(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: "complete" } : s
      ));
    }

    setIsUploading(false);
    onUploadComplete?.();
  };

  const connectWebSocket = (documentId: string) => {
    // Determine WebSocket URL based on current location
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = window.location.port || (wsProtocol === 'wss:' ? '443' : '80');
    const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/api/ws/documents/${encodeURIComponent(documentId)}/status`;

    console.log('Connecting to WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);

    let hasReceivedUpdate = false;
    let hasStartedFallback = false;

    const startFallbackOnce = () => {
      if (hasStartedFallback) return;
      hasStartedFallback = true;
      void runFallbackProgress();
    };

    ws.onopen = () => {
      console.log('WebSocket connected for document:', documentId);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        if (data.type === 'status_update' || data.stage) {
          hasReceivedUpdate = true;
          const stageKey = String(data.stage || "").toLowerCase();
          const stageIndex = STAGE_MAP[stageKey];

          if (stageIndex >= 0) {
            // Mark all previous stages as complete, current as processing
            setStages(prev => prev.map((s, idx) => {
              if (idx < stageIndex) return { ...s, status: "complete" };
              if (idx === stageIndex) return { ...s, status: stageKey === "complete" ? "complete" : "processing" };
              return s;
            }));
          }

          if (stageKey === 'complete') {
            // Mark all stages complete
            setStages(prev => prev.map(s => ({ ...s, status: "complete" })));
            ws.close();
            setIsUploading(false);

            toast({
              title: "Processing complete!",
              description: "Your document is ready.",
            });

            // Delay slightly before refreshing to let user see complete state
            setTimeout(() => {
              onUploadComplete?.();
            }, 1500);
          }

          if (stageKey === 'error') {
            setError(data.message || 'Processing failed');
            setStages(prev => prev.map(s =>
              s.status === "processing" ? { ...s, status: "error" } : s
            ));
            ws.close();
            setIsUploading(false);
          }
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      if (!hasReceivedUpdate) {
        startFallbackOnce();
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      if (!hasReceivedUpdate && isUploading) {
        startFallbackOnce();
      }
    };

    return ws;
  };

  const processFile = async (uploadFile: File) => {
    setIsUploading(true);
    // Reset stages
    setStages(prev => prev.map(s => ({ ...s, status: "pending" })));

    // Stage 1: Uploading - Actually call the API!
    setStages(prev => prev.map((s, idx) =>
      idx === 0 ? { ...s, status: "processing" } : s
    ));

    try {
      const response = await api.uploadToSupabaseWithAccess(uploadFile, accessRules);

      if (response.error) {
        throw new Error(response.error);
      }

      // Mark upload complete
      setStages(prev => prev.map((s, idx) =>
        idx === 0 ? { ...s, status: "complete" } : s
      ));

      // Get document ID from response and connect WebSocket
      const responseDocId = response?.id != null ? String(response.id) : null;
      setDocId(responseDocId);

      toast({
        title: "Document uploaded!",
        description: `${uploadFile.name} is being processed...`,
      });

      if (responseDocId) {
        // Connect to WebSocket for real-time updates.
        connectWebSocket(responseDocId);
      } else {
        // No tracking ID returned; use fallback progress UI.
        await runFallbackProgress();
      }

    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setStages(prev => prev.map(s =>
        s.status === "processing" ? { ...s, status: "error" } : s
      ));

      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again",
      });
    }
  };

  const resetUpload = () => {
    setFile(null);
    setError(null);
    setDocId(null);
    setIsUploading(false);
    setAccessRules({ access_level: "public" });
    setStages(prev => prev.map(s => ({ ...s, status: "pending" })));
  };

  const handleStartUpload = () => {
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="dropzone text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold mb-2">Drop files or click to upload</p>
          <p className="text-sm text-muted-foreground">PDF, DOCX, Excel, Images supported</p>
        </label>
      </div>

      {file && (
        <div className="space-y-4 animate-fade-in">
          {/* File Info Card */}
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
                {docId && <span className="ml-2 text-primary">• Doc ID: {docId}</span>}
              </p>
            </div>
            {stages.every(s => s.status === "complete") && (
              <button
                onClick={resetUpload}
                className="text-sm text-primary hover:text-primary/80"
              >
                Upload Another
              </button>
            )}
            {!isUploading && stages.every(s => s.status === "pending") && (
              <button
                onClick={resetUpload}
                className="text-sm text-muted-foreground hover:text-destructive"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Access Settings Panel - shown before upload starts */}
          {!isUploading && stages.every(s => s.status === "pending") && (
            <>
              <AccessSettingsPanel
                accessRules={accessRules}
                onAccessRulesChange={setAccessRules}
                userDepartment={user?.department || "Engineering"}
              />

              {/* Start Upload Button */}
              <Button
                onClick={handleStartUpload}
                className="w-full h-12 text-lg font-semibold gap-2"
                size="lg"
              >
                <Rocket className="w-5 h-5" />
                Start Secure Upload
              </Button>
            </>
          )}

          {/* Processing Stages - shown during/after upload */}
          {(isUploading || stages.some(s => s.status !== "pending")) && (
            <div className="glass-card p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                {stages.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {stage.status === "complete" ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : stage.status === "processing" ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : stage.status === "error" ? (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted" />
                    )}
                    <span className={`text-sm ${stage.status === "complete" ? "text-success" :
                      stage.status === "processing" ? "text-primary" :
                        stage.status === "error" ? "text-destructive" :
                          "text-muted-foreground"
                      }`}>
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

