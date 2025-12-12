/**
 * AuditTrail - Enhanced Git-Style Audit & Compliance System
 * Immutable version history with analytics and compliance tracking
 */

import { useState, useEffect, useMemo } from "react";
import {
  GitBranch, Eye, Edit, Trash2, RotateCcw, Clock, Filter,
  Download, Search, Calendar, User, FileText, Shield,
  Activity, TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, RefreshCw, BarChart3, PieChart, ArrowUpRight,
  ArrowDownRight, Users, Lock, Unlock, Plus, Settings, Zap,
  Database, Globe, Server, Terminal, Key
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// Types
interface AuditLog {
  id: string;
  action: 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'REVERT' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PERMISSION_CHANGE' | 'SYSTEM';
  category: 'DOCUMENT' | 'USER' | 'SYSTEM' | 'SECURITY' | 'COMPLIANCE';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
    department?: string;
  };
  resource: {
    type: string;
    id: string;
    name: string;
  };
  metadata: {
    version?: string;
    previousVersion?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    changes?: { field: string; old: string; new: string }[];
  };
  timestamp: Date;
  sessionId?: string;
  correlationId?: string;
}

interface ComplianceMetric {
  label: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

// Action icons and colors
const ActionConfig: Record<string, { icon: typeof Eye; color: string; bg: string }> = {
  VIEW: { icon: Eye, color: "text-blue-400", bg: "bg-blue-500/20" },
  CREATE: { icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  EDIT: { icon: Edit, color: "text-amber-400", bg: "bg-amber-500/20" },
  DELETE: { icon: Trash2, color: "text-red-400", bg: "bg-red-500/20" },
  REVERT: { icon: RotateCcw, color: "text-purple-400", bg: "bg-purple-500/20" },
  APPROVE: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  REJECT: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20" },
  LOGIN: { icon: Unlock, color: "text-cyan-400", bg: "bg-cyan-500/20" },
  LOGOUT: { icon: Lock, color: "text-slate-400", bg: "bg-slate-500/20" },
  EXPORT: { icon: Download, color: "text-indigo-400", bg: "bg-indigo-500/20" },
  PERMISSION_CHANGE: { icon: Key, color: "text-fuchsia-400", bg: "bg-fuchsia-500/20" },
  SYSTEM: { icon: Server, color: "text-gray-400", bg: "bg-gray-500/20" }
};

const CategoryConfig: Record<string, { icon: typeof FileText; color: string }> = {
  DOCUMENT: { icon: FileText, color: "text-blue-400" },
  USER: { icon: Users, color: "text-purple-400" },
  SYSTEM: { icon: Server, color: "text-gray-400" },
  SECURITY: { icon: Shield, color: "text-red-400" },
  COMPLIANCE: { icon: CheckCircle2, color: "text-emerald-400" }
};

const SeverityConfig: Record<string, { color: string; bg: string; border: string }> = {
  INFO: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  WARNING: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  ERROR: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  CRITICAL: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" }
};

// Mock data generator
function generateMockLogs(): AuditLog[] {
  const actions = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'REVERT', 'APPROVE', 'LOGIN', 'EXPORT', 'PERMISSION_CHANGE'] as const;
  const categories = ['DOCUMENT', 'USER', 'SYSTEM', 'SECURITY', 'COMPLIANCE'] as const;
  const severities = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const;
  const users = [
    { id: '1', name: 'Admin One', role: 'ADMIN', email: 'admin@klens.local', department: 'IT' },
    { id: '2', name: 'Eng. Rajesh', role: 'ENGINEER', email: 'rajesh@klens.local', department: 'Engineering' },
    { id: '3', name: 'Safety Officer', role: 'SAFETY_OFFICER', email: 'safety@klens.local', department: 'HSE' },
    { id: '4', name: 'Manager Singh', role: 'MANAGER', email: 'singh@klens.local', department: 'Operations' },
    { id: '5', name: 'Operator Kumar', role: 'OPERATOR', email: 'kumar@klens.local', department: 'Production' }
  ];
  const documents = [
    { type: 'DOCUMENT', id: 'DOC-001', name: 'Boiler Manual v2.3' },
    { type: 'DOCUMENT', id: 'DOC-002', name: 'Safety Protocol 2024' },
    { type: 'DOCUMENT', id: 'DOC-003', name: 'Maintenance Log Q4' },
    { type: 'REPORT', id: 'RPT-001', name: 'Audit Report 2024' },
    { type: 'USER', id: 'USR-001', name: 'User Profile: Kumar' },
    { type: 'SYSTEM', id: 'SYS-001', name: 'Database Backup' },
    { type: 'CONFIG', id: 'CFG-001', name: 'Access Control Rules' }
  ];

  return Array.from({ length: 50 }, (_, i) => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const severity = Math.random() > 0.8
      ? (Math.random() > 0.5 ? 'CRITICAL' : 'ERROR')
      : (Math.random() > 0.3 ? 'INFO' : 'WARNING');

    return {
      id: `LOG-${String(i + 1).padStart(5, '0')}`,
      action,
      category,
      severity: severity as typeof severities[number],
      user: users[Math.floor(Math.random() * users.length)],
      resource: documents[Math.floor(Math.random() * documents.length)],
      metadata: {
        version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
        ipAddress: `192.168.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`,
        location: ['Mumbai', 'Chennai', 'Delhi', 'Bangalore'][Math.floor(Math.random() * 4)],
        changes: action === 'EDIT' ? [
          { field: 'content', old: 'Previous text...', new: 'Updated text...' }
        ] : undefined
      },
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      sessionId: `SES-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`,
      correlationId: Math.random() > 0.7 ? `COR-${String(Math.floor(Math.random() * 100)).padStart(4, '0')}` : undefined
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Compliance metrics
const complianceMetrics: ComplianceMetric[] = [
  { label: 'Document Reviews', value: 94, target: 90, trend: 'up', status: 'good' },
  { label: 'Access Controls', value: 87, target: 95, trend: 'down', status: 'warning' },
  { label: 'Data Retention', value: 100, target: 100, trend: 'stable', status: 'good' },
  { label: 'Incident Response', value: 78, target: 85, trend: 'up', status: 'critical' }
];

// Time formatting
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function formatFullTimestamp(date: Date): string {
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function AuditTrail() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  // Fetch logs from API or fallback to mock
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { getAccessToken } = await import('@/lib/supabase');
      const token = await getAccessToken();

      if (token) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/audit/logs?limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.ok) {
          const apiLogs = await response.json();
          if (apiLogs && apiLogs.length > 0) {
            // Transform API logs to match our interface
            const transformedLogs: AuditLog[] = apiLogs.map((log: any) => ({
              id: log.id,
              action: log.action,
              category: log.category,
              severity: log.severity,
              user: {
                id: log.user_id,
                name: log.user_name,
                role: log.user_role,
                email: log.user_email,
                department: log.metadata?.department
              },
              resource: {
                type: log.resource_type,
                id: log.resource_id || '',
                name: log.resource_name
              },
              metadata: {
                version: log.metadata?.version,
                ipAddress: log.ip_address || log.metadata?.ip_address,
                location: log.metadata?.location,
                changes: log.metadata?.changes
              },
              timestamp: new Date(log.created_at),
              sessionId: log.session_id,
              correlationId: log.correlation_id
            }));
            setLogs(transformedLogs);
            setLoading(false);
            return;
          }
        }
      }
    } catch (error) {
      console.log('API not available, using mock data');
    }

    // Fallback to mock data
    setLogs(generateMockLogs());
    setLoading(false);
  };


  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!log.resource.name.toLowerCase().includes(query) &&
          !log.user.name.toLowerCase().includes(query) &&
          !log.action.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Action filter
      if (filterAction && log.action !== filterAction) return false;

      // Category filter
      if (filterCategory && log.category !== filterCategory) return false;

      // Severity filter
      if (filterSeverity && log.severity !== filterSeverity) return false;

      // Date range
      const now = new Date();
      const logDate = log.timestamp;
      switch (filterDateRange) {
        case 'today':
          if (logDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          if (now.getTime() - logDate.getTime() > 7 * 24 * 60 * 60 * 1000) return false;
          break;
        case 'month':
          if (now.getTime() - logDate.getTime() > 30 * 24 * 60 * 60 * 1000) return false;
          break;
      }

      return true;
    });
  }, [logs, searchQuery, filterAction, filterCategory, filterSeverity, filterDateRange]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = logs.filter(l => l.timestamp >= today);
    const criticalCount = logs.filter(l => l.severity === 'CRITICAL' || l.severity === 'ERROR').length;
    const uniqueUsers = new Set(logs.map(l => l.user.id)).size;

    const actionCounts: Record<string, number> = {};
    logs.forEach(l => {
      actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
    });

    return {
      total: logs.length,
      today: todayLogs.length,
      critical: criticalCount,
      uniqueUsers,
      actionCounts
    };
  }, [logs]);

  // Export logs
  const handleExport = (format: 'json' | 'csv') => {
    const data = filteredLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      action: log.action,
      category: log.category,
      severity: log.severity,
      user: log.user.name,
      userEmail: log.user.email,
      resource: log.resource.name,
      resourceType: log.resource.type,
      ipAddress: log.metadata.ipAddress
    }));

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      content = [headers, ...rows].join('\n');
      filename = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Downloaded ${filteredLogs.length} audit logs as ${format.toUpperCase()}`
    });
    setExportModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 animate-spin" />
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
            <GitBranch className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              Audit Trail
            </h2>
            <p className="text-muted-foreground mt-0.5">
              Immutable version history & compliance tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLogs(generateMockLogs());
                setLoading(false);
              }, 500);
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setExportModalOpen(true)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Events</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold mt-1">{stats.total.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Today</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold mt-1">{stats.today}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold mt-1">{stats.critical}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold mt-1">{stats.uniqueUsers}</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-md border border-border/50">
          <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20">
            <GitBranch className="w-4 h-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20">
            <Shield className="w-4 h-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-red-500/20">
            <AlertTriangle className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-card/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterDateRange}
                onChange={e => setFilterDateRange(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-card/50 border border-border/50 text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <select
                value={filterAction || ''}
                onChange={e => setFilterAction(e.target.value || null)}
                className="px-3 py-2 rounded-lg bg-card/50 border border-border/50 text-sm"
              >
                <option value="">All Actions</option>
                {Object.keys(ActionConfig).map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
              <select
                value={filterSeverity || ''}
                onChange={e => setFilterSeverity(e.target.value || null)}
                className="px-3 py-2 rounded-lg bg-card/50 border border-border/50 text-sm"
              >
                <option value="">All Severity</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} events
            </span>
          </div>

          {/* Timeline */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredLogs.map((log, idx) => {
                const actionConfig = ActionConfig[log.action] || ActionConfig.VIEW;
                const ActionIcon = actionConfig.icon;
                const severityConfig = SeverityConfig[log.severity];

                return (
                  <div
                    key={log.id}
                    className="relative group cursor-pointer"
                    onClick={() => { setSelectedLog(log); setDetailModalOpen(true); }}
                  >
                    {idx !== filteredLogs.length - 1 && (
                      <div className="absolute left-[17px] top-12 w-0.5 h-[calc(100%)] bg-border/50" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-full ${actionConfig.bg} flex items-center justify-center relative z-10 border-2 border-background`}>
                        <ActionIcon className={`w-4 h-4 ${actionConfig.color}`} />
                      </div>
                      <div className={`flex-1 p-4 rounded-xl bg-card/30 hover:bg-card/50 transition-colors border border-border/30 hover:border-border/50`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.action}</span>
                            <Badge variant="outline" className={`text-xs ${severityConfig.bg} ${severityConfig.color} ${severityConfig.border}`}>
                              {log.severity}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {log.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-2">{log.resource.name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.user.name}
                          </span>
                          {log.metadata.version && (
                            <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {log.metadata.version}
                            </span>
                          )}
                          {log.metadata.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {log.metadata.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actions Distribution */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Actions Distribution
              </h4>
              <div className="space-y-3">
                {Object.entries(stats.actionCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([action, count]) => {
                    const config = ActionConfig[action] || ActionConfig.VIEW;
                    const ActionIcon = config.icon;
                    const percentage = Math.round((count / stats.total) * 100);

                    return (
                      <div key={action} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <ActionIcon className={`w-4 h-4 ${config.color}`} />
                            {action}
                          </span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weekly Activity
              </h4>
              <div className="flex items-end justify-between h-32 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const height = Math.random() * 100;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-primary/50 to-primary rounded-t-sm transition-all hover:from-primary/70"
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Users */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Most Active Users
              </h4>
              <div className="space-y-3">
                {[
                  { name: 'Admin One', actions: 156, role: 'ADMIN' },
                  { name: 'Eng. Rajesh', actions: 134, role: 'ENGINEER' },
                  { name: 'Manager Singh', actions: 98, role: 'MANAGER' },
                  { name: 'Safety Officer', actions: 87, role: 'SAFETY_OFFICER' },
                  { name: 'Operator Kumar', actions: 45, role: 'OPERATOR' }
                ].map((user, i) => (
                  <div key={user.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <span className="text-sm font-mono text-primary">{user.actions}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Types */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Resource Types
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'Documents', count: 234, icon: FileText, color: 'text-blue-400' },
                  { type: 'Users', count: 89, icon: Users, color: 'text-purple-400' },
                  { type: 'System', count: 56, icon: Server, color: 'text-gray-400' },
                  { type: 'Security', count: 34, icon: Shield, color: 'text-red-400' }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.type} className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-sm">{item.type}</span>
                      </div>
                      <p className="text-xl font-bold">{item.count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compliance Metrics */}
            <div className="md:col-span-2 glass-card p-6">
              <h4 className="font-semibold mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Compliance Score Overview
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {complianceMetrics.map(metric => (
                  <div
                    key={metric.label}
                    className={`p-4 rounded-xl border ${metric.status === 'good'
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : metric.status === 'warning'
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-red-500/5 border-red-500/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      ) : metric.trend === 'down' ? (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      ) : null}
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{metric.value}%</span>
                      <span className="text-xs text-muted-foreground mb-1">/ {metric.target}%</span>
                    </div>
                    <Progress
                      value={metric.value}
                      className={`h-1.5 mt-2 ${metric.status === 'good' ? '[&>div]:bg-emerald-500' :
                        metric.status === 'warning' ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                        }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Schedule */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Audits
              </h4>
              <div className="space-y-3">
                {[
                  { title: 'ISO 27001 Review', date: 'Dec 20, 2024', status: 'scheduled' },
                  { title: 'Safety Compliance Audit', date: 'Dec 28, 2024', status: 'scheduled' },
                  { title: 'Data Retention Audit', date: 'Jan 5, 2025', status: 'pending' }
                ].map(audit => (
                  <div key={audit.title} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{audit.title}</p>
                      <p className="text-xs text-muted-foreground">{audit.date}</p>
                    </div>
                    <Badge variant="outline" className={audit.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}>
                      {audit.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Retention Policies */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Retention Policies
              </h4>
              <div className="space-y-3">
                {[
                  { type: 'Audit Logs', retention: '7 years', status: 'active' },
                  { type: 'User Sessions', retention: '90 days', status: 'active' },
                  { type: 'Documents', retention: '10 years', status: 'active' },
                  { type: 'System Logs', retention: '1 year', status: 'active' }
                ].map(policy => (
                  <div key={policy.type} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <span className="text-sm">{policy.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-primary">{policy.retention}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security Alerts */}
            <div className="md:col-span-2 glass-card p-6 border border-red-500/20">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Security Alerts
              </h4>
              <div className="space-y-3">
                {logs.filter(l => l.severity === 'CRITICAL' || l.severity === 'ERROR').slice(0, 5).map(log => {
                  const severityConfig = SeverityConfig[log.severity];
                  return (
                    <div
                      key={log.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${severityConfig.bg} border ${severityConfig.border}`}
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${severityConfig.color}`} />
                        <div>
                          <p className="text-sm font-medium">{log.resource.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.action} by {log.user.name} • {formatTimestamp(log.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${severityConfig.color} ${severityConfig.border}`}>
                        {log.severity}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Failed Logins */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-400" />
                Recent Failed Logins
              </h4>
              <div className="space-y-3">
                {[
                  { ip: '192.168.1.100', attempts: 5, lastAttempt: '10m ago', blocked: true },
                  { ip: '10.0.0.45', attempts: 3, lastAttempt: '1h ago', blocked: false },
                  { ip: '172.16.0.22', attempts: 2, lastAttempt: '3h ago', blocked: false }
                ].map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-mono">{entry.ip}</p>
                        <p className="text-xs text-muted-foreground">{entry.attempts} attempts • {entry.lastAttempt}</p>
                      </div>
                    </div>
                    {entry.blocked && (
                      <Badge variant="destructive" className="text-xs">Blocked</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Session Monitor */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                Active Sessions
              </h4>
              <div className="space-y-3">
                {[
                  { user: 'Admin One', device: 'Chrome / Windows', location: 'Mumbai', active: true },
                  { user: 'Eng. Rajesh', device: 'Firefox / Linux', location: 'Chennai', active: true },
                  { user: 'Manager Singh', device: 'Safari / macOS', location: 'Delhi', active: false }
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${session.active ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium">{session.user}</p>
                        <p className="text-xs text-muted-foreground">{session.device} • {session.location}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 text-xs">
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedLog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {(() => {
                    const config = ActionConfig[selectedLog.action];
                    const ActionIcon = config.icon;
                    return (
                      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                        <ActionIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                    );
                  })()}
                  <div>
                    <span>{selectedLog.action} Event</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedLog.id} • {formatFullTimestamp(selectedLog.timestamp)}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${SeverityConfig[selectedLog.severity].bg} ${SeverityConfig[selectedLog.severity].color}`}>
                    {selectedLog.severity}
                  </Badge>
                  <Badge variant="secondary">{selectedLog.category}</Badge>
                  {selectedLog.correlationId && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedLog.correlationId}
                    </Badge>
                  )}
                </div>

                {/* Resource */}
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Resource</p>
                  <p className="font-medium">{selectedLog.resource.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Type: {selectedLog.resource.type} • ID: {selectedLog.resource.id}
                  </p>
                </div>

                {/* User */}
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">User</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedLog.user.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedLog.user.email} • {selectedLog.user.role}</p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedLog.metadata.ipAddress && (
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground">IP Address</p>
                      <p className="font-mono text-sm">{selectedLog.metadata.ipAddress}</p>
                    </div>
                  )}
                  {selectedLog.metadata.location && (
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm">{selectedLog.metadata.location}</p>
                    </div>
                  )}
                  {selectedLog.metadata.version && (
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground">Version</p>
                      <p className="font-mono text-sm">{selectedLog.metadata.version}</p>
                    </div>
                  )}
                  {selectedLog.sessionId && (
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground">Session ID</p>
                      <p className="font-mono text-sm">{selectedLog.sessionId}</p>
                    </div>
                  )}
                </div>

                {/* Changes */}
                {selectedLog.metadata.changes && (
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Changes</p>
                    {selectedLog.metadata.changes.map((change, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{change.field}</span>
                        <div className="mt-1 pl-3 border-l-2 border-border">
                          <p className="text-red-400 line-through">{change.old}</p>
                          <p className="text-emerald-400">{change.new}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Audit Logs
            </DialogTitle>
            <DialogDescription>
              Download {filteredLogs.length} filtered audit logs
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => handleExport('json')}
            >
              <FileText className="w-8 h-8" />
              <span>JSON Format</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => handleExport('csv')}
            >
              <Database className="w-8 h-8" />
              <span>CSV Format</span>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
