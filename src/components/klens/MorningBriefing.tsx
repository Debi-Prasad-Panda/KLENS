import { CheckCircle2, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium";
  source: string;
  time: string;
}

export function MorningBriefing() {
  const { user } = useAuth();

  const tasks: Task[] = [
    { id: "1", title: "Boiler B7 pressure variance detected", priority: "critical", source: "Log #442", time: "2 min ago" },
    { id: "2", title: "Station 12 Fire Annexure missing", priority: "high", source: "Audit Report", time: "1 hour ago" },
    { id: "3", title: "Vendor payment approval pending", priority: "medium", source: "Finance", time: "3 hours ago" }
  ];

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">Good Morning, {user?.name}</h3>
          <p className="text-sm text-muted-foreground">Here's your intelligence briefing</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/20 rounded-full">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-xs font-semibold text-success">+18% Productivity</span>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
            <div className={`w-2 h-2 rounded-full ${
              task.priority === "critical" ? "bg-destructive animate-pulse" :
              task.priority === "high" ? "bg-warning" : "bg-primary"
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.source} • {task.time}</p>
            </div>
            <button className="text-xs text-primary hover:text-primary/80">Review</button>
          </div>
        ))}
      </div>
    </div>
  );
}
