import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Track previous language to detect language changes
  const prevLanguageRef = useRef(language);
  const hasFetchedRef = useRef<Record<string, boolean>>({});

  const fetchInsights = useCallback(async (role: 'engineer' | 'manager', forceRefresh = false) => {
    if (!docId) return;

    // Create cache key for this docId + role + language combination
    const cacheKey = `${docId}_${role}_${language}`;

    // Skip if already fetched for this combination (unless forcing refresh)
    if (!forceRefresh && hasFetchedRef.current[cacheKey]) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data;
      // Pass proper params to API - forceRefresh=false lets backend cache work
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

      // Mark as fetched
      hasFetchedRef.current[cacheKey] = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, [docId, language]);

  const regenerate = useCallback(async (role: 'engineer' | 'manager') => {
    // Force refresh bypasses both frontend and backend cache
    await fetchInsights(role, true);
  }, [fetchInsights]);

  // Fetch engineer insights on mount or when docId changes
  useEffect(() => {
    if (docId) {
      // Check if language changed - if so, we need to refetch
      const languageChanged = prevLanguageRef.current !== language;
      prevLanguageRef.current = language;

      // Fetch with forceRefresh only if language changed
      fetchInsights('engineer', languageChanged);
    }
  }, [docId, language, fetchInsights]);

  return { engineerInsights, managerInsights, loading, error, fetchInsights, regenerate };
}

