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

export interface PostFormValues {
  title: string;
  content: string;
}
