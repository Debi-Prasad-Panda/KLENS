/**
 * WorkforceCommandCenter - The "Live Roster" Admin Panel
 * 
 * Enterprise-grade Workforce Identity & Governance UI
 * Features:
 * - Live stats dashboard with pulse animations
 * - Smart User Cards with shift/cert status
 * - Ghost Protocol archival with confirmation
 * - Safety Passport indicators
 * - Role promotion controls
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, Shield, Clock, AlertTriangle, Ghost, 
  Search, Filter, MoreVertical, User, Mail,
  Building2, BadgeCheck, XCircle, CheckCircle,
  ChevronDown, RefreshCw, UserPlus, UserMinus,
  Eye, EyeOff, Crown, Wrench, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

// =============== TYPES ===============

interface WorkforceUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  department: string | null;
  employee_id: string | null;
  shift_pattern: string | null;
  current_status: string;
  is_active: boolean;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  is_on_shift?: boolean;
  expired_certs_count?: number;
  certs_expiring_soon?: number;
}

interface WorkforceStats {
  active_users: number;
  ghost_users: number;
  on_shift_users: number;
  expired_certs_count: number;
  users_with_expired_certs: number;
}

// =============== HELPER COMPONENTS ===============

const RoleIcon = ({ role }: { role: string }) => {
  switch (role) {
    case 'ADMIN':
      return <Crown className="w-4 h-4 text-amber-400" />;
    case 'MANAGER':
      return <Shield className="w-4 h-4 text-blue-400" />;
    case 'SAFETY_OFFICER':
      return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    default:
      return <Wrench className="w-4 h-4 text-slate-400" />;
  }
};

const ShiftBadge = ({ pattern, isOnShift }: { pattern: string | null; isOnShift?: boolean }) => {
  if (!pattern) return null;
  
  const colorClass = isOnShift 
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
    : 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full border ${colorClass}`}>
      {pattern}
    </span>
  );
};

const CertIndicator = ({ expired, expiring }: { expired?: number; expiring?: number }) => {
  if (!expired && !expiring) {
    return (
      <div className="flex items-center gap-1 text-emerald-400">
        <BadgeCheck className="w-4 h-4" />
        <span className="text-xs">Certs Valid</span>
      </div>
    );
  }
  
  if (expired && expired > 0) {
    return (
      <div className="flex items-center gap-1 text-red-400 animate-pulse">
        <XCircle className="w-4 h-4" />
        <span className="text-xs">{expired} Expired</span>
      </div>
    );
  }
  
  if (expiring && expiring > 0) {
    return (
      <div className="flex items-center gap-1 text-amber-400">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs">{expiring} Expiring</span>
      </div>
    );
  }
  
  return null;
};

// =============== STAT CARD ===============

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  pulse?: boolean;
}

const StatCard = ({ icon, label, value, color, pulse }: StatCardProps) => (
  <div className={`
    relative overflow-hidden rounded-xl p-4 border
    bg-gradient-to-br ${color}
    backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]
  `}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-white/10 ${pulse ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
    </div>
    {/* Decorative gradient */}
    <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5 blur-xl" />
  </div>
);

// =============== USER CARD ===============

interface UserCardProps {
  user: WorkforceUser;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onPromote: (id: string, role: string) => void;
  onViewDetails: (user: WorkforceUser) => void;
}

const UserCard = ({ user, onArchive, onRestore, onPromote, onViewDetails }: UserCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  
  const borderColor = user.is_archived 
    ? 'border-l-slate-600' 
    : user.is_on_shift 
      ? 'border-l-emerald-500' 
      : 'border-l-amber-500';
  
  const roles = ['ADMIN', 'MANAGER', 'OPERATOR', 'SAFETY_OFFICER'];
  
  return (
    <div className={`
      relative bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50
      border-l-4 ${borderColor} p-4 transition-all duration-300
      hover:bg-slate-800/80 hover:shadow-lg hover:shadow-black/20
      ${user.is_archived ? 'opacity-60' : ''}
    `}>
      {/* Ghost overlay */}
      {user.is_archived && (
        <div className="absolute top-2 right-2">
          <Ghost className="w-5 h-5 text-slate-500" />
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
            {(user.full_name || user.email)?.[0]?.toUpperCase() || '?'}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">
                {user.full_name || 'Unnamed User'}
              </h3>
              <RoleIcon role={user.role} />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Mail className="w-3 h-3" />
              <span className="truncate">{user.email}</span>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              {user.department && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Building2 className="w-3 h-3" />
                  {user.department}
                </div>
              )}
              <ShiftBadge pattern={user.shift_pattern} isOnShift={user.is_on_shift} />
            </div>
          </div>
        </div>
        
        {/* Status & Actions */}
        <div className="flex flex-col items-end gap-2">
          <CertIndicator 
            expired={user.expired_certs_count} 
            expiring={user.certs_expiring_soon} 
          />
          
          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
                <button
                  onClick={() => { onViewDetails(user); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
                
                <button
                  onClick={() => { setShowRoleMenu(!showRoleMenu); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" /> Change Role
                  <ChevronDown className="w-3 h-3 ml-auto" />
                </button>
                
                {showRoleMenu && (
                  <div className="border-t border-slate-700 py-1 px-2">
                    {roles.map(role => (
                      <button
                        key={role}
                        onClick={() => { onPromote(user.id, role); setShowMenu(false); setShowRoleMenu(false); }}
                        className={`w-full px-3 py-1.5 text-left text-xs rounded hover:bg-slate-600/50 flex items-center gap-2
                          ${user.role === role ? 'bg-blue-500/20 text-blue-400' : ''}`}
                      >
                        <RoleIcon role={role} />
                        {role}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="border-t border-slate-700" />
                
                {user.is_archived ? (
                  <button
                    onClick={() => { onRestore(user.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-emerald-400 hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Restore User
                  </button>
                ) : (
                  <button
                    onClick={() => { onArchive(user.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-amber-400 hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <Ghost className="w-4 h-4" /> Ghost Protocol
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            user.is_archived ? 'bg-slate-500' :
            user.current_status === 'ON_SHIFT' ? 'bg-emerald-500 animate-pulse' :
            user.current_status === 'ON_BREAK' ? 'bg-amber-500' :
            'bg-slate-500'
          }`} />
          <span className="text-slate-400">
            {user.is_archived ? 'Archived' : user.current_status?.replace('_', ' ') || 'Off Shift'}
          </span>
        </div>
        
        <span className="text-slate-500">
          ID: {user.employee_id || user.id.slice(0, 8)}
        </span>
      </div>
    </div>
  );
};

// =============== GHOST PROTOCOL MODAL ===============

interface GhostModalProps {
  user: WorkforceUser | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const GhostProtocolModal = ({ user, onConfirm, onCancel }: GhostModalProps) => {
  if (!user) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-amber-500/20">
            <Ghost className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Ghost Protocol</h2>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
          <p className="text-amber-200 text-sm">
            ⚠️ <strong>WAIT!</strong> Don't delete data.
          </p>
        </div>
        
        <p className="text-slate-300 mb-4">
          Converting <strong className="text-white">{user.full_name || user.email}</strong> to Ghost Mode will:
        </p>
        
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2 text-sm text-slate-400">
            <XCircle className="w-4 h-4 text-red-400" />
            Revoke login access immediately
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Preserve audit logs for compliance
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Allow AI to learn from past actions
          </li>
        </ul>
        
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Ghost className="w-4 h-4" />
            Archive as Ghost
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// =============== MAIN COMPONENT ===============

export function WorkforceCommandCenter() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<WorkforceUser[]>([]);
  const [stats, setStats] = useState<WorkforceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [ghostTarget, setGhostTarget] = useState<WorkforceUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<WorkforceUser | null>(null);
  
  // Fetch users and stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      
      // Fetch users
      const usersRes = await fetch(`/api/users?include_archived=${showArchived}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }
      
      // Fetch stats
      const statsRes = await fetch('/api/users/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch workforce data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Get token helper
  const getToken = async () => {
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || '';
  };
  
  useEffect(() => {
    fetchData();
  }, [showArchived]);
  
  // Archive user
  const handleArchive = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setGhostTarget(user);
  };
  
  const confirmArchive = async () => {
    if (!ghostTarget) return;
    
    try {
      const token = await getToken();
      const res = await fetch(`/api/users/${ghostTarget.id}/archive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success(`${ghostTarget.full_name || ghostTarget.email} archived (Ghost Mode)`);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to archive user');
      }
    } catch (err) {
      toast.error('Failed to archive user');
    } finally {
      setGhostTarget(null);
    }
  };
  
  // Restore user
  const handleRestore = async (userId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/users/${userId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success('User restored successfully');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to restore user');
    }
  };
  
  // Promote user
  const handlePromote = async (userId: string, role: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/users/${userId}/promote?role=${role}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success(`User role updated to ${role}`);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to update role');
      }
    } catch (err) {
      toast.error('Failed to update role');
    }
  };
  
  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  // Check if user is admin
  const isAdmin = currentUser?.role === 'ADMIN';
  
  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">You need ADMIN privileges to access this panel.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            Workforce Command Center
          </h1>
          <p className="text-slate-400 mt-1">Live roster & identity governance</p>
        </div>
        
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-400" />}
          label="Active Users"
          value={stats?.active_users || 0}
          color="from-blue-500/10 to-blue-600/5 border-blue-500/20"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-emerald-400" />}
          label="On Shift Now"
          value={stats?.on_shift_users || 0}
          color="from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          pulse
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
          label="Expired Certs"
          value={stats?.users_with_expired_certs || 0}
          color="from-red-500/10 to-red-600/5 border-red-500/20"
          pulse={stats?.users_with_expired_certs ? stats.users_with_expired_certs > 0 : false}
        />
        <StatCard
          icon={<Ghost className="w-6 h-6 text-slate-400" />}
          label="Ghost Accounts"
          value={stats?.ghost_users || 0}
          color="from-slate-500/10 to-slate-600/5 border-slate-500/20"
        />
      </div>
      
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        
        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={roleFilter || ''}
            onChange={e => setRoleFilter(e.target.value || null)}
            className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="OPERATOR">Operator</option>
            <option value="SAFETY_OFFICER">Safety Officer</option>
          </select>
        </div>
        
        {/* Show Archived Toggle */}
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
            showArchived 
              ? 'bg-slate-700 border-slate-600 text-white' 
              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          {showArchived ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {showArchived ? 'Showing Ghosts' : 'Show Ghosts'}
        </button>
      </div>
      
      {/* Users Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-800/30 rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onPromote={handlePromote}
              onViewDetails={setSelectedUser}
            />
          ))}
        </div>
      )}
      
      {/* Ghost Protocol Modal */}
      <GhostProtocolModal
        user={ghostTarget}
        onConfirm={confirmArchive}
        onCancel={() => setGhostTarget(null)}
      />
    </div>
  );
}

export default WorkforceCommandCenter;
