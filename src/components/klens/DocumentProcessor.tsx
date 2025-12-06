import { useState } from "react";
import { Upload, FileText, Image, FileSpreadsheet, CheckCircle2, Loader2 } from "lucide-react";

interface ProcessingStage {
  name: string;
  status: "pending" | "processing" | "complete";
}

export function DocumentProcessor() {
  const [file, setFile] = useState<File | null>(null);
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
    processFile();
  };

  const processFile = async () => {
    for (let i = 0; i < stages.length; i++) {
      setStages(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: "processing" } : s
      ));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStages(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: "complete" } : s
      ));
    }
  };

  return (
    <div className="space-y-6">
      <div className="dropzone text-center">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.docx,.xlsx,.png,.jpg"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold mb-2">Drop files or click to upload</p>
          <p className="text-sm text-muted-foreground">PDF, DOCX, Excel, Images supported</p>
        </label>
      </div>

      {file && (
        <div className="glass-card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>

          <div className="space-y-3">
            {stages.map((stage, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {stage.status === "complete" ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : stage.status === "processing" ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted" />
                )}
                <span className={`text-sm ${
                  stage.status === "complete" ? "text-success" :
                  stage.status === "processing" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {stage.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
