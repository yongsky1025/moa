import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Users, DollarSign, Clock, Star, MessageSquare, Pencil, ArrowLeft, Image as ImageIcon, CalendarOff, Tag, ChevronLeft, ChevronRight, X } from "lucide-react";
import { fetchAdminPlace, fetchTagsGrouped } from "../api/adminPlaceApi";
import type { AdminPlaceDetailDTO, TagCategoryGroupDTO } from "../types/adminTypes";
import AdminPlaceStatusBadge from "../component/place/AdminPlaceStatusBadge";
import { toAssetUrl } from "../../common/utils/assetUrl";

function formatTime(hour: number, minute: number) {
  if (hour === 24) return "24:00";
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatMinutes(m: number) {
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}시간 ${r}분` : `${h}시간`;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: "월", TUESDAY: "화", WEDNESDAY: "수",
  THURSDAY: "목", FRIDAY: "금", SATURDAY: "토", SUNDAY: "일",
};

export default function AdminPlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const placeId = Number(id);

  const [detail, setDetail] = useState<AdminPlaceDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [tagGroups, setTagGroups] = useState<TagCategoryGroupDTO[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDetail(await fetchAdminPlace(placeId));
    } catch {
      setError("장소 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchTagsGrouped().then(setTagGroups).catch(() => {}); }, []);

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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-moa-border h-40 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#FDFAF8]">
        <p className="text-sm text-red-500">{error ?? "장소 정보가 없습니다."}</p>
      </div>
    );
  }

  const weeklyClosedDays = detail.closedDays.filter((d) => d.closedType === "WEEKLY");
  const holidayClosedDays = detail.closedDays.filter((d) => d.closedType === "HOLIDAY");
  const images = detail.imagePaths ?? [];

  // 카테고리별로 선택된 태그만 묶기
  const tagsByCategory = tagGroups
    .map((g) => ({ categoryName: g.categoryName, tags: g.tags.filter((t) => detail.tagIds.includes(t.id)) }))
    .filter((g) => g.tags.length > 0);

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5F8F7B] shadow-sm">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{detail.name}</h1>
              <AdminPlaceStatusBadge status={detail.status} />
            </div>
            <p className="mt-0.5 text-sm text-gray-400">{detail.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/places")}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" /> 목록
          </button>
          <button
            onClick={() => navigate(`/admin/places/${placeId}/edit`)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#5F8F7B] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#4E7C69]"
          >
            <Pencil className="h-4 w-4" /> 수정
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* 왼쪽 */}
        <div className="flex flex-col gap-6">
          {/* 기본 정보 */}
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
              <MapPin className="h-4 w-4 text-[#5F8F7B]" /> 기본 정보
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-gray-400">지역</dt>
                <dd className="mt-0.5 text-gray-700">
                  {detail.city} {detail.district} {detail.dong}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400">좌표</dt>
                <dd className="mt-0.5 font-mono text-xs text-gray-500">
                  {detail.latitude.toFixed(5)}, {detail.longitude.toFixed(5)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs font-medium text-gray-400">
                  <Users className="h-3 w-3" /> 수용 인원
                </dt>
                <dd className="mt-0.5 text-gray-700">{detail.capacity}명</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs font-medium text-gray-400">
                  <DollarSign className="h-3 w-3" /> 시간당 가격
                </dt>
                <dd className="mt-0.5 text-gray-700">{detail.pricePerHour.toLocaleString()}원</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs font-medium text-gray-400">
                  <Clock className="h-3 w-3" /> 운영 시간
                </dt>
                <dd className="mt-0.5 text-gray-700">
                  {formatTime(detail.openTimeHour, detail.openTimeMinute)} ~{" "}
                  {formatTime(detail.closeTimeHour, detail.closeTimeMinute)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400">예약 시간</dt>
                <dd className="mt-0.5 text-gray-700">
                  최소 {formatMinutes(detail.minReservationMinutes)} / 최대 {formatMinutes(detail.maxReservationMinutes)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs font-medium text-gray-400">
                  <Star className="h-3 w-3" /> 평점
                </dt>
                <dd className="mt-0.5 text-gray-700">{detail.avgRating.toFixed(1)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs font-medium text-gray-400">
                  <MessageSquare className="h-3 w-3" /> 후기
                </dt>
                <dd className="mt-0.5 text-gray-700">{detail.reviewCount}건</dd>
              </div>
            </dl>
          </section>

          {/* 장소 설명 */}
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-gray-800">장소 설명</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
              {detail.description || <span className="text-gray-300">설명 없음</span>}
            </p>
          </section>
        </div>

        {/* 오른쪽 */}
        <div className="flex flex-col gap-6">
          {/* 이미지 */}
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
              <ImageIcon className="h-4 w-4 text-[#5F8F7B]" /> 장소 이미지
              {images.length > 0 && (
                <span className="rounded-full bg-[#5F8F7B]/10 px-2 py-0.5 text-xs font-semibold text-[#5F8F7B]">
                  {images.length}장
                </span>
              )}
            </h2>
            {images.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                등록된 이미지가 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {images.map((path, i) => (
                  <button
                    key={path}
                    onClick={() => setSelectedIdx(i)}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-100"
                  >
                    <img
                      src={toAssetUrl(path)}
                      alt={`장소 이미지 ${i + 1}`}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    {i === 0 && (
                      <span className="absolute left-1.5 top-1.5 rounded bg-[#5F8F7B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        대표
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* 태그 */}
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
              <Tag className="h-4 w-4 text-[#5F8F7B]" /> 태그
            </h2>
            {detail.tagIds.length === 0 ? (
              <p className="text-sm text-gray-400">등록된 태그가 없습니다.</p>
            ) : tagsByCategory.length === 0 ? (
              // tagGroups 로딩 전 fallback
              <div className="flex flex-wrap gap-2">
                {detail.tagIds.map((id) => (
                  <span key={id} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-400">
                    #{id}
                  </span>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {tagsByCategory.map((group) => (
                  <div key={group.categoryName}>
                    <p className="mb-1.5 text-xs font-medium text-gray-400">{group.categoryName}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.tags.map((t) => (
                        <span
                          key={t.id}
                          className="rounded-full border border-[#5F8F7B]/30 bg-[#5F8F7B]/10 px-3 py-1 text-xs font-medium text-[#5F8F7B]"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 휴무일 */}
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
              <CalendarOff className="h-4 w-4 text-[#5F8F7B]" /> 휴무일
            </h2>
            {weeklyClosedDays.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs font-medium text-gray-400">정기 휴무</p>
                <div className="flex flex-wrap gap-1.5">
                  {weeklyClosedDays.map((d) => (
                    <span key={d.id} className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                      {DAY_LABELS[d.dayOfWeek ?? ""] ?? d.dayOfWeek}요일
                    </span>
                  ))}
                </div>
              </div>
            )}
            {holidayClosedDays.length > 0 ? (
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-400">특정 휴무</p>
                <div className="space-y-1.5">
                  {holidayClosedDays.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                      <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">{d.date}</span>
                      <span className="text-gray-600">{d.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : weeklyClosedDays.length === 0 ? (
              <p className="text-sm text-gray-400">등록된 휴무일이 없습니다.</p>
            ) : null}
          </section>
        </div>
      </div>

      {/* 이미지 슬라이더 모달 */}
      {selectedIdx !== null && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedIdx(null)}
        >
          {/* 닫기 */}
          <button
            className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setSelectedIdx(null)}
          >
            <X className="h-5 w-5" />
          </button>

          {/* 이전 */}
          {images.length > 1 && (
            <button
              className="absolute left-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setSelectedIdx((selectedIdx - 1 + images.length) % images.length); }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* 이미지 */}
          <img
            src={toAssetUrl(images[selectedIdx])}
            alt={`장소 이미지 ${selectedIdx + 1}`}
            className="max-h-[85vh] max-w-[80vw] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* 다음 */}
          {images.length > 1 && (
            <button
              className="absolute right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setSelectedIdx((selectedIdx + 1) % images.length); }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* 카운터 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white">
            {selectedIdx + 1} / {images.length}
            {selectedIdx === 0 && (
              <span className="ml-2 rounded bg-[#5F8F7B] px-1.5 py-0.5 text-[10px] font-bold">대표</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
