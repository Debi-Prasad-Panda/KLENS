/**
 * NuclearKeys - Enhanced Quorum Approval System
 * High-risk action approval with multi-party authorization
 */

import { useState, useEffect } from "react";
import {
  Shield, Users, CheckCircle2, XCircle, Clock, History,
  AlertTriangle, Zap, Settings, Plus, Key, Lock, Unlock,
  ChevronRight, RefreshCw, Bell, Eye, Trash2, FileText,
  Timer, UserCheck, AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// Types
interface Approver {
  id: string;
  name: string;
  role: string;
  email: string;
  approved: boolean | null;
  approvedAt?: Date;
  comment?: string;
}

interface NuclearRequest {
  id: string;
  type: 'DELETE' | 'OVERRIDE' | 'EMERGENCY' | 'BULK_ACTION' | 'CONFIG_CHANGE';
  title: string;
  description: string;
  resourceId?: string;
  resourceType?: string;
  severity: 'HIGH' | 'CRITICAL' | 'CATASTROPHIC';
  requestedBy: string;
  requestedAt: Date;
  expiresAt: Date;
  requiredApprovals: number;
  approvers: Approver[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'EXECUTED';
  executedAt?: Date;
  executedBy?: string;
}

interface QuorumConfig {
  defaultRequiredApprovals: number;
  maxApprovers: number;
  expirationHours: number;
  requireDifferentDepartments: boolean;
  allowSelfApproval: boolean;
  notifyOnRequest: boolean;
}

// Mock data
const mockRequests: NuclearRequest[] = [
  {
    id: "NK-001",
    type: "DELETE",
    title: "Delete Safety Log #442 - Boiler B7 Incident",
    description: "Permanent deletion of safety incident log including all attachments and audit trail.",
    resourceType: "SAFETY_LOG",
    resourceId: "442",
    severity: "CRITICAL",
    requestedBy: "John Smith",
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
    requiredApprovals: 2,
    status: "PENDING",
    approvers: [
      { id: "1", name: "Admin One", role: "System Administrator", email: "admin1@klens.local", approved: true, approvedAt: new Date(Date.now() - 30 * 60 * 1000) },
      { id: "2", name: "Safety Lead", role: "Safety Officer", email: "safety@klens.local", approved: null },
      { id: "3", name: "Ops Manager", role: "Operations Manager", email: "ops@klens.local", approved: null }
    ]
  },
  {
    id: "NK-002",
    type: "BULK_ACTION",
    title: "Archive 156 Expired Documents",
    description: "Bulk archive operation for documents that have exceeded retention period.",
    resourceType: "DOCUMENTS",
    severity: "HIGH",
    requestedBy: "Data Admin",
    requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000),
    requiredApprovals: 2,
    status: "PENDING",
    approvers: [
      { id: "1", name: "Admin One", role: "System Administrator", email: "admin1@klens.local", approved: null },
      { id: "4", name: "Compliance Off.", role: "Compliance Officer", email: "compliance@klens.local", approved: null }
    ]
  },
  {
    id: "NK-003",
    type: "EMERGENCY",
    title: "Emergency System Override - Line 7 Shutdown",
    description: "Emergency override to bypass safety interlocks for critical maintenance.",
    resourceType: "SYSTEM",
    severity: "CATASTROPHIC",
    requestedBy: "Emergency Control",
    requestedAt: new Date(Date.now() - 15 * 60 * 1000),
    expiresAt: new Date(Date.now() + 45 * 60 * 1000),
    requiredApprovals: 3,
    status: "PENDING",
    approvers: [
      { id: "1", name: "Admin One", role: "System Administrator", email: "admin1@klens.local", approved: true, approvedAt: new Date(Date.now() - 10 * 60 * 1000) },
      { id: "2", name: "Safety Lead", role: "Safety Officer", email: "safety@klens.local", approved: true, approvedAt: new Date(Date.now() - 5 * 60 * 1000) },
      { id: "5", name: "Plant Manager", role: "Plant Manager", email: "manager@klens.local", approved: null }
    ]
  }
];

const mockHistory: NuclearRequest[] = [
  {
    id: "NK-000",
    type: "CONFIG_CHANGE",
    title: "Modify RLS Policies - Knowledge Hub",
    description: "Changed row-level security policies for department access.",
    resourceType: "DATABASE",
    severity: "HIGH",
    requestedBy: "DBA Admin",
    requestedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    requiredApprovals: 2,
    status: "EXECUTED",
    executedAt: new Date(Date.now() - 46 * 60 * 60 * 1000),
    executedBy: "Admin One",
    approvers: [
      { id: "1", name: "Admin One", role: "System Administrator", email: "admin1@klens.local", approved: true, approvedAt: new Date(Date.now() - 47 * 60 * 60 * 1000) },
      { id: "2", name: "Safety Lead", role: "Safety Officer", email: "safety@klens.local", approved: true, approvedAt: new Date(Date.now() - 46.5 * 60 * 60 * 1000) }
    ]
  }
];

// Severity colors
const SeverityColors: Record<string, { bg: string; text: string; border: string }> = {
  HIGH: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
  CRITICAL: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
  CATASTROPHIC: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", border: "border-fuchsia-500/30" }
};

// Type colors
const TypeIcons: Record<string, { icon: typeof Shield; color: string }> = {
  DELETE: { icon: Trash2, color: "text-red-400" },
  OVERRIDE: { icon: Unlock, color: "text-amber-400" },
  EMERGENCY: { icon: Zap, color: "text-fuchsia-400" },
  BULK_ACTION: { icon: FileText, color: "text-blue-400" },
  CONFIG_CHANGE: { icon: Settings, color: "text-purple-400" }
};

// Time formatting helper
function formatTimeRemaining(expiresAt: Date): string {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${minutes}m ago`;
}

export function NuclearKeys() {
  const { user, cinderellaAccess, grantCinderellaAccess } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const [requests, setRequests] = useState<NuclearRequest[]>(mockRequests);
  const [history, setHistory] = useState<NuclearRequest[]>(mockHistory);
  const [selectedRequest, setSelectedRequest] = useState<NuclearRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [lastBreakGlassEvent, setLastBreakGlassEvent] = useState<{ title: string; at: Date; by: string } | null>(null);
  const [config, setConfig] = useState<QuorumConfig>({
    defaultRequiredApprovals: 2,
    maxApprovers: 5,
    expirationHours: 24,
    requireDifferentDepartments: true,
    allowSelfApproval: false,
    notifyOnRequest: true
  });

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canBreakGlass = can('EMERGENCY_GRANT') || isAdmin;
  const pendingCount = requests.filter(r => r.status === "PENDING").length;
  const urgentCount = requests.filter(r =>
    r.status === "PENDING" && r.severity === "CATASTROPHIC"
  ).length;

  // Keep detail modal request object fresh as approvals/status update.
  useEffect(() => {
    if (!selectedRequest) return;
    const latest = requests.find(r => r.id === selectedRequest.id);
    if (!latest) {
      setSelectedRequest(null);
      return;
    }
    setSelectedRequest(latest);
  }, [requests, selectedRequest]);

  // Handle approval/rejection
  const handleApproval = (requestId: string, approverId: string, decision: boolean, comment?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;

      const updatedApprovers = req.approvers.map(a =>
        a.id === approverId
          ? { ...a, approved: decision, approvedAt: new Date(), comment }
          : a
      );

      const approvalCount = updatedApprovers.filter(a => a.approved === true).length;
      const rejectionCount = updatedApprovers.filter(a => a.approved === false).length;

      let newStatus = req.status;
      if (approvalCount >= req.requiredApprovals) {
        newStatus = "APPROVED";
      } else if (rejectionCount > req.approvers.length - req.requiredApprovals) {
        newStatus = "REJECTED";
      }

      return { ...req, approvers: updatedApprovers, status: newStatus };
    }));

    toast({
      title: decision ? "Approved" : "Rejected",
      description: `Your ${decision ? "approval" : "rejection"} has been recorded.`,
    });
  };

  // Execute approved action
  const handleExecute = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return { ...req, status: "EXECUTED", executedAt: new Date(), executedBy: user?.name };
    }));

    // Move to history
    const executed = requests.find(r => r.id === requestId);
    if (executed) {
      setHistory(prev => [{ ...executed, status: "EXECUTED", executedAt: new Date(), executedBy: user?.name }, ...prev]);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    }

    toast({
      title: "Action Executed",
      description: "The nuclear key action has been executed successfully.",
      variant: "destructive"
    });

    setDetailModalOpen(false);
  };

  // Grant emergency access (Cinderella)
  const handleEmergencyOverride = () => {
    grantCinderellaAccess(15); // 15 minutes
    toast({
      title: "🎃 Cinderella Access Granted",
      description: "You have 15 minutes of elevated permissions.",
    });
  };

  const handleBreakGlass = () => {
    if (!canBreakGlass) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to trigger Break Glass.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      "BREAK GLASS EMERGENCY OVERRIDE\n\nThis bypasses normal approval workflows and will trigger high-priority alerts. Continue?"
    );

    if (!confirmed) return;

    const now = new Date();
    const requestId = `BG-${Math.floor(now.getTime() / 1000)}`;
    const title = `Break Glass Emergency Override - ${user?.department || "Plant"}`;

    setRequests(prev => [
      {
        id: requestId,
        type: "EMERGENCY",
        title,
        description: "Emergency override triggered via Break Glass. Safety/operations alerts dispatched.",
        resourceType: "SYSTEM",
        severity: "CATASTROPHIC",
        requestedBy: user?.name || "Unknown",
        requestedAt: now,
        expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
        requiredApprovals: 1,
        approvers: [
          {
            id: String(user?.id || "0"),
            name: user?.name || "Current User",
            role: user?.role || "OPERATOR",
            email: user?.email || "",
            approved: true,
            approvedAt: now,
            comment: "Break Glass trigger",
          },
        ],
        status: "APPROVED",
      },
      ...prev,
    ]);

    // Record immediate executed event so users see a concrete state change.
    setHistory(prev => [
      {
        id: requestId,
        type: "EMERGENCY",
        title,
        description: "Break Glass emergency override executed.",
        resourceType: "SYSTEM",
        severity: "CATASTROPHIC",
        requestedBy: user?.name || "Unknown",
        requestedAt: now,
        expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
        requiredApprovals: 1,
        approvers: [
          {
            id: String(user?.id || "0"),
            name: user?.name || "Current User",
            role: user?.role || "OPERATOR",
            email: user?.email || "",
            approved: true,
            approvedAt: now,
            comment: "Break Glass trigger",
          },
        ],
        status: "EXECUTED",
        executedAt: now,
        executedBy: user?.name || "Current User",
      },
      ...prev,
    ]);

    setLastBreakGlassEvent({
      title,
      at: now,
      by: user?.name || "Current User",
    });

    grantCinderellaAccess(15);

    toast({
      title: "Break Glass Activated",
      description: "Emergency override enabled for 15 minutes. All actions are now under critical audit.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-fuchsia-500/20 flex items-center justify-center border border-red-500/30">
            <Key className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-fuchsia-500 bg-clip-text text-transparent">
              Nuclear Keys
            </h2>
            <p className="text-muted-foreground mt-0.5">
              Multi-party authorization for high-risk actions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              {urgentCount} Urgent
            </Badge>
          )}
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigModalOpen(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure
              </Button>
              <Button
                size="sm"
                onClick={() => setNewRequestModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-red-500 to-fuchsia-500 hover:from-red-600 hover:to-fuchsia-600"
              >
                <Plus className="w-4 h-4" />
                New Request
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold mt-1">{pendingCount}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Urgent</span>
            <Zap className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold mt-1">{urgentCount}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Executed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold mt-1">
            {history.filter(h => h.executedAt && (Date.now() - h.executedAt.getTime()) < 24 * 60 * 60 * 1000).length}
          </p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Approval Rate</span>
            <UserCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold mt-1">87%</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-md border border-border/50">
          <TabsTrigger value="pending" className="flex items-center gap-2 data-[state=active]:bg-red-500/20">
            <AlertTriangle className="w-4 h-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2 data-[state=active]:bg-fuchsia-500/20">
            <Zap className="w-4 h-4" />
            Emergency Override
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {requests.filter(r => r.status === "PENDING").length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending nuclear key requests</p>
                <p className="text-sm mt-1">All clear! No high-risk actions awaiting approval.</p>
              </div>
            ) : (
              requests.filter(r => r.status === "PENDING").map(request => {
                const severityColors = SeverityColors[request.severity];
                const typeConfig = TypeIcons[request.type];
                const TypeIcon = typeConfig.icon;
                const approvalCount = request.approvers.filter(a => a.approved === true).length;
                const progress = (approvalCount / request.requiredApprovals) * 100;

                return (
                  <div
                    key={request.id}
                    className={`rounded-xl border ${severityColors.border} ${severityColors.bg} backdrop-blur-xl p-5 
                      hover:border-current/50 transition-all duration-300 cursor-pointer group`}
                    onClick={() => { setSelectedRequest(request); setDetailModalOpen(true); }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl ${severityColors.bg} border ${severityColors.border} flex items-center justify-center`}>
                          <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`text-xs ${severityColors.text} ${severityColors.border}`}>
                              {request.severity}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {request.type.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">#{request.id}</span>
                          </div>
                          <h4 className="font-semibold text-foreground">{request.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {request.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                          {approvalCount} of {request.requiredApprovals} approvals
                        </span>
                        <span className={`${severityColors.text} flex items-center gap-1`}>
                          <Timer className="w-3 h-3" />
                          {formatTimeRemaining(request.expiresAt)}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Approvers */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {request.approvers.map(approver => (
                        <div
                          key={approver.id}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${approver.approved === true
                              ? "bg-emerald-500/20 text-emerald-400"
                              : approver.approved === false
                                ? "bg-red-500/20 text-red-400"
                                : "bg-secondary text-muted-foreground"
                            }`}
                        >
                          {approver.approved === true ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : approver.approved === false ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {approver.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {history.map(request => {
                const typeConfig = TypeIcons[request.type];
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center`}>
                        <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{request.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Executed by {request.executedBy} • {request.executedAt && formatTimeAgo(request.executedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${request.status === "EXECUTED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : request.status === "REJECTED"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-muted"
                          }`}
                      >
                        {request.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Emergency Override Tab */}
        <TabsContent value="emergency" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cinderella Access */}
            <div className="glass-card p-6 border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/5 to-purple-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-fuchsia-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Cinderella Access</h4>
                  <p className="text-sm text-muted-foreground">Time-limited elevated permissions</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Grant yourself temporary elevated access for emergency operations.
                All actions are logged and will be audited.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleEmergencyOverride}
                  className="flex-1 gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-500"
                >
                  <Zap className="w-4 h-4" />
                  Grant 15min Access
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Requires supervisor notification
              </p>
            </div>

            {/* Break Glass */}
            <div className="glass-card p-6 border border-red-500/30 bg-gradient-to-br from-red-500/5 to-orange-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Break Glass</h4>
                  <p className="text-sm text-muted-foreground">Emergency system override</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                For critical emergencies only. Bypasses all approval workflows.
                Triggers immediate alerts to all administrators.
              </p>
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={handleBreakGlass}
                disabled={!canBreakGlass}
              >
                <Shield className="w-4 h-4" />
                Break Glass (Requires 2FA)
              </Button>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Bell className="w-3 h-3" />
                All admins will be notified immediately
              </p>
            </div>

            {/* Active Sessions */}
            <div className="md:col-span-2 glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Active Emergency Sessions
              </h4>
              <div className="space-y-3">
                {lastBreakGlassEvent && (
                  <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <div>
                      <p className="font-medium text-sm text-red-300">{lastBreakGlassEvent.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Triggered by {lastBreakGlassEvent.by} at {lastBreakGlassEvent.at.toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">EXECUTED</Badge>
                  </div>
                )}

                {cinderellaAccess ? (
                  <div className="flex items-center justify-between p-3 bg-fuchsia-500/10 rounded-lg border border-fuchsia-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                        <Timer className="w-4 h-4 text-fuchsia-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user?.name || "Current User"}</p>
                        <p className="text-xs text-muted-foreground">Cinderella Access • Emergency mode active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30">
                        Until {new Date(cinderellaAccess.expiresAt).toLocaleTimeString()}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No active emergency sessions
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const typeConfig = TypeIcons[selectedRequest.type];
                    const TypeIcon = typeConfig.icon;
                    const severityColors = SeverityColors[selectedRequest.severity];
                    return (
                      <div className={`w-12 h-12 rounded-xl ${severityColors.bg} border ${severityColors.border} flex items-center justify-center`}>
                        <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
                      </div>
                    );
                  })()}
                  <div>
                    <DialogTitle>{selectedRequest.title}</DialogTitle>
                    <DialogDescription>
                      Request #{selectedRequest.id} • Requested by {selectedRequest.requestedBy}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 py-4">
                  {/* Description */}
                  <div>
                    <h5 className="text-sm font-semibold mb-2">Description</h5>
                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                      {selectedRequest.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Resource Type</p>
                      <p className="font-medium">{selectedRequest.resourceType}</p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Time Remaining</p>
                      <p className="font-medium">{formatTimeRemaining(selectedRequest.expiresAt)}</p>
                    </div>
                  </div>

                  {/* Approvers */}
                  <div>
                    <h5 className="text-sm font-semibold mb-3">Approvers ({selectedRequest.approvers.filter(a => a.approved).length}/{selectedRequest.requiredApprovals} required)</h5>
                    <div className="space-y-2">
                      {selectedRequest.approvers.map(approver => (
                        <div
                          key={approver.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${approver.approved === true
                              ? "bg-emerald-500/10 border border-emerald-500/30"
                              : approver.approved === false
                                ? "bg-red-500/10 border border-red-500/30"
                                : "bg-secondary/50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${approver.approved === true
                                ? "bg-emerald-500/20"
                                : approver.approved === false
                                  ? "bg-red-500/20"
                                  : "bg-secondary"
                              }`}>
                              {approver.approved === true ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : approver.approved === false ? (
                                <XCircle className="w-4 h-4 text-red-400" />
                              ) : (
                                <Clock className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{approver.name}</p>
                              <p className="text-xs text-muted-foreground">{approver.role}</p>
                            </div>
                          </div>
                          {approver.approved === null ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                onClick={(e) => { e.stopPropagation(); handleApproval(selectedRequest.id, approver.id, true); }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                                onClick={(e) => { e.stopPropagation(); handleApproval(selectedRequest.id, approver.id, false); }}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {approver.approvedAt && formatTimeAgo(approver.approvedAt)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                  Close
                </Button>
                {selectedRequest.status === "APPROVED" && (
                  <Button
                    variant="destructive"
                    onClick={() => handleExecute(selectedRequest.id)}
                    className="gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Execute Action
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Configuration Modal */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Nuclear Keys Configuration
            </DialogTitle>
            <DialogDescription>
              Configure quorum requirements and approval workflows
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Required Approvals</label>
              <select
                value={config.defaultRequiredApprovals}
                onChange={e => setConfig(prev => ({ ...prev, defaultRequiredApprovals: parseInt(e.target.value) }))}
                className="w-full p-2 rounded-lg bg-secondary border border-border"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} approver{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expiration Time (hours)</label>
              <select
                value={config.expirationHours}
                onChange={e => setConfig(prev => ({ ...prev, expirationHours: parseInt(e.target.value) }))}
                className="w-full p-2 rounded-lg bg-secondary border border-border"
              >
                {[1, 4, 8, 12, 24, 48, 72].map(n => (
                  <option key={n} value={n}>{n} hour{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Require Different Departments</p>
                <p className="text-xs text-muted-foreground">Approvers must be from different departments</p>
              </div>
              <input
                type="checkbox"
                checked={config.requireDifferentDepartments}
                onChange={e => setConfig(prev => ({ ...prev, requireDifferentDepartments: e.target.checked }))}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Allow Self-Approval</p>
                <p className="text-xs text-muted-foreground">Requesters can approve their own requests</p>
              </div>
              <input
                type="checkbox"
                checked={config.allowSelfApproval}
                onChange={e => setConfig(prev => ({ ...prev, allowSelfApproval: e.target.checked }))}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Notify on Request</p>
                <p className="text-xs text-muted-foreground">Send notifications when new requests are created</p>
              </div>
              <input
                type="checkbox"
                checked={config.notifyOnRequest}
                onChange={e => setConfig(prev => ({ ...prev, notifyOnRequest: e.target.checked }))}
                className="w-4 h-4"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({ title: "Configuration Saved", description: "Nuclear Keys settings have been updated." });
              setConfigModalOpen(false);
            }}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
