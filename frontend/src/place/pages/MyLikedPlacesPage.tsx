import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Star,
  Users,
  Loader2,
  Inbox,
  Tag,
} from "lucide-react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import { fetchMyLikedPlaces, togglePlaceLike } from "../api/placeRentalApi";
import type { MyLikedPlaceDTO } from "../types/placeTypes";

export default function MyLikedPlacesPage() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<MyLikedPlaceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unliking, setUnliking] = useState<number | null>(null);

  useEffect(() => {
    fetchMyLikedPlaces()
      .then(setPlaces)
      .catch(() => setError("찜한 장소 목록을 불러오는 중 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const handleUnlike = async (placeId: number) => {
    setUnliking(placeId);
    try {
      await togglePlaceLike(placeId);
      setPlaces((prev) => prev.filter((p) => p.placeId !== placeId));
    } finally {
      setUnliking(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <button
          onClick={() => navigate("/users/profile")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "#888",
            marginBottom: 6,
            padding: 0,
          }}
        >
          ← 마이페이지로 돌아가기
        </button>
        <h1 className="mb-8 text-2xl font-extrabold text-gray-900">
          찜한 장소
        </h1>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-moa-primary" />
          </div>
        ) : error ? (
          <p className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </p>
        ) : places.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <Inbox className="h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              찜한 장소가 없습니다.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              마음에 드는 장소에 하트를 눌러보세요.
            </p>
            <button
              type="button"
              onClick={() => navigate("/place/rental")}
              className="mt-5 rounded-xl bg-moa-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-moa-hover"
            >
              장소 둘러보기
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-400">{places.length}개의 장소</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {places.map((p) => (
                <LikedPlaceCard
                  key={p.placeId}
                  place={p}
                  unliking={unliking === p.placeId}
                  onUnlike={() => handleUnlike(p.placeId)}
                  onClick={() => navigate(`/place/${p.placeId}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

function LikedPlaceCard({
  place,
  unliking,
  onUnlike,
  onClick,
}: {
  place: MyLikedPlaceDTO;
  unliking: boolean;
  onUnlike: () => void;
  onClick: () => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* 이미지 */}
      <div
        className="relative h-44 cursor-pointer overflow-hidden bg-gray-100"
        onClick={onClick}
      >
        {place.thumbnailUrl ? (
          <img
            src={place.thumbnailUrl}
            alt={place.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin className="h-10 w-10 text-gray-300" />
          </div>
        )}

        {/* 찜 해제 버튼 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnlike();
          }}
          disabled={unliking}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white disabled:opacity-50"
          title="찜 해제"
        >
          <Heart
            className={`h-4 w-4 transition ${unliking ? "text-gray-300" : "fill-red-500 text-red-500"}`}
          />
        </button>
      </div>

      {/* 내용 */}
      <div className="p-4">
        <button
          type="button"
          onClick={onClick}
          className="text-left text-base font-bold text-moa-text hover:underline"
        >
          {place.name}
        </button>

        <div className="mt-1 flex items-center gap-1 text-sm text-moa-subtle">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>
            {place.city} {place.district}
          </span>
        </div>

        {/* 통계 행 */}
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{place.avgRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({place.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="h-3.5 w-3.5" />
            <span>최대 {place.capacity}명</span>
          </div>
        </div>

        {/* 태그 */}
        {place.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-0.5 rounded-full bg-moa-light px-2.5 py-0.5 text-xs font-medium text-moa-primary"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 가격 */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-400">시간당</span>
          <span className="font-bold text-moa-primary">
            {place.pricePerHour.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  );
}
