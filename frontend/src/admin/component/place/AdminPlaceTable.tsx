import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdminPlaceResponseDTO } from "../../types/adminTypes";
import { useAdminPlaces } from "../../context/AdminPlacesContext";
import { deletePlace } from "../../api/adminPlaceApi";
import { Trash2, Pencil, Eye } from "lucide-react";
import MoaPaginate from "../Moapaginate";
import AdminPlaceStatusBadge from "./AdminPlaceStatusBadge";
import AdminConfirmModal from "../AdminConfirmModal";
import AdminResultModal from "../AdminResultModal";
import { useAdminToast } from "../../hooks/useAdminToast";
import AdminToast from "../AdminToast";

const HEADERS = [
  "No.",
  "장소명",
  "주소",
  "지역",
  "수용인원",
  "시간당 가격",
  "평점",
  "후기",
  "상태",
  "",
];

export default function AdminPlaceTable() {
  const navigate = useNavigate();
  const { data, loading, error, params, actualTotalPage, handlePageChange, refresh } =
    useAdminPlaces();

  const list = data?.dtoList ?? [];
  const totalCount = data?.totalCount ?? 0;
  const current = data?.current ?? 1;

  const { toast, showToast } = useAdminToast();

  // 삭제 모달 상태
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [resultMsg, setResultMsg] = useState("");

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deletePlace(deleteTarget.id);
      setDeleteTarget(null);
      setResultMsg(`"${deleteTarget.name}" 장소가 비활성화되었습니다.`);
      refresh();
    } catch (e: any) {
      setDeleteTarget(null);
      const msg = e?.response?.data?.message ?? "장소 비활성화에 실패했습니다.";
      showToast(msg, { type: "error" });
    }
  };

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
                      장소가 없습니다.
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              list.map((p: AdminPlaceResponseDTO, idx: number) => {
                const no =
                  totalCount - (current - 1) * (params.size || 10) - idx;
                return (
                  <tr
                    key={p.id}
                    className="group transition-colors hover:bg-moa-light/30"
                  >
                    <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs whitespace-nowrap">
                      {no}
                    </td>
                    <td className="text-moa-text px-5 py-3.5 font-semibold whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 text-xs">
                      {p.address}
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 text-xs whitespace-nowrap">
                      {p.city} {p.district}
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 text-right font-mono text-xs whitespace-nowrap">
                      {p.capacity}명
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 text-right font-mono text-xs whitespace-nowrap">
                      {p.pricePerHour.toLocaleString()}원
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 text-right font-mono text-xs whitespace-nowrap">
                      {p.avgRating.toFixed(1)}
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 text-right font-mono text-xs whitespace-nowrap">
                      {p.reviewCount}건
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <AdminPlaceStatusBadge status={p.status} />
                    </td>
                    <td
                      className="px-5 py-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/places/${p.id}`)}
                          className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition hover:bg-green-50 hover:text-green-600"
                          title="상세보기"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/places/${p.id}/edit`)}
                          className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-500"
                          title="수정"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (p.status === "INACTIVE") {
                              showToast("이미 비활성화된 장소입니다.", { type: "error" });
                              return;
                            }
                            setDeleteTarget({ id: p.id, name: p.name });
                          }}
                          className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          title="비활성화"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

      {/* 삭제 확인 모달 */}
      <AdminConfirmModal
        open={!!deleteTarget}
        title="장소 비활성화"
        message={`"${deleteTarget?.name}" 장소를 비활성화하시겠습니까?\n비활성화된 장소는 사용자에게 노출되지 않습니다.`}
        confirmLabel="비활성화"
        confirmColor="red"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 결과 모달 */}
      <AdminResultModal
        open={!!resultMsg}
        message={resultMsg}
        onClose={() => setResultMsg("")}
      />

      <AdminToast toast={toast} />
    </div>
  );
}
