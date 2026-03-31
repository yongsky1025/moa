export type BoardType = "NOTICE" | "FREE" | "CIRCLE";
export type BoardScope = "GLOBAL" | "CIRCLE";

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

export interface BoardScopedCreateRequest {
  scope: BoardScope;
  name: string;
  circleId?: number;
  circleBoardKind?: "NOTICE" | "INTRO" | "ACTIVITY" | "CUSTOM";
}
