export interface GlobalBoardRouteParams {
  boardType?: string;
  postId?: string;
}

export interface CircleRouteParams {
  circleId?: string;
  boardId?: string;
  postId?: string;
}

export interface QueryStateView {
  loading: boolean;
  error: string | null;
}
