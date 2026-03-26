export type PostKind = "free" | "notice" | "circle";
export type PostReactionType = "LIKE";

export interface PostRequest {
  title: string;
  content: string;
}

export interface PostResponse {
  boardId: number;
  postId: number;
  title: string;
  content: string;
  authorName: string;
  authorPublicId: string;
  viewCount: number;
  likeCount: number;
  myReaction: PostReactionType | null;
  replyCount: number;
  createDate: string;
  updateDate: string;
}

export interface PostReactionSummary {
  likeCount: number;
  myReaction: PostReactionType | null;
}

export interface PostSearchRequest {
  q?: string;
  page?: number;
  size?: number;
  boardType?: "FREE" | "NOTICE" | "CIRCLE";
  circleId?: number;
}

export interface PostSearchHit {
  id: string;
  postId: number;
  boardId: number;
  boardType: "FREE" | "NOTICE" | "CIRCLE";
  circleId: number | null;
  title: string;
  content: string;
  authorName: string;
  authorPublicId: string;
  viewCount: number;
  likeCount: number;
  replyCount: number;
  createDate: string;
  updateDate: string;
}

export interface SearchPage<T> {
  hits: T[];
  totalHits: number;
  page: number;
  totalPages: number;
  processingTimeMs: number;
  query: string;
}

export interface PostFormValues {
  title: string;
  content: string;
}
