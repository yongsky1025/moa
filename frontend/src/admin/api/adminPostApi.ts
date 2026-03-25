import { API_SERVER_HOST_ADMIN } from "./adminDashboardApi";
import type {
  AdminPostSearchDTO,
  AdminPostResponseDTO,
  AdminPostDetailDTO,
  AdminNoticeRequestDTO,
  PageResultDTO,
} from "../types/adminTypes";
import api from "../../api/axiosInstance";

// 게시글 목록 조회 (필터/검색/정렬)
export const fetchAdminPosts = async (dto: AdminPostSearchDTO) => {
  const res = await api.get<PageResultDTO<AdminPostResponseDTO>>(
    `${API_SERVER_HOST_ADMIN}/posts/list`,
    { params: dto },
  );
  return res.data;
};

// 게시글 상세 조회
export const fetchPostDetail = async (postId: number) => {
  const res = await api.get<AdminPostDetailDTO>(
    `${API_SERVER_HOST_ADMIN}/posts/${postId}`,
  );
  return res.data;
};

// 공지사항 작성
export const createNotice = async (
  adminId: number,
  dto: AdminNoticeRequestDTO,
) => {
  const res = await api.post<number>(
    `${API_SERVER_HOST_ADMIN}/posts/notices`,
    dto,
    { params: { adminId } },
  );
  return res.data;
};

// 공지사항 수정
export const updateNotice = async (
  postId: number,
  dto: AdminNoticeRequestDTO,
) => {
  await api.put(`${API_SERVER_HOST_ADMIN}/posts/notices/${postId}`, dto);
};

// 공지사항 삭제 (soft delete)
export const deleteNotice = async (postId: number) => {
  await api.delete(`${API_SERVER_HOST_ADMIN}/posts/notices/${postId}`);
};

// 공지사항 복원
export const restoreNotice = async (postId: number) => {
  await api.patch(`${API_SERVER_HOST_ADMIN}/posts/notices/${postId}/restore`);
};
