import api from "../../api/axiosInstance";
import type { AdminUserSearchDTO, PageRequestDTO } from "../types/adminTypes";
import { API_SERVER_HOST_ADMIN } from "./adminDashboardApi";

export const fetchAdminUserList = async (dto: AdminUserSearchDTO) => {
  const res = await api.get(`${API_SERVER_HOST_ADMIN}/users/list`, {
    params: {
      page: dto.page,
      size: dto.size,
      type: dto.type,
      keyword: dto.keyword,
      gender: dto.gender,
      status: dto.status,
      role: dto.role,
      sort: dto.sort,
    },
  });
  // console.log("user list data", res);

  return res.data;
};

export const fetchAdminUserProfile = async (id: number) => {
  const res = await api.get(`${API_SERVER_HOST_ADMIN}/users/profile/${id}`);
  // console.log("user profile data", res);

  return res.data;
};

export const fetchAdminUserPosts = async (id: number, dto: PageRequestDTO) => {
  const { page, size = 10 } = dto;
  const res = await api.get(
    `${API_SERVER_HOST_ADMIN}/users/profile/${id}/post`,
    {
      params: { page: page, size: size },
    },
  );

  // console.log("users posts", res);

  return res.data;
};

export const fetchAdminUserReplies = async (
  id: number,
  dto: PageRequestDTO,
) => {
  const { page, size = 10 } = dto;
  const res = await api.get(
    `${API_SERVER_HOST_ADMIN}/users/profile/${id}/reply`,
    {
      params: { page: page, size: size },
    },
  );

  // console.log("users replies", res);

  return res.data;
};

export const fetchAdminUserCircles = async (
  id: number,
  dto: PageRequestDTO,
) => {
  const { page, size = 10 } = dto;
  const res = await api.get(
    `${API_SERVER_HOST_ADMIN}/users/profile/${id}/circle`,
    {
      params: { page: page, size: size },
    },
  );

  // console.log("users replies", res);

  return res.data;
};
