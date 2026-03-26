import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import RentalPlaceCard from "./RentalPlaceCard";
import type { PlaceCardDTO } from "../types/placeTypes";

interface Props {
  places: PlaceCardDTO[];
  loading: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="flex flex-col gap-2 p-3.5">
        <div className="h-3 w-2/3 rounded-full bg-gray-200" />
        <div className="h-4 w-4/5 rounded-full bg-gray-200" />
        <div className="my-0.5 border-t border-gray-100" />
        <div className="flex justify-between">
          <div className="h-4 w-1/3 rounded-full bg-gray-200" />
          <div className="h-4 w-1/4 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function PlaceCardGrid({ places = [], loading, hasNext, onLoadMore }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer — sentinel이 보이면 다음 페이지 로드
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, loading, onLoadMore]);

  if (!loading && places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-gray-400">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <MapPin className="h-9 w-9 text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-500">검색 결과가 없습니다</p>
          <p className="mt-1 text-sm">다른 검색어나 필터를 사용해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {places.map((p) => (
          <RentalPlaceCard key={p.id} place={p} />
        ))}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
      </div>

      {/* 무한스크롤 sentinel */}
      <div ref={sentinelRef} className="h-10" />

      {!hasNext && places.length > 0 && (
        <p className="py-6 text-center text-xs text-gray-400">모든 장소를 불러왔습니다</p>
      )}
    </div>
  );
}
