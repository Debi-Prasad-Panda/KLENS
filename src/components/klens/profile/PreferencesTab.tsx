/**
 * PreferencesTab - The "Cockpit"
 * 
 * User preferences for:
 * - AI Voice Settings
 * - Notification Preferences
 * - Display & Accessibility
 */

import { useState } from "react";
import {
     Volume2,
     Bell,
     Palette,
     Moon,
     Sun,
     Monitor,
     Mic,
     VolumeX,
     BellOff,
     Eye,
     Type,
     Sparkles,
     Play,
     Clock
} from "lucide-react";
import { toast } from "sonner";

// Mock preferences (would come from API)
const DEFAULT_PREFERENCES = {
     // AI Voice
     autoListen: false,
     speechRate: 1.0,
     wakeWord: "Hey K-LENS",
     readSummaries: true,

     // Notifications  
     docApprovals: "both", // email, push, both, none
     safetyAlerts: "both", // always enabled
     trainingReminders: "push",
     shiftChanges: "email",
     quietHoursEnabled: false,
     quietHoursStart: "22:00",
     quietHoursEnd: "07:00",

     // Display
     theme: "dark",
     fontSize: "medium",
     highContrast: false,
     reducedMotion: false,
};

export function PreferencesTab() {
     const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES);
     const [saving, setSaving] = useState(false);

     const updatePref = (key: string, value: any) => {
          setPrefs(prev => ({ ...prev, [key]: value }));
     };

     const handleSave = async () => {
          setSaving(true);
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          setSaving(false);
          toast.success("Preferences saved successfully!");
     };

     const handleTestVoice = () => {
          const msg = new SpeechSynthesisUtterance("Hello! I am K-LENS, your industrial knowledge assistant.");
          msg.rate = prefs.speechRate;
          speechSynthesis.speak(msg);
          toast.info("Testing voice output...");
     };

     return (
          <div className="space-y-6">
               {/* AI Voice Settings */}
               <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-5">
                         <div className="p-2 rounded-lg bg-blue-600/20">
                              <Volume2 className="w-5 h-5 text-blue-400" />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">AI Voice Settings</h3>
                              <p className="text-xs text-slate-400">Customize K-LENS voice interaction</p>
                         </div>
                    </div>

                    <div className="space-y-5">
                         {/* Auto-listen Mode */}
                         <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                   <Mic className={`w-5 h-5 ${prefs.autoListen ? "text-blue-400" : "text-slate-500"}`} />
                                   <div>
                                        <p className="text-sm text-white">Auto-listen Mode</p>
                                        <p className="text-xs text-slate-400">Hands-free voice activation</p>
                                   </div>
                              </div>
                              <button
                                   onClick={() => updatePref("autoListen", !prefs.autoListen)}
                                   className={`relative w-12 h-6 rounded-full transition-colors ${prefs.autoListen ? "bg-blue-600" : "bg-slate-700"
                                        }`}
                              >
                                   <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.autoListen ? "left-7" : "left-1"
                                             }`}
                                   />
                              </button>
                         </div>

                         {/* Speech Rate */}
                         <div className="p-4 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                   <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        <div>
                                             <p className="text-sm text-white">Speech Rate</p>
                                             <p className="text-xs text-slate-400">Adjust how fast K-LENS speaks</p>
                                        </div>
                                   </div>
                                   <span className="text-sm font-mono text-blue-400">{prefs.speechRate.toFixed(1)}x</span>
                              </div>
                              <input
                                   type="range"
                                   min="0.5"
                                   max="2.0"
                                   step="0.1"
                                   value={prefs.speechRate}
                                   onChange={(e) => updatePref("speechRate", parseFloat(e.target.value))}
                                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                              <div className="flex justify-between text-xs text-slate-500 mt-1">
                                   <span>0.5x (Slow)</span>
                                   <span>1.0x (Normal)</span>
                                   <span>2.0x (Fast)</span>
                              </div>
                         </div>

                         {/* Wake Word */}
                         <div className="p-4 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-3 mb-3">
                                   <VolumeX className="w-5 h-5 text-amber-400" />
                                   <div>
                                        <p className="text-sm text-white">Wake Word</p>
                                        <p className="text-xs text-slate-400">Say this to activate voice commands</p>
                                   </div>
                              </div>
                              <select
                                   value={prefs.wakeWord}
                                   onChange={(e) => updatePref("wakeWord", e.target.value)}
                                   className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                              >
                                   <option value="Hey K-LENS">Hey K-LENS</option>
                                   <option value="Hello Operator">Hello Operator</option>
                                   <option value="Okay Assistant">Okay Assistant</option>
                              </select>
                         </div>

                         {/* Read Summaries */}
                         <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                   <Play className="w-5 h-5 text-emerald-400" />
                                   <div>
                                        <p className="text-sm text-white">Read Document Summaries</p>
                                        <p className="text-xs text-slate-400">Automatically read AI summaries aloud</p>
                                   </div>
                              </div>
                              <button
                                   onClick={() => updatePref("readSummaries", !prefs.readSummaries)}
                                   className={`relative w-12 h-6 rounded-full transition-colors ${prefs.readSummaries ? "bg-emerald-600" : "bg-slate-700"
                                        }`}
                              >
                                   <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.readSummaries ? "left-7" : "left-1"
                                             }`}
                                   />
                              </button>
                         </div>

                         {/* Test Voice Button */}
                         <button
                              onClick={handleTestVoice}
                              className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                         >
                              <Play className="w-4 h-4" />
                              Test Voice Output
                         </button>
                    </div>
               </div>

               {/* Notification Preferences */}
               <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-5">
                         <div className="p-2 rounded-lg bg-amber-600/20">
                              <Bell className="w-5 h-5 text-amber-400" />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">Notification Preferences</h3>
                              <p className="text-xs text-slate-400">Control how you receive alerts</p>
                         </div>
                    </div>

                    <div className="space-y-4">
                         {/* Notification Categories */}
                         {[
                              { key: "docApprovals", label: "Document Approvals", icon: "📄", locked: false },
                              { key: "safetyAlerts", label: "Safety Alerts", icon: "🚨", locked: true },
                              { key: "trainingReminders", label: "Training Reminders", icon: "📚", locked: false },
                              { key: "shiftChanges", label: "Shift Changes", icon: "🔄", locked: false },
                         ].map((item) => (
                              <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                   <div className="flex items-center gap-3">
                                        <span className="text-xl">{item.icon}</span>
                                        <div>
                                             <p className="text-sm text-white">{item.label}</p>
                                             {item.locked && (
                                                  <p className="text-xs text-red-400">⚠️ Cannot disable - required for safety</p>
                                             )}
                                        </div>
                                   </div>
                                   <select
                                        value={(prefs as any)[item.key]}
                                        onChange={(e) => updatePref(item.key, e.target.value)}
                                        disabled={item.locked}
                                        className={`px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-amber-500 ${item.locked ? "opacity-50 cursor-not-allowed" : "text-white"
                                             }`}
                                   >
                                        <option value="both">Email + Push</option>
                                        <option value="email">Email Only</option>
                                        <option value="push">Push Only</option>
                                        {!item.locked && <option value="none">None</option>}
                                   </select>
                              </div>
                         ))}

                         {/* Quiet Hours */}
                         <div className="p-4 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center justify-between mb-4">
                                   <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-purple-400" />
                                        <div>
                                             <p className="text-sm text-white">Quiet Hours</p>
                                             <p className="text-xs text-slate-400">Silence non-urgent notifications</p>
                                        </div>
                                   </div>
                                   <button
                                        onClick={() => updatePref("quietHoursEnabled", !prefs.quietHoursEnabled)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${prefs.quietHoursEnabled ? "bg-purple-600" : "bg-slate-700"
                                             }`}
                                   >
                                        <span
                                             className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.quietHoursEnabled ? "left-7" : "left-1"
                                                  }`}
                                        />
                                   </button>
                              </div>

                              {prefs.quietHoursEnabled && (
                                   <div className="flex gap-4 mt-3">
                                        <div className="flex-1">
                                             <label className="block text-xs text-slate-400 mb-1">Start</label>
                                             <input
                                                  type="time"
                                                  value={prefs.quietHoursStart}
                                                  onChange={(e) => updatePref("quietHoursStart", e.target.value)}
                                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                             />
                                        </div>
                                        <div className="flex-1">
                                             <label className="block text-xs text-slate-400 mb-1">End</label>
                                             <input
                                                  type="time"
                                                  value={prefs.quietHoursEnd}
                                                  onChange={(e) => updatePref("quietHoursEnd", e.target.value)}
                                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                             />
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Display & Accessibility */}
               <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-5">
                         <div className="p-2 rounded-lg bg-emerald-600/20">
                              <Palette className="w-5 h-5 text-emerald-400" />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">Display & Accessibility</h3>
                              <p className="text-xs text-slate-400">Customize your viewing experience</p>
                         </div>
                    </div>

                    <div className="space-y-4">
                         {/* Theme */}
                         <div className="p-4 bg-slate-800/50 rounded-lg">
                              <p className="text-sm text-white mb-3">Theme</p>
                              <div className="grid grid-cols-3 gap-2">
                                   {[
                                        { value: "dark", icon: Moon, label: "Dark" },
                                        { value: "light", icon: Sun, label: "Light" },
                                        { value: "system", icon: Monitor, label: "System" },
                                   ].map((theme) => (
                                        <button
                                             key={theme.value}
                                             onClick={() => updatePref("theme", theme.value)}
                                             className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${prefs.theme === theme.value
                                                       ? "bg-emerald-600/30 border border-emerald-500"
                                                       : "bg-slate-900/50 border border-slate-700 hover:border-slate-600"
                                                  }`}
                                        >
                                             <theme.icon className={`w-5 h-5 ${prefs.theme === theme.value ? "text-emerald-400" : "text-slate-400"}`} />
                                             <span className={`text-xs ${prefs.theme === theme.value ? "text-emerald-400" : "text-slate-400"}`}>
                                                  {theme.label}
                                             </span>
                                        </button>
                                   ))}
                              </div>
                         </div>

                         {/* Font Size */}
                         <div className="p-4 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-3 mb-3">
                                   <Type className="w-5 h-5 text-blue-400" />
                                   <p className="text-sm text-white">Font Size</p>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                   {["small", "medium", "large"].map((size) => (
                                        <button
                                             key={size}
                                             onClick={() => updatePref("fontSize", size)}
                                             className={`py-2 rounded-lg transition-colors capitalize ${prefs.fontSize === size
                                                       ? "bg-blue-600/30 border border-blue-500 text-blue-400"
                                                       : "bg-slate-900/50 border border-slate-700 text-slate-400 hover:border-slate-600"
                                                  }`}
                                        >
                                             {size}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         {/* High Contrast */}
                         <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                   <Eye className="w-5 h-5 text-amber-400" />
                                   <div>
                                        <p className="text-sm text-white">High Contrast Mode</p>
                                        <p className="text-xs text-slate-400">Increase visual distinction</p>
                                   </div>
                              </div>
                              <button
                                   onClick={() => updatePref("highContrast", !prefs.highContrast)}
                                   className={`relative w-12 h-6 rounded-full transition-colors ${prefs.highContrast ? "bg-amber-600" : "bg-slate-700"
                                        }`}
                              >
                                   <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.highContrast ? "left-7" : "left-1"
                                             }`}
                                   />
                              </button>
                         </div>

                         {/* Reduced Motion */}
                         <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                   <Sparkles className="w-5 h-5 text-purple-400" />
                                   <div>
                                        <p className="text-sm text-white">Reduced Motion</p>
                                        <p className="text-xs text-slate-400">Minimize animations</p>
                                   </div>
                              </div>
                              <button
                                   onClick={() => updatePref("reducedMotion", !prefs.reducedMotion)}
                                   className={`relative w-12 h-6 rounded-full transition-colors ${prefs.reducedMotion ? "bg-purple-600" : "bg-slate-700"
                                        }`}
                              >
                                   <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.reducedMotion ? "left-7" : "left-1"
                                             }`}
                                   />
                              </button>
                         </div>
                    </div>
               </div>

               {/* Save Button */}
               <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
               >
                    {saving ? "Saving..." : "Save Preferences"}
               </button>
          </div>
     );
}
