import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApi } from "../api/postApi";
import type { PostKind, PostResponse } from "../types/postTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface UsePostDetailParams {
  kind: PostKind;
  postId: number;
  enabled?: boolean;
}

export function usePostDetail({ kind, postId, enabled = true }: UsePostDetailParams) {
  const query = useQuery<PostResponse>({
    queryKey: ["postDetail", kind, postId],
    enabled: enabled && Number.isFinite(postId),
    queryFn: async () => {
      const response =
        kind === "free"
          ? await postApi.getFreePost(postId)
          : await postApi.getNoticePost(postId);
      return response.data;
    },
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    data: query.data ?? null,
    loading: query.isPending,
    error: query.isError ? getErrorMessage(query.error) : "",
    refetch,
  };
}
