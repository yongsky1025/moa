import { useNavigate } from "react-router-dom";
import type { AdminPostResponseDTO } from "../../types/adminTypes";
import { useAdminPosts } from "../../context/AdminPostsContext";
import MoaPaginate from "../Moapaginate";

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

const HEADERS = [
  "No.",
  "게시판",
  "제목",
  "작성자",
  "조회수",
  "댓글",
  "작성일",
  "상태",
  "",
];

export default function AdminPostTable() {
  const navigate = useNavigate();
  const { data, loading, error, params, actualTotalPage, handlePageChange } =
    useAdminPosts();

  const list = data?.dtoList ?? [];
  const totalCount = data?.totalCount ?? 0;
  const current = data?.current ?? 1;

  return (
    <div className="border-moa-border overflow-hidden rounded-2xl border bg-white shadow-sm">
      {error && (
        <div className="border-b border-red-100 bg-red-50 px-6 py-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
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
              Array.from({ length: params.size || 10 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: HEADERS.length }).map((__, j) => (
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
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-moa-light flex h-16 w-16 items-center justify-center rounded-2xl">
                      <span className="text-moa-muted text-2xl font-black">
                        0
                      </span>
                    </div>
                    <span className="text-moa-subtle text-sm">
                      게시글이 없습니다.
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              list.map((p: AdminPostResponseDTO, idx: number) => {
                const no =
                  totalCount - (current - 1) * (params.size || 10) - idx;
                const boardLabel =
                  p.boardType === "CIRCLE" && p.circleName
                    ? `${p.circleName}`
                    : (BOARD_TYPE_LABEL[p.boardType] ?? p.boardName);
                return (
                  <tr
                    key={p.postId}
                    onClick={() => navigate(`/admin/posts/${p.postId}`)}
                    className={`group cursor-pointer transition-colors hover:bg-moa-light/30 ${
                      p.deleted ? "opacity-50" : ""
                    }`}
                  >
                    <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs whitespace-nowrap">
                      {no}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.boardType === "CIRCLE"
                            ? "bg-blue-50 text-blue-700"
                            : p.boardType === "NOTICE"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {boardLabel}
                      </span>
                    </td>
                    <td className="max-w-xs px-5 py-3.5">
                      <span className="text-moa-text group-hover:text-moa-primary truncate font-semibold transition-colors">
                        {p.title}
                      </span>
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 text-xs whitespace-nowrap">
                      {p.authorName}
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 font-mono text-xs whitespace-nowrap">
                      {p.viewCount.toLocaleString()}
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 font-mono text-xs whitespace-nowrap">
                      {p.replyCount}
                    </td>
                    <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs whitespace-nowrap">
                      {formatDateTime(p.createDate)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {p.deleted ? (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          삭제됨
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                          정상
                        </span>
                      )}
                    </td>
                    <td
                      className="px-5 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          navigate(`/admin/posts/${p.postId}`)
                        }
                        className="bg-moa-primary hover:bg-moa-hover inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-all group-hover:opacity-100 whitespace-nowrap"
                      >
                        상세보기
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {!loading && actualTotalPage > 1 && (
        <div className="border-moa-border flex flex-col items-center gap-3 border-t px-6 py-5">
          <MoaPaginate
            pageCount={actualTotalPage}
            currentPage={current}
            onPageChange={handlePageChange}
          />
          <p className="text-moa-subtle text-xs">
            <span className="text-moa-secondary font-semibold">{current}</span>{" "}
            / {actualTotalPage} 페이지 &nbsp;·&nbsp;총{" "}
            <span className="text-moa-primary font-semibold">
              {totalCount.toLocaleString()}
            </span>
            건
          </p>
        </div>
      )}
    </div>
  );
}
