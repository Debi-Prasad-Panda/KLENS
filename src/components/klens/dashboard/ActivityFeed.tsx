/**
 * ActivityFeed - Real-time Activity Stream
 * 
 * Shows recent actions across the organization:
 * - Document uploads, approvals, rejections
 * - User logins, shift changes, handovers
 * - Safety incidents and alerts
 * - AI assistant interactions
 */

import { useState } from "react";
import {
     FileText,
     LogIn,
     AlertTriangle,
     CheckCircle,
     XCircle,
     RefreshCw,
     MessageSquare,
     Shield,
     Upload,
     Filter,
     ChevronDown
} from "lucide-react";

// Activity types with their styling
type ActivityType = "document" | "auth" | "safety" | "approval" | "handover" | "ai";

interface Activity {
     id: number;
     type: ActivityType;
     user: string;
     action: string;
     target?: string;
     timestamp: string;
     meta?: string;
}

// Mock activity data
const MOCK_ACTIVITIES: Activity[] = [
     {
          id: 1,
          type: "document",
          user: "Rahul Sharma",
          action: "uploaded",
          target: "Safety Protocol v2.3.pdf",
          timestamp: "2 min ago",
          meta: "Zone A - Control Room"
     },
     {
          id: 2,
          type: "approval",
          user: "Priya Patel",
          action: "approved",
          target: "Equipment Maintenance Report",
          timestamp: "15 min ago"
     },
     {
          id: 3,
          type: "safety",
          user: "System",
          action: "detected temperature anomaly",
          target: "Boiler Unit 3",
          timestamp: "23 min ago",
          meta: "Auto-alert triggered"
     },
     {
          id: 4,
          type: "handover",
          user: "Amit Kumar",
          action: "initiated shift handover to",
          target: "Vikram Singh",
          timestamp: "45 min ago"
     },
     {
          id: 5,
          type: "auth",
          user: "Sneha Reddy",
          action: "logged in",
          target: "Kiosk #4",
          timestamp: "1 hour ago",
          meta: "Face ID verified"
     },
     {
          id: 6,
          type: "ai",
          user: "K-LENS AI",
          action: "generated summary for",
          target: "Weekly Safety Audit",
          timestamp: "1.5 hours ago"
     },
     {
          id: 7,
          type: "approval",
          user: "Debi Prasad Panda",
          action: "rejected",
          target: "Overtime Request - Dec 10",
          timestamp: "2 hours ago",
          meta: "Reason: Insufficient justification"
     },
     {
          id: 8,
          type: "document",
          user: "Rajesh Nair",
          action: "updated",
          target: "Emergency Evacuation Plan",
          timestamp: "3 hours ago"
     },
];

const ACTIVITY_TYPES = [
     { value: "all", label: "All Activities" },
     { value: "document", label: "Documents" },
     { value: "approval", label: "Approvals" },
     { value: "safety", label: "Safety" },
     { value: "auth", label: "Authentication" },
     { value: "handover", label: "Handovers" },
     { value: "ai", label: "AI Actions" },
];

const getActivityIcon = (type: ActivityType, action: string) => {
     switch (type) {
          case "document":
               if (action.includes("upload")) return Upload;
               return FileText;
          case "auth":
               return LogIn;
          case "safety":
               return AlertTriangle;
          case "approval":
               if (action.includes("reject")) return XCircle;
               return CheckCircle;
          case "handover":
               return RefreshCw;
          case "ai":
               return MessageSquare;
          default:
               return FileText;
     }
};

const getActivityColor = (type: ActivityType, action: string) => {
     switch (type) {
          case "safety":
               return "text-red-400 bg-red-500/20";
          case "approval":
               if (action.includes("reject")) return "text-red-400 bg-red-500/20";
               return "text-emerald-400 bg-emerald-500/20";
          case "auth":
               return "text-blue-400 bg-blue-500/20";
          case "handover":
               return "text-amber-400 bg-amber-500/20";
          case "ai":
               return "text-purple-400 bg-purple-500/20";
          case "document":
          default:
               return "text-cyan-400 bg-cyan-500/20";
     }
};

export function ActivityFeed() {
     const [filter, setFilter] = useState<string>("all");
     const [showFilter, setShowFilter] = useState(false);

     const filteredActivities = filter === "all"
          ? MOCK_ACTIVITIES
          : MOCK_ACTIVITIES.filter(a => a.type === filter);

     return (
          <div className="glass-card p-5 rounded-xl border border-slate-700/50">
               {/* Header */}
               <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-cyan-600/20">
                              <RefreshCw className="w-5 h-5 text-cyan-400" />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">Activity Feed</h3>
                              <p className="text-xs text-slate-400">Real-time organization updates</p>
                         </div>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                         <button
                              onClick={() => setShowFilter(!showFilter)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm text-slate-300"
                         >
                              <Filter className="w-4 h-4" />
                              {ACTIVITY_TYPES.find(t => t.value === filter)?.label}
                              <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? "rotate-180" : ""}`} />
                         </button>

                         {showFilter && (
                              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                                   {ACTIVITY_TYPES.map(type => (
                                        <button
                                             key={type.value}
                                             onClick={() => {
                                                  setFilter(type.value);
                                                  setShowFilter(false);
                                             }}
                                             className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${filter === type.value ? "text-cyan-400" : "text-slate-300"
                                                  }`}
                                        >
                                             {type.label}
                                        </button>
                                   ))}
                              </div>
                         )}
                    </div>
               </div>

               {/* Activity List */}
               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {filteredActivities.map((activity) => {
                         const Icon = getActivityIcon(activity.type, activity.action);
                         const colorClass = getActivityColor(activity.type, activity.action);

                         return (
                              <div
                                   key={activity.id}
                                   className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
                              >
                                   <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                                        <Icon className="w-4 h-4" />
                                   </div>

                                   <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-200">
                                             <span className="font-medium text-white">{activity.user}</span>
                                             {" "}{activity.action}{" "}
                                             {activity.target && (
                                                  <span className="font-medium text-cyan-400">{activity.target}</span>
                                             )}
                                        </p>
                                        {activity.meta && (
                                             <p className="text-xs text-slate-500 mt-0.5">{activity.meta}</p>
                                        )}
                                   </div>

                                   <span className="text-xs text-slate-500 flex-shrink-0">{activity.timestamp}</span>
                              </div>
                         );
                    })}
               </div>

               {/* Load More */}
               <div className="mt-4 text-center">
                    <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                         Load more activities...
                    </button>
               </div>
          </div>
     );
}
