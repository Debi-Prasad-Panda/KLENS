/**
 * AnalyticsTab - "Self-Quantified"
 * 
 * Personal metrics and analytics dashboard:
 * - Personal Metrics Dashboard
 * - Activity Breakdown
 * - Safety & Training
 * - AI Interaction Stats
 */

import { useState, useEffect } from "react";
import {
     BarChart3,
     TrendingUp,
     TrendingDown,
     FileText,
     Clock,
     Shield,
     GraduationCap,
     Sparkles,
     MessageSquare,
     Target,
     Calendar,
     Activity
} from "lucide-react";

// Mock analytics data
const MOCK_METRICS = {
     documentsProcessed: { value: 47, change: 15, trend: "up" },
     avgResponseTime: { value: "2.3h", change: -8, trend: "down" },
     complianceScore: { value: 98, change: 2, trend: "up" },
     hoursWorked: { value: 168, scheduled: 176 },
};

const MOCK_ACTIVITY_BY_TYPE = [
     { type: "SOPs", count: 18, color: "bg-blue-500" },
     { type: "Manuals", count: 12, color: "bg-purple-500" },
     { type: "Reports", count: 9, color: "bg-emerald-500" },
     { type: "Policies", count: 5, color: "bg-amber-500" },
     { type: "Other", count: 3, color: "bg-slate-500" },
];

const MOCK_ACTIVITY_BY_DAY = [
     { day: "Mon", count: 12 },
     { day: "Tue", count: 8 },
     { day: "Wed", count: 15 },
     { day: "Thu", count: 6 },
     { day: "Fri", count: 10 },
     { day: "Sat", count: 2 },
     { day: "Sun", count: 0 },
];

const MOCK_HOURLY_ACTIVITY = [
     { hour: "6am", count: 2 },
     { hour: "8am", count: 8 },
     { hour: "10am", count: 15 },
     { hour: "12pm", count: 5 },
     { hour: "2pm", count: 12 },
     { hour: "4pm", count: 9 },
     { hour: "6pm", count: 3 },
];

const MOCK_SAFETY = {
     incidents: 0,
     daysWithoutIncident: 127,
     trainingCompletion: 85,
     certsDueIn30Days: 1,
};

const MOCK_AI_STATS = {
     questionsAsked: 156,
     avgConfidence: 94,
     topTopics: ["Equipment Maintenance", "Safety Protocols", "Document Search"],
};

export function AnalyticsTab() {
     const [selectedPeriod, setSelectedPeriod] = useState("month");

     const totalDocs = MOCK_ACTIVITY_BY_TYPE.reduce((acc, item) => acc + item.count, 0);
     const maxDayCount = Math.max(...MOCK_ACTIVITY_BY_DAY.map(d => d.count));
     const maxHourlyCount = Math.max(...MOCK_HOURLY_ACTIVITY.map(h => h.count));

     return (
          <div className="space-y-6">
               {/* Period Selector */}
               <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Your Analytics</h3>
                    <div className="flex gap-2">
                         {["week", "month", "year"].map((period) => (
                              <button
                                   key={period}
                                   onClick={() => setSelectedPeriod(period)}
                                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${selectedPeriod === period
                                             ? "bg-blue-600 text-white"
                                             : "bg-slate-800/50 text-slate-400 hover:text-white"
                                        }`}
                              >
                                   {period}
                              </button>
                         ))}
                    </div>
               </div>

               {/* Key Metrics Grid */}
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Documents Processed */}
                    <div className="glass-card p-4 rounded-xl border border-slate-700/50">
                         <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <span className="text-xs text-slate-400">Documents</span>
                         </div>
                         <p className="text-2xl font-bold text-white">{MOCK_METRICS.documentsProcessed.value}</p>
                         <div className="flex items-center gap-1 mt-1">
                              <TrendingUp className="w-3 h-3 text-emerald-400" />
                              <span className="text-xs text-emerald-400">+{MOCK_METRICS.documentsProcessed.change}%</span>
                              <span className="text-xs text-slate-500">vs last month</span>
                         </div>
                    </div>

                    {/* Avg Response Time */}
                    <div className="glass-card p-4 rounded-xl border border-slate-700/50">
                         <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-purple-400" />
                              <span className="text-xs text-slate-400">Avg Response</span>
                         </div>
                         <p className="text-2xl font-bold text-white">{MOCK_METRICS.avgResponseTime.value}</p>
                         <div className="flex items-center gap-1 mt-1">
                              <TrendingDown className="w-3 h-3 text-emerald-400" />
                              <span className="text-xs text-emerald-400">{MOCK_METRICS.avgResponseTime.change}%</span>
                              <span className="text-xs text-slate-500">faster</span>
                         </div>
                    </div>

                    {/* Compliance Score */}
                    <div className="glass-card p-4 rounded-xl border border-slate-700/50">
                         <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs text-slate-400">Compliance</span>
                         </div>
                         <p className="text-2xl font-bold text-white">{MOCK_METRICS.complianceScore.value}%</p>
                         <div className="flex items-center gap-1 mt-1">
                              <TrendingUp className="w-3 h-3 text-emerald-400" />
                              <span className="text-xs text-emerald-400">+{MOCK_METRICS.complianceScore.change}%</span>
                              <span className="text-xs text-slate-500">improved</span>
                         </div>
                    </div>

                    {/* Hours Worked */}
                    <div className="glass-card p-4 rounded-xl border border-slate-700/50">
                         <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-amber-400" />
                              <span className="text-xs text-slate-400">Hours Worked</span>
                         </div>
                         <p className="text-2xl font-bold text-white">{MOCK_METRICS.hoursWorked.value}h</p>
                         <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-slate-400">of {MOCK_METRICS.hoursWorked.scheduled}h scheduled</span>
                         </div>
                    </div>
               </div>

               {/* Activity Breakdown */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Document Types Pie Chart */}
                    <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                         <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 rounded-lg bg-purple-600/20">
                                   <BarChart3 className="w-5 h-5 text-purple-400" />
                              </div>
                              <div>
                                   <h4 className="font-semibold text-white">Documents by Type</h4>
                                   <p className="text-xs text-slate-400">This {selectedPeriod}</p>
                              </div>
                         </div>

                         <div className="space-y-3">
                              {MOCK_ACTIVITY_BY_TYPE.map((item) => (
                                   <div key={item.type} className="flex items-center gap-3">
                                        <div className="w-20 text-sm text-slate-300">{item.type}</div>
                                        <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden">
                                             <div
                                                  className={`h-full ${item.color} transition-all duration-500`}
                                                  style={{ width: `${(item.count / totalDocs) * 100}%` }}
                                             />
                                        </div>
                                        <div className="w-8 text-sm text-slate-400 text-right">{item.count}</div>
                                   </div>
                              ))}
                         </div>
                    </div>

                    {/* Activity by Day Bar Chart */}
                    <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                         <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 rounded-lg bg-blue-600/20">
                                   <Activity className="w-5 h-5 text-blue-400" />
                              </div>
                              <div>
                                   <h4 className="font-semibold text-white">Activity by Day</h4>
                                   <p className="text-xs text-slate-400">Weekly pattern</p>
                              </div>
                         </div>

                         <div className="flex items-end justify-between h-32 gap-2">
                              {MOCK_ACTIVITY_BY_DAY.map((day) => (
                                   <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                             className="w-full bg-blue-500/80 rounded-t-sm transition-all hover:bg-blue-400"
                                             style={{ height: `${(day.count / maxDayCount) * 100}%`, minHeight: day.count ? "8px" : "0" }}
                                        />
                                        <span className="text-xs text-slate-500">{day.day}</span>
                                   </div>
                              ))}
                         </div>
                    </div>
               </div>

               {/* Hourly Activity */}
               <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 rounded-lg bg-emerald-600/20">
                              <Clock className="w-5 h-5 text-emerald-400" />
                         </div>
                         <div>
                              <h4 className="font-semibold text-white">Peak Activity Hours</h4>
                              <p className="text-xs text-slate-400">When you're most active</p>
                         </div>
                    </div>

                    <div className="flex items-end justify-between h-24 gap-1">
                         {MOCK_HOURLY_ACTIVITY.map((hour) => (
                              <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
                                   <div
                                        className="w-full bg-emerald-500/80 rounded-t-sm transition-all hover:bg-emerald-400"
                                        style={{ height: `${(hour.count / maxHourlyCount) * 100}%`, minHeight: hour.count ? "4px" : "0" }}
                                   />
                                   <span className="text-[10px] text-slate-500">{hour.hour}</span>
                              </div>
                         ))}
                    </div>
               </div>

               {/* Safety & Training + AI Stats */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Safety & Training */}
                    <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                         <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 rounded-lg bg-red-600/20">
                                   <Shield className="w-5 h-5 text-red-400" />
                              </div>
                              <div>
                                   <h4 className="font-semibold text-white">Safety & Training</h4>
                                   <p className="text-xs text-slate-400">Your safety record</p>
                              </div>
                         </div>

                         <div className="space-y-4">
                              {/* Days Without Incident */}
                              <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-center">
                                   <p className="text-3xl font-bold text-emerald-400">{MOCK_SAFETY.daysWithoutIncident}</p>
                                   <p className="text-sm text-slate-400">Days Without Incident 🎉</p>
                              </div>

                              {/* Training Progress */}
                              <div>
                                   <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Training Completion</span>
                                        <span className="text-white font-medium">{MOCK_SAFETY.trainingCompletion}%</span>
                                   </div>
                                   <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                             className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                             style={{ width: `${MOCK_SAFETY.trainingCompletion}%` }}
                                        />
                                   </div>
                              </div>

                              {/* Upcoming Cert Renewals */}
                              {MOCK_SAFETY.certsDueIn30Days > 0 && (
                                   <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg flex items-center gap-3">
                                        <GraduationCap className="w-5 h-5 text-amber-400" />
                                        <div>
                                             <p className="text-sm text-amber-400">{MOCK_SAFETY.certsDueIn30Days} certification due for renewal</p>
                                             <p className="text-xs text-slate-500">Within the next 30 days</p>
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* AI Interaction Stats */}
                    <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                         <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 rounded-lg bg-purple-600/20">
                                   <Sparkles className="w-5 h-5 text-purple-400" />
                              </div>
                              <div>
                                   <h4 className="font-semibold text-white">K-LENS AI Usage</h4>
                                   <p className="text-xs text-slate-400">Your AI interactions</p>
                              </div>
                         </div>

                         <div className="space-y-4">
                              {/* Questions Asked & Confidence */}
                              <div className="grid grid-cols-2 gap-4">
                                   <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                                        <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-white">{MOCK_AI_STATS.questionsAsked}</p>
                                        <p className="text-xs text-slate-400">Questions Asked</p>
                                   </div>
                                   <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                                        <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-white">{MOCK_AI_STATS.avgConfidence}%</p>
                                        <p className="text-xs text-slate-400">Avg Confidence</p>
                                   </div>
                              </div>

                              {/* Top Topics */}
                              <div>
                                   <p className="text-sm text-slate-400 mb-2">Most Asked Topics</p>
                                   <div className="flex flex-wrap gap-2">
                                        {MOCK_AI_STATS.topTopics.map((topic, idx) => (
                                             <span
                                                  key={idx}
                                                  className="px-3 py-1 bg-purple-900/30 text-purple-400 text-xs rounded-full border border-purple-500/30"
                                             >
                                                  {topic}
                                             </span>
                                        ))}
                                   </div>
                              </div>

                              <p className="text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                                   💡 Tip: The more you interact with K-LENS, the smarter it gets at understanding your needs!
                              </p>
                         </div>
                    </div>
               </div>
          </div>
     );
}
