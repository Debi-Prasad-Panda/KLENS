import { useState } from "react";
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
  Languages,
  Sparkles,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DocumentViewerProps {
  onBack: () => void;
}

const technicalInsights = {
  summary: [
    "Maximum operating pressure: 450 PSI at 120°C",
    "Maintenance interval: Every 2,000 operational hours",
    "Safety valve calibration required quarterly"
  ],
  specs: [
    { label: "Model", value: "B7-Industrial", icon: FileText },
    { label: "Max Temp", value: "120°C", icon: Thermometer },
    { label: "Max Pressure", value: "450 PSI", icon: Gauge },
    { label: "Service Life", value: "15 years", icon: Clock },
  ],
  compliance: {
    status: "PASS",
    standards: ["ISO 9001:2015", "ASME BPVC", "API 510"],
    lastAudit: "Oct 2024",
    nextAudit: "Apr 2025"
  },
  risks: [
    { severity: "high", text: "Pressure relief valve must be tested monthly" },
    { severity: "medium", text: "Insulation degradation check at 5-year mark" },
  ]
};

const managerialInsights = {
  summary: "This boiler unit represents a $2.4M capital asset with 8 years remaining useful life. Current maintenance compliance is at 94%, with an estimated annual operating cost of $180K.",
  financials: [
    { label: "Asset Value", value: "$2.4M", change: "-8% YoY", icon: DollarSign },
    { label: "Annual OpEx", value: "$180K", change: "+3% YoY", icon: TrendingUp },
    { label: "Downtime Cost", value: "$45K/day", change: null, icon: Clock },
    { label: "Insurance Premium", value: "$28K/yr", change: "-5% YoY", icon: Briefcase },
  ],
  risks: [
    { level: "MEDIUM", text: "Equipment approaching mid-life maintenance cycle - budget $120K for overhaul in Q2 2025" },
    { level: "LOW", text: "Insurance renewal due in March - recommend competitive quotes" },
  ],
  recommendations: [
    "Approve preventive maintenance budget allocation",
    "Schedule downtime for Q2 overhaul (3-5 days)",
    "Review vendor contracts for parts supply"
  ]
};

export function DocumentViewer({ onBack }: DocumentViewerProps) {
  const [viewMode, setViewMode] = useState<"engineer" | "manager">("engineer");
  const [zoom, setZoom] = useState(100);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

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
              Boiler_B7_Specifications.pdf
            </h2>
            <p className="text-sm text-muted-foreground">102 pages • Last updated: Nov 2024</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-2 px-3 py-2 glass-card">
            <Languages className="w-4 h-4 text-primary" />
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                toast({ title: "Language Changed", description: `Translating to ${e.target.value}...` });
              }}
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Malayalam">മലയാളം</option>
              <option value="Hindi">हिंदी</option>
              <option value="Tamil">தமிழ்</option>
            </select>
          </div>

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
            <span className="text-sm text-muted-foreground">Page 1 of 102</span>
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
              {/* Simulated PDF Content */}
              <div className="space-y-6">
                <div className="text-center border-b border-border pb-6">
                  <h1 className="text-2xl font-bold text-primary mb-2">BOILER B7</h1>
                  <h2 className="text-lg text-muted-foreground">Technical Specifications & Maintenance Manual</h2>
                  <p className="text-sm text-muted-foreground mt-4">Document ID: BSM-2024-B7-001</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">1. Overview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The B7 Industrial Boiler is a high-efficiency steam generation unit designed for 
                    continuous operation in industrial environments. This document outlines operational 
                    parameters, maintenance schedules, and safety protocols.
                  </p>

                  <h3 className="text-lg font-semibold mt-6">2. Technical Specifications</h3>
                  <div className="bg-secondary/30 rounded-lg p-4 font-mono text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Model:</span>
                      <span>B7-Industrial</span>
                      <span className="text-muted-foreground">Capacity:</span>
                      <span>15,000 kg/hr</span>
                      <span className="text-muted-foreground">Max Pressure:</span>
                      <span className="text-destructive">450 PSI</span>
                      <span className="text-muted-foreground">Max Temperature:</span>
                      <span className="text-destructive">120°C</span>
                      <span className="text-muted-foreground">Fuel Type:</span>
                      <span>Natural Gas / Diesel</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg mt-4">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">
                      WARNING: Operating beyond specified parameters may result in equipment failure or safety hazards.
                    </p>
                  </div>
                </div>
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

            {/* Toggle Switch */}
            <div className="flex items-center p-1 bg-secondary/50 rounded-xl">
              <button
                onClick={() => setViewMode("engineer")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all ${
                  viewMode === "engineer"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span className="text-sm font-medium">Engineer View</span>
              </button>
              <button
                onClick={() => setViewMode("manager")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all ${
                  viewMode === "manager"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">Manager View</span>
              </button>
            </div>
          </div>

          {/* Insights Content */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {viewMode === "engineer" ? (
              <>
                {/* Technical Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Technical Summary
                  </h4>
                  <ul className="space-y-2">
                    {technicalInsights.summary.map((item, i) => (
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
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Key Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {technicalInsights.specs.map((spec) => (
                      <div key={spec.label} className="p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <spec.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{spec.label}</span>
                        </div>
                        <p className="font-mono font-semibold">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Compliance Status
                  </h4>
                  <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-success font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        {technicalInsights.compliance.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Next audit: {technicalInsights.compliance.nextAudit}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {technicalInsights.compliance.standards.map((std) => (
                        <span key={std} className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Technical Risks */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Factors
                  </h4>
                  {technicalInsights.risks.map((risk, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        risk.severity === "high"
                          ? "bg-destructive/10 border-destructive/30"
                          : "bg-warning/10 border-warning/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold uppercase ${
                          risk.severity === "high" ? "text-destructive" : "text-warning"
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                      <p className="text-sm">{risk.text}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Executive Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Executive Summary
                  </h4>
                  <p className="text-sm text-muted-foreground p-4 bg-secondary/30 rounded-lg leading-relaxed">
                    {managerialInsights.summary}
                  </p>
                </div>

                {/* Financial Metrics */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Financial Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {managerialInsights.financials.map((item) => (
                      <div key={item.label} className="p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                        <p className="font-mono font-semibold text-lg">{item.value}</p>
                        {item.change && (
                          <span className={`text-xs ${
                            item.change.startsWith("+") ? "text-destructive" : "text-success"
                          }`}>
                            {item.change}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Risks */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-warning flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Assessment
                  </h4>
                  {managerialInsights.risks.map((risk, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        risk.level === "MEDIUM"
                          ? "bg-warning/10 border-warning/30"
                          : "bg-success/10 border-success/30"
                      }`}
                    >
                      <span className={`text-xs font-semibold ${
                        risk.level === "MEDIUM" ? "text-warning" : "text-success"
                      }`}>
                        {risk.level} RISK
                      </span>
                      <p className="text-sm mt-1">{risk.text}</p>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {managerialInsights.recommendations.map((rec, i) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
