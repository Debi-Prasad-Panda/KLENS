import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface DashboardStats {
  totalDocuments: number;
  complianceScore: number;
  pendingApprovals: number;
  systemAlerts: number;
}

interface DepartmentData {
  name: string;
  value: number;
}

interface RecentActivity {
  id: number;
  title: string;
  status: string;
  time: string | null;
}

interface DashboardData {
  stats: DashboardStats;
  departmentData: DepartmentData[];
  recentActivity: RecentActivity[];
}

interface UseDashboardStatsReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getDashboardStats();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      // Return fallback data on error
      setData({
        stats: {
          totalDocuments: 0,
          complianceScore: 0,
          pendingApprovals: 0,
          systemAlerts: 0
        },
        departmentData: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { data, loading, error, refetch: fetchStats };
}
