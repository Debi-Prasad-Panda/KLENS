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
}

export function useDocumentInsights(docId: number | undefined): UseDocumentInsightsReturn {
  const [engineerInsights, setEngineerInsights] = useState<EngineerInsights | null>(null);
  const [managerInsights, setManagerInsights] = useState<ManagerInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (role: 'engineer' | 'manager') => {
    if (!docId) return;

    // Check cache first
    if (role === 'engineer' && engineerInsights) return;
    if (role === 'manager' && managerInsights) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.getDocumentInsights(docId, role);
      
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

  // Fetch engineer insights on mount if we have a docId
  useEffect(() => {
    if (docId) {
      fetchInsights('engineer');
    }
  }, [docId]);

  return { engineerInsights, managerInsights, loading, error, fetchInsights };
}
