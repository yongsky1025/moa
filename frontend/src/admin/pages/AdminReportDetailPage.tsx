import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type {
  ReportResponseDTO,
  ReportStatus,
  ReportStatusUpdateRequest,
  ReportTargetContentDTO,
} from "../types/adminTypes";
import {
  fetchReportDetail,
  patchReportStatus,
} from "../api/adminReportAndSanctionApi";
import AdminReportStatusBadge from "../component/report/AdminReportStatusBadge";
import AdminConfirmModal from "../component/AdminConfirmModal";
import { useAdminToast } from "../hooks/useAdminToast";
import AdminToast from "../component/AdminToast";
import ReportEvidenceImages from "../component/report/ReportEvidenceImages";

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

function ActionButton({
  label,
  tone,
  onClick,
  disabled,
}: {
  label: string;
  tone: "approve" | "reject";
  onClick: () => void;
  disabled?: boolean;
}) {
  const cls =
    tone === "approve"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-rose-600 hover:bg-rose-700";
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

const TARGET_TYPE_LABEL: Record<string, string> = {
  POST: "게시글",
  REPLY: "댓글",
  CIRCLE: "모임",
  USER: "유저",
  PLACE_REVIEW: "장소 후기",
};

function ReportTargetContentCard({ content }: { content: ReportTargetContentDTO }) {
  const label = TARGET_TYPE_LABEL[content.targetType] ?? content.targetType;

  return (
    <section className="border-moa-border rounded-2xl border bg-white shadow-sm">
      <div className="border-moa-border flex items-center justify-between border-b px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="bg-moa-primary h-4 w-1 rounded-full" />
          <h2 className="text-moa-text text-sm font-black tracking-tight">
            신고 대상 콘텐츠
          </h2>
          <span className="bg-moa-light text-moa-secondary rounded-lg px-2 py-0.5 text-xs font-bold">
            {label}
          </span>
        </div>
        {content.deleted && (
          <span className="rounded-lg bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
            삭제됨
          </span>
        )}
      </div>

      <div className="space-y-3 px-6 py-5 text-sm">
        {content.targetType === "POST" && <PostContent content={content} />}
        {content.targetType === "REPLY" && <ReplyContent content={content} />}
        {content.targetType === "CIRCLE" && <CircleContent content={content} />}
        {content.targetType === "USER" && <UserContent content={content} />}
        {content.targetType === "PLACE_REVIEW" && <PlaceReviewContent content={content} />}

        {content.linkUrl && (
          <a
            href={content.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-moa-primary mt-2 inline-flex items-center gap-1 text-xs font-bold hover:underline"
          >
            원본 보기 →
          </a>
        )}
      </div>
    </section>
  );
}

function ContentRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-moa-subtle shrink-0 text-xs font-semibold">{label}</span>
      <span className="text-moa-text text-right text-xs">{children}</span>
    </div>
  );
}

function PostContent({ content }: { content: ReportTargetContentDTO }) {
  return (
    <>
      <ContentRow label="제목">
        <span className="font-semibold">{content.postTitle}</span>
      </ContentRow>
      <ContentRow label="작성자">{content.postAuthorName}</ContentRow>
      <ContentRow label="작성일">{formatDateTime(content.postCreatedAt)}</ContentRow>
      {content.postContent && (
        <div className="border-moa-border mt-2 rounded-xl border bg-stone-50 px-4 py-3">
          <p className="text-moa-text whitespace-pre-wrap text-sm leading-relaxed">
            {content.postContent}
          </p>
        </div>
      )}
    </>
  );
}

function ReplyContent({ content }: { content: ReportTargetContentDTO }) {
  return (
    <>
      <ContentRow label="원글 제목">
        <span className="font-semibold">{content.replyPostTitle}</span>
      </ContentRow>
      <ContentRow label="작성자">{content.replyAuthorName}</ContentRow>
      <ContentRow label="작성일">{formatDateTime(content.replyCreatedAt)}</ContentRow>
      {content.replyContent && (
        <div className="border-moa-border mt-2 rounded-xl border bg-stone-50 px-4 py-3">
          <p className="text-moa-text whitespace-pre-wrap text-sm leading-relaxed">
            {content.replyContent}
          </p>
        </div>
      )}
    </>
  );
}

function CircleContent({ content }: { content: ReportTargetContentDTO }) {
  return (
    <>
      <ContentRow label="모임명">
        <span className="font-semibold">{content.circleName}</span>
      </ContentRow>
      <ContentRow label="상태">{content.circleStatus}</ContentRow>
      <ContentRow label="인원">
        {content.circleCurrentMember}/{content.circleMaxMember}명
      </ContentRow>
      <ContentRow label="개설일">{formatDateTime(content.circleCreatedAt)}</ContentRow>
      {content.circleDescription && (
        <div className="border-moa-border mt-2 rounded-xl border bg-stone-50 px-4 py-3">
          <p className="text-moa-text whitespace-pre-wrap text-sm leading-relaxed">
            {content.circleDescription}
          </p>
        </div>
      )}
    </>
  );
}

function UserContent({ content }: { content: ReportTargetContentDTO }) {
  return (
    <>
      <ContentRow label="닉네임">
        <span className="font-semibold">{content.userNickname}</span>
      </ContentRow>
      <ContentRow label="이메일">{content.userEmail}</ContentRow>
      <ContentRow label="상태">{content.userStatus}</ContentRow>
      <ContentRow label="제재 횟수">
        <span className={content.userSanctionCount ? "font-bold text-red-600" : ""}>
          {content.userSanctionCount}회
        </span>
      </ContentRow>

      {content.userRecentActivities && content.userRecentActivities.length > 0 && (
        <div className="mt-3">
          <span className="text-moa-subtle text-xs font-semibold">최근 활동</span>
          <div className="mt-2 space-y-2">
            {content.userRecentActivities.map((act) => (
              <div
                key={`${act.type}-${act.id}`}
                className="border-moa-border rounded-xl border bg-stone-50 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    act.type === "POST"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    {act.type === "POST" ? "글" : "댓글"}
                  </span>
                  <span className="text-moa-text text-xs font-semibold truncate">
                    {act.title}
                  </span>
                  <span className="text-moa-subtle ml-auto shrink-0 text-[10px]">
                    {formatDateTime(act.createdAt)}
                  </span>
                </div>
                <p className="text-moa-secondary mt-1 text-xs line-clamp-2">
                  {act.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function PlaceReviewContent({ content }: { content: ReportTargetContentDTO }) {
  return (
    <>
      <ContentRow label="장소명">
        <span className="font-semibold">{content.placeReviewPlaceName}</span>
      </ContentRow>
      <ContentRow label="작성자">{content.placeReviewAuthorName}</ContentRow>
      <ContentRow label="평점">
        <span className="font-bold text-amber-500">{"★".repeat(content.placeReviewRating ?? 0)}</span>
        <span className="text-moa-subtle ml-1">({content.placeReviewRating}점)</span>
      </ContentRow>
      <ContentRow label="작성일">{formatDateTime(content.placeReviewCreatedAt)}</ContentRow>
      {content.placeReviewContent && (
        <div className="border-moa-border mt-2 rounded-xl border bg-stone-50 px-4 py-3">
          <p className="text-moa-text whitespace-pre-wrap text-sm leading-relaxed">
            {content.placeReviewContent}
          </p>
        </div>
      )}
    </>
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
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ReportStatus | null>(null);

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
        setAdminNote(r.adminNote ?? "");
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message ?? "신고 상세를 불러오지 못했습니다.",
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
    return s === "PENDING" || s === "REVIEWING";
  }, [data?.status]);

  const decide = async (status: ReportStatus) => {
    if (!data) return;
    setSaving(true);
    try {
      const req: ReportStatusUpdateRequest = {
        status,
        adminNote: adminNote.trim(),
      };
      await patchReportStatus(data.reportId, req);
      const next = { ...data, status, adminNote: req.adminNote ?? null };
      setData(next);

      // 토스트 띄우고 가자.
      const label = status === "RESOLVED" ? "승인" : "반려";
      showToast(`신고가 ${label}되었습니다.`, { navigateTo: "/admin/reports" });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "상태 변경에 실패했습니다.");
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
      <AdminToast toast={toast} />
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
            onClick={() => navigate("/admin/reports")}
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
                {data.description && (
                  <div className="border-moa-border mt-2 rounded-xl border bg-stone-50 px-4 py-3">
                    <span className="text-moa-subtle text-xs font-semibold">신고 사유</span>
                    <p className="text-moa-text mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                      {data.description}
                    </p>
                  </div>
                )}
                <ReportEvidenceImages imagePaths={data.imagePaths} />
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
              상세를 조회한 순간 '대기'에서 '검토중'으로 변경됩니다.
            </p>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="text-moa-subtle text-xs font-semibold">
                관리자 메모 <span className="text-rose-500">*</span>
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
                onClick={() => {
                  if (!adminNote.trim()) { setError('관리자 메모를 입력해주세요.'); return; }
                  setError(null);
                  setConfirmAction("RESOLVED");
                }}
              />
              <ActionButton
                label="반려"
                tone="reject"
                disabled={!canDecide || saving}
                onClick={() => {
                  if (!adminNote.trim()) { setError('관리자 메모를 입력해주세요.'); return; }
                  setError(null);
                  setConfirmAction("REJECTED");
                }}
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

      {/* 신고 대상 콘텐츠 */}
      {data?.targetContent && (
        <ReportTargetContentCard content={data.targetContent} />
      )}

      <AdminConfirmModal
        open={!!confirmAction}
        title={confirmAction === "RESOLVED" ? "신고 승인" : "신고 반려"}
        message={
          confirmAction === "RESOLVED"
            ? "이 신고를 승인하시겠습니까? 승인 후 제재가 진행될 수 있습니다."
            : "이 신고를 반려하시겠습니까?"
        }
        confirmLabel={confirmAction === "RESOLVED" ? "승인" : "반려"}
        confirmColor={confirmAction === "RESOLVED" ? "green" : "red"}
        onConfirm={() => {
          if (confirmAction) decide(confirmAction);
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
