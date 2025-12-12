/**
 * RoleManagementView - Admin Role & Permission Management
 * Premium UI for managing RBAC with visual excellence
 */

import { useState, useEffect } from "react";
import {
     Crown, Shield, Wrench, ShieldCheck, User, Check, X,
     ChevronDown, ChevronRight, Search, Filter, AlertTriangle,
     Lock, Unlock, Save, RefreshCw, Eye, Edit2, Users,
     Layers, Grid3X3, LayoutGrid
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { getAccessToken } from "@/lib/supabase";
import {
     ROLE_METADATA,
     PERMISSION_CATEGORIES,
     PERMISSION_METADATA,
     Permission as PermissionType,
     Role,
     getRolePermissions
} from "@/lib/permissions";

// Types
interface RoleInfo {
     role: string;
     display_name: string;
     description: string;
     color: string;
     icon: string;
     permissions: string[];
     permission_count: number;
}

interface PermissionInfo {
     action: string;
     description: string;
     category: string;
     risk_level: string;
}

// Role Icons Mapping
const RoleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
     Crown: Crown,
     Shield: Shield,
     Wrench: Wrench,
     ShieldCheck: ShieldCheck,
     User: User
};

// Risk Level Colors
const RiskColors: Record<string, { bg: string; text: string; border: string }> = {
     LOW: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
     MEDIUM: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
     HIGH: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
     CRITICAL: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" }
};

// Role Colors
const RoleColors: Record<string, { primary: string; bg: string; glow: string }> = {
     amber: { primary: "text-amber-400", bg: "bg-amber-500/20", glow: "shadow-amber-500/20" },
     blue: { primary: "text-blue-400", bg: "bg-blue-500/20", glow: "shadow-blue-500/20" },
     purple: { primary: "text-purple-400", bg: "bg-purple-500/20", glow: "shadow-purple-500/20" },
     emerald: { primary: "text-emerald-400", bg: "bg-emerald-500/20", glow: "shadow-emerald-500/20" },
     slate: { primary: "text-slate-400", bg: "bg-slate-500/20", glow: "shadow-slate-500/20" }
};

export function RoleManagementView() {
     const { user } = useAuth();
     const { toast } = useToast();
     const [roles, setRoles] = useState<RoleInfo[]>([]);
     const [permissions, setPermissions] = useState<PermissionInfo[]>([]);
     const [loading, setLoading] = useState(true);
     const [selectedRole, setSelectedRole] = useState<string | null>(null);
     const [editModalOpen, setEditModalOpen] = useState(false);
     const [pendingChanges, setPendingChanges] = useState<{ add: string[]; remove: string[] }>({ add: [], remove: [] });
     const [searchQuery, setSearchQuery] = useState("");
     const [filterCategory, setFilterCategory] = useState<string | null>(null);
     const [compareRoles, setCompareRoles] = useState<[string, string] | null>(null);
     const [saving, setSaving] = useState(false);

     const isAdmin = user?.role === "ADMIN";

     // Fetch roles and permissions
     useEffect(() => {
          fetchData();
     }, []);

     const fetchData = async () => {
          setLoading(true);
          try {
               const token = await getAccessToken();

               // Try to fetch from API first
               const rolesRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/roles/`, {
                    headers: { Authorization: `Bearer ${token}` }
               });

               const permsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/roles/permissions`, {
                    headers: { Authorization: `Bearer ${token}` }
               });

               if (rolesRes.ok && permsRes.ok) {
                    setRoles(await rolesRes.json());
                    setPermissions(await permsRes.json());
               } else {
                    // Fallback to local data
                    console.log("API not available, using local permission data");
                    loadLocalData();
               }
          } catch (error) {
               console.error("Failed to fetch roles:", error);
               loadLocalData();
          }
          setLoading(false);
     };

     const loadLocalData = () => {
          // Use local permissions.ts data as fallback
          const localRoles: RoleInfo[] = Object.entries(ROLE_METADATA).map(([role, meta]) => ({
               role,
               display_name: meta.displayName,
               description: meta.description,
               color: meta.color,
               icon: meta.icon,
               permissions: getRolePermissions(role),
               permission_count: getRolePermissions(role).length
          }));
          setRoles(localRoles);

          const localPerms: PermissionInfo[] = Object.entries(PERMISSION_METADATA).map(([action, meta]) => ({
               action,
               description: meta.description,
               category: meta.category,
               risk_level: meta.riskLevel
          }));
          setPermissions(localPerms);
     };

     const saveChanges = async () => {
          if (!selectedRole || (pendingChanges.add.length === 0 && pendingChanges.remove.length === 0)) return;

          setSaving(true);
          try {
               const token = await getAccessToken();

               const response = await fetch(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/roles/${selectedRole}/permissions`,
                    {
                         method: 'PUT',
                         headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`
                         },
                         body: JSON.stringify({
                              role: selectedRole,
                              permissions_to_add: pendingChanges.add,
                              permissions_to_remove: pendingChanges.remove
                         })
                    }
               );

               if (response.ok) {
                    const result = await response.json();
                    toast({
                         title: "Permissions Updated",
                         description: `Successfully updated ${selectedRole} role. Added: ${pendingChanges.add.length}, Removed: ${pendingChanges.remove.length}`,
                    });
                    await fetchData();
                    setPendingChanges({ add: [], remove: [] });
                    setEditModalOpen(false);
               } else {
                    const error = await response.text();
                    toast({
                         title: "Failed to Save",
                         description: error || "Could not update permissions. Make sure the backend API is running.",
                         variant: "destructive"
                    });
               }
          } catch (error) {
               console.error("Failed to save changes:", error);
               toast({
                    title: "Connection Error",
                    description: "Could not connect to the backend API. Please ensure the server is running at localhost:8000.",
                    variant: "destructive"
               });
          }
          setSaving(false);
     };

     const togglePermission = (action: string, currentlyHas: boolean) => {
          if (currentlyHas) {
               // Remove permission
               if (pendingChanges.add.includes(action)) {
                    setPendingChanges(prev => ({ ...prev, add: prev.add.filter(p => p !== action) }));
               } else if (!pendingChanges.remove.includes(action)) {
                    setPendingChanges(prev => ({ ...prev, remove: [...prev.remove, action] }));
               }
          } else {
               // Add permission
               if (pendingChanges.remove.includes(action)) {
                    setPendingChanges(prev => ({ ...prev, remove: prev.remove.filter(p => p !== action) }));
               } else if (!pendingChanges.add.includes(action)) {
                    setPendingChanges(prev => ({ ...prev, add: [...prev.add, action] }));
               }
          }
     };

     const getEffectivePermissions = (rolePerms: string[]) => {
          let effective = [...rolePerms];
          pendingChanges.remove.forEach(p => {
               effective = effective.filter(ep => ep !== p);
          });
          pendingChanges.add.forEach(p => {
               if (!effective.includes(p)) effective.push(p);
          });
          return effective;
     };

     const filteredPermissions = permissions.filter(p => {
          const matchesSearch = !searchQuery ||
               p.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
               p.description.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory = !filterCategory || p.category === filterCategory;
          return matchesSearch && matchesCategory;
     });

     const groupedPermissions = filteredPermissions.reduce((acc, p) => {
          if (!acc[p.category]) acc[p.category] = [];
          acc[p.category].push(p);
          return acc;
     }, {} as Record<string, PermissionInfo[]>);

     const getRoleById = (roleId: string) => roles.find(r => r.role === roleId);

     if (loading) {
          return (
               <div className="flex items-center justify-center h-64 animate-pulse">
                    <div className="flex flex-col items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-primary/20 animate-spin" />
                         <p className="text-muted-foreground">Loading roles...</p>
                    </div>
               </div>
          );
     }

     return (
          <div className="space-y-6 animate-fade-in">
               {/* Header */}
               <div className="flex items-center justify-between">
                    <div>
                         <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                              Role Management
                         </h2>
                         <p className="text-muted-foreground mt-1">
                              Configure roles and permissions for document access control
                         </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button
                              variant="outline"
                              size="sm"
                              onClick={fetchData}
                              className="gap-2"
                         >
                              <RefreshCw className="w-4 h-4" />
                              Refresh
                         </Button>
                    </div>
               </div>

               {/* Main Content */}
               <Tabs defaultValue="roles" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-md border border-border/50">
                         <TabsTrigger value="roles" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
                              <Users className="w-4 h-4" />
                              Role Cards
                         </TabsTrigger>
                         <TabsTrigger value="matrix" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
                              <Grid3X3 className="w-4 h-4" />
                              Permission Matrix
                         </TabsTrigger>
                         <TabsTrigger value="compare" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
                              <Layers className="w-4 h-4" />
                              Compare Roles
                         </TabsTrigger>
                    </TabsList>

                    {/* Role Cards Tab */}
                    <TabsContent value="roles" className="mt-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {roles.map(role => {
                                   const colors = RoleColors[role.color] || RoleColors.slate;
                                   const IconComponent = RoleIcons[role.icon] || User;

                                   return (
                                        <div
                                             key={role.role}
                                             className={`relative group rounded-xl border border-border/50 bg-card/30 backdrop-blur-xl p-5
                    hover:border-primary/50 transition-all duration-300 hover:shadow-lg ${colors.glow}
                    ${selectedRole === role.role ? 'ring-2 ring-primary' : ''}`}
                                        >
                                             {/* Gradient overlay */}
                                             <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${colors.bg}`} />

                                             {/* Content */}
                                             <div className="relative z-10">
                                                  {/* Header */}
                                                  <div className="flex items-start justify-between mb-4">
                                                       <div className="flex items-center gap-3">
                                                            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                                                                 <IconComponent className={`w-6 h-6 ${colors.primary}`} />
                                                            </div>
                                                            <div>
                                                                 <h3 className="font-semibold text-foreground">{role.display_name}</h3>
                                                                 <Badge variant="outline" className={`text-xs ${colors.primary} border-current/30`}>
                                                                      {role.role}
                                                                 </Badge>
                                                            </div>
                                                       </div>
                                                       {isAdmin && (
                                                            <Button
                                                                 variant="ghost"
                                                                 size="icon"
                                                                 onClick={() => {
                                                                      setSelectedRole(role.role);
                                                                      setPendingChanges({ add: [], remove: [] });
                                                                      setEditModalOpen(true);
                                                                 }}
                                                                 className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                 <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                       )}
                                                  </div>

                                                  {/* Description */}
                                                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                       {role.description}
                                                  </p>

                                                  {/* Stats */}
                                                  <div className="flex items-center gap-4 mb-4">
                                                       <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                 <Lock className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                 <p className="text-lg font-bold">{role.permission_count}</p>
                                                                 <p className="text-xs text-muted-foreground">Permissions</p>
                                                            </div>
                                                       </div>
                                                  </div>

                                                  {/* Permission Preview */}
                                                  <Collapsible>
                                                       <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
                                                            <ChevronRight className="w-4 h-4 transition-transform ui-expanded:rotate-90" />
                                                            View permissions
                                                       </CollapsibleTrigger>
                                                       <CollapsibleContent className="mt-3">
                                                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                                                 {role.permissions.slice(0, 12).map(perm => (
                                                                      <Badge
                                                                           key={perm}
                                                                           variant="secondary"
                                                                           className="text-xs font-mono"
                                                                      >
                                                                           {perm}
                                                                      </Badge>
                                                                 ))}
                                                                 {role.permissions.length > 12 && (
                                                                      <Badge variant="outline" className="text-xs">
                                                                           +{role.permissions.length - 12} more
                                                                      </Badge>
                                                                 )}
                                                            </div>
                                                       </CollapsibleContent>
                                                  </Collapsible>
                                             </div>
                                        </div>
                                   );
                              })}
                         </div>
                    </TabsContent>

                    {/* Permission Matrix Tab */}
                    <TabsContent value="matrix" className="mt-6">
                         {/* Search & Filter */}
                         <div className="flex flex-wrap gap-3 mb-6">
                              <div className="relative flex-1 min-w-[200px]">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                   <input
                                        type="text"
                                        placeholder="Search permissions..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-card/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                   />
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                   <Button
                                        variant={filterCategory === null ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFilterCategory(null)}
                                   >
                                        All
                                   </Button>
                                   {Object.entries(PERMISSION_CATEGORIES).map(([key, label]) => (
                                        <Button
                                             key={key}
                                             variant={filterCategory === key ? "default" : "outline"}
                                             size="sm"
                                             onClick={() => setFilterCategory(key)}
                                        >
                                             {label}
                                        </Button>
                                   ))}
                              </div>
                         </div>

                         {/* Matrix Grid */}
                         <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden">
                              <ScrollArea className="w-full">
                                   <table className="w-full min-w-[800px]">
                                        <thead>
                                             <tr className="border-b border-border/50 bg-card/50">
                                                  <th className="text-left p-4 font-semibold sticky left-0 bg-card/80 backdrop-blur-xl z-10 min-w-[250px]">
                                                       Permission
                                                  </th>
                                                  {roles.map(role => {
                                                       const colors = RoleColors[role.color] || RoleColors.slate;
                                                       const IconComponent = RoleIcons[role.icon] || User;
                                                       return (
                                                            <th key={role.role} className="p-4 text-center min-w-[100px]">
                                                                 <div className="flex flex-col items-center gap-1">
                                                                      <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                                                           <IconComponent className={`w-4 h-4 ${colors.primary}`} />
                                                                      </div>
                                                                      <span className={`text-xs font-medium ${colors.primary}`}>{role.role}</span>
                                                                 </div>
                                                            </th>
                                                       );
                                                  })}
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {Object.entries(groupedPermissions).map(([category, perms]) => (
                                                  <>
                                                       <tr key={`cat-${category}`} className="bg-secondary/20">
                                                            <td colSpan={roles.length + 1} className="px-4 py-2">
                                                                 <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                      {PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES] || category}
                                                                 </span>
                                                            </td>
                                                       </tr>
                                                       {perms.map(perm => {
                                                            const riskColors = RiskColors[perm.risk_level] || RiskColors.LOW;
                                                            return (
                                                                 <tr key={perm.action} className="border-b border-border/30 hover:bg-card/50 transition-colors">
                                                                      <td className="p-4 sticky left-0 bg-card/80 backdrop-blur-xl">
                                                                           <div className="flex flex-col gap-1">
                                                                                <div className="flex items-center gap-2">
                                                                                     <code className="text-sm font-mono text-foreground">{perm.action}</code>
                                                                                     <Badge
                                                                                          variant="outline"
                                                                                          className={`text-[10px] ${riskColors.bg} ${riskColors.text} ${riskColors.border}`}
                                                                                     >
                                                                                          {perm.risk_level}
                                                                                     </Badge>
                                                                                </div>
                                                                                <span className="text-xs text-muted-foreground">{perm.description}</span>
                                                                           </div>
                                                                      </td>
                                                                      {roles.map(role => {
                                                                           const hasPermission = role.permissions.includes(perm.action);
                                                                           return (
                                                                                <td key={`${role.role}-${perm.action}`} className="p-4 text-center">
                                                                                     {hasPermission ? (
                                                                                          <div className="flex justify-center">
                                                                                               <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                                                               </div>
                                                                                          </div>
                                                                                     ) : (
                                                                                          <div className="flex justify-center">
                                                                                               <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                                                                                                    <X className="w-4 h-4 text-muted-foreground/50" />
                                                                                               </div>
                                                                                          </div>
                                                                                     )}
                                                                                </td>
                                                                           );
                                                                      })}
                                                                 </tr>
                                                            );
                                                       })}
                                                  </>
                                             ))}
                                        </tbody>
                                   </table>
                              </ScrollArea>
                         </div>
                    </TabsContent>

                    {/* Compare Roles Tab */}
                    <TabsContent value="compare" className="mt-6">
                         <div className="space-y-6">
                              {/* Role Selection */}
                              <div className="flex flex-wrap gap-4 items-center">
                                   <div className="flex-1 min-w-[200px]">
                                        <label className="text-sm text-muted-foreground mb-2 block">First Role</label>
                                        <select
                                             value={compareRoles?.[0] || ""}
                                             onChange={e => setCompareRoles([e.target.value, compareRoles?.[1] || ""])}
                                             className="w-full p-2 rounded-lg bg-card/50 border border-border/50 text-sm"
                                        >
                                             <option value="">Select role...</option>
                                             {roles.map(r => (
                                                  <option key={r.role} value={r.role}>{r.display_name}</option>
                                             ))}
                                        </select>
                                   </div>
                                   <div className="flex-1 min-w-[200px]">
                                        <label className="text-sm text-muted-foreground mb-2 block">Second Role</label>
                                        <select
                                             value={compareRoles?.[1] || ""}
                                             onChange={e => setCompareRoles([compareRoles?.[0] || "", e.target.value])}
                                             className="w-full p-2 rounded-lg bg-card/50 border border-border/50 text-sm"
                                        >
                                             <option value="">Select role...</option>
                                             {roles.map(r => (
                                                  <option key={r.role} value={r.role}>{r.display_name}</option>
                                             ))}
                                        </select>
                                   </div>
                              </div>

                              {/* Comparison View */}
                              {compareRoles && compareRoles[0] && compareRoles[1] && (
                                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Role 1 Only */}
                                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 backdrop-blur-xl p-4">
                                             <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                                  <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                                                       <Check className="w-3 h-3" />
                                                  </div>
                                                  Only in {getRoleById(compareRoles[0])?.display_name}
                                             </h4>
                                             <div className="space-y-2 max-h-64 overflow-y-auto">
                                                  {getRoleById(compareRoles[0])?.permissions
                                                       .filter(p => !getRoleById(compareRoles[1])?.permissions.includes(p))
                                                       .map(perm => (
                                                            <Badge key={perm} variant="secondary" className="mr-1 mb-1 font-mono text-xs">
                                                                 {perm}
                                                            </Badge>
                                                       ))}
                                             </div>
                                        </div>

                                        {/* Both Roles */}
                                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl p-4">
                                             <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                                                  <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                                                       <Check className="w-3 h-3" />
                                                  </div>
                                                  Common Permissions
                                             </h4>
                                             <div className="space-y-2 max-h-64 overflow-y-auto">
                                                  {getRoleById(compareRoles[0])?.permissions
                                                       .filter(p => getRoleById(compareRoles[1])?.permissions.includes(p))
                                                       .map(perm => (
                                                            <Badge key={perm} variant="secondary" className="mr-1 mb-1 font-mono text-xs bg-emerald-500/10">
                                                                 {perm}
                                                            </Badge>
                                                       ))}
                                             </div>
                                        </div>

                                        {/* Role 2 Only */}
                                        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 backdrop-blur-xl p-4">
                                             <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                                  <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                                                       <Check className="w-3 h-3" />
                                                  </div>
                                                  Only in {getRoleById(compareRoles[1])?.display_name}
                                             </h4>
                                             <div className="space-y-2 max-h-64 overflow-y-auto">
                                                  {getRoleById(compareRoles[1])?.permissions
                                                       .filter(p => !getRoleById(compareRoles[0])?.permissions.includes(p))
                                                       .map(perm => (
                                                            <Badge key={perm} variant="secondary" className="mr-1 mb-1 font-mono text-xs">
                                                                 {perm}
                                                            </Badge>
                                                       ))}
                                             </div>
                                        </div>
                                   </div>
                              )}

                              {(!compareRoles || !compareRoles[0] || !compareRoles[1]) && (
                                   <div className="text-center py-12 text-muted-foreground">
                                        <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Select two roles above to compare their permissions</p>
                                   </div>
                              )}
                         </div>
                    </TabsContent>
               </Tabs>

               {/* Edit Permissions Modal */}
               <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                         <DialogHeader>
                              <DialogTitle className="flex items-center gap-3">
                                   {selectedRole && (
                                        <>
                                             {(() => {
                                                  const role = getRoleById(selectedRole);
                                                  if (!role) return null;
                                                  const colors = RoleColors[role.color] || RoleColors.slate;
                                                  const IconComponent = RoleIcons[role.icon] || User;
                                                  return (
                                                       <>
                                                            <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                                                                 <IconComponent className={`w-5 h-5 ${colors.primary}`} />
                                                            </div>
                                                            <div>
                                                                 <span>Edit {role.display_name}</span>
                                                                 <p className="text-sm font-normal text-muted-foreground mt-0.5">
                                                                      Modify permissions for this role
                                                                 </p>
                                                            </div>
                                                       </>
                                                  );
                                             })()}
                                        </>
                                   )}
                              </DialogTitle>
                              <DialogDescription>
                                   Toggle permissions below. Changes are not saved until you click "Save Changes".
                              </DialogDescription>
                         </DialogHeader>

                         {/* Pending Changes Indicator */}
                         {(pendingChanges.add.length > 0 || pendingChanges.remove.length > 0) && (
                              <div className="flex items-center gap-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                   <AlertTriangle className="w-5 h-5 text-amber-400" />
                                   <div className="flex-1">
                                        <p className="text-sm font-medium text-amber-400">Unsaved Changes</p>
                                        <p className="text-xs text-muted-foreground">
                                             {pendingChanges.add.length} to add, {pendingChanges.remove.length} to remove
                                        </p>
                                   </div>
                              </div>
                         )}

                         {/* Permission List */}
                         <ScrollArea className="flex-1 -mx-6 px-6">
                              {selectedRole && (
                                   <div className="space-y-4 py-4">
                                        {Object.entries(PERMISSION_CATEGORIES).map(([catKey, catLabel]) => {
                                             const catPerms = permissions.filter(p => p.category === catKey);
                                             if (catPerms.length === 0) return null;

                                             return (
                                                  <div key={catKey} className="space-y-2">
                                                       <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                            {catLabel}
                                                       </h4>
                                                       <div className="space-y-1">
                                                            {catPerms.map(perm => {
                                                                 const role = getRoleById(selectedRole);
                                                                 const originalHas = role?.permissions.includes(perm.action) || false;
                                                                 const willHave = pendingChanges.add.includes(perm.action)
                                                                      ? true
                                                                      : pendingChanges.remove.includes(perm.action)
                                                                           ? false
                                                                           : originalHas;
                                                                 const hasChanged = willHave !== originalHas;
                                                                 const riskColors = RiskColors[perm.risk_level] || RiskColors.LOW;

                                                                 return (
                                                                      <div
                                                                           key={perm.action}
                                                                           className={`flex items-center justify-between p-3 rounded-lg transition-colors
                                ${hasChanged ? 'bg-amber-500/5 border border-amber-500/30' : 'bg-card/30 hover:bg-card/50'}`}
                                                                      >
                                                                           <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                     <code className="text-sm font-mono">{perm.action}</code>
                                                                                     <Badge
                                                                                          variant="outline"
                                                                                          className={`text-[10px] ${riskColors.bg} ${riskColors.text} ${riskColors.border}`}
                                                                                     >
                                                                                          {perm.risk_level}
                                                                                     </Badge>
                                                                                     {hasChanged && (
                                                                                          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                                                                                               MODIFIED
                                                                                          </Badge>
                                                                                     )}
                                                                                </div>
                                                                                <p className="text-xs text-muted-foreground mt-0.5">{perm.description}</p>
                                                                           </div>
                                                                           <Switch
                                                                                checked={willHave}
                                                                                onCheckedChange={() => togglePermission(perm.action, originalHas)}
                                                                           />
                                                                      </div>
                                                                 );
                                                            })}
                                                       </div>
                                                  </div>
                                             );
                                        })}
                                   </div>
                              )}
                         </ScrollArea>

                         <DialogFooter className="mt-4">
                              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                                   Cancel
                              </Button>
                              <Button
                                   onClick={saveChanges}
                                   disabled={saving || (pendingChanges.add.length === 0 && pendingChanges.remove.length === 0)}
                                   className="gap-2"
                              >
                                   {saving ? (
                                        <>
                                             <RefreshCw className="w-4 h-4 animate-spin" />
                                             Saving...
                                        </>
                                   ) : (
                                        <>
                                             <Save className="w-4 h-4" />
                                             Save Changes
                                        </>
                                   )}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </div>
     );
}
