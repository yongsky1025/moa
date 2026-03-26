import { API_SERVER_HOST_ADMIN } from "./adminDashboardApi";
import type {
  AgeGroupStatsDTO,
  CircleSurvivalStatsDTO,
  ActivityHeatmapStatsDTO,
  AgeCategoryRetentionStatsDTO,
} from "../types/adminTypes";
import api from "../../api/axiosInstance";

const STATS_BASE = `${API_SERVER_HOST_ADMIN}/stats`;

export const fetchAgeDistribution = async (): Promise<AgeGroupStatsDTO[]> => {
  const res = await api.get(`${STATS_BASE}/age-distribution`);
  console.log("연령대별 가입자 수", res.data);
  return res.data;
};

export const fetchAgeCircleParticipation = async (): Promise<
  AgeGroupStatsDTO[]
> => {
  const res = await api.get(`${STATS_BASE}/age-circle-participation`);
  console.log("연령대별 모임 참여자 통계", res.data);
  return res.data;
};

export const fetchCircleSurvival =
  async (): Promise<CircleSurvivalStatsDTO> => {
    const res = await api.get(`${STATS_BASE}/circle-survival`);
    console.log("모임 생존률", res.data);
    return res.data;
  };

export const fetchActivityHeatmap = async (): Promise<
  ActivityHeatmapStatsDTO[]
> => {
  const res = await api.get(`${STATS_BASE}/activity-heatmap`);
  console.log("시간대별 활동량", res.data);
  return res.data;
};

export const fetchAgeCategoryRetention = async (): Promise<
  AgeCategoryRetentionStatsDTO[]
> => {
  const res = await api.get(`${STATS_BASE}/age-category-retention`);
  console.log("연령대+카테고리별 모임 유지율", res.data);
  return res.data;
};
