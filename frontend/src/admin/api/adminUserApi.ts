import axios from 'axios';
import type {
  AdminUserSearchDTO,
  PageRequestDTO,
  UserInfoDTO,
} from '../types/adminTypes';
import { API_SERVER_HOST_ADMIN } from './adminDashboardApi';

export const fetchAdminUserList = async (dto: AdminUserSearchDTO) => {
  const res = await axios.get(`${API_SERVER_HOST_ADMIN}/users/list`, {
    params: {
      page: dto.page,
      size: dto.size,
      name: dto.name,
      gender: dto.gender,
      status: dto.status,
      role: dto.role,
    },
  });
  console.log('user list data', res);

  return res.data;
};

export const fetchAdminUserProfile = async (id: number) => {
  const res = await axios.get(`${API_SERVER_HOST_ADMIN}/profile/${id}`);
  console.log('user profile data', res);

  return res.data;
};

export const fetchAdminUserPosts = async (id: number, dto: PageRequestDTO) => {
  const { page, size = 10 } = dto;
  const res = await axios.get(`${API_SERVER_HOST_ADMIN}/profile/${id}/post`, {
    params: { page: page, size: size },
  });

  console.log('users posts', res);

  return res.data;
};

export const fetchAdminUserReplies = async (
  id: number,
  dto: PageRequestDTO,
) => {
  const { page, size = 10 } = dto;
  const res = await axios.get(`${API_SERVER_HOST_ADMIN}/profile/${id}/reply`, {
    params: { page: page, size: size },
  });

  console.log('users replies', res);

  return res.data;
};

export const fetchAdminUserCircles = async (
  id: number,
  dto: PageRequestDTO,
) => {
  const { page, size = 10 } = dto;
  const res = await axios.get(`${API_SERVER_HOST_ADMIN}/profile/${id}/circle`, {
    params: { page: page, size: size },
  });

  console.log('users replies', res);

  return res.data;
};
