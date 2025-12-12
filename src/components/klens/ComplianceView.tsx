import { useState } from "react";
import { 
  Shield, FileCheck, AlertTriangle, Clock, RotateCcw, Lock, Users, CheckCircle2,
  XCircle, Hash, TrendingUp, Award, FileText, Calendar, Target, AlertCircle,
  CheckSquare, BookOpen, Scale, Briefcase, Activity, BarChart3, Eye, Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const auditLogs = [
  { id: 1, user: "Eng. Rajesh", action: "MODIFIED", target: "Boiler_Specs_v3.pdf", time: "2 min ago", hash: "7f8a2b...", severity: "medium" },
  { id: 2, user: "Sarah Chen", action: "APPROVED", target: "Vendor Payment #442", time: "15 min ago", hash: "3c9d1e...", severity: "low" },
  { id: 3, user: "System", action: "FLAGGED", target: "Safety_Log_Q4.pdf", time: "1 hour ago", hash: "a2f8c4...", severity: "high" },
  { id: 4, user: "Rajesh", action: "DELETED", target: "Obsolete_Manual.pdf", time: "3 hours ago", hash: "9b7e3f...", revertable: true, severity: "medium" },
  { id: 5, user: "Admin", action: "RESTORED", target: "Critical_Report.xlsx", time: "Yesterday", hash: "5d2a8c...", severity: "low" },
];

const pendingApprovals = [
  { id: 1, title: "Delete Safety Log v1", requester: "Eng. Rajesh", current: 0, required: 2, type: "critical" },
  { id: 2, title: "Modify Access Permissions", requester: "IT Admin", current: 1, required: 2, type: "security" },
  { id: 3, title: "Export Compliance Report", requester: "Legal Team", current: 2, required: 2, type: "data" },
];

const regulations = [
  { name: "ISO 9001:2015", status: "compliant", lastAudit: "2024-01-15", nextAudit: "2024-07-15", score: 98 },
  { name: "OSHA 1910", status: "compliant", lastAudit: "2024-02-01", nextAudit: "2024-08-01", score: 95 },
  { name: "Factory Act 1948", status: "review", lastAudit: "2023-12-10", nextAudit: "2024-06-10", score: 88 },
  { name: "ISO 14001", status: "compliant", lastAudit: "2024-01-20", nextAudit: "2024-07-20", score: 92 },
];

const riskMatrix = [
  { category: "Safety", level: "low", count: 3, trend: "down" },
  { category: "Environmental", level: "medium", count: 7, trend: "stable" },
  { category: "Operational", level: "low", count: 2, trend: "down" },
  { category: "Financial", level: "high", count: 1, trend: "up" },
];

export function ComplianceView() {
  const [showQuorumPopup, setShowQuorumPopup] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"overview" | "audits" | "regulations" | "risks">("overview");

  const handleDeleteAttempt = () => {
    setShowQuorumPopup(true);
    toast({
      variant: "destructive",
      title: "Action Restricted",
      description: "Multi-Signature approval required (0/2)",
    });
  };

  const handleApprove = (id: number) => {
    toast({
      title: "Approval Submitted",
      description: "Your signature has been recorded on the blockchain.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modern Header */}
      <div className="glass-card p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-success/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-success flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Compliance & Governance
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Regulatory tracking, audit trails, and risk management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-success/10 rounded-xl border border-success/30">
              <span className="text-xs text-muted-foreground block">Compliance Score</span>
              <span className="text-lg font-bold text-success">94.2%</span>
            </div>
            <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/30">
              <span className="text-xs text-muted-foreground block">Risk Level</span>
              <span className="text-lg font-bold text-primary">Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 glass-card p-2 rounded-xl border border-border/50">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "audits", label: "Audit Trail", icon: FileCheck },
          { id: "regulations", label: "Regulations", icon: Scale },
          { id: "risks", label: "Risk Matrix", icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              selectedTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Audits", value: "1,247", icon: FileCheck, color: "primary", change: "+12%" },
              { label: "Pending Actions", value: "8", icon: Clock, color: "warning", change: "-3%" },
              { label: "Active Risks", value: "13", icon: AlertTriangle, color: "destructive", change: "-8%" },
              { label: "Certifications", value: "24", icon: Award, color: "success", change: "+2" },
            ].map((stat) => {
              const bgClass = stat.color === 'success' ? 'from-success/10 to-emerald-600/10' : stat.color === 'primary' ? 'from-primary/10 to-cyan-500/10' : stat.color === 'warning' ? 'from-warning/10 to-orange-500/10' : 'from-destructive/10 to-red-600/10';
              const textClass = stat.color === 'success' ? 'text-success' : stat.color === 'primary' ? 'text-primary' : stat.color === 'warning' ? 'text-warning' : 'text-destructive';
              const iconBg = stat.color === 'success' ? 'from-success to-emerald-600' : stat.color === 'primary' ? 'from-primary to-cyan-500' : stat.color === 'warning' ? 'from-warning to-orange-500' : 'from-destructive to-red-600';
              
              return (
                <div key={stat.label} className={`glass-card p-5 rounded-xl border border-${stat.color}/20 bg-gradient-to-br ${bgClass} hover:scale-[1.02] transition-transform`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs font-bold ${textClass}`}>{stat.change}</span>
                  </div>
                  <p className={`text-2xl font-bold font-mono ${textClass}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Audits */}
            <div className="glass-card p-6 rounded-xl border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </h3>
                <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                  View All <Eye className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3">
                {auditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{log.user}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          log.action === "DELETED" ? "bg-destructive/20 text-destructive" :
                          log.action === "FLAGGED" ? "bg-warning/20 text-warning" :
                          log.action === "APPROVED" ? "bg-success/20 text-success" :
                          "bg-primary/20 text-primary"
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{log.target}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="glass-card p-6 rounded-xl border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Multi-Signature Queue
                </h3>
                <span className="text-xs text-muted-foreground">2/3 required</span>
              </div>
              <div className="space-y-3">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className={`p-4 rounded-lg border ${
                      approval.current >= approval.required
                        ? "bg-success/5 border-success/30"
                        : "bg-secondary/30 border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-sm">{approval.title}</h4>
                        <p className="text-xs text-muted-foreground">by {approval.requester}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        approval.type === "critical" ? "bg-destructive/20 text-destructive" :
                        approval.type === "security" ? "bg-warning/20 text-warning" :
                        "bg-primary/20 text-primary"
                      }`}>
                        {approval.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            approval.current >= approval.required ? "bg-success" : "bg-primary"
                          }`}
                          style={{ width: `${(approval.current / approval.required) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{approval.current}/{approval.required}</span>
                      {approval.current < approval.required ? (
                        <button
                          onClick={() => handleApprove(approval.id)}
                          className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-lg hover:bg-primary/30"
                        >
                          Sign
                        </button>
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Audit Trail Tab */}
      {selectedTab === "audits" && (
        <div className="glass-card p-6 rounded-xl border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              Immutable Audit Trail
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 text-sm font-medium">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      log.severity === "high" ? "bg-destructive/20" :
                      log.severity === "medium" ? "bg-warning/20" :
                      "bg-success/20"
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        log.severity === "high" ? "text-destructive" :
                        log.severity === "medium" ? "text-warning" :
                        "text-success"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{log.user}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          log.action === "DELETED" ? "bg-destructive/20 text-destructive" :
                          log.action === "FLAGGED" ? "bg-warning/20 text-warning" :
                          log.action === "APPROVED" ? "bg-success/20 text-success" :
                          "bg-primary/20 text-primary"
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{log.target}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs font-mono text-muted-foreground">Hash: {log.hash}</span>
                  {log.revertable && (
                    <button
                      onClick={() => toast({ title: "Revert initiated" })}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Revert
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulations Tab */}
      {selectedTab === "regulations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regulations.map((reg) => (
            <div key={reg.name} className="glass-card p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    reg.status === "compliant" ? "bg-success/20" : "bg-warning/20"
                  }`}>
                    <Scale className={`w-6 h-6 ${
                      reg.status === "compliant" ? "text-success" : "text-warning"
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-bold">{reg.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      reg.status === "compliant" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                    }`}>
                      {reg.status === "compliant" ? "Compliant" : "Under Review"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-success">{reg.score}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Audit:</span>
                  <span className="font-medium">{reg.lastAudit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Audit:</span>
                  <span className="font-medium text-primary">{reg.nextAudit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Risk Matrix Tab */}
      {selectedTab === "risks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskMatrix.map((risk) => (
            <div key={risk.category} className="glass-card p-5 rounded-xl border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    risk.level === "high" ? "bg-destructive/20" :
                    risk.level === "medium" ? "bg-warning/20" :
                    "bg-success/20"
                  }`}>
                    <AlertCircle className={`w-6 h-6 ${
                      risk.level === "high" ? "text-destructive" :
                      risk.level === "medium" ? "text-warning" :
                      "text-success"
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-bold">{risk.category}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      risk.level === "high" ? "bg-destructive/20 text-destructive" :
                      risk.level === "medium" ? "bg-warning/20 text-warning" :
                      "bg-success/20 text-success"
                    }`}>
                      {risk.level.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{risk.count}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className={`w-3 h-3 ${
                      risk.trend === "up" ? "text-destructive rotate-0" :
                      risk.trend === "down" ? "text-success rotate-180" :
                      "text-muted-foreground rotate-90"
                    }`} />
                    <span className="text-muted-foreground">{risk.trend}</span>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    risk.level === "high" ? "bg-destructive" :
                    risk.level === "medium" ? "bg-warning" :
                    "bg-success"
                  }`}
                  style={{ width: `${(risk.count / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quorum Popup */}
      {showQuorumPopup && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-8 max-w-md mx-4 animate-scale-in rounded-2xl border border-primary/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-destructive/20 flex items-center justify-center">
                <Lock className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Access Restricted</h3>
                <p className="text-muted-foreground">Multi-Sig Required</p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-sm">
                This action requires <span className="text-primary font-semibold">2 of 3</span> authorized signatures.
              </p>
              <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-card" />
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-card" />
                  <div className="w-8 h-8 rounded-full bg-primary border-2 border-card flex items-center justify-center">
                    <span className="text-[10px] font-bold text-background">+1</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">0/2 Signatures</p>
                  <p className="text-xs text-muted-foreground">Waiting for Manager approval</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuorumPopup(false)}
                className="flex-1 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowQuorumPopup(false);
                  toast({ title: "Request Submitted", description: "Awaiting manager approval." });
                }}
                className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Request Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
