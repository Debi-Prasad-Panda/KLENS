import { useState, useEffect } from "react";
import {
  FileText,
  Wrench,
  Briefcase,
  ChevronLeft,
  Download,
  Share2,
  Bookmark,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Clock,
  Thermometer,
  Gauge,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useDocumentInsights } from "@/hooks/useDocumentInsights";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

interface DocumentViewerProps {
  onBack: () => void;
  document?: any;
}

// Default icon mapping for specs
const getSpecIcon = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes('temp')) return Thermometer;
  if (lower.includes('pressure')) return Gauge;
  if (lower.includes('time') || lower.includes('life') || lower.includes('hour')) return Clock;
  return FileText;
};

export function DocumentViewer({ onBack, document }: DocumentViewerProps) {
  const docTitle = document?.original_name || "Document";
  const docId = document?.id;
  const [viewMode, setViewMode] = useState<"engineer" | "manager" | "operator" | "safety_officer" | "maintenance" | "quality">("engineer");
  const [zoom, setZoom] = useState(100);
  const [contentLanguage, setContentLanguage] = useState("English");
  const { t } = useLanguage();

  const { engineerInsights, managerInsights, otherInsights, loading, error, fetchInsights, regenerate } = useDocumentInsights(docId, contentLanguage);

  // Fetch insights when switching roles
  useEffect(() => {
    if (docId) {
      fetchInsights(viewMode);
    }
  }, [viewMode, docId, fetchInsights]);

  const handleCopyInsight = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: text.substring(0, 50) + "..." });
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-lg bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {docTitle}
            </h2>
            <p className="text-sm text-muted-foreground">AI-Powered Analysis • Last updated: {document?.created_at ? new Date(document.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Header Actions */}
          <button
            onClick={() => regenerate(viewMode)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 glass-card hover:bg-secondary/50 transition-colors disabled:opacity-50"
            title="Regenerate AI Analysis"
          >
            <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">{t("Regenerate", "Regenerate")}</span>
          </button>

          {/* Local Content Language Selector (Restored) */}
          <div className="glass-card">
            <Select
              value={contentLanguage}
              onValueChange={(value) => {
                setContentLanguage(value);
                toast({ title: "Summarizing in " + value, description: "Regenerating AI insights..." });
              }}
            >
              <SelectTrigger className="w-[180px] bg-transparent border-none focus:ring-0 text-foreground">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-primary" />
                  <SelectValue placeholder="Content Language" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi (हिंदी)</SelectItem>
                <SelectItem value="Bengali">Bengali (বাংলা)</SelectItem>
                <SelectItem value="Telugu">Telugu (తెలుగు)</SelectItem>
                <SelectItem value="Marathi">Marathi (मराठी)</SelectItem>
                <SelectItem value="Tamil">Tamil (தமிழ்)</SelectItem>
                <SelectItem value="Urdu">Urdu (اردو)</SelectItem>
                <SelectItem value="Gujarati">Gujarati (ગુજરાતી)</SelectItem>
                <SelectItem value="Kannada">Kannada (ಕನ್ನಡ)</SelectItem>
                <SelectItem value="Malayalam">Malayalam (മലയാളം)</SelectItem>
                <SelectItem value="Odia">Odia (ଓଡ଼ିଆ)</SelectItem>
                <SelectItem value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</SelectItem>
                <SelectItem value="Assamese">Assamese (অসমীয়া)</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* View Original PDF - only for Knowledge Hub docs */}
          {document?.s3_url && (
            <a
              href={document.s3_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors"
              title="Open original PDF"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">{t("View Original", "View Original")}</span>
            </a>
          )}

          {/* Actions */}
          <button className="w-10 h-10 rounded-lg bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-lg bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-lg bg-secondary/50 border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Split Screen Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 overflow-hidden">
        {/* Left: PDF Preview */}
        <div className="glass-card flex flex-col overflow-hidden">
          {/* PDF Controls */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-sm text-muted-foreground">Document Preview</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-mono w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PDF Content Simulation */}
          <div className="flex-1 overflow-auto p-6 bg-secondary/20">
            <div
              className="bg-card/80 rounded-lg p-8 shadow-lg mx-auto transition-transform"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", maxWidth: "600px" }}
            >
              <div className="space-y-6">
                <div className="text-center border-b border-border pb-6">
                  <h1 className="text-2xl font-bold text-primary mb-2">{docTitle}</h1>
                  <p className="text-sm text-muted-foreground mt-4">Document ID: {docId || 'N/A'}</p>
                </div>

                {/* Show document content - supports both legacy (ocr_text) and Knowledge Hub (content_chunk) */}
                {(document?.ocr_text || document?.content_chunk) ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Extracted Content</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {(() => {
                        const text = document.ocr_text || document.content_chunk || "";
                        return text.length > 1500 ? text.substring(0, 1500) + "..." : text;
                      })()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      AI-Generated Summary
                    </h3>
                    {loading ? (
                      <div className="space-y-4 py-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <p className="text-sm font-medium text-primary">Generating AI insights...</p>
                        </div>
                        {/* Skeleton loader */}
                        <div className="space-y-3">
                          <div className="h-4 bg-secondary/50 rounded animate-pulse w-full"></div>
                          <div className="h-4 bg-secondary/50 rounded animate-pulse w-5/6"></div>
                          <div className="h-4 bg-secondary/50 rounded animate-pulse w-4/6"></div>
                        </div>
                        <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                          <div className="h-3 bg-secondary/50 rounded animate-pulse w-1/3 mb-2"></div>
                          <div className="h-3 bg-secondary/50 rounded animate-pulse w-1/2"></div>
                        </div>
                      </div>
                    ) : viewMode === "engineer" && engineerInsights ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground italic mb-4">
                          Original document content not available. Showing AI analysis:
                        </p>
                        {engineerInsights.summary.map((item, i) => (
                          <p key={i} className="text-sm text-foreground leading-relaxed border-l-2 border-primary/50 pl-4">
                            • {item}
                          </p>
                        ))}
                        {engineerInsights.specs.length > 0 && (
                          <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">KEY SPECIFICATIONS</p>
                            {engineerInsights.specs.map((spec, i) => (
                              <p key={i} className="text-sm">
                                <span className="font-medium">{spec.label}:</span> {spec.value}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : viewMode === "manager" && managerInsights ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground italic mb-4">
                          Original document content not available. Showing AI analysis:
                        </p>
                        <p className="text-sm text-foreground leading-relaxed border-l-2 border-primary/50 pl-4">
                          {managerInsights.summary}
                        </p>
                        {managerInsights.financials.length > 0 && (
                          <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">FINANCIAL OVERVIEW</p>
                            {managerInsights.financials.map((item, i) => (
                              <p key={i} className="text-sm">
                                <span className="font-medium">{item.label}:</span> {item.value}
                                {item.change && <span className="text-xs ml-2">({item.change})</span>}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : otherInsights && ["operator", "safety_officer", "maintenance", "quality"].includes(viewMode) ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground italic mb-4">
                          Original document content not available. Showing AI analysis:
                        </p>
                        {/* Display summary */}
                        {otherInsights.summary && (
                          <div className="space-y-2">
                            {Array.isArray(otherInsights.summary) ? (
                              otherInsights.summary.map((item: string, i: number) => (
                                <p key={i} className="text-sm text-foreground leading-relaxed border-l-2 border-primary/50 pl-4">
                                  • {item}
                                </p>
                              ))
                            ) : (
                              <p className="text-sm text-foreground leading-relaxed border-l-2 border-primary/50 pl-4">
                                {otherInsights.summary}
                              </p>
                            )}
                          </div>
                        )}
                        {/* Display key points if available */}
                        {otherInsights.key_points && otherInsights.key_points.length > 0 && (
                          <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">KEY POINTS</p>
                            {otherInsights.key_points.map((point: string, i: number) => (
                              <p key={i} className="text-sm">• {point}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Click "Regenerate" to generate AI insights</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Insights */}
        <div className="glass-card flex flex-col overflow-hidden">
          {/* Role Toggle */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold">AI Insights</span>
              </div>
              <span className="text-xs text-muted-foreground">Powered by Gemini</span>
            </div>

            {/* Role Dropdown */}
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <SelectTrigger className="w-full bg-secondary/50 border-border">
                <div className="flex items-center gap-2">
                  {viewMode === "engineer" && <Wrench className="w-4 h-4 text-primary" />}
                  {viewMode === "manager" && <Briefcase className="w-4 h-4 text-primary" />}
                  {viewMode === "operator" && <Gauge className="w-4 h-4 text-primary" />}
                  {viewMode === "safety_officer" && <AlertTriangle className="w-4 h-4 text-primary" />}
                  {viewMode === "maintenance" && <Wrench className="w-4 h-4 text-primary" />}
                  {viewMode === "quality" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  <SelectValue placeholder="Select Role View" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engineer">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    <span>Engineer View</span>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Manager View</span>
                  </div>
                </SelectItem>
                <SelectItem value="operator">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    <span>Operator View</span>
                  </div>
                </SelectItem>
                <SelectItem value="safety_officer">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Safety Officer View</span>
                  </div>
                </SelectItem>
                <SelectItem value="maintenance">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    <span>Maintenance Tech View</span>
                  </div>
                </SelectItem>
                <SelectItem value="quality">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Quality Inspector View</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Insights Content */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {loading ? (
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <p className="text-sm font-medium text-primary">Generating AI insights...</p>
                </div>
                {/* Skeleton loader */}
                <div className="space-y-3">
                  <div className="h-4 bg-secondary/50 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-secondary/50 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-secondary/50 rounded animate-pulse w-4/6"></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="h-3 bg-secondary/50 rounded animate-pulse w-2/3 mb-2"></div>
                    <div className="h-4 bg-secondary/50 rounded animate-pulse w-1/2"></div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="h-3 bg-secondary/50 rounded animate-pulse w-2/3 mb-2"></div>
                    <div className="h-4 bg-secondary/50 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : viewMode === "engineer" && engineerInsights ? (
              <>
                {/* Technical Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Technical Summary
                  </h4>
                  <ul className="space-y-2">
                    {engineerInsights.summary.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg group cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => handleCopyInsight(item)}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm flex-1">{item}</span>
                        <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Specs Grid */}
                {engineerInsights.specs.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      Key Specifications
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {engineerInsights.specs.map((spec) => {
                        const Icon = getSpecIcon(spec.label);
                        return (
                          <div key={spec.label} className="p-3 bg-secondary/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{spec.label}</span>
                            </div>
                            <p className="font-mono font-semibold">{spec.value}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Compliance */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Compliance Status
                  </h4>
                  <div className={`p-4 border rounded-lg ${engineerInsights.compliance.status === "PASS"
                    ? "bg-success/10 border-success/30"
                    : engineerInsights.compliance.status === "FAIL"
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-warning/10 border-warning/30"
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-semibold flex items-center gap-2 ${engineerInsights.compliance.status === "PASS" ? "text-success" :
                        engineerInsights.compliance.status === "FAIL" ? "text-destructive" : "text-warning"
                        }`}>
                        <CheckCircle2 className="w-5 h-5" />
                        {engineerInsights.compliance.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Next audit: {engineerInsights.compliance.nextAudit}
                      </span>
                    </div>
                    {engineerInsights.compliance.standards.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {engineerInsights.compliance.standards.map((std) => (
                          <span key={std} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                            {std}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Risks */}
                {engineerInsights.risks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Risk Factors
                    </h4>
                    {engineerInsights.risks.map((risk, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${risk.severity === "high"
                          ? "bg-destructive/10 border-destructive/30"
                          : risk.severity === "medium"
                            ? "bg-warning/10 border-warning/30"
                            : "bg-success/10 border-success/30"
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold uppercase ${risk.severity === "high" ? "text-destructive" :
                            risk.severity === "medium" ? "text-warning" : "text-success"
                            }`}>
                            {risk.severity}
                          </span>
                        </div>
                        <p className="text-sm">{risk.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : viewMode === "manager" && managerInsights ? (
              <>
                {/* Executive Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Executive Summary
                  </h4>
                  <p className="text-sm text-muted-foreground p-4 bg-secondary/30 rounded-lg leading-relaxed">
                    {managerInsights.summary}
                  </p>
                </div>

                {/* Financial Metrics */}
                {managerInsights.financials.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Financial Overview
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {managerInsights.financials.map((item) => (
                        <div key={item.label} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                          </div>
                          <p className="font-mono font-semibold text-lg">{item.value}</p>
                          {item.change && (
                            <span className={`text-xs ${item.change.startsWith("+") ? "text-destructive" : "text-success"
                              }`}>
                              {item.change}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Risks */}
                {managerInsights.risks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-warning flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Risk Assessment
                    </h4>
                    {managerInsights.risks.map((risk, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${risk.level === "HIGH"
                          ? "bg-destructive/10 border-destructive/30"
                          : risk.level === "MEDIUM"
                            ? "bg-warning/10 border-warning/30"
                            : "bg-success/10 border-success/30"
                          }`}
                      >
                        <span className={`text-xs font-semibold ${risk.level === "HIGH" ? "text-destructive" :
                          risk.level === "MEDIUM" ? "text-warning" : "text-success"
                          }`}>
                          {risk.level} RISK
                        </span>
                        <p className="text-sm mt-1">{risk.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {managerInsights.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-success flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Recommended Actions
                    </h4>
                    <ul className="space-y-2">
                      {managerInsights.recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                        >
                          <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-success">{i + 1}</span>
                          </div>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t border-border">
                  <div className="flex gap-3">
                    <button
                      onClick={() => toast({ title: "Report Generated", description: "Executive summary exported to PDF" })}
                      className="flex-1 py-3 px-4 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">Export Summary</span>
                    </button>
                    <button
                      onClick={() => toast({ title: "Shared", description: "Link copied to clipboard" })}
                      className="flex-1 py-3 px-4 bg-secondary/50 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm font-medium">Share Insights</span>
                    </button>
                  </div>
                </div>
              </>
            ) : otherInsights && ["operator", "safety_officer", "maintenance", "quality"].includes(viewMode) ? (
              <>
                {/* Generic Role Insights Display */}
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4" />
                      {viewMode.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} Analysis
                    </h4>

                    {/* Summary Section */}
                    {otherInsights.summary && (
                      <div className="space-y-2 mb-4">
                        {Array.isArray(otherInsights.summary) ? (
                          otherInsights.summary.map((item: string, i: number) => (
                            <p key={i} className="text-sm flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              {item}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm">{otherInsights.summary}</p>
                        )}
                      </div>
                    )}

                    {/* Key Points */}
                    {otherInsights.key_points && (
                      <div className="mt-4">
                        <h5 className="text-xs font-semibold text-muted-foreground mb-2">KEY POINTS</h5>
                        <ul className="space-y-1">
                          {otherInsights.key_points.map((point: string, i: number) => (
                            <li key={i} className="text-sm text-foreground">• {point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {otherInsights.recommendations && otherInsights.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-xs font-semibold text-success mb-2">RECOMMENDATIONS</h5>
                        <ul className="space-y-1">
                          {otherInsights.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm text-foreground flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-success" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risks/Warnings */}
                    {otherInsights.risks && otherInsights.risks.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-xs font-semibold text-warning mb-2">RISKS & WARNINGS</h5>
                        <ul className="space-y-1">
                          {otherInsights.risks.map((risk: any, i: number) => (
                            <li key={i} className="text-sm text-foreground flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-warning" />
                              {typeof risk === 'string' ? risk : risk.text || risk.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Sparkles className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  {docId ? "Loading insights..." : "Select a document to view AI insights"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
