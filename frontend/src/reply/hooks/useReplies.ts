import { useCallback, useEffect, useMemo, useState } from "react";
import { replyApi } from "../api/replyApi";
import type { ReplyResponse } from "../types/replyTypes";
import { buildReplyTree } from "../utils/replyTree";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface UseRepliesParams {
  postId: number;
  enabled?: boolean;
}

export function useReplies({ postId, enabled = true }: UseRepliesParams) {
  const [data, setData] = useState<ReplyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await replyApi.getReplies(postId);
      setData(response.data);
    } catch (e) {
      setError(getErrorMessage(e));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void refetch();
  }, [enabled, refetch]);

  const tree = useMemo(() => buildReplyTree(data), [data]);

  return { data, tree, loading, error, refetch };
}
