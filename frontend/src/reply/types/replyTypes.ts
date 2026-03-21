export interface ReplyRequest {
  content: string;
}

export interface ReplyResponse {
  replyId: number;
  content: string;
  authorName: string;
  authorPublicId: string | null;
  createDate: string;
  parentId: number | null;
  depth: number;
  deleted: boolean;
  replyCount: number;
}

export interface ReplyTreeNode extends ReplyResponse {
  children: ReplyResponse[];
}
