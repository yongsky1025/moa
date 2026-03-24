import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import PlaceBasicInfoForm from "../component/place/PlaceBasicInfoForm";
import PlaceKakaoMapSearch, {
  type SelectedAddress,
} from "../component/place/PlaceKakaoMapSearch";
import PlaceOperationForm, {
  type OperationData,
} from "../component/place/PlaceOperationForm";
import PlaceTagSelector from "../component/place/PlaceTagSelector";
import PlaceImageUploader from "../component/place/PlaceImageUploader";
import { registerPlace } from "../api/adminPlaceApi";
import type { PlaceClosedDayRequest } from "../types/adminTypes";
import { useAdminToast } from "../hooks/useAdminToast";
import AdminToast from "../component/AdminToast";

export default function AdminPlaceRegisterPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useAdminToast();
  const errorRef = useRef<HTMLDivElement>(null);

  // ── 상태 ─────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAddress, setSelectedAddress] =
    useState<SelectedAddress | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [operation, setOperation] = useState<OperationData>({
    openTimeHour: 9,
    openTimeMinute: 0,
    closeTimeHour: 22,
    closeTimeMinute: 0,
    capacity: 10,
    pricePerHour: 10000,
    minReservationMinutes: 60,
    maxReservationMinutes: 240,
    closedDays: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── 태그 토글 ────────────────────────────
  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      next.has(tagId) ? next.delete(tagId) : next.add(tagId);
      return next;
    });
  };

  // ── 유효성 에러 시 스크롤 및 토스트 표시 ───
  const setValidationError = (msg: string) => {
    setError(msg);
    showToast(msg, { type: "error" });
  };

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [error]);

  // ── 등록 ─────────────────────────────────
  const handleSubmit = async (e?: React.MouseEvent) => {
    e?.preventDefault?.();
    if (!name.trim()) return setValidationError("장소명을 입력해주세요.");
    if (!selectedAddress) return setValidationError("주소를 검색하여 선택해주세요.");
    if (selectedTagIds.size === 0)
      return setValidationError("태그를 1개 이상 선택해주세요.");
    if (!description.trim()) return setValidationError("장소 설명을 입력해주세요.");

    setSubmitting(true);
    setError("");

    const placeClosedDays: PlaceClosedDayRequest[] = operation.closedDays.map(
      (day) => ({
        dayOfWeek: day,
        closedType: "WEEKLY",
        reason: "정기 휴무",
      }),
    );

    try {
      const id = await registerPlace({
        name,
        address: selectedAddress.address,
        city: selectedAddress.city,
        district: selectedAddress.district,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
        capacity: operation.capacity,
        pricePerHour: operation.pricePerHour,
        description,
        openTimeHour: operation.openTimeHour,
        openTimeMinute: operation.openTimeMinute,
        closeTimeHour: operation.closeTimeHour,
        closeTimeMinute: operation.closeTimeMinute,
        minReservationMinutes: operation.minReservationMinutes,
        maxReservationMinutes: operation.maxReservationMinutes,
        tagIds: Array.from(selectedTagIds),
        placeClosedDays,
        imagePaths,
      });
      showToast(`장소가 등록되었습니다. (ID: ${id})`, { type: "success" });
      setTimeout(() => navigate("/admin/places"), 1200);
    } catch (e: any) {
      setError(e.response?.data?.message || "장소 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5F8F7B] shadow-sm">
          <Plus className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            장소 등록
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            새로운 대여 장소를 등록합니다
          </p>
        </div>
      </div>

      {error && (
        <div
          ref={errorRef}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* 좌측: 기본 정보 + 지도 */}
        <div className="flex flex-col gap-6">
          <PlaceBasicInfoForm
            name={name}
            description={description}
            onNameChange={setName}
            onDescriptionChange={setDescription}
          />
          <PlaceKakaoMapSearch
            value={selectedAddress}
            onChange={setSelectedAddress}
          />
        </div>

        {/* 우측: 운영 정보 + 태그 + 이미지 */}
        <div className="flex flex-col gap-6">
          <PlaceOperationForm value={operation} onChange={setOperation} />
          <PlaceTagSelector
            selectedTagIds={selectedTagIds}
            onToggle={handleTagToggle}
          />
          <PlaceImageUploader value={imagePaths} onChange={setImagePaths} />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-end gap-3 pb-4">
        <button
          type="button"
          onClick={() => navigate("/admin/places")}
          className="cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e)}
          disabled={submitting}
          className="cursor-pointer rounded-xl bg-[#5F8F7B] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#4E7C69] disabled:opacity-50"
        >
          {submitting ? "등록 중..." : "장소 등록"}
        </button>
      </div>

      <AdminToast toast={toast} />
    </div>
  );
}
