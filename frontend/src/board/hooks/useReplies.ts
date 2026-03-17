import { replyApi } from '../api/replyApi';
import { useCallback } from 'react';
import type { CreateReplyRequest, UpdateReplyRequest } from '../types';
import { useMutationLike } from './useMutationLike';
import { useQueryLike } from './useQueryLike';

interface QueryOptions {
  enabled?: boolean;
}

export const useReplies = (postId: number, options?: QueryOptions) => {
  const fetcher = useCallback(() => replyApi.getReplies(postId), [postId]);
  return useQueryLike(fetcher, [postId], options?.enabled);
};

export const useCreateReply = () => {
  return useMutationLike((postId: number, payload: CreateReplyRequest) =>
    replyApi.createReply(postId, payload),
  );
};

export const useCreateChildReply = () => {
  return useMutationLike(
    (postId: number, replyId: number, payload: CreateReplyRequest) =>
      replyApi.createChildReply(postId, replyId, payload),
  );
};

export const useUpdateReply = () => {
  return useMutationLike(
    (postId: number, replyId: number, payload: UpdateReplyRequest) =>
      replyApi.updateReply(postId, replyId, payload),
  );
};

export const useDeleteReply = () => {
  return useMutationLike((postId: number, replyId: number) =>
    replyApi.deleteReply(postId, replyId),
  );
};
