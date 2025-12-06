import { useAuth } from "@/contexts/AuthContext";
import { Shield, Briefcase, Wrench, AlertTriangle } from "lucide-react";

interface DocumentAnalysis {
  technical: string;
  business: string;
  compliance: string[];
  risks: string[];
}

const sampleDoc: DocumentAnalysis = {
  technical: "Boiler B7 operating at 105°C, pressure 402 PSI. Valve V-12 requires calibration per spec BIS-2825.",
  business: "Equipment maintenance required within 48 hours to prevent 12-hour downtime ($45K revenue impact). Spare parts available in inventory.",
  compliance: ["Factory Act 1948 - Section 31A", "Boiler Regulation 2017 - Clause 8.2"],
  risks: ["Pressure variance exceeds 5% threshold", "Missing safety valve inspection certificate"]
};

export function RoleBasedView() {
  const { user } = useAuth();

  const getViewForRole = () => {
    switch (user?.role) {
      case "engineer":
        return (
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Engineer View</h3>
            </div>
            <p className="text-sm font-mono bg-secondary/50 p-4 rounded-lg">{sampleDoc.technical}</p>
          </div>
        );

      case "manager":
        return (
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-success" />
              <h3 className="font-semibold">Manager View - Business Impact</h3>
            </div>
            <p className="text-sm bg-secondary/50 p-4 rounded-lg">{sampleDoc.business}</p>
          </div>
        );

      case "safety_officer":
        return (
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">Compliance Watchdog</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Regulations</p>
                {sampleDoc.compliance.map((reg, i) => (
                  <div key={i} className="text-sm bg-success/20 text-success px-3 py-1 rounded mb-1">
                    ✓ {reg}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Risks Detected</p>
                {sampleDoc.risks.map((risk, i) => (
                  <div key={i} className="text-sm bg-destructive/20 text-destructive px-3 py-1 rounded mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    {risk}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div className="glass-card p-6">Select a role to view document analysis</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-lg w-fit">
        <span className="text-sm">Current Role:</span>
        <span className="text-sm font-semibold text-primary capitalize">{user?.role?.replace("_", " ")}</span>
      </div>
      {getViewForRole()}
    </div>
  );
}
