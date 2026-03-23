import type { PostResponse } from "../types/postTypes";
import { formatDateTime } from "./dateFormat";

export interface PostViewModel extends PostResponse {
  createdAtText: string;
  updatedAtText: string;
}

export function toPostViewModel(post: PostResponse): PostViewModel {
  return {
    ...post,
    createdAtText: formatDateTime(post.createDate),
    updatedAtText: formatDateTime(post.updateDate),
  };
}
