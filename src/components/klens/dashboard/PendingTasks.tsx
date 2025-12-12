/**
 * PendingTasks - Consolidated Task Queue
 * 
 * Shows items requiring user action:
 * - Document approvals pending
 * - Training certifications expiring
 * - Compliance reviews needed
 * - Handover requests to accept
 */

import { useState } from "react";
import {
     ClipboardList,
     FileCheck,
     GraduationCap,
     FileWarning,
     RefreshCw,
     Clock,
     AlertCircle,
     CheckCircle,
     XCircle,
     ChevronRight,
     Filter,
     ChevronDown
} from "lucide-react";

type TaskPriority = "critical" | "warning" | "info";
type TaskType = "approval" | "training" | "compliance" | "handover";

interface PendingTask {
     id: number;
     type: TaskType;
     title: string;
     description: string;
     priority: TaskPriority;
     dueDate: string;
     dueStatus: "overdue" | "today" | "upcoming";
     requester?: string;
     count?: number;
}

// Mock tasks data
const MOCK_TASKS: PendingTask[] = [
     {
          id: 1,
          type: "training",
          title: "Safety Training Certification",
          description: "Annual fire safety training renewal required",
          priority: "critical",
          dueDate: "Overdue by 3 days",
          dueStatus: "overdue"
     },
     {
          id: 2,
          type: "approval",
          title: "Document Approvals",
          description: "3 documents awaiting your approval",
          priority: "warning",
          dueDate: "Due today",
          dueStatus: "today",
          count: 3
     },
     {
          id: 3,
          type: "handover",
          title: "Shift Handover Request",
          description: "Amit Kumar requesting handover acceptance",
          priority: "warning",
          dueDate: "2 hours ago",
          dueStatus: "today",
          requester: "Amit Kumar"
     },
     {
          id: 4,
          type: "compliance",
          title: "Equipment Inspection Review",
          description: "Monthly inspection report needs sign-off",
          priority: "info",
          dueDate: "Due in 2 days",
          dueStatus: "upcoming"
     },
     {
          id: 5,
          type: "approval",
          title: "Leave Request",
          description: "Sneha Reddy - Casual Leave (Dec 15-16)",
          priority: "info",
          dueDate: "Due in 3 days",
          dueStatus: "upcoming",
          requester: "Sneha Reddy"
     },
     {
          id: 6,
          type: "compliance",
          title: "Safety Audit Acknowledgement",
          description: "Review and acknowledge safety audit findings",
          priority: "warning",
          dueDate: "Due tomorrow",
          dueStatus: "today"
     },
];

const TASK_TYPES = [
     { value: "all", label: "All Tasks" },
     { value: "approval", label: "Approvals" },
     { value: "training", label: "Training" },
     { value: "compliance", label: "Compliance" },
     { value: "handover", label: "Handovers" },
];

const getTaskIcon = (type: TaskType) => {
     switch (type) {
          case "approval":
               return FileCheck;
          case "training":
               return GraduationCap;
          case "compliance":
               return FileWarning;
          case "handover":
               return RefreshCw;
     }
};

const getPriorityStyle = (priority: TaskPriority) => {
     switch (priority) {
          case "critical":
               return {
                    bg: "bg-red-500/10",
                    border: "border-red-500/30",
                    icon: "text-red-400 bg-red-500/20",
                    badge: "bg-red-500/20 text-red-400",
                    label: "Critical"
               };
          case "warning":
               return {
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/30",
                    icon: "text-amber-400 bg-amber-500/20",
                    badge: "bg-amber-500/20 text-amber-400",
                    label: "High"
               };
          case "info":
               return {
                    bg: "bg-slate-500/10",
                    border: "border-slate-500/30",
                    icon: "text-blue-400 bg-blue-500/20",
                    badge: "bg-blue-500/20 text-blue-400",
                    label: "Normal"
               };
     }
};

const getDueStatusIcon = (status: string) => {
     switch (status) {
          case "overdue":
               return <AlertCircle className="w-3 h-3 text-red-400" />;
          case "today":
               return <Clock className="w-3 h-3 text-amber-400" />;
          default:
               return <Clock className="w-3 h-3 text-slate-400" />;
     }
};

export function PendingTasks() {
     const [filter, setFilter] = useState<string>("all");
     const [showFilter, setShowFilter] = useState(false);

     const filteredTasks = filter === "all"
          ? MOCK_TASKS
          : MOCK_TASKS.filter(t => t.type === filter);

     // Sort by priority (critical first)
     const sortedTasks = [...filteredTasks].sort((a, b) => {
          const priorityOrder = { critical: 0, warning: 1, info: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
     });

     const criticalCount = MOCK_TASKS.filter(t => t.priority === "critical").length;

     return (
          <div className="glass-card p-5 rounded-xl border border-slate-700/50">
               {/* Header */}
               <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-amber-600/20">
                              <ClipboardList className="w-5 h-5 text-amber-400" />
                         </div>
                         <div>
                              <h3 className="font-semibold text-white">Pending Tasks</h3>
                              <p className="text-xs text-slate-400">
                                   {criticalCount > 0 && (
                                        <span className="text-red-400 font-medium">{criticalCount} critical</span>
                                   )}
                                   {criticalCount > 0 && " • "}
                                   {MOCK_TASKS.length} total items
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
                              {TASK_TYPES.find(t => t.value === filter)?.label}
                              <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? "rotate-180" : ""}`} />
                         </button>

                         {showFilter && (
                              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                                   {TASK_TYPES.map(type => (
                                        <button
                                             key={type.value}
                                             onClick={() => {
                                                  setFilter(type.value);
                                                  setShowFilter(false);
                                             }}
                                             className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${filter === type.value ? "text-amber-400" : "text-slate-300"
                                                  }`}
                                        >
                                             {type.label}
                                        </button>
                                   ))}
                              </div>
                         )}
                    </div>
               </div>

               {/* Task List */}
               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {sortedTasks.map((task) => {
                         const Icon = getTaskIcon(task.type);
                         const style = getPriorityStyle(task.priority);

                         return (
                              <div
                                   key={task.id}
                                   className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-slate-800/50 ${style.bg} ${style.border}`}
                              >
                                   <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${style.icon}`}>
                                             <Icon className="w-4 h-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                             <div className="flex items-center justify-between mb-1">
                                                  <h4 className="font-medium text-white text-sm">{task.title}</h4>
                                                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${style.badge}`}>
                                                       {style.label}
                                                  </span>
                                             </div>
                                             <p className="text-xs text-slate-400 mb-2">{task.description}</p>

                                             {/* Due Date & Actions */}
                                             <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-1 text-xs text-slate-500">
                                                       {getDueStatusIcon(task.dueStatus)}
                                                       <span className={task.dueStatus === "overdue" ? "text-red-400" : ""}>{task.dueDate}</span>
                                                  </div>

                                                  {/* Quick Actions */}
                                                  <div className="flex items-center gap-2">
                                                       {task.type === "approval" && (
                                                            <>
                                                                 <button className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors" title="Approve">
                                                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                                                 </button>
                                                                 <button className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors" title="Reject">
                                                                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                                                                 </button>
                                                            </>
                                                       )}
                                                       <button className="p-1.5 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors" title="View Details">
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
                         Sorted by priority
                    </span>
                    <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                         View All Tasks →
                    </button>
               </div>
          </div>
     );
}
