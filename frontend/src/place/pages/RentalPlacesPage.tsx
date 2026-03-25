import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutGrid, Map } from "lucide-react";
import PlaceSearchBar from "../components/PlaceSearchBar";
import PlaceFilterBar from "../components/PlaceFilterBar";
import PlaceCardGrid from "../components/PlaceCardGrid";
import PlaceMapView from "../components/PlaceMapView";
import { fetchPlaces } from "../api/placeRentalApi";
import type { PlaceCardDTO, PlaceListResponse, PlaceSearchParams } from "../types/placeTypes";
import type { TagCategoryGroup } from "../components/PlaceTagFilterDropdown";
import api from "../../users/utils/jwtUtil";

const DEFAULT_SIZE = 20;

const DEFAULT_PARAMS: PlaceSearchParams = {
  sort: "newest",
  size: DEFAULT_SIZE,
};

export default function RentalPlacesPage() {
  const [view, setView] = useState<"list" | "map">("list");
  const [keyword, setKeyword] = useState("");
  const [params, setParams] = useState<PlaceSearchParams>(DEFAULT_PARAMS);
  const [tagGroups, setTagGroups] = useState<TagCategoryGroup[]>([]);

  const [places, setPlaces] = useState<PlaceCardDTO[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastIdRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);

  // 태그 그룹 초기 로드
  useEffect(() => {
    api
      .get<TagCategoryGroup[]>("/api/places/tags/grouped")
      .then((res) => setTagGroups(res.data))
      .catch(() => {});
  }, []);

  // 검색 실행 — 처음부터 다시 로드
  const search = useCallback(
    async (searchParams: PlaceSearchParams, searchKeyword: string) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);
      lastIdRef.current = null;

      try {
        const res: PlaceListResponse = await fetchPlaces({
          ...searchParams,
          keyword: searchKeyword || undefined,
          lastId: undefined,
        });
        setPlaces(res.places);
        setHasNext(res.hasNext);
        lastIdRef.current = res.lastId;
      } catch {
        // 에러 무시 (네트워크 오류 등)
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [],
  );

  // 무한스크롤 — 다음 페이지 로드
  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasNext || lastIdRef.current === null) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const res: PlaceListResponse = await fetchPlaces({
        ...params,
        keyword: keyword || undefined,
        lastId: lastIdRef.current,
      });
      setPlaces((prev) => [...prev, ...res.places]);
      setHasNext(res.hasNext);
      lastIdRef.current = res.lastId;
    } catch {
      // 에러 무시
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [hasNext, params, keyword]);

  // 최초 로드
  useEffect(() => {
    search(DEFAULT_PARAMS, "");
  }, [search]);

  // 필터 변경 → 재검색
  const handleParamsChange = (partial: Partial<PlaceSearchParams>) => {
    const next = { ...params, ...partial, size: DEFAULT_SIZE };
    setParams(next);
    search(next, keyword);
  };

  // 검색 실행
  const handleSearch = () => {
    search(params, keyword);
  };

  // 필터 초기화
  const handleReset = () => {
    setKeyword("");
    setParams(DEFAULT_PARAMS);
    search(DEFAULT_PARAMS, "");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">장소 대여</h1>
        <p className="mt-0.5 text-sm text-gray-400">모임에 딱 맞는 장소를 찾아보세요</p>
      </div>

      {/* 검색바 */}
      <PlaceSearchBar value={keyword} onChange={setKeyword} onSearch={handleSearch} />

      {/* 필터바 */}
      <PlaceFilterBar
        params={params}
        tagGroups={tagGroups}
        onParamsChange={handleParamsChange}
        onReset={handleReset}
      />

      {/* 뷰 전환 + 결과 수 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {!loading && (
            <>
              <span className="font-semibold text-gray-800">{places.length}</span>
              {hasNext ? "개 이상" : "개"} 장소
            </>
          )}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-[#5F8F7B] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            목록
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "map"
                ? "bg-[#5F8F7B] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Map className="h-4 w-4" />
            지도
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      {view === "list" ? (
        <PlaceCardGrid
          places={places}
          loading={loading}
          hasNext={hasNext}
          onLoadMore={loadMore}
        />
      ) : (
        <PlaceMapView places={places} />
      )}
    </div>
  );
}
