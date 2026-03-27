import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type {
  AdminPostDetailDTO,
  AdminReplyDTO,
  SanctionType,
} from "../types/adminTypes";
import { fetchPostDetail } from "../api/adminPostApi";
import { applySanction } from "../api/adminReportAndSanctionApi";
import AdminSanctionModal from "../component/post/AdminSanctionModal";
import { useAdminToast } from "../hooks/useAdminToast";
import AdminToast from "../component/AdminToast";
import { NOTICE_CATEGORY_LABEL } from "../../post/constants/noticeCategory";

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return "-";
  const d = new Date(date);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yy}.${mm}.${dd} ${hh}:${mi}`;
};

const BOARD_TYPE_LABEL: Record<string, string> = {
  FREE: "자유게시판",
  NOTICE: "공지사항",
  SUPPORT: "가입인사",
  CIRCLE: "모임",
};

export default function AdminPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast, showToast } = useAdminToast();

  const [post, setPost] = useState<AdminPostDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 직권삭제 모달 상태
  const [sanctionTarget, setSanctionTarget] = useState<{
    type: "POST" | "REPLY";
    id: number;
    authorName: string;
    authorId: number;
  } | null>(null);
  const [sanctionLoading, setSanctionLoading] = useState(false);

  // 제재 미적용 안내 모달
  const [showNoSanctionModal, setShowNoSanctionModal] = useState(false);

  const load = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      setPost(await fetchPostDetail(Number(postId)));
    } catch {
      setError("게시글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const handleSanctionConfirm = async (
    reason: string,
    addUserSanction: boolean,
    userSanctionType?: SanctionType,
    userSanctionReason?: string,
  ) => {
    if (!sanctionTarget || !post) return;
    setSanctionLoading(true);

    try {
      // 1. 콘텐츠 삭제 (CONTENT_DELETE)
      await applySanction(1, {
        reportId: undefined,
        targetUserId: sanctionTarget.authorId,
        targetType: sanctionTarget.type,
        targetId: sanctionTarget.id,
        sanctionType: "CONTENT_DELETE",
        reason,
      });

      // 2. 추가 유저 제재 (선택 시) — 별도 사유 사용
      if (addUserSanction && userSanctionType && userSanctionReason) {
        await applySanction(1, {
          reportId: undefined,
          targetUserId: sanctionTarget.authorId,
          targetType: "USER",
          targetId: sanctionTarget.authorId,
          sanctionType: userSanctionType,
          reason: userSanctionReason,
        });
      }

      showToast(
        `${sanctionTarget.type === "POST" ? "게시글" : "댓글"} 직권 삭제가 완료되었습니다.`,
      );

      setSanctionTarget(null);

      // 게시글 삭제 시 목록으로 이동, 댓글 삭제 시 새로고침
      if (sanctionTarget.type === "POST") {
        setTimeout(() => navigate("/admin/posts"), 1000);
      } else {
        load();
      }
    } catch (e: any) {
      showToast(
        e?.response?.data?.message ?? "제재 처리에 실패했습니다.",
        { type: "error" },
      );
    } finally {
      setSanctionLoading(false);
    }
  };

  // 제재 관리 버튼 클릭 핸들러
  const handleSanctionNavigation = () => {
    if (!post) return;
    if (post.deleted && post.sanctionId) {
      // 제재 받은 게시글 → 제재 상세로 직행
      navigate(`/admin/sanctions/${post.sanctionId}`);
    } else {
      // 제재 받지 않은 게시글 → 안내 모달
      setShowNoSanctionModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#FDFAF8]">
        <div className="text-moa-subtle animate-pulse text-sm">
          불러오는 중...
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#FDFAF8]">
        <p className="text-sm text-red-600">{error ?? "게시글을 찾을 수 없습니다."}</p>
        <button
          onClick={() => navigate("/admin/posts")}
          className="text-moa-primary cursor-pointer text-sm underline"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const boardLabel =
    post.boardType === "CIRCLE" && post.circleName
      ? `모임 · ${post.circleName}`
      : (BOARD_TYPE_LABEL[post.boardType] ?? post.boardName);
  const noticeCategoryLabel =
    post.boardType === "NOTICE" && post.noticeCategory
      ? (NOTICE_CATEGORY_LABEL[post.noticeCategory] ?? "공지")
      : null;

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      {/* ── 헤더 (유저 상세와 통일) ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-moa-text text-2xl font-black tracking-tight">게시글 상세</h1>
            <p className="text-moa-subtle mt-0.5 text-sm">게시글 내용 및 댓글을 확인하고 관리합니다.</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/posts")}
          className="border-moa-border text-moa-secondary hover:bg-moa-light flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold shadow-sm transition-colors"
        >
          ‹ 목록
        </button>
      </div>

      {/* 게시글 정보 */}
      <section className="border-moa-border rounded-2xl border bg-white shadow-sm">
        <div className="border-moa-border flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="bg-moa-primary h-4 w-1 rounded-full" />
            <h2 className="text-moa-text text-sm font-black tracking-tight">
              게시글 상세
            </h2>
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
                post.boardType === "CIRCLE"
                  ? "bg-blue-50 text-blue-700"
                  : post.boardType === "NOTICE"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-gray-50 text-gray-600"
              }`}
            >
              {boardLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {post.deleted ? (
              <>
                <span className="rounded-lg bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                  삭제됨
                </span>
                <button
                  onClick={() => post.sanctionId && navigate(`/admin/sanctions/${post.sanctionId}`)}
                  disabled={!post.sanctionId}
                  className="border-moa-border text-moa-primary hover:bg-moa-light cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-40"
                >
                  제재 관리에서 복원
                </button>
              </>
            ) : (
              <button
                onClick={() =>
                  setSanctionTarget({
                    type: "POST",
                    id: post.postId,
                    authorName: post.authorName,
                    authorId: post.authorId,
                  })
                }
                className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                직권 삭제
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-5">
          {/* 메타 정보 */}
          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-moa-subtle">작성자:</span>{" "}
              <span className="text-moa-text font-semibold">
                {post.authorName}
              </span>
            </div>
            <div>
              <span className="text-moa-subtle">조회수:</span>{" "}
              <span className="text-moa-text font-semibold">
                {post.viewCount.toLocaleString()}
              </span>
            </div>
            {noticeCategoryLabel && (
              <div>
                <span className="text-moa-subtle">카테고리:</span>{" "}
                <span className="text-moa-text font-semibold">
                  {noticeCategoryLabel}
                </span>
              </div>
            )}
            <div>
              <span className="text-moa-subtle">작성일:</span>{" "}
              <span className="text-moa-text font-mono text-xs">
                {formatDateTime(post.createDate)}
              </span>
            </div>
            {post.updateDate && post.updateDate !== post.createDate && (
              <div>
                <span className="text-moa-subtle">수정일:</span>{" "}
                <span className="text-moa-text font-mono text-xs">
                  {formatDateTime(post.updateDate)}
                </span>
              </div>
            )}
          </div>

          {/* 제목 */}
          <h3 className="text-moa-text mb-3 text-lg font-bold">
            {post.title}
          </h3>

          {/* 본문 */}
          <div className="border-moa-border bg-moa-light min-h-32 rounded-xl border p-4">
            <p className="text-moa-text text-sm leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>

        {/* 신고/제재 관리 링크 */}
        <div className="border-moa-border flex items-center gap-4 border-t px-6 py-4">
          <button
            onClick={() =>
              navigate(`/admin/reports?targetType=POST&type=name&keyword=${encodeURIComponent(post.authorName)}`)
            }
            className="text-moa-subtle hover:text-moa-primary cursor-pointer text-xs underline transition-colors"
          >
            이 게시글 관련 신고 보기
          </button>
          <button
            onClick={handleSanctionNavigation}
            className="text-moa-subtle hover:text-moa-primary cursor-pointer text-xs underline transition-colors"
          >
            제재 관리 페이지로 이동
          </button>
        </div>
      </section>

      {/* 댓글 목록 */}
      <section className="border-moa-border rounded-2xl border bg-white shadow-sm">
        <div className="border-moa-border flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="bg-moa-primary h-4 w-1 rounded-full" />
            <h2 className="text-moa-text text-sm font-black tracking-tight">
              댓글
            </h2>
            <span className="bg-moa-light text-moa-secondary rounded-lg px-2 py-0.5 text-xs font-bold">
              {post.replies.length}개
            </span>
          </div>
        </div>

        <div className="divide-moa-border divide-y">
          {post.replies.length === 0 && (
            <div className="px-6 py-12 text-center">
              <span className="text-moa-subtle text-sm">
                댓글이 없습니다.
              </span>
            </div>
          )}

          {post.replies.map((reply: AdminReplyDTO) => (
            <div
              key={reply.replyId}
              className={`flex items-start gap-3 px-6 py-4 ${
                reply.deleted ? "opacity-50" : ""
              }`}
              style={{ paddingLeft: `${1.5 + reply.depth * 1.5}rem` }}
            >
              {reply.depth > 0 && (
                <span className="text-moa-subtle mt-0.5 text-xs">└</span>
              )}
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-moa-text text-sm font-semibold">
                    {reply.authorName}
                  </span>
                  <span className="text-moa-subtle font-mono text-xs">
                    {formatDateTime(reply.createDate)}
                  </span>
                  {reply.deleted && (
                    <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-500">
                      삭제됨
                    </span>
                  )}
                </div>
                <p className="text-moa-text text-sm leading-relaxed">
                  {reply.content}
                </p>
              </div>

              {/* 댓글 직권 삭제 */}
              {!reply.deleted && (
                <button
                  onClick={() =>
                    setSanctionTarget({
                      type: "REPLY",
                      id: reply.replyId,
                      authorName: reply.authorName,
                      authorId: reply.authorId,
                    })
                  }
                  className="text-moa-subtle hover:text-red-500 shrink-0 cursor-pointer text-xs transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 직권삭제 모달 */}
      {sanctionTarget && (
        <AdminSanctionModal
          targetType={sanctionTarget.type}
          targetId={sanctionTarget.id}
          authorName={sanctionTarget.authorName}
          onConfirm={handleSanctionConfirm}
          onClose={() => setSanctionTarget(null)}
          loading={sanctionLoading}
        />
      )}

      {/* 제재 미적용 안내 모달 */}
      {showNoSanctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <span className="text-sm">⚠</span>
              </div>
              <h3 className="text-moa-text text-base font-bold">안내</h3>
            </div>
            <p className="text-moa-text mb-5 text-sm">
              제재를 받지 않은 게시글입니다.
              <br />
              <span className="text-moa-subtle text-xs">
                제재로 삭제된 게시글만 제재 상세 페이지로 이동할 수 있습니다.
              </span>
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowNoSanctionModal(false)}
                className="bg-moa-primary hover:bg-moa-hover cursor-pointer rounded-xl px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminToast toast={toast} />
    </div>
  );
}
