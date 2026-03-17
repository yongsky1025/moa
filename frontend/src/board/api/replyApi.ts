import api from '../../users/utils/jwtUtil';
import type {
  CreateReplyRequest,
  Reply,
  UpdateReplyRequest,
} from '../types';

export const replyApi = {
  async getReplies(postId: number): Promise<Reply[]> {
    const response = await api.get(`/api/posts/${postId}/replies`);
    const payload = response.data as unknown;

    if (Array.isArray(payload)) {
      return payload as Reply[];
    }

    if (
      payload &&
      typeof payload === 'object' &&
      'content' in payload &&
      Array.isArray((payload as { content?: unknown }).content)
    ) {
      return (payload as { content: Reply[] }).content;
    }

    return [];
  },

  async createReply(postId: number, payload: CreateReplyRequest): Promise<number> {
    const response = await api.post(`/api/posts/${postId}/replies`, payload);
    return response.data as number;
  },

  async createChildReply(
    postId: number,
    replyId: number,
    payload: CreateReplyRequest,
  ): Promise<number> {
    const response = await api.post(
      `/api/posts/${postId}/replies/${replyId}`,
      payload,
    );
    return response.data as number;
  },

  async updateReply(
    postId: number,
    replyId: number,
    payload: UpdateReplyRequest,
  ): Promise<number> {
    const response = await api.put(
      `/api/posts/${postId}/replies/${replyId}`,
      payload,
    );
    return response.data as number;
  },

  async deleteReply(postId: number, replyId: number): Promise<void> {
    await api.delete(`/api/posts/${postId}/replies/${replyId}`);
  },
};
