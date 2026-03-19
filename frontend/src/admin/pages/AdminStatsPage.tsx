import '../styles/dashboard.css';
import { useAdminStats } from '../hooks/useAdminStats';
import CircleSurvivalCard from '../component/stats/CircleSurvivalCard';
import AgeDistributionCard from '../component/stats/AgeDistributionCard';
import AgeCircleParticipationCard from '../component/stats/AgeCircleParticipationCard';
import ActivityHeatmapCard from '../component/stats/ActivityHeatmapCard';
import AgeCategoryRetentionCard from '../component/stats/AgeCategoryRetentionCard';

export default function AdminStatsPage() {
  const {
    ageDistribution,
    ageCircleParticipation,
    circleSurvival,
    activityHeatmap,
    ageCategoryRetention,
    loading,
    error,
    refetch,
  } = useAdminStats();

  return (
    <div className="px-7 pt-8 pb-16">
      {/* 헤더 */}
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h1
            className="mb-1 text-2xl font-black tracking-tight"
            style={{ color: '#262626' }}
          >
            통계 리포트
          </h1>
          <p className="text-sm text-moa-subtle">
            moa 서비스 상세 통계 분석
          </p>
        </div>
        <button
          onClick={refetch}
          className="refetch-btn border-moa-border flex cursor-pointer items-center gap-1.5 rounded-lg border bg-white px-3.5 py-1.75 text-xs text-moa-subtle transition-colors duration-150 hover:bg-moa-light"
        >
          ↻ 새로고침
        </button>
      </div>

      {/* 에러 배너 */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ 데이터를 불러오지 못했습니다 — {error}
        </div>
      )}

      {/* Row 1: 모임 생존률 (1/3) + 연령대별 가입자 수 (2/3) */}
      <div className="mb-4 grid grid-cols-[1fr_2fr] gap-3.5">
        <CircleSurvivalCard data={circleSurvival} loading={loading} />
        <AgeDistributionCard data={ageDistribution} loading={loading} />
      </div>

      {/* Row 2: 연령대별 모임 참여자 (전체 너비) */}
      <div className="mb-4">
        <AgeCircleParticipationCard data={ageCircleParticipation} loading={loading} />
      </div>

      {/* Row 3: 시간대별 활동량 히트맵 (전체 너비) */}
      <div className="mb-4">
        <ActivityHeatmapCard data={activityHeatmap} loading={loading} />
      </div>

      {/* Row 4: 연령대 × 카테고리별 모임 유지율 (전체 너비) */}
      <div>
        <AgeCategoryRetentionCard data={ageCategoryRetention} loading={loading} />
      </div>
    </div>
  );
}
