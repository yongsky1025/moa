import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNotice } from "../api/adminPostApi";
import { useAdminToast } from "../hooks/useAdminToast";
import AdminToast from "../component/AdminToast";
import {
  NOTICE_CATEGORY_OPTIONS,
  type NoticeCategory,
} from "../../post/constants/noticeCategory";

export default function AdminNoticeWritePage() {
  const navigate = useNavigate();
  const { toast, showToast } = useAdminToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noticeCategory, setNoticeCategory] =
    useState<NoticeCategory>("ANNOUNCEMENT");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast("제목을 입력하세요.", { type: "error" });
      return;
    }
    if (!content.trim()) {
      showToast("내용을 입력하세요.", { type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      // TODO: 실제 로그인한 관리자 ID로 교체
      await createNotice(1, {
        title: title.trim(),
        content: content.trim(),
        noticeCategory,
      });
      showToast("공지사항이 작성되었습니다.", { navigateTo: "/admin/posts/notices" });
    } catch (e: any) {
      showToast(
        e?.response?.data?.message ?? "공지사항 작성에 실패했습니다.",
        { type: "error" },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate("/admin/posts/notices")}
        className="text-moa-subtle hover:text-moa-primary flex w-fit cursor-pointer items-center gap-1 text-sm transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        공지사항 목록으로
      </button>

      <section className="border-moa-border rounded-2xl border bg-white shadow-sm">
        <div className="border-moa-border flex items-center gap-2 border-b px-6 py-5">
          <div className="bg-moa-primary h-4 w-1 rounded-full" />
          <h2 className="text-moa-text text-sm font-black tracking-tight">
            공지사항 작성
          </h2>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div>
            <label className="text-moa-text mb-1.5 block text-sm font-semibold">
              카테고리
            </label>
            <select
              value={noticeCategory}
              onChange={(e) => setNoticeCategory(e.target.value as NoticeCategory)}
              className="border-moa-border focus:border-moa-primary text-moa-text w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
            >
              {NOTICE_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-moa-text mb-1.5 block text-sm font-semibold">
              제목
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              className="border-moa-border focus:border-moa-primary text-moa-text w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-moa-text mb-1.5 block text-sm font-semibold">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지사항 내용을 입력하세요"
              rows={12}
              className="border-moa-border focus:border-moa-primary text-moa-text w-full resize-none rounded-xl border p-4 text-sm leading-relaxed outline-none transition-colors"
            />
          </div>
        </div>

        <div className="border-moa-border flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={() => navigate("/admin/posts/notices")}
            className="border-moa-border text-moa-text hover:bg-moa-light cursor-pointer rounded-xl border px-5 py-2 text-sm font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-moa-primary hover:bg-moa-hover cursor-pointer rounded-xl px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-40"
          >
            {submitting ? "작성 중..." : "작성"}
          </button>
        </div>
      </section>

      <AdminToast toast={toast} />
    </div>
  );
}
