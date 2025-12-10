/**
 * SecurityTab - Security & Devices (The Shield)
 * 
 * Contains:
 * - Cinderella Access controller
 * - Session Manager (active devices)
 * - MFA Settings placeholder
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
     Shield,
     Zap,
     Smartphone,
     Monitor,
     Tablet,
     Clock,
     LogOut,
     Trash2,
     Key,
     CheckCircle2,
     AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

// Mock active sessions
const MOCK_SESSIONS = [
     {
          id: "session-1",
          device: "Windows Desktop",
          icon: Monitor,
          location: "Office - Main Building",
          lastActive: "Now",
          isCurrent: true,
     },
     {
          id: "session-2",
          device: "iPad Pro",
          icon: Tablet,
          location: "Factory Floor",
          lastActive: "1 hour ago",
          isCurrent: false,
     },
     {
          id: "session-3",
          device: "iPhone 15",
          icon: Smartphone,
          location: "Mobile",
          lastActive: "Yesterday",
          isCurrent: false,
     },
];

// Mock Cinderella access log
const MOCK_ACCESS_LOG = [
     { date: "Dec 10, 2024", time: "14:30", duration: "1 hour", reason: "DB Schema Fix" },
     { date: "Dec 5, 2024", time: "09:15", duration: "30 min", reason: "Emergency Approval" },
     { date: "Nov 28, 2024", time: "16:00", duration: "2 hours", reason: "System Maintenance" },
];

export function SecurityTab() {
     const { user, cinderellaAccess, grantCinderellaAccess } = useAuth();
     const [showCinderellaModal, setShowCinderellaModal] = useState(false);
     const [cinderellaReason, setCinderellaReason] = useState("");
     const [cinderellaDuration, setCinderellaDuration] = useState("60");
     const [loading, setLoading] = useState(false);

     const isAdmin = user?.role === "ADMIN";

     const handleRequestAccess = async () => {
          if (!cinderellaReason.trim()) {
               toast.error("Please provide a reason for access");
               return;
          }

          setLoading(true);
          try {
               await api.grantCinderellaAccess(Number(user?.id), parseInt(cinderellaDuration));
               grantCinderellaAccess(parseInt(cinderellaDuration));
               toast.success("Cinderella Access Granted! 👑", {
                    description: `Admin mode active for ${cinderellaDuration} minutes`,
               });
               setShowCinderellaModal(false);
               setCinderellaReason("");
          } catch (error) {
               toast.error("Failed to grant access");
          } finally {
               setLoading(false);
          }
     };

     const handleLogoutSession = (sessionId: string, deviceName: string) => {
          toast.success(`Logged out from ${deviceName}`, {
               description: "Session has been terminated",
          });
     };

     const handleRemoteWipe = (sessionId: string, deviceName: string) => {
          const confirmed = window.confirm(
               `⚠️ REMOTE WIPE\n\nThis will erase all K-LENS data from ${deviceName}.\n\nThis action cannot be undone. Continue?`
          );
          if (confirmed) {
               toast.success(`Remote wipe initiated for ${deviceName}`, {
                    description: "Device data will be erased on next sync",
               });
          }
     };

     return (
          <div className="space-y-6">
               {/* Cinderella Access Controller */}
               <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                         <div className={`p-2 rounded-lg ${cinderellaAccess ? "bg-amber-600/20" : "bg-slate-700/50"}`}>
                              <Zap className={`w-5 h-5 ${cinderellaAccess ? "text-amber-400" : "text-slate-400"}`} />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">Cinderella Access</h3>
                              <p className="text-xs text-slate-400">Time-limited privilege elevation</p>
                         </div>
                    </div>

                    {cinderellaAccess ? (
                         /* Active Cinderella State */
                         <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                   <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                                        <span className="text-amber-400 font-medium">Admin Mode Active</span>
                                   </div>
                                   <span className="text-xs text-amber-300 font-mono bg-amber-900/50 px-2 py-1 rounded">
                                        Expires: {new Date(cinderellaAccess.expiresAt).toLocaleTimeString()}
                                   </span>
                              </div>
                              <p className="text-xs text-slate-400">
                                   All actions are being logged. Higher privileges will automatically revoke at expiry.
                              </p>
                         </div>
                    ) : (
                         /* Request Access Button */
                         <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                   <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-slate-400" />
                                        <div>
                                             <p className="text-sm text-white">Current State: <strong>Standard User</strong></p>
                                             <p className="text-xs text-slate-400">Request elevation for administrative tasks</p>
                                        </div>
                                   </div>
                                   {isAdmin && (
                                        <button
                                             onClick={() => setShowCinderellaModal(true)}
                                             className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
                                        >
                                             Request Elevated Access
                                        </button>
                                   )}
                              </div>

                              {/* Access Log */}
                              <div>
                                   <p className="text-xs text-slate-500 mb-2">Recent Access History</p>
                                   <div className="space-y-2">
                                        {MOCK_ACCESS_LOG.map((log, idx) => (
                                             <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-xs">
                                                  <div className="flex items-center gap-2">
                                                       <Clock className="w-3 h-3 text-slate-500" />
                                                       <span className="text-slate-400">{log.date} at {log.time}</span>
                                                  </div>
                                                  <span className="text-slate-400">{log.duration}</span>
                                                  <span className="text-slate-300">{log.reason}</span>
                                             </div>
                                        ))}
                                   </div>
                              </div>
                         </div>
                    )}
               </div>

               {/* Session Manager */}
               <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 rounded-lg bg-emerald-600/20">
                              <Monitor className="w-5 h-5 text-emerald-400" />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">Active Sessions</h3>
                              <p className="text-xs text-slate-400">{MOCK_SESSIONS.length} devices logged in</p>
                         </div>
                    </div>

                    <div className="space-y-3">
                         {MOCK_SESSIONS.map((session) => {
                              const DeviceIcon = session.icon;
                              return (
                                   <div
                                        key={session.id}
                                        className={`flex items-center justify-between p-4 rounded-lg ${session.isCurrent
                                                  ? "bg-emerald-900/20 border border-emerald-500/30"
                                                  : "bg-slate-800/50"
                                             }`}
                                   >
                                        <div className="flex items-center gap-4">
                                             <div className={`p-2 rounded-lg ${session.isCurrent ? "bg-emerald-600/20" : "bg-slate-700/50"}`}>
                                                  <DeviceIcon className={`w-5 h-5 ${session.isCurrent ? "text-emerald-400" : "text-slate-400"}`} />
                                             </div>
                                             <div>
                                                  <div className="flex items-center gap-2">
                                                       <p className="text-sm font-medium text-white">{session.device}</p>
                                                       {session.isCurrent && (
                                                            <span className="px-2 py-0.5 bg-emerald-600/30 text-emerald-400 text-[10px] rounded-full">
                                                                 Current
                                                            </span>
                                                       )}
                                                  </div>
                                                  <p className="text-xs text-slate-400">{session.location} • {session.lastActive}</p>
                                             </div>
                                        </div>

                                        {!session.isCurrent && (
                                             <div className="flex gap-2">
                                                  <button
                                                       onClick={() => handleLogoutSession(session.id, session.device)}
                                                       className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors"
                                                       title="Log out"
                                                  >
                                                       <LogOut className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                       onClick={() => handleRemoteWipe(session.id, session.device)}
                                                       className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                                                       title="Remote wipe"
                                                  >
                                                       <Trash2 className="w-4 h-4" />
                                                  </button>
                                             </div>
                                        )}
                                   </div>
                              );
                         })}
                    </div>
               </div>

               {/* MFA Settings */}
               <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 rounded-lg bg-blue-600/20">
                              <Key className="w-5 h-5 text-blue-400" />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">Two-Factor Authentication</h3>
                              <p className="text-xs text-slate-400">Add extra security to your account</p>
                         </div>
                    </div>

                    <div className="space-y-3">
                         <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                   <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                   <div>
                                        <p className="text-sm text-white">Authenticator App</p>
                                        <p className="text-xs text-slate-400">Using Google Authenticator</p>
                                   </div>
                              </div>
                              <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 text-xs rounded-full">Active</span>
                         </div>

                         <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                   <AlertTriangle className="w-5 h-5 text-slate-500" />
                                   <div>
                                        <p className="text-sm text-white">Hardware Key (YubiKey)</p>
                                        <p className="text-xs text-slate-400">Physical security key</p>
                                   </div>
                              </div>
                              <button className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg transition-colors">
                                   Setup
                              </button>
                         </div>
                    </div>
               </div>

               {/* Cinderella Request Modal */}
               {showCinderellaModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                         <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4">
                              <div className="flex items-center gap-3 mb-4">
                                   <div className="p-2 rounded-lg bg-amber-600/20">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                   </div>
                                   <h3 className="text-lg font-semibold text-white">Request Elevated Access</h3>
                              </div>

                              <div className="space-y-4">
                                   <div>
                                        <label className="block text-sm text-slate-400 mb-2">Reason for access</label>
                                        <input
                                             type="text"
                                             value={cinderellaReason}
                                             onChange={(e) => setCinderellaReason(e.target.value)}
                                             placeholder="e.g., Fixing DB Schema"
                                             className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                                        />
                                   </div>

                                   <div>
                                        <label className="block text-sm text-slate-400 mb-2">Duration</label>
                                        <select
                                             value={cinderellaDuration}
                                             onChange={(e) => setCinderellaDuration(e.target.value)}
                                             className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                                        >
                                             <option value="15">15 minutes</option>
                                             <option value="30">30 minutes</option>
                                             <option value="60">1 hour</option>
                                             <option value="120">2 hours</option>
                                             <option value="240">4 hours</option>
                                        </select>
                                   </div>

                                   <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                                        ⚠️ All actions during elevated access will be logged and audited.
                                   </div>

                                   <div className="flex gap-3">
                                        <button
                                             onClick={() => setShowCinderellaModal(false)}
                                             className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             onClick={handleRequestAccess}
                                             disabled={loading}
                                             className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                             {loading ? "Granting..." : "Grant Access"}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
