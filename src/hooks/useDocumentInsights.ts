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

export function useDocumentInsights(docId: number | string | undefined, language: string = "English"): UseDocumentInsightsReturn {
  const [engineerInsights, setEngineerInsights] = useState<EngineerInsights | null>(null);
  const [managerInsights, setManagerInsights] = useState<ManagerInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (role: 'engineer' | 'manager', forceRefresh = false) => {
    if (!docId) return;

    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      // NOTE: We should ideally cache by language too, but for now we'll just refetch if language changes 
      // (which triggers forceRefresh effectively due to dependency change if we wired it right, or we just rely on explicit refresh)
      // Actually, simplest is to just fetch if we don't have insights. 
      // If language changes, we probably want to force refresh? 
      // Current logic: if I have English insights, and switch to Hindi, 'engineerInsights' is not null, so it returns early.
      // WE NEED TO FIX THIS: invalidate cache if language changes.
    }

    setLoading(true);
    setError(null);

    try {
      let data;
      // Pass proper params to API
      if (typeof docId === 'number') {
        data = await api.getDocumentInsights(docId, role, forceRefresh, language);
      } else {
        data = await api.getSupabaseDocumentInsights(docId, role, forceRefresh, language);
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
  }, [docId, language]); // Added language dep

  const regenerate = useCallback(async (role: 'engineer' | 'manager') => {
    await fetchInsights(role, true);
  }, [fetchInsights]);

  // Fetch engineer insights on mount or when docId/language changes
  useEffect(() => {
    if (docId) {
      // Always fetch when ID or Language changes
      fetchInsights('engineer', true); // Force refresh to get new language
    }
  }, [docId, language]);

  return { engineerInsights, managerInsights, loading, error, fetchInsights, regenerate };
}
