import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import PlaceBasicInfoForm from "../component/place/PlaceBasicInfoForm";
import PlaceKakaoMapSearch, {
  type SelectedAddress,
} from "../component/place/PlaceKakaoMapSearch";
import PlaceOperationForm, {
  type OperationData,
} from "../component/place/PlaceOperationForm";
import PlaceTagSelector from "../component/place/PlaceTagSelector";
import PlaceClosedDayManager from "../component/place/PlaceClosedDayManager";
import PlaceImageUploader from "../component/place/PlaceImageUploader";
import { fetchAdminPlace, updatePlace } from "../api/adminPlaceApi";
import type { PlaceClosedDayRequest } from "../types/adminTypes";
import AdminConfirmModal from "../component/AdminConfirmModal";
import AdminResultModal from "../component/AdminResultModal";

export default function AdminPlaceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAddress, setSelectedAddress] =
    useState<SelectedAddress | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
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

  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  // 기존 데이터 불러오기
  useEffect(() => {
    if (!id) return;
    fetchAdminPlace(Number(id))
      .then((data) => {
        setName(data.name);
        setDescription(data.description);
        setSelectedAddress({
          address: data.address,
          city: data.city,
          district: data.district,
          dong: data.dong ?? "",
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setSelectedTagIds(new Set(data.tagIds));
        setOperation({
          openTimeHour: data.openTimeHour,
          openTimeMinute: data.openTimeMinute,
          closeTimeHour: data.closeTimeHour,
          closeTimeMinute: data.closeTimeMinute,
          capacity: data.capacity,
          pricePerHour: data.pricePerHour,
          minReservationMinutes: data.minReservationMinutes,
          maxReservationMinutes: data.maxReservationMinutes,
          closedDays: data.closedDays
            .filter((d) => d.closedType === "WEEKLY" && d.dayOfWeek)
            .map((d) => d.dayOfWeek!),
        });
        setImagePaths(data.imagePaths ?? []);
      })
      .catch(() => setError("장소 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      next.has(tagId) ? next.delete(tagId) : next.add(tagId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) return setError("장소명을 입력해주세요.");
    if (!selectedAddress) return setError("주소를 검색하여 선택해주세요.");
    if (selectedTagIds.size === 0)
      return setError("태그를 1개 이상 선택해주세요.");
    if (!description.trim()) return setError("장소 설명을 입력해주세요.");

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
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
      await updatePlace(Number(id), {
        name,
        address: selectedAddress!.address,
        city: selectedAddress!.city,
        district: selectedAddress!.district,
        dong: selectedAddress!.dong,
        latitude: selectedAddress!.latitude,
        longitude: selectedAddress!.longitude,
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
      setResultMsg("장소 정보가 수정되었습니다.");
    } catch (e: any) {
      setError(e.response?.data?.message || "장소 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#FDFAF8]">
        <div className="text-moa-subtle text-sm">장소 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5F8F7B] shadow-sm">
          <Pencil className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            장소 수정
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            장소 정보를 수정합니다
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

        {/* 우측: 운영 정보 + 태그 + 이미지 + 특정 휴무일 */}
        <div className="flex flex-col gap-6">
          <PlaceOperationForm value={operation} onChange={setOperation} />
          <PlaceTagSelector
            selectedTagIds={selectedTagIds}
            onToggle={handleTagToggle}
          />
          <PlaceImageUploader value={imagePaths} onChange={setImagePaths} />
          <PlaceClosedDayManager placeId={Number(id)} />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-end gap-3 pb-4">
        <button
          onClick={() => navigate("/admin/places")}
          className="cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="cursor-pointer rounded-xl bg-[#5F8F7B] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#4E7C69] disabled:opacity-50"
        >
          {submitting ? "수정 중..." : "장소 수정"}
        </button>
      </div>

      {/* 수정 확인 모달 */}
      <AdminConfirmModal
        open={showConfirm}
        title="장소 수정"
        message="장소 정보를 수정하시겠습니까?"
        confirmLabel="수정"
        confirmColor="green"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      {/* 결과 모달 */}
      <AdminResultModal
        open={!!resultMsg}
        message={resultMsg}
        onClose={() => {
          setResultMsg("");
          navigate("/admin/places");
        }}
      />
    </div>
  );
}
