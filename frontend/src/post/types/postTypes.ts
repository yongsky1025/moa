import type { NoticeCategory } from "../constants/noticeCategory";

export type PostKind = "free" | "notice";
export type PostReactionType = "LIKE";
export type PostSearchTarget = "ALL" | "TITLE" | "CONTENT";

export interface PostRequest {
  title: string;
  content: string;
  noticeCategory?: NoticeCategory;
}

export interface PostResponse {
  boardId: number;
  boardType?: "FREE" | "NOTICE" | "CIRCLE";
  postId: number;
  title: string;
  content: string;
  thumbnailImageId?: number | null;
  thumbnailUrl?: string | null;
  authorName: string;
  authorPublicId: string;
  viewCount: number;
  likeCount: number;
  myReaction: PostReactionType | null;
  replyCount: number;
  noticeCategory?: NoticeCategory | null;
  pinned?: boolean;
  pinnedAt?: string | null;
  createDate: string;
  updateDate: string;
}

export interface PostReactionSummary {
  likeCount: number;
  myReaction: PostReactionType | null;
}

export interface PostBookmarkSummary {
  bookmarked: boolean;
}

export interface CommunitySidebarPost {
  postId: number;
  boardId?: number;
  boardName?: string;
  boardType: "FREE" | "NOTICE" | "CIRCLE";
  title: string;
  viewCount: number;
  replyCount: number;
  createDate: string;
}

export interface CommunityMyReply {
  replyId: number;
  content: string;
  likeCount: number;
  createDate: string;
  postId: number;
  postTitle: string;
  boardId?: number;
  boardName?: string;
  boardType: "FREE" | "NOTICE" | "CIRCLE";
}

export interface PostSearchRequest {
  q?: string;
  page?: number;
  size?: number;
  target?: PostSearchTarget;
  boardType?: "FREE" | "NOTICE" | "CIRCLE";
  boardId?: number;
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
  noticeCategory?: NoticeCategory;
}
