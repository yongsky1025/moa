import api from '../../users/utils/jwtUtil';
import type {
  Board,
  CreateCircleBoardRequest,
  UpdateCircleBoardRequest,
} from '../types';
import { assertBoardRule } from '../utils/guards';
import { toBoard } from '../utils/mappers';

export const boardApi = {
  async getCircleBoards(circleId: number): Promise<Board[]> {
    const response = await api.get(`/api/circle/${circleId}/boards`);
    return (response.data as unknown[]).map((item) => toBoard(item as never));
  },

  async getCircleBoard(circleId: number, boardId: number): Promise<Board> {
    const response = await api.get(`/api/circle/${circleId}/boards/${boardId}`);
    return toBoard(response.data as never);
  },

  async createCircleBoard(
    circleId: number,
    payload: CreateCircleBoardRequest,
  ): Promise<number> {
    assertBoardRule('circle', circleId);
    const response = await api.post(`/api/circle/${circleId}/boards`, {
      boardType: 'CIRCLE',
      circleId,
      name: payload.name,
    });
    return response.data as number;
  },

  async updateCircleBoard(
    circleId: number,
    boardId: number,
    payload: UpdateCircleBoardRequest,
  ): Promise<number> {
    assertBoardRule('circle', circleId);
    const response = await api.put(`/api/circle/${circleId}/boards/${boardId}`, {
      boardType: 'CIRCLE',
      circleId,
      name: payload.name,
    });
    return response.data as number;
  },

  async deleteCircleBoard(circleId: number, boardId: number): Promise<void> {
    await api.delete(`/api/circle/${circleId}/boards/${boardId}`);
  },
};
