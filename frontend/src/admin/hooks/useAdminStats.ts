import { useCallback, useEffect, useState } from 'react';
import type {
  AgeGroupStatsDTO,
  CircleSurvivalStatsDTO,
  ActivityHeatmapStatsDTO,
  AgeCategoryRetentionStatsDTO,
  AdminPlaceStatisticDTO,
} from '../types/adminTypes';
import {
  fetchAgeDistribution,
  fetchAgeCircleParticipation,
  fetchCircleSurvival,
  fetchActivityHeatmap,
  fetchAgeCategoryRetention,
  fetchPlaceStats,
} from '../api/adminStatsApi';

interface UseAdminStatsResult {
  ageDistribution: AgeGroupStatsDTO[];
  ageCircleParticipation: AgeGroupStatsDTO[];
  circleSurvival: CircleSurvivalStatsDTO | null;
  activityHeatmap: ActivityHeatmapStatsDTO[];
  ageCategoryRetention: AgeCategoryRetentionStatsDTO[];
  placeStats: AdminPlaceStatisticDTO | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminStats(): UseAdminStatsResult {
  const [ageDistribution, setAgeDistribution] = useState<AgeGroupStatsDTO[]>([]);
  const [ageCircleParticipation, setAgeCircleParticipation] = useState<AgeGroupStatsDTO[]>([]);
  const [circleSurvival, setCircleSurvival] = useState<CircleSurvivalStatsDTO | null>(null);
  const [activityHeatmap, setActivityHeatmap] = useState<ActivityHeatmapStatsDTO[]>([]);
  const [ageCategoryRetention, setAgeCategoryRetention] = useState<AgeCategoryRetentionStatsDTO[]>([]);
  const [placeStats, setPlaceStats] = useState<AdminPlaceStatisticDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dist, participation, survival, heatmap, retention, place] = await Promise.all([
        fetchAgeDistribution(),
        fetchAgeCircleParticipation(),
        fetchCircleSurvival(),
        fetchActivityHeatmap(),
        fetchAgeCategoryRetention(),
        fetchPlaceStats(),
      ]);
      setAgeDistribution(dist);
      setAgeCircleParticipation(participation);
      setCircleSurvival(survival);
      setActivityHeatmap(heatmap);
      setAgeCategoryRetention(retention);
      setPlaceStats(place);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    ageDistribution,
    ageCircleParticipation,
    circleSurvival,
    activityHeatmap,
    ageCategoryRetention,
    placeStats,
    loading,
    error,
    refetch: load,
  };
}
