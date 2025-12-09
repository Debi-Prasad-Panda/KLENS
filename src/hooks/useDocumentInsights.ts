import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface EngineerSpec {
  label: string;
  value: string;
}

interface EngineerCompliance {
  status: string;
  standards: string[];
  nextAudit: string;
}

interface EngineerRisk {
  severity: string;
  text: string;
}

interface EngineerInsights {
  summary: string[];
  specs: EngineerSpec[];
  compliance: EngineerCompliance;
  risks: EngineerRisk[];
}

interface ManagerFinancial {
  label: string;
  value: string;
  change: string | null;
}

interface ManagerRisk {
  level: string;
  text: string;
}

interface ManagerInsights {
  summary: string;
  financials: ManagerFinancial[];
  risks: ManagerRisk[];
  recommendations: string[];
}

interface UseDocumentInsightsReturn {
  engineerInsights: EngineerInsights | null;
  managerInsights: ManagerInsights | null;
  loading: boolean;
  error: string | null;
  fetchInsights: (role: 'engineer' | 'manager') => Promise<void>;
  regenerate: (role: 'engineer' | 'manager') => Promise<void>;
}

export function useDocumentInsights(docId: number | string | undefined): UseDocumentInsightsReturn {
  const [engineerInsights, setEngineerInsights] = useState<EngineerInsights | null>(null);
  const [managerInsights, setManagerInsights] = useState<ManagerInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (role: 'engineer' | 'manager', forceRefresh = false) => {
    if (!docId) return;

    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      if (role === 'engineer' && engineerInsights) return;
      if (role === 'manager' && managerInsights) return;
    }

    setLoading(true);
    setError(null);

    try {
      let data;
      // Pass refresh=true to API if forcing refresh
      if (typeof docId === 'number') {
        data = await api.getDocumentInsights(docId, role, forceRefresh);
      } else {
        // Assume string ID is a UUID from Supabase
        data = await api.getSupabaseDocumentInsights(docId, role, forceRefresh);
      }
      
      if (role === 'engineer') {
        setEngineerInsights(data as EngineerInsights);
      } else {
        setManagerInsights(data as ManagerInsights);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, [docId, engineerInsights, managerInsights]);

  const regenerate = useCallback(async (role: 'engineer' | 'manager') => {
    await fetchInsights(role, true);
  }, [fetchInsights]);

  // Fetch engineer insights on mount if we have a docId
  // Only first time, not on every render
  useEffect(() => {
    if (docId && !engineerInsights) {
      fetchInsights('engineer');
    }
  }, [docId]);

  return { engineerInsights, managerInsights, loading, error, fetchInsights, regenerate };
}
