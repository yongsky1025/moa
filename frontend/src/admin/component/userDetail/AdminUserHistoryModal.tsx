import { createPortal } from 'react-dom';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MoaPaginate from '../Moapaginate';
import { useAdminUserDetail } from '../../context/AdminUserDetailContext';
import type { PageResultDTO, UserInfoCircleDTO, UserInfoPostDTO, UserInfoReplyDTO } from '../../types/adminTypes';

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

function getTitle(kind: 'post' | 'reply' | 'circle') {
  return kind === 'post' ? '게시글 이력' : kind === 'reply' ? '댓글 이력' : '가입 모임 이력';
}

function getEmptyText(kind: 'post' | 'reply' | 'circle') {
  return kind === 'post' ? '작성한 게시글이 없습니다.' : kind === 'reply' ? '작성한 댓글이 없습니다.' : '가입한 모임이 없습니다.';
}

function toSafeNumber(val: any, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function actualTotalPage<T>(page: PageResultDTO<T> | null, size: number) {
  if (!page) return 0;
  return Math.ceil(toSafeNumber(page.totalCount) / Math.max(1, size));
}

export default function AdminUserHistoryModal() {
  const navigate = useNavigate();
  const { history, closeHistory, setHistoryPage, historyLoading, historyError, postHistory, replyHistory, circleHistory } =
    useAdminUserDetail();

  const activeData: PageResultDTO<unknown> | null = useMemo(() => {
    if (history.kind === 'post') return postHistory as PageResultDTO<UserInfoPostDTO> | null;
    if (history.kind === 'reply') return replyHistory as PageResultDTO<UserInfoReplyDTO> | null;
    return circleHistory as PageResultDTO<UserInfoCircleDTO> | null;
  }, [history.kind, postHistory, replyHistory, circleHistory]);

  if (!history.open) return null;

  const pageCount = actualTotalPage(activeData, history.size);
  const list = activeData?.dtoList ?? [];

  const goDetail = (payload: any) => {
    // 게시글/모임 상세는 추후 구현 예정이라, 라우트 확정되면 여기만 변경하면 됨
    if (history.kind === 'post') {
      const boardKey = String(payload?.boardName ?? '');
      navigate(`/board/${boardKey}`);
      return;
    }
    if (history.kind === 'reply') {
      navigate(`/board`);
      return;
    }
    if (history.kind === 'circle') {
      const circleKey = String(payload?.circleName ?? '');
      navigate(`/circle/${circleKey}`);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeHistory();
      }}
    >
      <div className="border-moa-border w-full max-w-3xl overflow-hidden rounded-2xl border bg-white shadow-xl">
        <div className="border-b border-moa-border flex items-center justify-between px-6 py-4">
          <div>
            <h3 className="text-moa-text text-base font-extrabold tracking-tight">{getTitle(history.kind)}</h3>
            <p className="text-moa-subtle mt-0.5 text-xs">
              페이지 {history.page} · {list.length.toLocaleString()}건 표시
            </p>
          </div>
          <button
            onClick={closeHistory}
            className="text-moa-secondary hover:bg-moa-light cursor-pointer rounded-xl px-3 py-2 text-sm font-bold transition-colors"
          >
            닫기
          </button>
        </div>

        {historyError && (
          <div className="border-b border-red-100 bg-red-50 px-6 py-4">
            <p className="text-sm text-red-700">{historyError}</p>
          </div>
        )}

        <div className="max-h-[62vh] overflow-auto px-6 py-5">
          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-moa-border bg-moa-light px-4 py-3">
                  <div className="bg-moa-border h-4 w-2/3 rounded-full" />
                  <div className="bg-moa-border mt-2 h-3 w-1/3 rounded-full" />
                </div>
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="text-moa-subtle flex flex-col items-center gap-3 py-16 text-sm">
              <div className="bg-moa-light flex h-16 w-16 items-center justify-center rounded-2xl">
                <span className="text-moa-muted text-2xl font-black">0</span>
              </div>
              {getEmptyText(history.kind)}
            </div>
          ) : (
            <div className="space-y-2">
              {history.kind === 'post' &&
                (list as UserInfoPostDTO[]).map((p, idx) => (
                  <button
                    key={`${p.boardName}-${idx}`}
                    onClick={() => goDetail(p)}
                    className="border-moa-border hover:bg-moa-light/40 flex w-full cursor-pointer items-start justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-moa-text truncate text-sm font-bold">{p.title}</div>
                      <div className="text-moa-subtle mt-1 line-clamp-2 text-xs">{p.content}</div>
                      <div className="text-moa-subtle mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span>{formatDateTime(p.createDate)}</span>
                        <span>·</span>
                        <span>조회 {toSafeNumber(p.viewCount).toLocaleString()}</span>
                        <span>·</span>
                        <span>댓글 {toSafeNumber(p.countReply).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-moa-subtle mt-1 shrink-0">›</span>
                  </button>
                ))}

              {history.kind === 'reply' &&
                (list as UserInfoReplyDTO[]).map((r, idx) => (
                  <button
                    key={`${r.createDate}-${idx}`}
                    onClick={() => goDetail(r)}
                    className="border-moa-border hover:bg-moa-light/40 flex w-full cursor-pointer items-start justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-moa-text truncate text-sm font-bold">{r.title}</div>
                      <div className="text-moa-subtle mt-1 line-clamp-2 text-xs">{r.content}</div>
                      <div className="text-moa-subtle mt-2 text-[11px] font-mono">{formatDateTime(r.createDate)}</div>
                    </div>
                    <span className="text-moa-subtle mt-1 shrink-0">›</span>
                  </button>
                ))}

              {history.kind === 'circle' &&
                (list as UserInfoCircleDTO[]).map((c, idx) => (
                  <button
                    key={`${c.circleName}-${idx}`}
                    onClick={() => goDetail(c)}
                    className="border-moa-border hover:bg-moa-light/40 flex w-full cursor-pointer items-start justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-moa-text truncate text-sm font-bold">{c.circleName}</div>
                      <div className="text-moa-subtle mt-1 text-xs">
                        {c.categoryName} · {String(c.role ?? '').toUpperCase()}
                      </div>
                      <div className="text-moa-subtle mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span>{formatDateTime(c.createDate)}</span>
                        <span>·</span>
                        <span>현재 {toSafeNumber(c.currentMember).toLocaleString()}명</span>
                      </div>
                    </div>
                    <span className="text-moa-subtle mt-1 shrink-0">›</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {!historyLoading && pageCount > 1 && (
          <div className="border-t border-moa-border px-6 py-5">
            <div className="flex flex-col items-center gap-3">
              <MoaPaginate pageCount={pageCount} currentPage={history.page} onPageChange={({ selected }) => setHistoryPage(selected)} />
              <p className="text-moa-subtle text-xs">
                <span className="text-moa-secondary font-semibold">{history.page}</span> / {pageCount} 페이지
                &nbsp;·&nbsp;총 <span className="text-moa-primary font-semibold">{toSafeNumber(activeData?.totalCount).toLocaleString()}</span>건
              </p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

