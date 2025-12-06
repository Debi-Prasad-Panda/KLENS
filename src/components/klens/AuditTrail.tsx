import { GitBranch, Eye, Edit, Trash2, RotateCcw } from "lucide-react";

interface AuditLog {
  id: string;
  action: "view" | "edit" | "delete" | "revert";
  user: string;
  document: string;
  timestamp: string;
  version: string;
}

const logs: AuditLog[] = [
  { id: "1", action: "edit", user: "Eng. Rajesh", document: "Boiler Manual v2.3", timestamp: "2 min ago", version: "v2.3" },
  { id: "2", action: "view", user: "Safety Officer", document: "Audit Report 2024", timestamp: "15 min ago", version: "v1.0" },
  { id: "3", action: "revert", user: "Admin", document: "Safety Protocol", timestamp: "1 hour ago", version: "v3.1 → v3.0" },
  { id: "4", action: "delete", user: "Manager", document: "Old Maintenance Log", timestamp: "2 hours ago", version: "v1.5" }
];

export function AuditTrail() {
  const getIcon = (action: string) => {
    switch (action) {
      case "view": return <Eye className="w-4 h-4 text-primary" />;
      case "edit": return <Edit className="w-4 h-4 text-warning" />;
      case "delete": return <Trash2 className="w-4 h-4 text-destructive" />;
      case "revert": return <RotateCcw className="w-4 h-4 text-success" />;
      default: return null;
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <GitBranch className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-semibold">Git-Style Audit Trail</h3>
          <p className="text-sm text-muted-foreground">Immutable version history</p>
        </div>
      </div>

      <div className="space-y-3">
        {logs.map((log, idx) => (
          <div key={log.id} className="relative">
            {idx !== logs.length - 1 && (
              <div className="absolute left-[11px] top-8 w-0.5 h-full bg-border" />
            )}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center relative z-10">
                {getIcon(log.action)}
              </div>
              <div className="flex-1 bg-secondary/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{log.action}</span>
                  <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{log.document}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">{log.user}</span>
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded font-mono">
                    {log.version}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
        View Full History
      </button>
    </div>
  );
}
