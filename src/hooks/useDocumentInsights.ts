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

// Define the role type globally
export type RoleType = 'engineer' | 'manager' | 'operator' | 'safety_officer' | 'maintenance' | 'quality';

interface UseDocumentInsightsReturn {
  engineerInsights: EngineerInsights | null;
  managerInsights: ManagerInsights | null;
  otherInsights: any | null; // For other roles (operator, safety, etc.)
  loading: boolean;
  error: string | null;
  fetchInsights: (role: RoleType) => Promise<void>;
  regenerate: (role: RoleType) => Promise<void>;
}

export function useDocumentInsights(docId: number | string | undefined, language: string = "English"): UseDocumentInsightsReturn {
  const [engineerInsights, setEngineerInsights] = useState<EngineerInsights | null>(null);
  const [managerInsights, setManagerInsights] = useState<ManagerInsights | null>(null);
  const [otherInsights, setOtherInsights] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track previous language to detect language changes
  const prevLanguageRef = useRef(language);
  const hasFetchedRef = useRef<Record<string, boolean>>({});

  const fetchInsights = useCallback(async (role: RoleType, forceRefresh = false) => {
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
      } else if (role === 'manager') {
        setManagerInsights(data as ManagerInsights);
      } else {
        // For other roles (operator, safety_officer, maintenance, quality)
        setOtherInsights(data);
      }

      // Mark as fetched
      hasFetchedRef.current[cacheKey] = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, [docId, language]);

  const regenerate = useCallback(async (role: RoleType) => {
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

  return { engineerInsights, managerInsights, otherInsights, loading, error, fetchInsights, regenerate };
}

