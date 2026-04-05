import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  ChevronRight,
  MapPin,
  Sparkles,
  Users,
  X,
  ZoomIn,
} from "lucide-react";
import { placeApi, type PlaceRecommendResponse } from "../../api/placeApi";
import { toAssetUrl } from "../../common/utils/assetUrl";

// ── 타입 ──────────────────────────────────────────────────────────────────────

export interface ScheduleContextForRecommend {
  scheduleId: number;
  circleId: number;
  title: string;
  description: string;
  tags: { id: number; name: string }[];
  latitude?: number;
  longitude?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  schedule: ScheduleContextForRecommend;
}

// ── 내부 타입 ─────────────────────────────────────────────────────────────────

type Phase = "nudge" | "loading" | "results" | "empty";

// ── 유사도 배지 ───────────────────────────────────────────────────────────────

function similarityBadge(score: number): { text: string; className: string } {
  if (score >= 0.65)
    return { text: "매우 적합", className: "bg-moa-primary text-white" };
  if (score >= 0.45)
    return { text: "적합", className: "bg-moa-light text-moa-secondary" };
  return { text: "참고", className: "bg-gray-100 text-gray-500" };
}

// ── 스켈레톤 카드 ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-xl border border-gray-100 bg-white p-4">
      <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 rounded-full bg-gray-200" />
        <div className="h-3 w-2/3 rounded-full bg-gray-200" />
        <div className="flex gap-1">
          <div className="h-4 w-12 rounded-full bg-gray-200" />
          <div className="h-4 w-12 rounded-full bg-gray-200" />
        </div>
      </div>
      <div className="h-8 w-16 shrink-0 rounded-lg bg-gray-200" />
    </div>
  );
}

// ── 이미지 라이트박스 ─────────────────────────────────────────────────────────

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

function Lightbox({ src, alt, onClose }: LightboxProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
        aria-label="닫기"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ── 추천 장소 카드 ────────────────────────────────────────────────────────────

interface RecommendCardProps {
  place: PlaceRecommendResponse;
  onClick: () => void;
}

function RecommendCard({ place, onClick }: RecommendCardProps) {
  const badge = similarityBadge(place.score);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const imageSrc = place.representativeImagePath ? toAssetUrl(place.representativeImagePath) : null;

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭(navigate)으로 이벤트 전파 차단
    setLightboxOpen(true);
  };

  return (
    <>
      <button
        onClick={onClick}
        className="group flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-moa-primary/40 hover:shadow-md"
      >
        {/* 썸네일 — 이미지 있으면 사진, 없으면 아이콘 (동일 크기 유지) */}
        <div className="relative h-10 w-10 shrink-0">
          {imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt={place.name}
                className="h-10 w-10 rounded-lg object-cover"
                loading="lazy"
              />
              <button
                onClick={handleImageClick}
                className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition hover:bg-black/30"
                aria-label="이미지 확대"
              >
                <ZoomIn className="h-4 w-4 text-white opacity-0 transition group-hover:opacity-100" />
              </button>
            </>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-moa-light">
              <MapPin className="h-5 w-5 text-moa-primary" />
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-gray-900 group-hover:text-moa-primary">
              {place.name}
            </span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
            >
              {badge.text}
            </span>
          </div>

          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3 w-3 shrink-0" />
            {place.city} {place.district}
            {place.distanceKm != null && (
              <span className="ml-1 text-moa-muted">
                · {place.distanceKm.toFixed(1)}km
              </span>
            )}
          </p>

          {place.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {place.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-moa-light px-2 py-0.5 text-[11px] text-moa-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 가격 + 인원 */}
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-moa-primary">
            {place.pricePerHour.toLocaleString()}
            <span className="text-xs font-normal text-gray-400">원/h</span>
          </p>
          <p className="mt-0.5 flex items-center justify-end gap-0.5 text-xs text-gray-400">
            <Users className="h-3 w-3" />
            {place.capacity}명
          </p>
          <ChevronRight className="ml-auto mt-1 h-4 w-4 text-gray-300 transition-colors group-hover:text-moa-primary" />
        </div>
      </button>

      {/* 라이트박스 */}
      {lightboxOpen && imageSrc && (
        <Lightbox
          src={imageSrc}
          alt={place.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

// ── 메인 모달 ─────────────────────────────────────────────────────────────────

export default function PlaceRecommendModal({ open, onClose, schedule }: Props) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("nudge");
  const [places, setPlaces] = useState<PlaceRecommendResponse[]>([]);

  // 모달이 열릴 때마다 nudge로 초기화
  useEffect(() => {
    if (open) {
      setPhase("nudge");
      setPlaces([]);
    }
  }, [open]);

  if (!open) return null;

  // "네, 추천 받기" 클릭 → loading으로 전환 후 API 호출
  const handleConfirm = async () => {
    setPhase("loading");
    try {
      const tagNames = schedule.tags.map((t) => t.name);
      const res = await placeApi.recommendPlaces(
        schedule.title,
        schedule.description,
        tagNames,
        schedule.latitude,
        schedule.longitude,
        5,
      );
      if (res.data.length === 0) {
        setPhase("empty");
      } else {
        setPlaces(res.data);
        setPhase("results");
      }
    } catch {
      setPhase("empty");
    }
  };

  // 장소 카드 클릭 → 상세 페이지로 이동 (scheduleId 전달 → 예약 패널에서 일정 자동 선택 + 날짜 세팅)
  const handlePlaceClick = (placeId: number) => {
    onClose();
    navigate(`/place/${placeId}`, {
      state: {
        scheduleId: schedule.scheduleId,
        circleId: schedule.circleId,
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 — 모든 phase에 노출 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ── Phase: nudge ──────────────────────────────────────── */}
        {phase === "nudge" && (
          <div className="flex flex-col items-center gap-6 px-8 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moa-light">
              <Sparkles className="h-8 w-8 text-moa-primary" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-moa-text">
                일정과 어울리는 장소를 모아가 마련했습니다
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-moa-subtle">
                <span className="font-semibold text-moa-primary">
                  '{schedule.title}'
                </span>
                에 맞는 장소를 AI가 추천해드릴게요.
                <br />
                모아 장소 대여 서비스를 이용하시겠습니까?
              </p>
            </div>

            <div className="flex w-full gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-moa-border py-3 text-sm font-medium text-moa-subtle transition hover:bg-gray-50"
              >
                다음에 이용할게요
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-moa-primary py-3 text-sm font-semibold text-white transition hover:bg-moa-hover"
              >
                네, 추천 받기
              </button>
            </div>
          </div>
        )}

        {/* ── Phase: loading ────────────────────────────────────── */}
        {phase === "loading" && (
          <div className="flex flex-col gap-4 px-6 py-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-moa-secondary">
              <Bot className="h-5 w-5 animate-pulse text-moa-primary" />
              AI가 일정에 맞는 장소를 찾고 있습니다...
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Phase: results ────────────────────────────────────── */}
        {phase === "results" && (
          <div className="flex flex-col">
            <div className="border-b border-moa-border px-6 py-4 pr-12">
              <h2 className="text-base font-bold text-moa-text">
                '{schedule.title}'과 어울리는 장소
              </h2>
              <p className="mt-0.5 text-xs text-moa-subtle">
                클릭하면 장소 상세 페이지로 이동합니다
              </p>
            </div>

            <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto px-6 py-4">
              {places.map((place) => (
                <RecommendCard
                  key={place.id}
                  place={place}
                  onClick={() => handlePlaceClick(place.id)}
                />
              ))}
            </div>

            <div className="border-t border-moa-border px-6 py-3 text-right">
              <button
                onClick={onClose}
                className="text-sm text-moa-subtle transition hover:text-moa-text"
              >
                다음에 이용할게요
              </button>
            </div>
          </div>
        )}

        {/* ── Phase: empty ──────────────────────────────────────── */}
        {phase === "empty" && (
          <div className="flex flex-col items-center gap-5 px-8 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <MapPin className="h-7 w-7 text-gray-400" />
            </div>

            <div>
              <p className="text-base font-semibold text-moa-text">
                AI 기반 장소 추천에 알맞는 장소가 없습니다
              </p>
              <p className="mt-2 text-sm text-moa-subtle">
                직접 장소를 둘러보시겠습니까?
              </p>
            </div>

            <div className="flex w-full gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-moa-border py-3 text-sm font-medium text-moa-subtle transition hover:bg-gray-50"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate("/place/rental");
                }}
                className="flex-1 rounded-xl bg-moa-primary py-3 text-sm font-semibold text-white transition hover:bg-moa-hover"
              >
                장소 둘러보기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
