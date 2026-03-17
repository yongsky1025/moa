import { boardApi } from '../api/boardApi';
import { useCallback } from 'react';
import type { CreateCircleBoardRequest, UpdateCircleBoardRequest } from '../types';
import { useMutationLike } from './useMutationLike';
import { useQueryLike } from './useQueryLike';

interface QueryOptions {
  enabled?: boolean;
}

export const useCircleBoards = (circleId: number, options?: QueryOptions) => {
  const fetcher = useCallback(() => boardApi.getCircleBoards(circleId), [circleId]);
  return useQueryLike(fetcher, [circleId], options?.enabled);
};

export const useCircleBoard = (
  circleId: number,
  boardId: number,
  options?: QueryOptions,
) => {
  const fetcher = useCallback(() => boardApi.getCircleBoard(circleId, boardId), [
    circleId,
    boardId,
  ]);
  return useQueryLike(fetcher, [
    circleId,
    boardId,
  ], options?.enabled);
};

export const useCreateCircleBoard = () => {
  return useMutationLike(
    (circleId: number, payload: CreateCircleBoardRequest) =>
      boardApi.createCircleBoard(circleId, payload),
  );
};

export const useUpdateCircleBoard = () => {
  return useMutationLike(
    (circleId: number, boardId: number, payload: UpdateCircleBoardRequest) =>
      boardApi.updateCircleBoard(circleId, boardId, payload),
  );
};

export const useDeleteCircleBoard = () => {
  return useMutationLike((circleId: number, boardId: number) =>
    boardApi.deleteCircleBoard(circleId, boardId),
  );
};
