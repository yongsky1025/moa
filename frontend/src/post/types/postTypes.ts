export type PostKind = "free" | "notice" | "circle";

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
  replyCount: number;
  createDate: string;
  updateDate: string;
}

export interface PostFormValues {
  title: string;
  content: string;
}
