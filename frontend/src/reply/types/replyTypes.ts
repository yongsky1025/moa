export interface ReplyRequest {
  content: string;
}

export type ReplyReactionType = "LIKE";

export interface ReplyResponse {
  replyId: number;
  content: string;
  authorName: string;
  authorPublicId: string | null;
  authorUserId: number | null;
  createDate: string;
  parentId: number | null;
  depth: number;
  replyToUserId: number | null;
  deleted: boolean;
  likeCount: number;
  myReaction: ReplyReactionType | null;
  replyCount: number;
}

export interface ReplyReactionSummary {
  likeCount: number;
  myReaction: ReplyReactionType | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ReplyTreeNode extends ReplyResponse {
  children: ReplyTreeNode[];
}
