import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type {
  SanctionCancelRequest,
  SanctionResponseDTO,
} from '../types/adminTypes';
import {
  cancelSanction,
  fetchSanctionDetail,
  liftSanction,
} from '../api/adminReportAndSanctionApi';
import AdminSanctionStateBadge from '../component/sanction/AdminSanctionStateBadge';
import AdminConfirmModal from '../component/AdminConfirmModal';
import { useAdminToast } from '../hooks/useAdminToast';
import AdminToast from '../component/AdminToast';

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return '-';
  const d = new Date(date);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yy}.${mm}.${dd} ${hh}:${mi}`;
};

export default function AdminSanctionDetailPage() {
  const { toast, showToast } = useAdminToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const sanctionId = Number(id);

  const [data, setData] = useState<SanctionResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminId, setAdminId] = useState(''); // security 붙으면 제거(토큰)
  const [cancelReason, setCancelReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'lift' | 'cancel' | null>(null);

  useEffect(() => {
    if (!Number.isFinite(sanctionId)) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = (await fetchSanctionDetail(
          sanctionId,
        )) as SanctionResponseDTO;
        if (!alive) return;
        setData(r);
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message ?? '제재 상세를 불러오지 못했습니다.',
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [sanctionId]);

  // 버튼 활성화 조건
  const canLift = useMemo(
    () => data?.sanctionState === 'ACTIVE' && data?.sanctionType !== 'WARNING',
    [data?.sanctionState, data?.sanctionType],
  );
  const canCancel = useMemo(
    () => data?.sanctionState !== 'CANCELLED',
    [data?.sanctionState],
  );

  // 토스트 들어오고 필요x, 혹시 모르니 남겨둠
  // const onCancel = async () => {
  //   if (!data) return;
  //   const aId = Number(adminId);
  //   if (!Number.isFinite(aId)) {
  //     setError('adminId는 숫자로 입력해주세요.');
  //     return;
  //   }
  //   if (!cancelReason.trim()) {
  //     setError('취소 사유를 입력해주세요.');
  //     return;
  //   }

  //   setSaving(true);
  //   setError(null);
  //   try {
  //     const req: SanctionCancelRequest = {
  //       adminId: aId,
  //       cancelReason: cancelReason.trim(),
  //     };
  //     await cancelSanction(data.sanctionId, req);
  //     const next: SanctionResponseDTO = {
  //       ...data,
  //       sanctionState: 'CANCELLED',
  //       cancelReason: req.cancelReason,
  //       cancelledAt: new Date().toISOString(),
  //     };
  //     setData(next);
  //   } catch (e: any) {
  //     setError(e?.response?.data?.message ?? '제재 취소에 실패했습니다.');
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  // 해제
  const handleLift = async () => {
    if (!canLift) return;
    setSaving(true);
    try {
      await liftSanction(sanctionId);
      showToast('제재가 해제되었습니다.', { navigateTo: '/admin/sanctions' });
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? '해제에 실패했습니다.', {
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // 취소
  const handleCancel = async () => {
    if (!canCancel) return;

    const aId = Number(adminId);
    if (!adminId.trim() || !Number.isFinite(aId)) {
      setError('adminId를 숫자로 입력해주세요.');
      return;
    }
    if (!cancelReason.trim()) {
      setError('취소 사유를 입력해주세요.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const req: SanctionCancelRequest = {
        adminId: aId,
        cancelReason: cancelReason.trim(),
      };
      await cancelSanction(sanctionId, req);
      showToast('제재가 취소되었습니다.', { navigateTo: '/admin/sanctions' });
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? '취소에 실패했습니다.', {
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!Number.isFinite(sanctionId)) {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          잘못된 제재 ID 입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      <AdminToast toast={toast} />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <span className="text-lg font-black text-white">⛔</span>
          </div>
          <div>
            <h1 className="text-moa-text text-2xl font-black tracking-tight">
              제재 상세
            </h1>
            <p className="text-moa-subtle mt-0.5 text-sm">
              제재 정보를 확인하고 취소할 수 있습니다.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/sanctions')}
          className="border-moa-border text-moa-secondary hover:bg-moa-light flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold shadow-sm transition-colors"
        >
          ‹ 목록
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="border-moa-border rounded-2xl border bg-white shadow-sm">
          <div className="border-moa-border border-b px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-moa-primary h-4 w-1 rounded-full" />
                <h2 className="text-moa-text text-sm font-black tracking-tight">
                  제재 정보
                </h2>
              </div>
              {data?.sanctionState && (
                <AdminSanctionStateBadge state={data.sanctionState} />
              )}
            </div>
          </div>

          <div className="space-y-3 px-6 py-5 text-sm">
            {loading && !data ? (
              <div className="animate-pulse space-y-2">
                <div className="bg-moa-border h-4 w-2/3 rounded-full" />
                <div className="bg-moa-border h-4 w-1/2 rounded-full" />
                <div className="bg-moa-border h-4 w-5/6 rounded-full" />
              </div>
            ) : data ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-moa-subtle text-xs font-semibold">
                    제재 ID
                  </span>
                  <span className="text-moa-text font-mono text-xs">
                    {data.sanctionId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-moa-subtle text-xs font-semibold">
                    대상 유저
                  </span>
                  <span className="text-moa-text font-semibold">
                    {data.targetUserName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-moa-subtle text-xs font-semibold">
                    관리자
                  </span>
                  <span className="text-moa-text font-semibold">
                    {data.adminName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-moa-subtle text-xs font-semibold">
                    대상
                  </span>
                  <span className="text-moa-text font-mono text-xs">
                    {String(data.targetType)} #{data.targetId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-moa-subtle text-xs font-semibold">
                    제재 유형
                  </span>
                  <span className="text-moa-text font-mono text-xs">
                    {String(data.sanctionType)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-moa-subtle text-xs font-semibold">
                    기간
                  </span>
                  <span className="text-moa-text font-mono text-xs">
                    {formatDateTime(data.startAt)} ~{' '}
                    {data.endAt ? formatDateTime(data.endAt) : '∞'}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="text-moa-subtle text-xs font-semibold">
                    사유
                  </div>
                  <div className="text-moa-text border-moa-border bg-moa-light mt-1 rounded-xl border px-3 py-2 text-sm">
                    {data.reason}
                  </div>
                </div>
                {data.sanctionState === 'CANCELLED' && (
                  <div className="pt-2">
                    <div className="text-moa-subtle text-xs font-semibold">
                      취소 정보
                    </div>
                    <div className="text-moa-text border-moa-border mt-1 rounded-xl border bg-white px-3 py-2 text-sm">
                      <div className="font-mono text-xs">
                        {formatDateTime(data.cancelledAt)}
                      </div>
                      <div className="mt-1 text-sm">
                        {data.cancelReason ?? '-'}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-moa-subtle text-sm">데이터가 없습니다.</div>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-6">
          {/* 제재 해제 */}
          <section className="border-moa-border rounded-2xl border bg-white shadow-sm">
            <div className="border-moa-border border-b px-6 py-5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-emerald-500" />
                <h2 className="text-moa-text text-sm font-black tracking-tight">
                  제재 해제
                </h2>
              </div>
              <p className="text-moa-subtle mt-1 text-xs">
                활성 상태의 제재를 만료 전에 조기 종료합니다.
              </p>
            </div>
            <div className="px-6 py-5">
              {canLift ? (
                <button
                  onClick={() => setConfirmAction('lift')}
                  disabled={saving}
                  className="w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  해제
                </button>
              ) : (
                <div className="text-moa-subtle border-moa-border bg-moa-light rounded-xl border px-3 py-2 text-xs">
                  {data?.sanctionState === 'LIFTED'
                    ? '이미 해제된 제재입니다.'
                    : data?.sanctionType === 'WARNING'
                      ? '경고는 해제 대상이 아닙니다.'
                      : '활성 상태의 제재만 해제할 수 있습니다.'}
                </div>
              )}
            </div>
          </section>

          {/* 제재 취소 */}
          <section className="border-moa-border rounded-2xl border bg-white shadow-sm">
            <div className="border-moa-border border-b px-6 py-5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-rose-500" />
                <h2 className="text-moa-text text-sm font-black tracking-tight">
                  제재 취소
                </h2>
              </div>
              <p className="text-moa-subtle mt-1 text-xs">
                관리자 실수 등의 사유로 취소 처리합니다.
              </p>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="text-moa-subtle text-xs font-semibold">
                  관리자 ID번호
                </label>
                <input
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  inputMode="numeric"
                  className="border-moa-border focus:border-moa-primary mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none"
                  placeholder="예: 1"
                />
              </div>
              <div>
                <label className="text-moa-subtle text-xs font-semibold">
                  취소 사유
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="border-moa-border focus:border-moa-primary mt-2 w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm outline-none"
                  rows={4}
                  placeholder="취소 사유를 입력하세요."
                />
              </div>
              {canCancel ? (
                <button
                  onClick={() => setConfirmAction('cancel')}
                  disabled={saving}
                  className="w-full cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-rose-700 disabled:opacity-40"
                >
                  취소
                </button>
              ) : (
                <div className="text-moa-subtle border-moa-border bg-moa-light rounded-xl border px-3 py-2 text-xs">
                  이미 취소된 제재입니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <AdminConfirmModal
        open={confirmAction === 'lift'}
        title="제재 해제"
        message="이 제재를 해제하시겠습니까? 해제 후 대상 유저의 제한이 즉시 풀립니다."
        confirmLabel="해제"
        confirmColor="green"
        onConfirm={() => { setConfirmAction(null); handleLift(); }}
        onCancel={() => setConfirmAction(null)}
      />

      <AdminConfirmModal
        open={confirmAction === 'cancel'}
        title="제재 취소"
        message="이 제재를 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="확인"
        confirmColor="red"
        onConfirm={() => { setConfirmAction(null); handleCancel(); }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
