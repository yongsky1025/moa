import { useCallback, useEffect, useState } from 'react';
import { fetchPendingCircles, approveCircle, rejectCircle } from '../api/adminCircleApi';
import type { PendingCircleDTO } from '../types/adminTypes';
import AdminCircleStatusBadge from '../component/circle/AdminCircleStatusBadge';
import AdminConfirmModal from '../component/AdminConfirmModal';
import AdminResultModal from '../component/AdminResultModal';

export default function AdminCirclesPendingPage() {
  const [circles, setCircles] = useState<PendingCircleDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PendingCircleDTO | null>(null);

  // 모달 상태
  const [confirmModal, setConfirmModal] = useState<{ type: 'approve' | 'reject'; circleId: number } | null>(null);
  const [resultModal, setResultModal] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCircles(await fetchPendingCircles());
    } catch {
      setError('승인 대기 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async () => {
    if (!confirmModal) return;
    try {
      if (confirmModal.type === 'approve') {
        await approveCircle(confirmModal.circleId);
        setResultModal('승인되었습니다.');
      } else {
        await rejectCircle(confirmModal.circleId);
        setResultModal('반려되었습니다.');
      }
    } catch {
      setResultModal('처리 중 오류가 발생했습니다.');
    }
    setConfirmModal(null);
  };

  const handleResultClose = () => {
    setResultModal(null);
    setSelected(null);
    load();
  };

  // 상세 뷰
  if (selected) {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="text-moa-secondary border-moa-border hover:bg-moa-light flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
              <span className="text-lg text-white">◎</span>
            </div>
            <div>
              <h1 className="text-moa-text text-xl font-bold">{selected.name}</h1>
              <p className="text-moa-subtle text-xs">모임 생성 승인 요청</p>
            </div>
          </div>
        </div>

        {/* 모임 정보 카드 */}
        <div className="border-moa-border rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="bg-moa-primary h-4 w-1 rounded-full" />
            <span className="text-moa-secondary text-xs font-bold uppercase tracking-widest">모임 정보</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="모임 ID" value={String(selected.circleId)} />
            <InfoRow label="카테고리" value={selected.categoryName} />
            <InfoRow label="상태" value={<AdminCircleStatusBadge status={selected.status} />} />
            <InfoRow label="최대 인원" value={`${selected.maxMember}명`} />
          </div>

          {selected.description && (
            <div className="border-moa-border mt-4 border-t pt-4">
              <p className="text-moa-subtle mb-1 text-xs font-semibold">모임 설명</p>
              <p className="text-moa-text text-sm leading-relaxed">{selected.description}</p>
            </div>
          )}
        </div>

        {/* 승인/반려 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmModal({ type: 'reject', circleId: selected.circleId })}
            className="cursor-pointer rounded-xl border border-red-200 bg-white px-6 py-2.5 text-sm font-bold text-red-500 shadow-sm transition-all hover:bg-red-50"
          >
            반려
          </button>
          <button
            onClick={() => setConfirmModal({ type: 'approve', circleId: selected.circleId })}
            className="bg-moa-primary hover:bg-moa-hover cursor-pointer rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all"
          >
            승인
          </button>
        </div>

        <AdminConfirmModal
          open={!!confirmModal}
          title={confirmModal?.type === 'approve' ? '모임 승인' : '모임 반려'}
          message={confirmModal?.type === 'approve'
            ? `"${selected.name}" 모임을 승인하시겠습니까?`
            : `"${selected.name}" 모임을 반려하시겠습니까?`}
          confirmLabel={confirmModal?.type === 'approve' ? '승인' : '반려'}
          confirmColor={confirmModal?.type === 'approve' ? 'green' : 'red'}
          onConfirm={handleAction}
          onCancel={() => setConfirmModal(null)}
        />

        <AdminResultModal
          open={!!resultModal}
          message={resultModal ?? ''}
          onClose={handleResultClose}
        />
      </div>
    );
  }

  // 리스트 뷰
  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <span className="text-lg text-white">◎</span>
          </div>
          <div>
            <h1 className="text-moa-text text-2xl font-bold tracking-tight">생성 승인 대기</h1>
            <p className="text-moa-subtle mt-0.5 text-sm">
              대기 <span className="text-moa-primary font-bold">{circles.length}</span>건
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="text-moa-secondary border-moa-border hover:bg-moa-light hover:border-moa-primary flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all cursor-pointer"
        >
          ↻ 새로고침
        </button>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 테이블 */}
      <div className="border-moa-border overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-moa-primary">
              {['No.', '모임명', '카테고리', '최대 인원', '상태', ''].map((h, i) => (
                <th key={i} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-white opacity-90 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-moa-border divide-y">
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className="px-5 py-4">
                    <div className="bg-moa-border h-4 rounded-full" style={{ width: `${60 + (j * 17) % 40}%` }} />
                  </td>
                ))}
              </tr>
            ))}

            {!loading && circles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-moa-light flex h-16 w-16 items-center justify-center rounded-2xl">
                      <span className="text-moa-muted text-2xl">◎</span>
                    </div>
                    <span className="text-moa-subtle text-sm">승인 대기 중인 모임이 없습니다.</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && circles.map((c, idx) => (
              <tr
                key={c.circleId}
                onClick={() => setSelected(c)}
                className="group cursor-pointer transition-colors hover:bg-moa-light/30"
              >
                <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs">{idx + 1}</td>
                <td className="px-5 py-3.5">
                  <span className="text-moa-text group-hover:text-moa-primary font-semibold transition-colors">
                    {c.name}
                  </span>
                </td>
                <td className="text-moa-secondary px-5 py-3.5">{c.categoryName}</td>
                <td className="text-moa-secondary px-5 py-3.5">{c.maxMember}명</td>
                <td className="px-5 py-3.5"><AdminCircleStatusBadge status={c.status} /></td>
                <td className="px-5 py-3.5 text-right">
                  <span className="bg-moa-primary hover:bg-moa-hover inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-all group-hover:opacity-100 whitespace-nowrap">
                    상세보기
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-moa-subtle text-xs font-semibold">{label}</p>
      <div className="text-moa-text mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}
