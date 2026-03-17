export interface Post {
  boardId: number;
  postId: number;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  replyCount: number;
  thumbnailImagePath?: string | null;
  createDate?: string;
  updateDate?: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  tempKey?: string;
  thumbnailImageId?: number;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  tempKey?: string;
  thumbnailImageId?: number;
}
