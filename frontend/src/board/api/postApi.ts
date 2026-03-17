import api from '../../users/utils/jwtUtil';
import type {
  CreatePostRequest,
  GlobalBoardType,
  PageRequest,
  PageResponse,
  Post,
  UpdatePostRequest,
} from '../types';
import { assertBoardRule } from '../utils/guards';

const withDefaults = (query?: PageRequest): Required<PageRequest> => {
  return {
    page: query?.page ?? 1,
    size: query?.size ?? 20,
    keyword: query?.keyword ?? '',
  };
};

export const postApi = {
  async getGlobalPosts(
    boardType: GlobalBoardType,
    query?: PageRequest,
  ): Promise<PageResponse<Post>> {
    assertBoardRule(boardType, null);
    const params = withDefaults(query);
    const response = await api.get(`/api/${boardType}/paged`, { params });
    return response.data as PageResponse<Post>;
  },

  async getGlobalPost(boardType: GlobalBoardType, postId: number): Promise<Post> {
    assertBoardRule(boardType, null);
    const response = await api.get(`/api/${boardType}/${postId}`);
    return response.data as Post;
  },

  async createGlobalPost(
    boardType: GlobalBoardType,
    payload: CreatePostRequest,
  ): Promise<number> {
    assertBoardRule(boardType, null);
    const response = await api.post(`/api/${boardType}`, payload);
    return response.data as number;
  },

  async updateGlobalPost(
    boardType: GlobalBoardType,
    postId: number,
    payload: UpdatePostRequest,
  ): Promise<number> {
    assertBoardRule(boardType, null);
    const response = await api.put(`/api/${boardType}/${postId}`, payload);
    return response.data as number;
  },

  async deleteGlobalPost(
    boardType: GlobalBoardType,
    postId: number,
  ): Promise<void> {
    assertBoardRule(boardType, null);
    await api.delete(`/api/${boardType}/${postId}`);
  },

  async getCircleBoardPosts(
    circleId: number,
    boardId: number,
    query?: PageRequest,
  ): Promise<PageResponse<Post>> {
    assertBoardRule('circle', circleId);
    const params = withDefaults(query);
    const response = await api.get(
      `/api/circle/${circleId}/boards/${boardId}/posts/paged`,
      {
        params,
      },
    );
    return response.data as PageResponse<Post>;
  },

  async getCirclePost(
    circleId: number,
    boardId: number,
    postId: number,
  ): Promise<Post> {
    assertBoardRule('circle', circleId);
    const response = await api.get(
      `/api/circle/${circleId}/boards/${boardId}/posts/${postId}`,
    );
    return response.data as Post;
  },

  async createCirclePost(
    circleId: number,
    boardId: number,
    payload: CreatePostRequest,
  ): Promise<number> {
    assertBoardRule('circle', circleId);
    const response = await api.post(
      `/api/circle/${circleId}/boards/${boardId}/posts`,
      payload,
    );
    return response.data as number;
  },

  async updateCirclePost(
    circleId: number,
    boardId: number,
    postId: number,
    payload: UpdatePostRequest,
  ): Promise<number> {
    assertBoardRule('circle', circleId);
    const response = await api.put(
      `/api/circle/${circleId}/boards/${boardId}/posts/${postId}`,
      payload,
    );
    return response.data as number;
  },

  async deleteCirclePost(
    circleId: number,
    boardId: number,
    postId: number,
  ): Promise<void> {
    assertBoardRule('circle', circleId);
    await api.delete(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`);
  },
};
