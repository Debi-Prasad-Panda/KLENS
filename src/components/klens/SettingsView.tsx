import { Bell, Lock, Globe, Palette, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function SettingsView() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
            <span className="text-sm">Email notifications</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </label>
          <label className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
            <span className="text-sm">Push notifications</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </label>
          <label className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
            <span className="text-sm">Critical alerts only</span>
            <input type="checkbox" className="w-4 h-4" />
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Security</h3>
        </div>
        <div className="space-y-3">
          <button className="w-full p-3 bg-secondary/50 rounded-lg text-left hover:bg-secondary transition-colors">
            <p className="text-sm font-medium">Change Password</p>
            <p className="text-xs text-muted-foreground mt-1">Update your password</p>
          </button>
          <button className="w-full p-3 bg-secondary/50 rounded-lg text-left hover:bg-secondary transition-colors">
            <p className="text-sm font-medium">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground mt-1">Add an extra layer of security</p>
          </button>
          <button className="w-full p-3 bg-secondary/50 rounded-lg text-left hover:bg-secondary transition-colors">
            <p className="text-sm font-medium">Active Sessions</p>
            <p className="text-xs text-muted-foreground mt-1">Manage your logged-in devices</p>
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Preferences</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <label className="text-sm font-medium block mb-2">Theme</label>
            <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
              <option>Dark Mode</option>
              <option>Light Mode</option>
              <option>Auto</option>
            </select>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <label className="text-sm font-medium block mb-2">Language</label>
            <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
              <option>English</option>
              <option>Hindi</option>
              <option>Malayalam</option>
              <option>Tamil</option>
            </select>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <label className="text-sm font-medium block mb-2">Date Format</label>
            <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Privacy</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
            <span className="text-sm">Show online status</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </label>
          <label className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
            <span className="text-sm">Allow analytics</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </label>
          <button className="w-full p-3 bg-secondary/50 rounded-lg text-left hover:bg-secondary transition-colors">
            <p className="text-sm font-medium">Download My Data</p>
            <p className="text-xs text-muted-foreground mt-1">Export all your data</p>
          </button>
        </div>
      </div>
    </div>
  );
}
