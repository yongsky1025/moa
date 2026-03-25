import { MapPin, Users, Star, MessageSquare, Heart, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PlaceCardDTO } from "../types/placeTypes";

const API_HOST = "http://localhost:8080";

function formatMinutes(m: number) {
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}시간 ${r}분` : `${h}시간`;
}

interface Props {
  place: PlaceCardDTO;
  minReservationMinutes?: number;
}

export default function RentalPlaceCard({ place, minReservationMinutes }: Props) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const locationLabel = [place.city, place.district, place.dong]
    .filter(Boolean)
    .join(" ");

  const imageSrc = place.representativeImagePath
    ? `${API_HOST}${place.representativeImagePath}`
    : null;

  return (
    <article
      onClick={() => navigate(`/places/${place.id}`)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={place.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin className="h-10 w-10 text-gray-300" />
          </div>
        )}

        {/* 좋아요 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked((v) => !v);
          }}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow transition hover:bg-white"
          aria-label="좋아요"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${liked ? "fill-red-500 stroke-red-500" : "stroke-gray-500"}`}
          />
        </button>

        {/* 평점 배지 */}
        {place.avgRating > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-semibold text-white">
            <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
            {place.avgRating.toFixed(1)}
            {place.reviewCount > 0 && (
              <span className="text-white/70">({place.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {/* 텍스트 영역 */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {/* 위치 */}
        <p className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{locationLabel}</span>
        </p>

        {/* 장소명 */}
        <h3 className="truncate text-sm font-bold text-gray-900 group-hover:text-[#5F8F7B]">
          {place.name}
        </h3>

        {/* 구분선 */}
        <div className="my-0.5 border-t border-gray-100" />

        {/* 가격 + 수용인원 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#5F8F7B]">
              {place.pricePerHour.toLocaleString()}
              <span className="text-xs font-normal text-gray-400">원/시간</span>
            </span>
            {minReservationMinutes != null && (
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                <Clock className="h-2.5 w-2.5" />
                최소 {formatMinutes(minReservationMinutes)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 text-gray-400">
            <Users className="h-3 w-3" />
            <span>{place.capacity}명</span>
          </div>
        </div>
      </div>
    </article>
  );
}
