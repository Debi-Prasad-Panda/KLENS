import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Flame,
  FileWarning,
  CreditCard,
  Loader2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ActivityFeed, TeamStatus, PendingTasks } from "./dashboard";

interface DashboardViewProps {
  onOpenDocument?: () => void;
}

// Static area data for trends (can be enhanced with real data later)
const areaData = [
  { name: "Jan", docs: 400 },
  { name: "Feb", docs: 600 },
  { name: "Mar", docs: 800 },
  { name: "Apr", docs: 700 },
  { name: "May", docs: 900 },
  { name: "Jun", docs: 1100 },
  { name: "Jul", docs: 1400 },
];

// Color palette for pie chart
const DEPARTMENT_COLORS = ["#22d3ee", "#34d399", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899"];

// Task type icons mapping
const getTaskIcon = (status: string) => {
  switch (status) {
    case "failed": return Flame;
    case "processing": return FileWarning;
    default: return CreditCard;
  }
};

const getTaskType = (status: string): "critical" | "warning" | "info" => {
  switch (status) {
    case "failed": return "critical";
    case "processing":
    case "ocr":
    case "analyzing": return "warning";
    default: return "info";
  }
};

const formatTimeAgo = (isoTime: string | null) => {
  if (!isoTime) return "Unknown";
  const date = new Date(isoTime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
  return `${Math.floor(diffMins / 1440)} days ago`;
};

export function DashboardView({ onOpenDocument }: DashboardViewProps) {
  const { data, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  // Build stats from API data
  const stats = data ? [
    { label: "Total Documents", value: data.stats.totalDocuments.toLocaleString(), icon: FileText, change: "+12%", color: "primary" },
    { label: "Compliance Score", value: `${data.stats.complianceScore}%`, icon: CheckCircle2, change: "+2.1%", color: "success" },
    { label: "Pending Approvals", value: data.stats.pendingApprovals.toString(), icon: Clock, change: "-3", color: "warning" },
    { label: "System Alerts", value: data.stats.systemAlerts.toString(), icon: AlertTriangle, change: "+1", color: "destructive" },
  ] : [];

  // Build pie data from department stats
  const pieData = data?.departmentData.map((dept, index) => ({
    name: dept.name,
    value: dept.value,
    color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]
  })) || [];

  // Build tasks from recent activity
  const tasks = data?.recentActivity.slice(0, 3).map(activity => ({
    id: activity.id,
    title: activity.title,
    subtitle: `Status: ${activity.status}`,
    type: getTaskType(activity.status),
    icon: getTaskIcon(activity.status),
    time: formatTimeAgo(activity.time),
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Good Morning, <span className="text-gradient-cyan">User</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            {tasks.length > 0 ? (
              <>K-LENS has prioritized <span className="text-primary font-semibold">{tasks.length} tasks</span> for your attention.</>
            ) : (
              <>All caught up! No pending tasks.</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass-card">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-sm font-mono">Productivity up <span className="text-success">18%</span> this week</span>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
          {error} - Showing cached data
        </div>
      )}

      {/* Task Cards */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`task-card ${task.type === "critical" ? "task-card-critical" :
                  task.type === "warning" ? "task-card-warning" : "task-card-info"
                }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${task.type === "critical" ? "bg-destructive/20" :
                    task.type === "warning" ? "bg-warning/20" : "bg-primary/20"
                  }`}>
                  <task.icon className={`w-5 h-5 ${task.type === "critical" ? "text-destructive" :
                      task.type === "warning" ? "text-warning" : "text-primary"
                    }`} />
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${task.type === "critical" ? "bg-destructive/20 text-destructive" :
                    task.type === "warning" ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"
                  }`}>
                  {task.type}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{task.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{task.subtitle}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{task.time}</span>
                <button
                  onClick={() => onOpenDocument?.()}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Review <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="stat-card" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${stat.color}/20`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                </div>
                <span className={`text-xs font-mono ${stat.change.startsWith("+") ? "text-success" : "text-destructive"
                  }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Document Processing Trends</h3>
              <p className="text-sm text-muted-foreground">Monthly document ingestion</p>
            </div>
            <select className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option>Last 7 months</option>
              <option>Last 12 months</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="docs"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#colorDocs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <div className="mb-6">
            <h3 className="font-semibold">Department Activity</h3>
            <p className="text-sm text-muted-foreground">Document distribution</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: "No Data", value: 1, color: "#64748b" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(pieData.length > 0 ? pieData : [{ color: "#64748b" }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.length > 0 ? pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-mono">{item.value}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center">No department data available</p>
            )}
          </div>
        </div>
      </div>

      {/* New Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <ActivityFeed />

        {/* Team Status */}
        <TeamStatus />
      </div>

      {/* Pending Tasks - Full Width */}
      <PendingTasks />
    </div>
  );
}
