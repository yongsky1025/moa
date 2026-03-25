import { useCallback, useEffect, useMemo, useState } from "react";
import { replyApi } from "../api/replyApi";
import type { ReplyResponse } from "../types/replyTypes";
import { buildReplyTree } from "../utils/replyTree";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface UseRepliesParams {
  postId: number;
  enabled?: boolean;
}

const PAGE_SIZE = 20;

export function useReplies({ postId, enabled = true }: UseRepliesParams) {
  const [data, setData] = useState<ReplyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");
      try {
        const response = await replyApi.getReplies(postId, targetPage, PAGE_SIZE);
        const pageResponse = response.data;
        setData((previous) =>
          append ? [...previous, ...pageResponse.content] : pageResponse.content,
        );
        setPage(pageResponse.number);
        setHasMore(!pageResponse.last);
        setTotalCount(pageResponse.totalElements);
      } catch (e) {
        setError(getErrorMessage(e));
        if (!append) {
          setData([]);
          setHasMore(false);
          setTotalCount(0);
        }
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [postId],
  );

  const refetch = useCallback(async () => {
    await fetchPage(0, false);
  }, [fetchPage]);

  const refetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let targetPage = 0;
      let merged: ReplyResponse[] = [];

      while (true) {
        const response = await replyApi.getReplies(postId, targetPage, PAGE_SIZE);
        const pageResponse = response.data;
        merged = [...merged, ...pageResponse.content];

        if (pageResponse.last) {
          setData(merged);
          setPage(pageResponse.number);
          setHasMore(false);
          setTotalCount(pageResponse.totalElements);
          break;
        }
        targetPage += 1;
      }
    } catch (e) {
      setError(getErrorMessage(e));
      setData([]);
      setHasMore(false);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const loadMore = useCallback(async () => {
    if (!enabled || loading || loadingMore || !hasMore) {
      return;
    }
    await fetchPage(page + 1, true);
  }, [enabled, fetchPage, hasMore, loading, loadingMore, page]);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setHasMore(false);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    void refetch();
  }, [enabled, refetch]);

  const tree = useMemo(() => buildReplyTree(data), [data]);

  return {
    data,
    tree,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    refetch,
    refetchAll,
    loadMore,
  };
}
