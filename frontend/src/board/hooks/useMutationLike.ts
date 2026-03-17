import { useState } from 'react';

interface MutationState<TArgs extends unknown[], TResult> {
  loading: boolean;
  error: string | null;
  mutate: (...args: TArgs) => Promise<TResult | null>;
}

export const useMutationLike = <TArgs extends unknown[], TResult>(
  mutateFn: (...args: TArgs) => Promise<TResult>,
): MutationState<TArgs, TResult> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (...args: TArgs): Promise<TResult | null> => {
    try {
      setLoading(true);
      setError(null);
      return await mutateFn(...args);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'request failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, mutate };
};

