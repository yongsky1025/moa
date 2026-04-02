import { useCallback, useEffect, useState } from "react";
import { postApi } from "../api/postApi";
import type { PostKind, PostResponse } from "../types/postTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface UsePostsParams {
  kind: PostKind;
  enabled?: boolean;
}

export function usePosts({ kind, enabled = true }: UsePostsParams) {
  const [data, setData] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = kind === "free"
        ? await postApi.getFreePosts()
        : await postApi.getNoticePosts();
      setData(response.data);
    } catch (e) {
      setError(getErrorMessage(e));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}
