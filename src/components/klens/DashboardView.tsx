import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Flame,
  FileWarning,
  CreditCard
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardViewProps {
  onOpenDocument?: () => void;
}

const areaData = [
  { name: "Jan", docs: 400 },
  { name: "Feb", docs: 600 },
  { name: "Mar", docs: 800 },
  { name: "Apr", docs: 700 },
  { name: "May", docs: 900 },
  { name: "Jun", docs: 1100 },
  { name: "Jul", docs: 1400 },
];

const pieData = [
  { name: "Engineering", value: 45, color: "#22d3ee" },
  { name: "Legal", value: 25, color: "#34d399" },
  { name: "HR", value: 20, color: "#f59e0b" },
  { name: "Safety", value: 10, color: "#f43f5e" },
];

const stats = [
  { label: "Total Documents", value: "12,847", icon: FileText, change: "+12%", color: "primary" },
  { label: "Compliance Score", value: "94.2%", icon: CheckCircle2, change: "+2.1%", color: "success" },
  { label: "Pending Approvals", value: "8", icon: Clock, change: "-3", color: "warning" },
  { label: "System Alerts", value: "3", icon: AlertTriangle, change: "+1", color: "destructive" },
];

const tasks = [
  {
    id: 1,
    title: "Boiler Pressure Variance",
    subtitle: "Detected in Log #442",
    type: "critical",
    icon: Flame,
    time: "2 min ago",
  },
  {
    id: 2,
    title: "Station 12 Audit",
    subtitle: "Missing Fire Annexure",
    type: "warning",
    icon: FileWarning,
    time: "1 hour ago",
  },
  {
    id: 3,
    title: "Vendor Payment",
    subtitle: "Awaiting Sign-off",
    type: "info",
    icon: CreditCard,
    time: "3 hours ago",
  },
];

export function DashboardView({ onOpenDocument }: DashboardViewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Good Morning, <span className="text-gradient-cyan">Rajesh</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            K-LENS has prioritized <span className="text-primary font-semibold">3 tasks</span> for your attention.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass-card">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-sm font-mono">Productivity up <span className="text-success">18%</span> this week</span>
        </div>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`task-card ${
              task.type === "critical" ? "task-card-critical" :
              task.type === "warning" ? "task-card-warning" : "task-card-info"
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                task.type === "critical" ? "bg-destructive/20" :
                task.type === "warning" ? "bg-warning/20" : "bg-primary/20"
              }`}>
                <task.icon className={`w-5 h-5 ${
                  task.type === "critical" ? "text-destructive" :
                  task.type === "warning" ? "text-warning" : "text-primary"
                }`} />
              </div>
              <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
                task.type === "critical" ? "bg-destructive/20 text-destructive" :
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
                onClick={() => task.id === 1 && onOpenDocument?.()}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Review <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="stat-card" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${stat.color}/20`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                </div>
                <span className={`text-xs font-mono ${
                  stat.change.startsWith("+") ? "text-success" : "text-destructive"
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
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
