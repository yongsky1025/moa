// pages/AdminDashboardPage.tsx
// ★ 변경: 인라인 사이드바 코드 전부 제거 → AdminLayout이 처리
// 대시보드 콘텐츠만 남김

import "../styles/dashboard.css";
import KpiCards from "../component/mainboard/KpiCards";
import GenderDonutCard from "../component/mainboard/GenderDonutCard";
import MonthlyTrendCard from "../component/mainboard/MonthlyTrendCard";
import CircleStatusCard from "../component/mainboard/CircleStatusCard";
import PostActivityCard from "../component/mainboard/PostActivityCard";
import QuickActionsCard from "../component/mainboard/QuickActionsCard";
import { useAdminPostActivity } from "../hooks/useAdminPostActivity";
import { useAdminMain } from "../hooks/useAdminMain";

export default function AdminDashboardPage() {
  const {
    data: mainData,
    loading: mainLoading,
    error: mainError,
    refetch: refetchMain,
  } = useAdminMain();
  const {
    data: postData,
    loading: postLoading,
    refetch: refetchPost,
  } = useAdminPostActivity();
  const loading = mainLoading || postLoading;

  return (
    <div className="px-7 pt-8 pb-16">
      {/* 헤더 */}
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h1
            className="mb-1 text-2xl font-black tracking-tight"
            style={{ color: "#262626" }}
          >
            관리자 대시보드
          </h1>
          <p className="text-sm text-moa-subtle">moa 서비스 관리 현황</p>
        </div>
        <button
          onClick={() => {
            refetchMain();
            refetchPost();
          }}
          className="refetch-btn border-moa-border flex cursor-pointer items-center gap-1.5 rounded-lg border bg-white px-3.5 py-1.75 text-xs text-moa-subtle transition-colors duration-150 hover:bg-moa-light"
        >
          ↻ 새로고침
        </button>
      </div>

      {/* 에러 배너 */}
      {mainError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠️ 데이터를 불러오지 못했습니다 — {mainError}
        </div>
      )}

      {/* Row 1: KPI 6개 */}
      <KpiCards mainData={mainData} postData={postData} loading={loading} />

      {/* Row 2: 성비 + 사용자 증감 추이 */}
      <div className="mb-4 grid grid-cols-[1fr_2.4fr] gap-3.5">
        <GenderDonutCard
          data={mainData?.userCountDTO ?? null}
          loading={mainLoading}
        />
        <MonthlyTrendCard
          data={mainData?.dashboardChartDTO ?? null}
          loading={mainLoading}
        />
      </div>

      {/* Row 3: 모임 현황 + 게시글 활동 */}
      <div className="mb-4 grid grid-cols-[1.4fr_1fr] gap-3.5">
        <CircleStatusCard
          circleData={mainData?.circleSummaryDTO ?? null}
          userData={mainData?.userCountDTO ?? null}
          loading={mainLoading}
        />
        <PostActivityCard data={postData} loading={postLoading} />
      </div>

      {/* Row 4: 빠른 작업 */}
      <QuickActionsCard />
    </div>
  );
}
