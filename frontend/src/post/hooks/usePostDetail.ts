import { useCallback, useEffect, useState } from "react";
import { postApi } from "../api/postApi";
import type { PostKind, PostResponse } from "../types/postTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface UsePostDetailParams {
  kind: PostKind;
  postId: number;
  circleId?: number;
  boardId?: number;
  enabled?: boolean;
}

export function usePostDetail({ kind, postId, circleId, boardId, enabled = true }: UsePostDetailParams) {
  const [data, setData] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (kind === "free") {
        response = await postApi.getFreePost(postId);
      } else if (kind === "notice") {
        response = await postApi.getNoticePost(postId);
      } else {
        response = await postApi.getCirclePost(circleId ?? 0, boardId ?? 0, postId);
      }
      setData(response.data);
    } catch (e) {
      setError(getErrorMessage(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [kind, postId, circleId, boardId]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}
