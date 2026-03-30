import { useEffect, useRef, useState } from "react";
import { Search, MapPin, X } from "lucide-react";

export interface SelectedAddress {
  address: string;
  city: string;
  district: string;
  dong: string;
  latitude: number;
  longitude: number;
}

interface Props {
  value: SelectedAddress | null;
  onChange: (addr: SelectedAddress | null) => void;
}

export default function PlaceKakaoMapSearch({ value, onChange }: Props) {
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<
    kakao.maps.services.PlaceItem[]
  >([]);
  const [kakaoReady, setKakaoReady] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

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

  // 맵 초기화 및 클릭 리스너
  useEffect(() => {
    if (!kakaoReady || !mapContainerRef.current || mapRef.current) return;
    mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 5,
    });

    const handler = (mouseEvent: {
      latLng: { getLat: () => number; getLng: () => number };
    }) => {
      const lat = mouseEvent.latLng.getLat();
      const lng = mouseEvent.latLng.getLng();
      const geocoder = new (
        kakao.maps.services as unknown as {
          Geocoder: new () => {
            coord2Address: (
              lng: number,
              lat: number,
              cb: (
                result: {
                  address: {
                    address_name: string;
                    region_1depth_name: string;
                    region_2depth_name: string;
                    region_3depth_name: string;
                  };
                }[],
                status: string,
              ) => void,
            ) => void;
          };
        }
      ).Geocoder();
      geocoder.coord2Address(lng, lat, (result, status) => {
        if (
          status ===
            (kakao.maps.services as unknown as { Status: { OK: string } })
              .Status.OK &&
          result?.[0]?.address
        ) {
          const addr = result[0].address;
          const addressName = addr.address_name;
          const city = addr.region_1depth_name || "";
          const district = addr.region_2depth_name || "";
          const dong = addr.region_3depth_name || "";
          onChangeRef.current({
            address: addressName,
            city,
            district,
            dong,
            latitude: lat,
            longitude: lng,
          });
        }
      });
    };
    kakao.maps.event.addListener(
      mapRef.current,
      "click",
      handler as unknown as () => void,
    );
    return () => {
      if (
        mapRef.current &&
        (
          kakao.maps.event as unknown as {
            removeListener?: (
              target: unknown,
              type: string,
              handler: () => void,
            ) => void;
          }
        ).removeListener
      ) {
        (
          kakao.maps.event as unknown as {
            removeListener: (
              target: unknown,
              type: string,
              handler: () => void,
            ) => void;
          }
        ).removeListener(
          mapRef.current,
          "click",
          handler as unknown as () => void,
        );
      }
    };
  }, [kakaoReady]);

  // value가 외부에서 세팅된 경우 마커 표시
  useEffect(() => {
    if (!kakaoReady || !mapRef.current || !value) return;
    if (markerRef.current) markerRef.current.setMap(null);

    const position = new kakao.maps.LatLng(value.latitude, value.longitude);
    const marker = new kakao.maps.Marker({ map: mapRef.current, position });
    markerRef.current = marker;
    mapRef.current.setCenter(position);
    mapRef.current.setLevel(3);
  }, [kakaoReady, value]);

  const parseCityDistrictDong = (addr: string) => {
    const parts = addr.split(" ");
    return {
      city: parts[0] || "",
      district: parts[1] || "",
      dong: parts[2] || "",
    };
  };

  const handleSearch = () => {
    if (!kakaoReady || !placeQuery.trim() || !mapRef.current) return;
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(placeQuery, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setPlaceResults(result.slice(0, 5));
      } else {
        setPlaceResults([]);
      }
    });
  };

  const handleSelect = (place: kakao.maps.services.PlaceItem) => {
    const lat = Number(place.y);
    const lng = Number(place.x);
    const addr = place.road_address_name || place.address_name;
    const { city, district, dong } = parseCityDistrictDong(addr);

    onChange({
      address: addr,
      city,
      district,
      dong,
      latitude: lat,
      longitude: lng,
    });
    setPlaceResults([]);
    setPlaceQuery("");
  };

  const handleClear = () => {
    onChange(null);
    setPlaceQuery("");
    setPlaceResults([]);
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
        <MapPin className="h-4 w-4" /> 위치 설정
      </h2>

      {value ? (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-[#EAF4F0] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#4E7C69]">
              {value.address}
            </p>
            <p className="text-xs text-gray-500">
              {value.city} {value.district} {value.dong} · 위도{" "}
              {value.latitude.toFixed(4)}, 경도 {value.longitude.toFixed(4)}
            </p>
          </div>
          <button
            onClick={handleClear}
            className="rounded-full p-1 transition hover:bg-[#d4ebe2]"
          >
            <X className="h-4 w-4 text-[#4E7C69]" />
          </button>
        </div>
      ) : (
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="주소 또는 장소명 검색"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#5F8F7B] focus:ring-1 focus:ring-[#5F8F7B]"
            />
          </div>
          <button
            onClick={handleSearch}
            className="cursor-pointer rounded-lg bg-[#5F8F7B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#4E7C69]"
          >
            검색
          </button>
        </div>
      )}

      {placeResults.length > 0 && (
        <div className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-gray-200">
          {placeResults.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSelect(p)}
              className="flex w-full cursor-pointer flex-col border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#EAF4F0]"
            >
              <span className="text-sm font-medium text-gray-800">
                {p.place_name}
              </span>
              <span className="text-xs text-gray-500">
                {p.road_address_name || p.address_name}
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="h-72 w-full overflow-hidden rounded-lg border border-gray-200"
      />
      <p className="mt-2 text-xs text-gray-500">
        지도에서 위치를 클릭해도 선택할 수 있습니다.
      </p>
    </section>
  );
}
