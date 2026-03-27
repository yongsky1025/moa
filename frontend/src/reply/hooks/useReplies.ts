import { useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { replyApi } from "../api/replyApi";
import type { PageResponse, ReplyResponse } from "../types/replyTypes";
import { buildReplyTree } from "../utils/replyTree";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface UseRepliesParams {
  postId: number;
  enabled?: boolean;
}

const PAGE_SIZE = 20;

export function useReplies({ postId, enabled = true }: UseRepliesParams) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => ["postReplies", postId, PAGE_SIZE] as const,
    [postId],
  );
  const query = useInfiniteQuery<PageResponse<ReplyResponse>>({
    queryKey,
    enabled: enabled && Number.isFinite(postId),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await replyApi.getReplies(postId, Number(pageParam), PAGE_SIZE);
      return response.data;
    },
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });

  const pages = query.data?.pages ?? [];
  const data = useMemo(
    () => pages.flatMap((page) => page.content),
    [pages],
  );
  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const hasMore = enabled && !!lastPage && !lastPage.last;
  const totalCount = enabled && lastPage ? lastPage.totalElements : 0;
  const loading = enabled ? query.isPending : false;
  const loadingMore = enabled ? query.isFetchingNextPage : false;
  const error = query.isError ? getErrorMessage(query.error) : "";

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const refetchAll = useCallback(async () => {
    await query.refetch();

    let guard = 0;
    while (guard < 100) {
      const cached = queryClient.getQueryData<InfiniteData<PageResponse<ReplyResponse>>>(queryKey);
      const cachedPages = cached?.pages ?? [];
      const cachedLast = cachedPages.length > 0 ? cachedPages[cachedPages.length - 1] : null;

      if (!cachedLast || cachedLast.last) {
        break;
      }

      await query.fetchNextPage();
      guard += 1;
    }
  }, [query, queryClient, queryKey]);

  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || query.isFetchingNextPage) {
      return;
    }
    await query.fetchNextPage();
  }, [enabled, hasMore, query]);

  const tree = useMemo(() => buildReplyTree(enabled ? data : []), [enabled, data]);

  return {
    data: enabled ? data : [],
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
