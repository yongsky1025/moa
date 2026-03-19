import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCircleDetail, closeCircle } from '../api/adminCircleApi';
import type { AdminCircleDetailDTO } from '../types/adminTypes';
import AdminCircleInfoCard from '../component/circle/AdminCircleInfoCard';
import AdminCircleMemberList from '../component/circle/AdminCircleMemberList';
import AdminCirclePostList from '../component/circle/AdminCirclePostList';
import AdminConfirmModal from '../component/AdminConfirmModal';
import AdminResultModal from '../component/AdminResultModal';

type Tab = 'members' | 'posts';

export default function AdminCircleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const circleId = Number(id);

  const [detail, setDetail] = useState<AdminCircleDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('members');

  // 해산 모달
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDetail(await fetchCircleDetail(circleId));
    } catch {
      setError('모임 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [circleId]);

  useEffect(() => { load(); }, [load]);

  const handleClose = async () => {
    try {
      await closeCircle(circleId);
      setResultMsg('해산 처리되었습니다.');
    } catch {
      setResultMsg('처리 중 오류가 발생했습니다.');
    }
    setShowCloseConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-moa-border h-10 w-10 animate-pulse rounded-xl" />
          <div className="space-y-2">
            <div className="bg-moa-border h-6 w-48 animate-pulse rounded-lg" />
            <div className="bg-moa-border h-4 w-32 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="bg-moa-border h-64 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#FDFAF8] px-6 py-6">
        <p className="text-sm text-red-600">{error ?? '존재하지 않는 모임입니다.'}</p>
        <button
          onClick={() => navigate('/admin/circles')}
          className="bg-moa-primary hover:bg-moa-hover cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors"
        >
          목록으로
        </button>
      </div>
    );
  }

  const tabCls = (t: Tab) =>
    `cursor-pointer px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${
      tab === t
        ? 'border-moa-primary text-moa-primary'
        : 'border-transparent text-moa-subtle hover:text-moa-text'
    }`;

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <span className="text-lg text-white">◎</span>
          </div>
          <div>
            <h1 className="text-moa-text text-xl font-bold">{detail.circleName}</h1>
            <p className="text-moa-subtle text-xs">{detail.categoryName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/circles')}
            className="border-moa-border text-moa-secondary hover:bg-moa-light flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold shadow-sm transition-colors"
          >
            ‹ 목록
          </button>
          {detail.status !== 'CLOSED' && detail.status !== 'REJECTED' && (
            <button
              onClick={() => setShowCloseConfirm(true)}
              className="cursor-pointer rounded-xl border border-red-200 bg-white px-5 py-2 text-sm font-bold text-red-500 shadow-sm transition-all hover:bg-red-50"
            >
              강제 해산
            </button>
          )}
        </div>
      </div>

      {/* 정보 카드 */}
      <AdminCircleInfoCard detail={detail} />

      {/* 탭 + 콘텐츠 */}
      <div className="border-moa-border rounded-2xl border bg-white shadow-sm">
        <div className="border-moa-border flex border-b">
          <button className={tabCls('members')} onClick={() => setTab('members')}>회원 목록</button>
          <button className={tabCls('posts')} onClick={() => setTab('posts')}>최근 게시글</button>
        </div>
        <div className="p-0">
          {tab === 'members' && <AdminCircleMemberList circleId={circleId} />}
          {tab === 'posts' && <AdminCirclePostList circleId={circleId} />}
        </div>
      </div>

      {/* 해산 컨펌 */}
      <AdminConfirmModal
        open={showCloseConfirm}
        title="모임 강제 해산"
        message={`"${detail.circleName}" 모임을 강제 해산하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="해산"
        confirmColor="red"
        onConfirm={handleClose}
        onCancel={() => setShowCloseConfirm(false)}
      />

      <AdminResultModal
        open={!!resultMsg}
        message={resultMsg ?? ''}
        onClose={() => { setResultMsg(null); navigate('/admin/circles'); }}
      />
    </div>
  );
}
