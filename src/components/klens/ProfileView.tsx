import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Briefcase, Shield, Clock, Key, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

export function ProfileView() {
  const { user, cinderellaAccess, grantCinderellaAccess } = useAuth();
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGrantAccess = async () => {
    if (!user) return;
    setLoading(true);
    setMessage("");
    try {
      await api.grantCinderellaAccess(Number(user.id), duration);
      grantCinderellaAccess(duration);
      setMessage("Cinderella access granted successfully!");
    } catch (error) {
      setMessage("Failed to grant access");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-destructive/20 text-destructive";
      case "manager": return "bg-primary/20 text-primary";
      case "engineer": return "bg-success/20 text-success";
      case "safety_officer": return "bg-warning/20 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account and security settings</p>
      </div>

      {/* User Info Card */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
            <User className="w-12 h-12 text-background" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">{user?.name}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm">{user?.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${getRoleBadgeColor(user?.role || '')}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cinderella Access */}
      {user?.role === 'admin' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-warning" />
            <div>
              <h3 className="font-semibold">Cinderella Access</h3>
              <p className="text-sm text-muted-foreground">Grant temporary elevated privileges</p>
            </div>
          </div>

          {cinderellaAccess ? (
            <div className="p-4 bg-warning/20 border border-warning/50 rounded-lg">
              <p className="text-sm font-medium text-warning mb-2">Active Cinderella Access</p>
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(cinderellaAccess.expiresAt).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Granted by: {cinderellaAccess.grantedBy}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  min="15"
                  max="480"
                />
              </div>
              <button
                onClick={handleGrantAccess}
                disabled={loading}
                className="px-4 py-2 bg-warning text-warning-foreground rounded-lg font-medium hover:bg-warning/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Granting..." : "Grant Access"}
              </button>
              {message && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Security Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold">Security</h3>
            <p className="text-sm text-muted-foreground">Manage your security preferences</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg text-left transition-colors">
            <p className="font-medium text-sm">Change Password</p>
            <p className="text-xs text-muted-foreground">Update your account password</p>
          </button>
          <button className="w-full px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg text-left transition-colors">
            <p className="font-medium text-sm">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
          </button>
          <button className="w-full px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg text-left transition-colors">
            <p className="font-medium text-sm">Active Sessions</p>
            <p className="text-xs text-muted-foreground">Manage your logged-in devices</p>
          </button>
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Documents Uploaded", value: "47" },
          { label: "Actions Performed", value: "234" },
          { label: "Days Active", value: "89" },
          { label: "Compliance Score", value: "98%" }
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold font-mono text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
