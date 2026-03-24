import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { AdminPostResponseDTO, PageResultDTO } from "../types/adminTypes";
import { fetchAdminPosts } from "../api/adminPostApi";
import { deleteNotice, restoreNotice } from "../api/adminPostApi";
import MoaPaginate from "../component/Moapaginate";
import { usePageSize } from "../hooks/usePageSize";
import { useAdminToast } from "../hooks/useAdminToast";
import AdminToast from "../component/AdminToast";
import AdminConfirmModal from "../component/AdminConfirmModal";

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

const DELETED_OPTIONS = [
  { value: "", label: "전체" },
  { value: "false", label: "정상" },
  { value: "true", label: "삭제됨" },
];

const HEADERS = ["No.", "제목", "작성자", "조회수", "작성일", "상태", ""];

export default function AdminNoticesPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useAdminToast();
  const pageSize = usePageSize();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<PageResultDTO<AdminPostResponseDTO> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const deleted = searchParams.get("deleted") ?? "";
  const keyword = searchParams.get("keyword") ?? "";

  // 확인 모달
  const [confirmTarget, setConfirmTarget] = useState<{
    postId: number;
    action: "delete" | "restore";
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(
        await fetchAdminPosts({
          page,
          size: pageSize,
          boardType: "NOTICE",
          deleted:
            deleted === "true" ? true : deleted === "false" ? false : undefined,
          keyword: keyword || undefined,
          type: keyword ? "title" : undefined,
        }),
      );
    } catch {
      showToast("공지사항을 불러오지 못했습니다.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, deleted, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  const list = data?.dtoList ?? [];
  const totalCount = data?.totalCount ?? 0;
  const current = data?.current ?? 1;
  const actualTotalPage = data
    ? Math.ceil((data.totalCount ?? 0) / pageSize)
    : 0;

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  };

  const handleAction = async () => {
    if (!confirmTarget) return;
    try {
      if (confirmTarget.action === "delete") {
        await deleteNotice(confirmTarget.postId);
        showToast("공지사항이 삭제되었습니다.");
      } else {
        await restoreNotice(confirmTarget.postId);
        showToast("공지사항이 복원되었습니다.");
      }
      setConfirmTarget(null);
      load();
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? "처리에 실패했습니다.", { type: "error" });
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <span className="text-lg font-black text-white">📢</span>
          </div>
          <div>
            <h1 className="text-moa-text text-2xl font-bold tracking-tight">
              공지사항 관리
            </h1>
            <p className="text-moa-subtle mt-0.5 text-sm">
              전체{" "}
              <span className="text-moa-primary font-bold">
                {totalCount.toLocaleString()}
              </span>
              건
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="text-moa-secondary border-moa-border hover:bg-moa-light hover:border-moa-primary flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all"
          >
            ↻ 새로고침
          </button>
          <button
            onClick={() => navigate("/admin/posts/notices/write")}
            className="bg-moa-primary hover:bg-moa-hover flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors"
          >
            + 공지사항 작성
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="border-moa-border flex items-center gap-3 rounded-2xl border bg-white px-5 py-3 shadow-sm">
        <input
          value={keyword}
          onChange={(e) => updateParam("keyword", e.target.value)}
          placeholder="제목 검색"
          className="border-moa-border bg-moa-light focus:border-moa-primary h-9 flex-1 rounded-lg border px-3 text-sm outline-none transition-colors focus:bg-white"
        />
        <select
          value={deleted}
          onChange={(e) => updateParam("deleted", e.target.value)}
          className="border-moa-border h-9 cursor-pointer rounded-lg border px-3 text-sm outline-none"
        >
          {DELETED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* 테이블 */}
      <div className="border-moa-border overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-moa-primary">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-white opacity-90 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-moa-border divide-y">
            {loading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {HEADERS.map((__, j) => (
                    <td key={j} className="px-5 py-4">
                      <div
                        className="bg-moa-border h-4 rounded-full"
                        style={{ width: `${60 + ((j * 17) % 40)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && list.length === 0 && (
              <tr>
                <td
                  colSpan={HEADERS.length}
                  className="px-5 py-16 text-center"
                >
                  <span className="text-moa-subtle text-sm">
                    공지사항이 없습니다.
                  </span>
                </td>
              </tr>
            )}

            {!loading &&
              list.map((p, idx) => {
                const no = totalCount - (current - 1) * pageSize - idx;
                return (
                  <tr
                    key={p.postId}
                    className={`group transition-colors hover:bg-moa-light/30 ${p.deleted ? "opacity-50" : ""}`}
                  >
                    <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs">
                      {no}
                    </td>
                    <td className="max-w-sm px-5 py-3.5">
                      <span className="text-moa-text truncate font-semibold">
                        {p.title}
                      </span>
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 text-xs">
                      {p.authorName}
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 font-mono text-xs">
                      {p.viewCount.toLocaleString()}
                    </td>
                    <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs">
                      {formatDateTime(p.createDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      {p.deleted ? (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          삭제됨
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                          정상
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!p.deleted && (
                          <>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/posts/notices/${p.postId}/edit`,
                                )
                              }
                              className="border-moa-border text-moa-primary hover:bg-moa-light cursor-pointer rounded-lg border px-3 py-1 text-xs font-medium transition-colors"
                            >
                              수정
                            </button>
                            <button
                              onClick={() =>
                                setConfirmTarget({
                                  postId: p.postId,
                                  action: "delete",
                                })
                              }
                              className="cursor-pointer rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                              삭제
                            </button>
                          </>
                        )}
                        {p.deleted && (
                          <button
                            onClick={() =>
                              setConfirmTarget({
                                postId: p.postId,
                                action: "restore",
                              })
                            }
                            className="border-moa-border text-moa-primary hover:bg-moa-light cursor-pointer rounded-lg border px-3 py-1 text-xs font-medium transition-colors"
                          >
                            복원
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {!loading && actualTotalPage > 1 && (
          <div className="border-moa-border flex flex-col items-center gap-3 border-t px-6 py-5">
            <MoaPaginate
              pageCount={actualTotalPage}
              currentPage={current}
              onPageChange={({ selected }) => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(selected + 1));
                setSearchParams(next, { replace: true });
              }}
            />
          </div>
        )}
      </div>

      {/* 확인 모달 */}
      <AdminConfirmModal
        open={!!confirmTarget}
        title={
          confirmTarget?.action === "delete"
            ? "공지사항 삭제"
            : "공지사항 복원"
        }
        message={
          confirmTarget?.action === "delete"
            ? "이 공지사항을 삭제하시겠습니까?"
            : "이 공지사항을 복원하시겠습니까?"
        }
        confirmLabel={confirmTarget?.action === "delete" ? "삭제" : "복원"}
        confirmColor={confirmTarget?.action === "delete" ? "red" : "green"}
        onConfirm={handleAction}
        onCancel={() => setConfirmTarget(null)}
      />

      <AdminToast toast={toast} />
    </div>
  );
}
