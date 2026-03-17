import type { Board, BoardType } from '../types';

interface RawBoardResponse {
  boardId: number;
  boardType: string;
  name: string;
  circleId?: number | null;
  createDate?: string;
  updateDate?: string;
}

const toBoardType = (boardType: string): BoardType => {
  switch (boardType) {
    case 'NOTICE':
      return 'notice';
    case 'FREE':
      return 'free';
    case 'CIRCLE':
      return 'circle';
    default:
      throw new Error(`unsupported boardType: ${boardType}`);
  }
};

export const toBoard = (raw: RawBoardResponse): Board => {
  const mappedType = toBoardType(raw.boardType);
  if (mappedType === 'circle') {
    if (!raw.circleId) {
      throw new Error('circle board response requires circleId');
    }
    return {
      boardId: raw.boardId,
      type: 'circle',
      name: raw.name,
      circleId: raw.circleId,
      createDate: raw.createDate,
      updateDate: raw.updateDate,
    };
  }

  return {
    boardId: raw.boardId,
    type: mappedType,
    name: raw.name,
    circleId: null,
    createDate: raw.createDate,
    updateDate: raw.updateDate,
  };
};

