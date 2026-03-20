import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type {
  ReportResponseDTO,
  ReportStatus,
  ReportStatusUpdateRequest,
} from '../types/adminTypes';
import {
  fetchReportDetail,
  patchReportStatus,
} from '../api/adminReportAndSanctionApi';
import AdminReportStatusBadge from '../component/report/AdminReportStatusBadge';
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

function ActionButton({
  label,
  tone,
  onClick,
  disabled,
}: {
  label: string;
  tone: 'approve' | 'reject';
  onClick: () => void;
  disabled?: boolean;
}) {
  const cls =
    tone === 'approve'
      ? 'bg-emerald-600 hover:bg-emerald-700'
      : 'bg-rose-600 hover:bg-rose-700';
  return (
    <button
      disabled={!!disabled}
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2 text-sm font-extrabold text-white shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-40 ${cls}`}
    >
      {label}
    </button>
  );
}

export default function AdminReportDetailPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useAdminToast();
  const { id } = useParams();
  const reportId = Number(id);

  const [data, setData] = useState<ReportResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(reportId)) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = (await fetchReportDetail(reportId)) as ReportResponseDTO;
        if (!alive) return;
        setData(r);
        setAdminNote(r.adminNote ?? '');
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message ?? '신고 상세를 불러오지 못했습니다.',
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [reportId]);

  const canDecide = useMemo(() => {
    const s = data?.status;
    return s === 'PENDING' || s === 'REVIEWING';
  }, [data?.status]);

  const decide = async (status: ReportStatus) => {
    if (!data) return;
    setSaving(true);
    try {
      const req: ReportStatusUpdateRequest = {
        status,
        adminNote: adminNote.trim() || undefined,
      };
      await patchReportStatus(data.reportId, req);
      const next = { ...data, status, adminNote: req.adminNote ?? null };
      setData(next);

      // 토스트 띄우고 가자.
      const label = status === 'RESOLVED' ? '승인' : '반려';
      showToast(`신고가 ${label}되었습니다.`, { navigateTo: '/admin/reports' });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '상태 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (!Number.isFinite(reportId)) {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          잘못된 신고 ID 입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      {toast && <AdminToast msg={toast.msg} type={toast.type} />}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <span className="text-lg font-black text-white">🚩</span>
          </div>
          <div>
            <h1 className="text-moa-text text-2xl font-black tracking-tight">
              신고 상세
            </h1>
            <p className="text-moa-subtle mt-0.5 text-sm">
              신고 내용을 확인하고 승인/반려를 처리합니다.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/reports')}
            className="border-moa-border text-moa-secondary hover:bg-moa-light flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold shadow-sm transition-colors"
          >
            ‹ 목록
          </button>
        </div>
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
                  신고 정보
                </h2>
              </div>
              {data?.status && <AdminReportStatusBadge status={data.status} />}
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
                    신고 ID
                  </span>
                  <span className="text-moa-text font-mono text-xs">
                    {data.reportId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-moa-subtle text-xs font-semibold">
                    신고자
                  </span>
                  <span className="text-moa-text font-semibold">
                    {data.reporterName}
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
                    유형
                  </span>
                  <span className="text-moa-text font-mono text-xs">
                    {String(data.category)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-moa-subtle text-xs font-semibold">
                    접수일
                  </span>
                  <span className="text-moa-text font-mono text-xs">
                    {formatDateTime(data.createdAt)}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-moa-subtle text-sm">데이터가 없습니다.</div>
            )}
          </div>
        </section>

        <section className="border-moa-border rounded-2xl border bg-white shadow-sm">
          <div className="border-moa-border border-b px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="bg-moa-primary h-4 w-1 rounded-full" />
              <h2 className="text-moa-text text-sm font-black tracking-tight">
                처리
              </h2>
            </div>
            <p className="text-moa-subtle mt-1 text-xs">
              상세를 조회한 순간 PENDING이면 REVIEWING으로 변경됩니다.
            </p>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="text-moa-subtle text-xs font-semibold">
                관리자 메모(선택)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="border-moa-border focus:border-moa-primary mt-2 w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm outline-none"
                rows={4}
                placeholder="승인/반려 사유 또는 참고 메모를 남겨주세요."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                label="승인"
                tone="approve"
                disabled={!canDecide || saving}
                onClick={() => decide('RESOLVED')}
              />
              <ActionButton
                label="반려"
                tone="reject"
                disabled={!canDecide || saving}
                onClick={() => decide('REJECTED')}
              />
            </div>
            {!canDecide && data?.status && (
              <div className="text-moa-subtle border-moa-border bg-moa-light rounded-xl border px-3 py-2 text-xs">
                현재 상태({String(data.status)})에서는 승인/반려를 변경할 수
                없습니다.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
