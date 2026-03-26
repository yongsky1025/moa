import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Users, X } from "lucide-react";
import type { PlaceCardDTO } from "../types/placeTypes";

const API_HOST = "http://localhost:8080";

interface Props {
  places: PlaceCardDTO[];
}

export default function PlaceMapView({ places }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const placesRef = useRef<PlaceCardDTO[]>(places); // 최신 places를 클로저 없이 참조
  const [kakaoReady, setKakaoReady] = useState(false);
  const [selected, setSelected] = useState<PlaceCardDTO | null>(null);
  const [visiblePlaces, setVisiblePlaces] = useState<PlaceCardDTO[]>(places);
  const navigate = useNavigate();

  // placesRef 항상 최신 유지
  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  // Kakao Maps SDK 초기화
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof kakao !== "undefined" && kakao.maps) {
        clearInterval(timer);
        kakao.maps.load(() => setKakaoReady(true));
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // 지도 생성 (한 번만) — bounds_changed 리스너도 여기서만 등록
  useEffect(() => {
    if (!kakaoReady || !mapContainerRef.current || mapRef.current) return;
    mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 8,
    });

    // bounds_changed: placesRef로 항상 최신 places 참조
    kakao.maps.event.addListener(mapRef.current, "bounds_changed", () => {
      if (!mapRef.current) return;
      const bounds = mapRef.current.getBounds();
      setVisiblePlaces(
        placesRef.current.filter((p) =>
          bounds.contain(new kakao.maps.LatLng(p.latitude, p.longitude)),
        ),
      );
    });
  }, [kakaoReady]);

  // places가 바뀔 때 마커만 재렌더링
  useEffect(() => {
    if (!kakaoReady || !mapRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (places.length === 0) {
      setVisiblePlaces([]);
      return;
    }

    const bounds = new kakao.maps.LatLngBounds();

    places.forEach((place) => {
      const position = new kakao.maps.LatLng(place.latitude, place.longitude);
      bounds.extend(position);

      // 커스텀 오버레이 (가격 말풍선 마커)
      const content = document.createElement("div");
      content.innerHTML = `
        <button
          style="
            display:flex;align-items:center;gap:4px;
            background:#5F8F7B;color:#fff;
            border:none;border-radius:9999px;
            padding:5px 10px;font-size:12px;font-weight:700;
            cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.18);
            white-space:nowrap;
          "
        >
          <span style="font-size:10px;opacity:0.85;">₩</span>
          ${place.pricePerHour.toLocaleString()}
        </button>
        <div style="
          width:8px;height:8px;background:#5F8F7B;
          margin:0 auto;clip-path:polygon(0 0,100% 0,50% 100%);
        "></div>
      `;
      content.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
      content.addEventListener("click", () => {
        setSelected(place);
      });

      const overlay = new (kakao.maps as any).CustomOverlay({
        position,
        content,
        yAnchor: 1.2,
      });
      overlay.setMap(mapRef.current);
      markersRef.current.push(overlay);
    });

    // 모든 마커가 보이도록 범위 조정
    if (places.length === 1) {
      mapRef.current.setCenter(
        new kakao.maps.LatLng(places[0].latitude, places[0].longitude),
      );
      mapRef.current.setLevel(5);
    } else {
      mapRef.current.setBounds(bounds);
    }

    // 초기 visiblePlaces 설정
    setVisiblePlaces(places);
  }, [kakaoReady, places]);

  return (
    <div className="relative h-[calc(100vh-280px)] min-h-130 overflow-hidden rounded-2xl border border-gray-200">
      {/* 카카오 지도 */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* 장소 없음 오버레이 */}
      {places.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
          <MapPin className="h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-400">표시할 장소가 없습니다</p>
        </div>
      )}

      {/* 좌측 장소 목록 패널 — z-10으로 지도 위에 표시 */}
      {places.length > 0 && (
        <div className="absolute left-3 top-3 z-10 flex max-h-[calc(100%-24px)] w-60 flex-col gap-1.5 overflow-y-auto rounded-xl bg-white/95 p-2 shadow-lg backdrop-blur-sm">
          <p className="px-2 py-1 text-xs font-semibold text-gray-400">
            현재 화면 내 장소 ({visiblePlaces.length})
          </p>
          {visiblePlaces.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelected(p);
              }}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                selected?.id === p.id
                  ? "bg-[#EAF4F0] text-[#4E7C69]"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              {/* 썸네일 */}
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {p.representativeImagePath ? (
                  <img
                    src={`${API_HOST}${p.representativeImagePath}`}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <MapPin className="h-4 w-4 text-gray-300" />
                  </div>
                )}
              </div>
              {/* 텍스트 */}
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{p.name}</p>
                <p className="text-[11px] font-bold text-[#5F8F7B]">
                  {p.pricePerHour.toLocaleString()}원/h
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 선택된 장소 상세 팝업 */}
      {selected && (
        <div className="absolute bottom-4 right-4 z-10 w-68 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <button
            onClick={() => setSelected(null)}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <X className="h-4 w-4" />
          </button>

          {/* 이미지 */}
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            {selected.representativeImagePath ? (
              <img
                src={`${API_HOST}${selected.representativeImagePath}`}
                alt={selected.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <MapPin className="h-10 w-10 text-gray-300" />
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="p-3.5">
            <h3 className="mb-0.5 text-sm font-bold text-gray-900">{selected.name}</h3>
            <p className="mb-2 flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3 shrink-0" />
              {[selected.city, selected.district, selected.dong].filter(Boolean).join(" ")}
            </p>
            <div className="mb-3 flex items-center gap-3 text-xs">
              <span className="font-bold text-[#5F8F7B]">
                {selected.pricePerHour.toLocaleString()}
                <span className="font-normal text-gray-400">원/시간</span>
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Users className="h-3 w-3" /> {selected.capacity}명
              </span>
              {selected.avgRating > 0 && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                  {selected.avgRating.toFixed(1)}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate(`/place/${selected.id}`)}
              className="w-full rounded-xl bg-[#5F8F7B] py-2 text-sm font-semibold text-white transition hover:bg-[#4E7C69]"
            >
              상세 보기
            </button>
          </div>
        </div>
      )}

      {/* 좌측 하단 — 총 장소 수 뱃지 */}
      <div className="absolute bottom-4 left-3 z-10 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow">
        총 {places.length}개 장소
      </div>
    </div>
  );
}
