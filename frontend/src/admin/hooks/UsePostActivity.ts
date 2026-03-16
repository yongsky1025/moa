import { useCallback, useEffect, useState } from 'react';
import type { PostActivitySummaryDTO } from '../types/adminTypes';
import { fetchPostActivity } from '../api/adminDashboardApi';

interface UsePostActivity {
  data: PostActivitySummaryDTO | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePostActivity(): UsePostActivity {
  const [data, setData] = useState<PostActivitySummaryDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchPostActivity();
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
