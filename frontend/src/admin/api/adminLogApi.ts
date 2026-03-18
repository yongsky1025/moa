import axios from 'axios';
import { API_SERVER_HOST_ADMIN } from './adminDashboardApi';
import type { AdminActionLog, LogSearchDTO, PageResultDTO } from '../types/adminTypes';

export const fetchAllLogs = async (
  params: LogSearchDTO,
): Promise<PageResultDTO<AdminActionLog>> => {
  const { data } = await axios.get(`${API_SERVER_HOST_ADMIN}/logs/list`, { params });
  return data;
};

export const fetchUserLogs = async (
  userId: number,
  params: LogSearchDTO,
): Promise<PageResultDTO<AdminActionLog>> => {
  const { data } = await axios.get(
    `${API_SERVER_HOST_ADMIN}/logs/users/${userId}/logs`,
    { params },
  );
  return data;
};
