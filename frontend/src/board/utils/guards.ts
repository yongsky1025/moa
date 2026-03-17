import type {
  Board,
  BoardType,
  CircleBoard,
  GlobalBoard,
  GlobalBoardType,
} from '../types';

export const isGlobalBoardType = (value: string): value is GlobalBoardType => {
  return value === 'notice' || value === 'free';
};

export const isBoardType = (value: string): value is BoardType => {
  return isGlobalBoardType(value) || value === 'circle';
};

export const isCircleBoard = (board: Board): board is CircleBoard => {
  return board.type === 'circle';
};

export const isGlobalBoard = (board: Board): board is GlobalBoard => {
  return board.type === 'notice' || board.type === 'free';
};

export const assertBoardRule = (
  type: BoardType,
  circleId?: number | null,
): void => {
  if (type === 'circle' && !circleId) {
    throw new Error('circle board requires circleId');
  }
  if ((type === 'notice' || type === 'free') && circleId) {
    throw new Error('global board cannot include circleId');
  }
};

