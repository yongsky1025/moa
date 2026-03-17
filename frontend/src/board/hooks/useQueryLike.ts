import { useCallback, useEffect, useMemo, useState } from 'react';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useQueryLike = <T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  enabled = true,
): QueryState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const depKey = useMemo(() => JSON.stringify(deps), [deps]);

  const run = useCallback(async () => {
    void depKey;

    if (!enabled) {
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'request failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetcher, enabled, depKey]);

  useEffect(() => {
    void run();
  }, [run]);

  return {
    data,
    loading,
    error,
    refetch: run,
  };
};
