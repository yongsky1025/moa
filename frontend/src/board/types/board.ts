export type BoardType = 'notice' | 'free' | 'circle';
export type GlobalBoardType = Exclude<BoardType, 'circle'>;

interface BaseBoard {
  boardId: number;
  name: string;
  createDate?: string;
  updateDate?: string;
}

export interface GlobalBoard extends BaseBoard {
  type: GlobalBoardType;
  circleId?: null;
}

export interface CircleBoard extends BaseBoard {
  type: 'circle';
  circleId: number;
}

export type Board = GlobalBoard | CircleBoard;

export interface CreateCircleBoardRequest {
  name: string;
}

export interface UpdateCircleBoardRequest {
  name: string;
}

