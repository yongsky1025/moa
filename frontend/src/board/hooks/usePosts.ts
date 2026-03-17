import { postApi } from '../api/postApi';
import { useCallback, useMemo } from 'react';
import type {
  CreatePostRequest,
  GlobalBoardType,
  PageRequest,
  UpdatePostRequest,
} from '../types';
import { useMutationLike } from './useMutationLike';
import { useQueryLike } from './useQueryLike';

interface QueryOptions {
  enabled?: boolean;
}

export const useGlobalPosts = (
  boardType: GlobalBoardType,
  query?: PageRequest,
  options?: QueryOptions,
) => {
  const querySnapshot = useMemo(
    () => ({
      page: query?.page,
      size: query?.size,
      keyword: query?.keyword,
    }),
    [query?.page, query?.size, query?.keyword],
  );
  const fetcher = useCallback(
    () => postApi.getGlobalPosts(boardType, querySnapshot),
    [boardType, querySnapshot],
  );
  return useQueryLike(fetcher, [
    boardType,
    querySnapshot.page,
    querySnapshot.size,
    querySnapshot.keyword,
  ], options?.enabled);
};

export const useGlobalPost = (
  boardType: GlobalBoardType,
  postId: number,
  options?: QueryOptions,
) => {
  const fetcher = useCallback(
    () => postApi.getGlobalPost(boardType, postId),
    [boardType, postId],
  );
  return useQueryLike(fetcher, [
    boardType,
    postId,
  ], options?.enabled);
};

export const useCirclePosts = (
  circleId: number,
  boardId: number,
  query?: PageRequest,
  options?: QueryOptions,
) => {
  const querySnapshot = useMemo(
    () => ({
      page: query?.page,
      size: query?.size,
      keyword: query?.keyword,
    }),
    [query?.page, query?.size, query?.keyword],
  );
  const fetcher = useCallback(
    () => postApi.getCircleBoardPosts(circleId, boardId, querySnapshot),
    [circleId, boardId, querySnapshot],
  );
  return useQueryLike(fetcher, [
    circleId,
    boardId,
    querySnapshot.page,
    querySnapshot.size,
    querySnapshot.keyword,
  ], options?.enabled);
};

export const useCirclePost = (
  circleId: number,
  boardId: number,
  postId: number,
  options?: QueryOptions,
) => {
  const fetcher = useCallback(
    () => postApi.getCirclePost(circleId, boardId, postId),
    [circleId, boardId, postId],
  );
  return useQueryLike(fetcher, [
    circleId,
    boardId,
    postId,
  ], options?.enabled);
};

export const useCreateGlobalPost = () => {
  return useMutationLike((boardType: GlobalBoardType, payload: CreatePostRequest) =>
    postApi.createGlobalPost(boardType, payload),
  );
};

export const useUpdateGlobalPost = () => {
  return useMutationLike(
    (boardType: GlobalBoardType, postId: number, payload: UpdatePostRequest) =>
      postApi.updateGlobalPost(boardType, postId, payload),
  );
};

export const useDeleteGlobalPost = () => {
  return useMutationLike((boardType: GlobalBoardType, postId: number) =>
    postApi.deleteGlobalPost(boardType, postId),
  );
};

export const useCreateCirclePost = () => {
  return useMutationLike(
    (circleId: number, boardId: number, payload: CreatePostRequest) =>
      postApi.createCirclePost(circleId, boardId, payload),
  );
};

export const useUpdateCirclePost = () => {
  return useMutationLike(
    (
      circleId: number,
      boardId: number,
      postId: number,
      payload: UpdatePostRequest,
    ) => postApi.updateCirclePost(circleId, boardId, postId, payload),
  );
};

export const useDeleteCirclePost = () => {
  return useMutationLike((circleId: number, boardId: number, postId: number) =>
    postApi.deleteCirclePost(circleId, boardId, postId),
  );
};
