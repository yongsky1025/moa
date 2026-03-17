export interface Reply {
  replyId: number;
  content: string;
  authorName: string;
  createDate?: string;
  parentId?: number | null;
  depth: number;
  deleted: boolean;
  replyCount: number;
}

export interface CreateReplyRequest {
  content: string;
}

export interface UpdateReplyRequest {
  content: string;
}

