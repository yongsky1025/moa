import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminUserDetailProvider, useAdminUserDetail } from '../context/AdminUserDetailContext';
import AdminUserProfileCard from '../component/userDetail/AdminUserProfileCard';
import AdminUserActivityStatsCard from '../component/userDetail/AdminUserActivityStatsCard';
import AdminUserHistoryModal from '../component/userDetail/AdminUserHistoryModal';

function DetailInner() {
  const navigate = useNavigate();
  const { profile, loadingProfile, profileError, refreshProfile } = useAdminUserDetail();

  const counts = useMemo(
    () => ({
      posts: profile?.countCreateBoard ?? 0,
      replies: profile?.countCreateReply ?? 0,
      circles: profile?.countJoinCircle ?? 0,
    }),
    [profile],
  );

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-moa-text text-2xl font-black tracking-tight">유저 상세</h1>
            <p className="text-moa-subtle mt-0.5 text-sm">프로필 및 활동 통계를 확인합니다.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/users')}
            className="border-moa-border text-moa-secondary hover:bg-moa-light flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold shadow-sm transition-colors"
          >
            ‹ 목록
          </button>
          <button
            onClick={refreshProfile}
            className="text-moa-secondary border-moa-border hover:bg-moa-light hover:border-moa-primary flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all"
          >
            ↻ 새로고침
          </button>
        </div>
      </div>

      {profileError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{profileError}</div>
      )}

      {loadingProfile && !profile ? (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_2fr]">
          <div className="border-moa-border animate-pulse rounded-2xl border bg-white p-6 shadow-sm">
            <div className="bg-moa-border h-10 w-2/3 rounded-full" />
            <div className="bg-moa-border mt-4 h-4 w-1/2 rounded-full" />
            <div className="bg-moa-border mt-6 h-4 w-full rounded-full" />
            <div className="bg-moa-border mt-2 h-4 w-5/6 rounded-full" />
            <div className="bg-moa-border mt-2 h-4 w-2/3 rounded-full" />
          </div>
          <div className="border-moa-border animate-pulse rounded-2xl border bg-white p-6 shadow-sm">
            <div className="bg-moa-border h-6 w-1/3 rounded-full" />
            <div className="bg-moa-border mt-6 h-18 w-full rounded-2xl" />
            <div className="bg-moa-border mt-3 h-18 w-full rounded-2xl" />
            <div className="bg-moa-border mt-3 h-18 w-full rounded-2xl" />
          </div>
        </div>
      ) : profile ? (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_2fr]">
          <AdminUserProfileCard
            name={profile.name}
            userId={profile.userId}
            age={profile.age}
            birthDate={profile.birthDate}
            gender={profile.gender}
            role={profile.role}
            status={profile.userStatus}
            createDate={profile.createDate}
          />
          <AdminUserActivityStatsCard counts={counts} />
        </div>
      ) : (
        <div className="border-moa-border rounded-2xl border bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-moa-subtle text-sm">유저 정보를 표시할 수 없습니다.</p>
        </div>
      )}

      <AdminUserHistoryModal />
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const userId = Number(id);

  if (!Number.isFinite(userId)) {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          잘못된 유저 ID 입니다.
        </div>
      </div>
    );
  }

  return (
    <AdminUserDetailProvider userId={userId}>
      <DetailInner />
    </AdminUserDetailProvider>
  );
}

