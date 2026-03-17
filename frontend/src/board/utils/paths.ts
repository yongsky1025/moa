import type { GlobalBoardType } from '../types';

export const toGlobalBoardPath = (boardType: GlobalBoardType): string => {
  return `/board/global/${boardType}`;
};

export const toGlobalPostPath = (
  boardType: GlobalBoardType,
  postId: number,
): string => {
  return `/board/global/${boardType}/posts/${postId}`;
};

export const toGlobalPostEditPath = (
  boardType: GlobalBoardType,
  postId: number,
): string => {
  return `/board/global/${boardType}/posts/${postId}/edit`;
};

export const toGlobalPostCreatePath = (boardType: GlobalBoardType): string => {
  return `/board/global/${boardType}/posts/new`;
};

export const toCircleBoardsPath = (circleId: number): string => {
  return `/board/circle/${circleId}/boards`;
};

export const toCircleBoardCreatePath = (circleId: number): string => {
  return `/board/circle/${circleId}/boards/new`;
};

export const toCircleBoardPath = (circleId: number, boardId: number): string => {
  return `/board/circle/${circleId}/boards/${boardId}`;
};

export const toCircleBoardEditPath = (circleId: number, boardId: number): string => {
  return `/board/circle/${circleId}/boards/${boardId}/edit`;
};

export const toCirclePostCreatePath = (
  circleId: number,
  boardId: number,
): string => {
  return `/board/circle/${circleId}/boards/${boardId}/posts/new`;
};

export const toCirclePostPath = (
  circleId: number,
  boardId: number,
  postId: number,
): string => {
  return `/board/circle/${circleId}/boards/${boardId}/posts/${postId}`;
};

export const toCirclePostEditPath = (
  circleId: number,
  boardId: number,
  postId: number,
): string => {
  return `/board/circle/${circleId}/boards/${boardId}/posts/${postId}/edit`;
};
