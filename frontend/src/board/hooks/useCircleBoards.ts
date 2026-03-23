import { useCallback, useEffect, useState } from "react";
import { boardApi } from "../api/boardApi";
import type { BoardResponse } from "../types/boardTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface UseCircleBoardsParams {
  circleId: number;
  enabled?: boolean;
}

export function useCircleBoards({ circleId, enabled = true }: UseCircleBoardsParams) {
  const [data, setData] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await boardApi.getCircleBoards(circleId);
      setData(response.data);
    } catch (e) {
      setError(getErrorMessage(e));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [circleId]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}
