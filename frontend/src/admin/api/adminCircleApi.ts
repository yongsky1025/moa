import { API_SERVER_HOST_ADMIN } from "./adminDashboardApi";
import type {
  AdminCircleSearchDTO,
  AdminCircleDetailDTO,
  PageResultDTO,
  AdminCircleResponseDTO,
  AdminCircleMemberDTO,
  AdminCirclePostDTO,
  PendingCircleDTO,
  PopularCircleDTO,
  PageRequestDTO,
  AdminCircleCategoryRequestDTO,
} from "../types/adminTypes";
import api from "../../api/axiosInstance";

// 전체 모임 리스트 (페이징 + 필터)
export const fetchCircleList = async (dto: AdminCircleSearchDTO) => {
  const res = await api.get<PageResultDTO<AdminCircleResponseDTO>>(
    `${API_SERVER_HOST_ADMIN}/circles/list`,
    { params: dto },
  );
  return res.data;
};

// 모임 상세 조회
export const fetchCircleDetail = async (circleId: number) => {
  const res = await api.get<AdminCircleDetailDTO>(
    `${API_SERVER_HOST_ADMIN}/circles/${circleId}`,
  );
  return res.data;
};

// 모임 회원 목록
export const fetchCircleMembers = async (
  circleId: number,
  dto: PageRequestDTO,
) => {
  const res = await api.get<PageResultDTO<AdminCircleMemberDTO>>(
    `${API_SERVER_HOST_ADMIN}/circles/${circleId}/members`,
    { params: dto },
  );
  return res.data;
};

// 모임 게시물 목록
export const fetchCirclePosts = async (
  circleId: number,
  dto: PageRequestDTO,
) => {
  const res = await api.get<PageResultDTO<AdminCirclePostDTO>>(
    `${API_SERVER_HOST_ADMIN}/circles/${circleId}/posts`,
    { params: dto },
  );
  return res.data;
};

// 승인 대기 목록
export const fetchPendingCircles = async () => {
  const res = await api.get<PendingCircleDTO[]>(
    `${API_SERVER_HOST_ADMIN}/circles/pending`,
  );
  return res.data;
};

// 모임 승인
export const approveCircle = async (circleId: number) => {
  const res = await api.patch(
    `${API_SERVER_HOST_ADMIN}/circles/${circleId}/approve`,
  );
  return res.data;
};

// 모임 반려
export const rejectCircle = async (circleId: number) => {
  const res = await api.patch(
    `${API_SERVER_HOST_ADMIN}/circles/${circleId}/reject`,
  );
  return res.data;
};

// 모임 강제 해산
export const closeCircle = async (circleId: number) => {
  const res = await api.patch(
    `${API_SERVER_HOST_ADMIN}/circles/${circleId}/close`,
  );
  return res.data;
};

// 카테고리 이름 목록
export const fetchCircleCategories = async () => {
  const res = await api.get<string[]>(
    `${API_SERVER_HOST_ADMIN}/circles/categories`,
  );
  return res.data;
};

// 인기모임 TOP5
export const fetchPopularCircles = async () => {
  const res = await api.get<PopularCircleDTO[]>(
    `${API_SERVER_HOST_ADMIN}/circles/popular-circles`,
  );
  return res.data;
};

// 서클 카테고리 추가
export const createCircleCategory = async (
  dto: AdminCircleCategoryRequestDTO,
) => {
  const res = await api.post(`${API_SERVER_HOST_ADMIN}/circles/category`, dto);
  console.log("circle category name", dto);
  return res.data;
};
