import { useState } from "react";
import { Shield, Users, CheckCircle2, XCircle } from "lucide-react";

interface Approver {
  id: string;
  name: string;
  role: string;
  approved: boolean | null;
}

export function NuclearKeys() {
  const [approvers, setApprovers] = useState<Approver[]>([
    { id: "1", name: "Admin 1", role: "System Admin", approved: null },
    { id: "2", name: "Admin 2", role: "Safety Lead", approved: null },
    { id: "3", name: "Admin 3", role: "Operations Head", approved: null }
  ]);

  const requiredApprovals = 2;
  const currentApprovals = approvers.filter(a => a.approved === true).length;
  const isApproved = currentApprovals >= requiredApprovals;

  const handleApprove = (id: string, decision: boolean) => {
    setApprovers(prev => prev.map(a => 
      a.id === id ? { ...a, approved: decision } : a
    ));
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold">Nuclear Keys - Quorum Approval</h3>
          <p className="text-sm text-muted-foreground">
            High-risk action requires {requiredApprovals} of {approvers.length} approvals
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <p className="text-sm font-medium text-destructive">⚠️ Delete Safety Log #442 - Boiler B7 Incident</p>
        <p className="text-xs text-muted-foreground mt-1">This action cannot be undone</p>
      </div>

      <div className="space-y-3 mb-6">
        {approvers.map((approver) => (
          <div key={approver.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{approver.name}</p>
                <p className="text-xs text-muted-foreground">{approver.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {approver.approved === null ? (
                <>
                  <button
                    onClick={() => handleApprove(approver.id, true)}
                    className="px-3 py-1 bg-success/20 text-success rounded text-xs hover:bg-success/30"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApprove(approver.id, false)}
                    className="px-3 py-1 bg-destructive/20 text-destructive rounded text-xs hover:bg-destructive/30"
                  >
                    Reject
                  </button>
                </>
              ) : approver.approved ? (
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs">Approved</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-destructive">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs">Rejected</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
        <span className="text-sm">Approval Status: {currentApprovals}/{requiredApprovals}</span>
        {isApproved ? (
          <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90">
            Execute Action
          </button>
        ) : (
          <button disabled className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium cursor-not-allowed">
            Awaiting Approval
          </button>
        )}
      </div>
    </div>
  );
}
