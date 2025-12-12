/**
 * TeamStatus - Team Member Status Grid
 * 
 * Shows current status of team members:
 * - Avatar, name, role
 * - Shift status (On Shift, On Break, Off Duty)
 * - Current location/zone
 * - Safety score indicator
 * - Quick actions
 */

import { useState } from "react";
import {
     Users,
     MapPin,
     Shield,
     Phone,
     MessageCircle,
     ChevronDown,
     User,
     Filter
} from "lucide-react";

type ShiftStatus = "ON_SHIFT" | "ON_BREAK" | "OFF_SHIFT";

interface TeamMember {
     id: number;
     name: string;
     role: string;
     avatar?: string;
     shiftStatus: ShiftStatus;
     location?: string;
     safetyScore: number;
     department: string;
     phone?: string;
}

// Mock team data
const MOCK_TEAM: TeamMember[] = [
     {
          id: 1,
          name: "Rahul Sharma",
          role: "Senior Operator",
          shiftStatus: "ON_SHIFT",
          location: "Zone A - Control Room",
          safetyScore: 95,
          department: "Operations",
          phone: "555-0101"
     },
     {
          id: 2,
          name: "Priya Patel",
          role: "Safety Officer",
          shiftStatus: "ON_SHIFT",
          location: "Zone B - Boiler Room",
          safetyScore: 100,
          department: "Safety",
          phone: "555-0102"
     },
     {
          id: 3,
          name: "Amit Kumar",
          role: "Maintenance Lead",
          shiftStatus: "ON_BREAK",
          location: "Break Room",
          safetyScore: 88,
          department: "Maintenance",
          phone: "555-0103"
     },
     {
          id: 4,
          name: "Sneha Reddy",
          role: "Junior Technician",
          shiftStatus: "ON_SHIFT",
          location: "Zone C - Generator",
          safetyScore: 92,
          department: "Operations",
          phone: "555-0104"
     },
     {
          id: 5,
          name: "Vikram Singh",
          role: "Shift Supervisor",
          shiftStatus: "OFF_SHIFT",
          safetyScore: 97,
          department: "Operations",
          phone: "555-0105"
     },
     {
          id: 6,
          name: "Ananya Gupta",
          role: "Quality Inspector",
          shiftStatus: "ON_SHIFT",
          location: "Zone A - QC Lab",
          safetyScore: 94,
          department: "Quality",
          phone: "555-0106"
     },
];

const DEPARTMENTS = [
     { value: "all", label: "All Departments" },
     { value: "Operations", label: "Operations" },
     { value: "Safety", label: "Safety" },
     { value: "Maintenance", label: "Maintenance" },
     { value: "Quality", label: "Quality" },
];

const getStatusStyle = (status: ShiftStatus) => {
     switch (status) {
          case "ON_SHIFT":
               return {
                    bg: "bg-emerald-500/20",
                    text: "text-emerald-400",
                    dot: "bg-emerald-400",
                    label: "On Shift"
               };
          case "ON_BREAK":
               return {
                    bg: "bg-amber-500/20",
                    text: "text-amber-400",
                    dot: "bg-amber-400",
                    label: "On Break"
               };
          case "OFF_SHIFT":
               return {
                    bg: "bg-slate-500/20",
                    text: "text-slate-400",
                    dot: "bg-slate-400",
                    label: "Off Duty"
               };
     }
};

const getSafetyScoreColor = (score: number) => {
     if (score >= 90) return "text-emerald-400";
     if (score >= 70) return "text-amber-400";
     return "text-red-400";
};

export function TeamStatus() {
     const [filter, setFilter] = useState<string>("all");
     const [showFilter, setShowFilter] = useState(false);

     const filteredTeam = filter === "all"
          ? MOCK_TEAM
          : MOCK_TEAM.filter(m => m.department === filter);

     const activeCount = MOCK_TEAM.filter(m => m.shiftStatus === "ON_SHIFT").length;

     return (
          <div className="glass-card p-5 rounded-xl border border-slate-700/50">
               {/* Header */}
               <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-purple-600/20">
                              <Users className="w-5 h-5 text-purple-400" />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">Team Status</h3>
                              <p className="text-xs text-slate-400">
                                   <span className="text-emerald-400 font-medium">{activeCount}</span> members on shift
                              </p>
                         </div>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                         <button
                              onClick={() => setShowFilter(!showFilter)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm text-slate-300"
                         >
                              <Filter className="w-4 h-4" />
                              {DEPARTMENTS.find(d => d.value === filter)?.label}
                              <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? "rotate-180" : ""}`} />
                         </button>

                         {showFilter && (
                              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                                   {DEPARTMENTS.map(dept => (
                                        <button
                                             key={dept.value}
                                             onClick={() => {
                                                  setFilter(dept.value);
                                                  setShowFilter(false);
                                             }}
                                             className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${filter === dept.value ? "text-purple-400" : "text-slate-300"
                                                  }`}
                                        >
                                             {dept.label}
                                        </button>
                                   ))}
                              </div>
                         )}
                    </div>
               </div>

               {/* Team Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {filteredTeam.map((member) => {
                         const statusStyle = getStatusStyle(member.shiftStatus);

                         return (
                              <div
                                   key={member.id}
                                   className="p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-700/30"
                              >
                                   <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                             <User className="w-5 h-5 text-white" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                             <div className="flex items-center justify-between">
                                                  <h4 className="font-medium text-white text-sm truncate">{member.name}</h4>
                                                  <span className={`flex items-center gap-1.5 text-xs ${statusStyle.text}`}>
                                                       <span className={`w-2 h-2 rounded-full ${statusStyle.dot} animate-pulse`} />
                                                       {statusStyle.label}
                                                  </span>
                                             </div>
                                             <p className="text-xs text-slate-500">{member.role}</p>

                                             {/* Location */}
                                             {member.location && (
                                                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                                       <MapPin className="w-3 h-3" />
                                                       <span className="truncate">{member.location}</span>
                                                  </div>
                                             )}

                                             {/* Stats & Actions Row */}
                                             <div className="flex items-center justify-between mt-2">
                                                  {/* Safety Score */}
                                                  <div className="flex items-center gap-1">
                                                       <Shield className={`w-3 h-3 ${getSafetyScoreColor(member.safetyScore)}`} />
                                                       <span className={`text-xs font-mono ${getSafetyScoreColor(member.safetyScore)}`}>
                                                            {member.safetyScore}
                                                       </span>
                                                  </div>

                                                  {/* Quick Actions */}
                                                  <div className="flex items-center gap-1">
                                                       <button
                                                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                                                            title="Call"
                                                       >
                                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                       </button>
                                                       <button
                                                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                                                            title="Message"
                                                       >
                                                            <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                                                       </button>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         );
                    })}
               </div>

               {/* Footer */}
               <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                         Showing {filteredTeam.length} of {MOCK_TEAM.length} members
                    </span>
                    <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                         View All Team →
                    </button>
               </div>
          </div>
     );
}
