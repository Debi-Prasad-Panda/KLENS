/**
 * OverviewTab - The "Command Center"
 * 
 * Contains:
 * - Shift Schedule widget (timeline view)
 * - Recent Activity Heatmap (GitHub-style)
 * - Pending Actions widget
 * - Emergency Info (manager view only)
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
     Calendar,
     Clock,
     AlertCircle,
     FileText,
     GraduationCap,
     Phone,
     Heart,
     ChevronRight
} from "lucide-react";

// Mock data for shift schedule
const MOCK_SHIFTS = [
     { day: "Mon", date: "Dec 9", shift: "08:00 - 16:00", status: "completed" },
     { day: "Tue", date: "Dec 10", shift: "08:00 - 16:00", status: "current" },
     { day: "Wed", date: "Dec 11", shift: "08:00 - 16:00", status: "upcoming" },
     { day: "Thu", date: "Dec 12", shift: "Off", status: "off" },
     { day: "Fri", date: "Dec 13", shift: "08:00 - 16:00", status: "upcoming" },
     { day: "Sat", date: "Dec 14", shift: "Off", status: "off" },
     { day: "Sun", date: "Dec 15", shift: "Off", status: "off" },
];

// Mock activity data for heatmap (last 12 weeks)
const generateMockActivityData = () => {
     const data = [];
     for (let week = 0; week < 12; week++) {
          for (let day = 0; day < 7; day++) {
               data.push({
                    week,
                    day,
                    count: Math.floor(Math.random() * 5),
               });
          }
     }
     return data;
};

// Mock pending actions
const MOCK_PENDING_ACTIONS = [
     { id: 1, type: "approval", text: "3 Documents awaiting approval", icon: FileText, urgent: false },
     { id: 2, type: "training", text: "1 Safety Training overdue", icon: GraduationCap, urgent: true },
     { id: 3, type: "review", text: "2 Document reviews pending", icon: AlertCircle, urgent: false },
];

// Mock emergency info
const MOCK_EMERGENCY_INFO = {
     contactName: "Jane Doe (Wife)",
     contactPhone: "555-0199",
     bloodType: "O+",
     medicalTags: ["Diabetic"],
};

export function OverviewTab() {
     const { user } = useAuth();
     const [activityData] = useState(generateMockActivityData());

     const isManagerOrAdmin = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SAFETY_OFFICER";

     const getActivityColor = (count: number) => {
          if (count === 0) return "bg-slate-800";
          if (count === 1) return "bg-blue-900/50";
          if (count === 2) return "bg-blue-700/60";
          if (count === 3) return "bg-blue-500/70";
          return "bg-blue-400";
     };

     const getShiftStatusStyle = (status: string) => {
          switch (status) {
               case "completed": return "bg-slate-700/50 text-slate-400";
               case "current": return "bg-emerald-600/20 text-emerald-400 border border-emerald-500/50";
               case "upcoming": return "bg-slate-800/50 text-slate-300";
               case "off": return "bg-slate-900/50 text-slate-500";
               default: return "bg-slate-800/50 text-slate-400";
          }
     };

     return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Shift Schedule Widget */}
               <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 rounded-lg bg-blue-600/20">
                              <Calendar className="w-5 h-5 text-blue-400" />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">Shift Schedule</h3>
                              <p className="text-xs text-slate-400">This week</p>
                         </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                         {MOCK_SHIFTS.map((shift, idx) => (
                              <div
                                   key={idx}
                                   className={`flex-shrink-0 w-20 p-3 rounded-lg text-center ${getShiftStatusStyle(shift.status)}`}
                              >
                                   <p className="text-xs font-medium">{shift.day}</p>
                                   <p className="text-[10px] opacity-70">{shift.date}</p>
                                   <p className="text-xs mt-2 font-mono">{shift.shift}</p>
                              </div>
                         ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm">
                         <Clock className="w-4 h-4 text-emerald-400" />
                         <span className="text-slate-300">Next Shift: <strong className="text-white">Tomorrow, 08:00 - 16:00</strong></span>
                    </div>
               </div>

               {/* Activity Heatmap Widget */}
               <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-purple-600/20">
                                   <FileText className="w-5 h-5 text-purple-400" />
                              </div>
                              <div>
                                   <h3 className="font-semibold text-white">Activity</h3>
                                   <p className="text-xs text-slate-400">Last 12 weeks</p>
                              </div>
                         </div>
                         <div className="flex items-center gap-1 text-xs text-slate-500">
                              <span>Less</span>
                              <div className="flex gap-0.5">
                                   {[0, 1, 2, 3, 4].map((level) => (
                                        <div key={level} className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`} />
                                   ))}
                              </div>
                              <span>More</span>
                         </div>
                    </div>

                    <div className="flex gap-0.5 flex-wrap">
                         {activityData.map((item, idx) => (
                              <div
                                   key={idx}
                                   className={`w-3 h-3 rounded-sm ${getActivityColor(item.count)} transition-colors hover:ring-1 hover:ring-white/30`}
                                   title={`${item.count} activities`}
                              />
                         ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                         <span className="text-slate-400">Total this year:</span>
                         <span className="text-white font-semibold">1,402 activities</span>
                    </div>
               </div>

               {/* Pending Actions Widget */}
               <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 rounded-lg bg-amber-600/20">
                              <AlertCircle className="w-5 h-5 text-amber-400" />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">Pending Actions</h3>
                              <p className="text-xs text-slate-400">Items requiring attention</p>
                         </div>
                    </div>

                    <div className="space-y-2">
                         {MOCK_PENDING_ACTIONS.map((action) => (
                              <button
                                   key={action.id}
                                   className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${action.urgent
                                             ? "bg-red-900/20 border border-red-500/30 hover:bg-red-900/30"
                                             : "bg-slate-800/50 hover:bg-slate-800/80"
                                        }`}
                              >
                                   <div className="flex items-center gap-3">
                                        <action.icon className={`w-4 h-4 ${action.urgent ? "text-red-400" : "text-slate-400"}`} />
                                        <span className={`text-sm ${action.urgent ? "text-red-300" : "text-slate-300"}`}>
                                             {action.text}
                                        </span>
                                   </div>
                                   <ChevronRight className="w-4 h-4 text-slate-500" />
                              </button>
                         ))}
                    </div>
               </div>

               {/* Emergency Info Widget (Manager/Admin Only) */}
               {isManagerOrAdmin && (
                    <div className="glass-card p-5 rounded-xl border border-red-700/30 bg-red-950/10">
                         <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 rounded-lg bg-red-600/20">
                                   <Heart className="w-5 h-5 text-red-400" />
                              </div>
                              <div>
                                   <h3 className="font-semibold text-white">Emergency Info</h3>
                                   <p className="text-xs text-red-400">Private - Manager View Only</p>
                              </div>
                         </div>

                         <div className="space-y-3">
                              <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                   <Phone className="w-4 h-4 text-slate-400" />
                                   <div>
                                        <p className="text-xs text-slate-500">Emergency Contact</p>
                                        <p className="text-sm text-white">{MOCK_EMERGENCY_INFO.contactName}</p>
                                        <p className="text-xs text-slate-400">{MOCK_EMERGENCY_INFO.contactPhone}</p>
                                   </div>
                              </div>

                              <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                   <Heart className="w-4 h-4 text-red-400" />
                                   <div>
                                        <p className="text-xs text-slate-500">Medical Info</p>
                                        <div className="flex items-center gap-2 mt-1">
                                             <span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded-full">
                                                  {MOCK_EMERGENCY_INFO.bloodType}
                                             </span>
                                             {MOCK_EMERGENCY_INFO.medicalTags.map((tag, idx) => (
                                                  <span key={idx} className="px-2 py-0.5 bg-amber-900/30 text-amber-400 text-xs rounded-full">
                                                       {tag}
                                                  </span>
                                             ))}
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
