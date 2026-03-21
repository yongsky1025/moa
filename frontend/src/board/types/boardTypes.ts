export type BoardType = "NOTICE" | "FREE" | "CIRCLE";

export interface BoardRequest {
  boardType: BoardType;
  name: string;
  circleId?: number;
}

export interface BoardResponse {
  boardId: number;
  boardType: BoardType;
  name: string;
  circleId: number | null;
  createDate: string;
  updateDate: string;
}
