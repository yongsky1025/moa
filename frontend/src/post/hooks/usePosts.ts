import { useCallback, useEffect, useState } from "react";
import { postApi } from "../api/postApi";
import type { PostKind, PostResponse } from "../types/postTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface UsePostsParams {
  kind: PostKind;
  circleId?: number;
  boardId?: number;
  enabled?: boolean;
}

export function usePosts({ kind, circleId, boardId, enabled = true }: UsePostsParams) {
  const [data, setData] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (kind === "free") {
        response = await postApi.getFreePosts();
      } else if (kind === "notice") {
        response = await postApi.getNoticePosts();
      } else if (boardId) {
        response = await postApi.getCircleBoardPosts(circleId ?? 0, boardId);
      } else {
        response = await postApi.getCircleAllPosts(circleId ?? 0);
      }
      setData(response.data);
    } catch (e) {
      setError(getErrorMessage(e));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [kind, circleId, boardId]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}
