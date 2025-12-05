import { useState } from "react";
import { 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  RotateCcw,
  Lock,
  Users,
  CheckCircle2,
  XCircle,
  Hash
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const auditLogs = [
  { id: 1, user: "Eng. Rajesh", action: "MODIFIED", target: "Boiler_Specs_v3.pdf", time: "2 min ago", hash: "7f8a2b..." },
  { id: 2, user: "Sarah Chen", action: "APPROVED", target: "Vendor Payment #442", time: "15 min ago", hash: "3c9d1e..." },
  { id: 3, user: "System", action: "FLAGGED", target: "Safety_Log_Q4.pdf", time: "1 hour ago", hash: "a2f8c4..." },
  { id: 4, user: "Rajesh", action: "DELETED", target: "Obsolete_Manual.pdf", time: "3 hours ago", hash: "9b7e3f...", revertable: true },
  { id: 5, user: "Admin", action: "RESTORED", target: "Critical_Report.xlsx", time: "Yesterday", hash: "5d2a8c..." },
];

const pendingApprovals = [
  { id: 1, title: "Delete Safety Log v1", requester: "Eng. Rajesh", current: 0, required: 2, type: "critical" },
  { id: 2, title: "Modify Access Permissions", requester: "IT Admin", current: 1, required: 2, type: "security" },
  { id: 3, title: "Export Compliance Report", requester: "Legal Team", current: 2, required: 2, type: "data" },
];

export function ComplianceView() {
  const [showQuorumPopup, setShowQuorumPopup] = useState(false);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Center</h2>
          <p className="text-muted-foreground mt-1">
            Audit trails, governance, and multi-signature approvals
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass-card">
          <Shield className="w-4 h-4 text-success" />
          <span className="text-sm font-mono">
            Compliance Score: <span className="text-success font-bold">94.2%</span>
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Audits", value: "1,247", icon: FileCheck, color: "primary" },
          { label: "Pending Actions", value: "8", icon: Clock, color: "warning" },
          { label: "Violations", value: "3", icon: AlertTriangle, color: "destructive" },
          { label: "Auto-Resolved", value: "156", icon: CheckCircle2, color: "success" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-${stat.color}/20 flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}`} />
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold font-mono text-${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Trail */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              Immutable Audit Trail
            </h3>
            <button className="text-xs text-primary hover:text-primary/80 transition-colors">
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition-colors"
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
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    Hash: {log.hash}
                  </span>
                  {log.revertable && (
                    <button
                      onClick={() => toast({ title: "Revert initiated", description: "Reverting changes..." })}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
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

        {/* Quorum Approvals */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Multi-Signature Queue
            </h3>
            <span className="text-xs text-muted-foreground">Requires 2/3 signatures</span>
          </div>
          <div className="space-y-4">
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
                    <p className="text-xs text-muted-foreground">
                      Requested by {approval.requester}
                    </p>
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
                  <span className="text-xs font-mono">
                    {approval.current}/{approval.required}
                  </span>
                  {approval.current < approval.required ? (
                    <button
                      onClick={() => handleApprove(approval.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
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

          {/* Demo Delete Button */}
          <div className="mt-6 pt-4 border-t border-border">
            <button
              onClick={handleDeleteAttempt}
              className="w-full py-3 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Attempt Critical Delete (Demo)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quorum Popup */}
      {showQuorumPopup && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-8 max-w-md mx-4 animate-scale-in">
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
