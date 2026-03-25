import type { AdminCircleDetailDTO } from '../../types/adminTypes';
import AdminCircleStatusBadge from './AdminCircleStatusBadge';

const formatDate = (date: string | null) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export default function AdminCircleInfoCard({ detail }: { detail: AdminCircleDetailDTO }) {
  const memberPercent = detail.maxMember > 0
    ? Math.round((detail.currentMember / detail.maxMember) * 100)
    : 0;
  const isFull = memberPercent >= 100;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 모임 정보 */}
      <div className="border-moa-border col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="bg-moa-primary h-4 w-1 rounded-full" />
          <span className="text-moa-secondary text-xs font-bold uppercase tracking-widest">모임 정보</span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="모임 ID" value={String(detail.circleId)} mono />
          <InfoRow label="카테고리" value={detail.categoryName} />
          <InfoRow label="리더" value={detail.leaderName ?? '-'} />
          <InfoRow label="상태" value={<AdminCircleStatusBadge status={detail.status} />} />
          <InfoRow label="생성일" value={formatDate(detail.createDate)} />
        </div>

        {detail.description && (
          <div className="border-moa-border mt-5 border-t pt-4">
            <p className="text-moa-subtle mb-1 text-xs font-semibold">모임 설명</p>
            <p className="text-moa-text text-sm leading-relaxed">{detail.description}</p>
          </div>
        )}
      </div>

      {/* 인원 현황 + 총 게시글 */}
      <div className="flex flex-col gap-6">
        {/* 인원 현황 — 바 형식 */}
        <div className="border-moa-border rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <div className={`h-4 w-1 rounded-full ${isFull ? 'bg-red-500' : 'bg-moa-primary'}`} />
            <span className="text-moa-secondary text-xs font-bold uppercase tracking-widest">인원 현황</span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <p className="text-moa-text text-3xl font-black">
                <span className={isFull ? 'text-red-500' : 'text-moa-primary'}>{detail.currentMember}</span>
                <span className="text-moa-subtle text-lg font-normal"> / {detail.maxMember}</span>
              </p>
              <span className={`text-sm font-bold ${isFull ? 'text-red-500' : 'text-moa-primary'}`}>
                {memberPercent}%
              </span>
            </div>

            {/* 프로그레스 바 */}
            <div className="bg-moa-border h-3 w-full overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull ? 'bg-red-500' : 'bg-moa-primary'
                }`}
                style={{ width: `${Math.min(memberPercent, 100)}%` }}
              />
            </div>

            <p className={`text-xs font-medium ${isFull ? 'text-red-500' : 'text-moa-subtle'}`}>
              {isFull ? '정원이 가득 찼습니다' : `정원의 ${memberPercent}% 충원`}
            </p>
          </div>
        </div>

        {/* 총 게시글 */}
        <div className="border-moa-border rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="bg-moa-primary h-4 w-1 rounded-full" />
            <span className="text-moa-secondary text-xs font-bold uppercase tracking-widest">총 게시글</span>
          </div>
          <p className="text-moa-text text-3xl font-black">
            <span className="text-moa-primary">{detail.totalPosts.toLocaleString()}</span>
            <span className="text-moa-subtle text-base font-normal"> 개</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-moa-subtle text-xs font-semibold">{label}</p>
      <div className={`text-moa-text mt-0.5 text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}
