import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutGrid, Map } from "lucide-react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import PlaceSearchBar from "../components/PlaceSearchBar";
import PlaceFilterBar from "../components/PlaceFilterBar";
import PlaceCardGrid from "../components/PlaceCardGrid";
import PlaceMapView from "../components/PlaceMapView";
import PlaceTagSection from "../components/PlaceTagSection";
import { fetchPlaces, fetchTagsGrouped } from "../api/placeRentalApi";
import type { PlaceCardDTO, PlaceListResponse, PlaceSearchParams } from "../types/placeTypes";
import type { TagCategoryGroup } from "../components/PlaceTagFilterDropdown";

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

  const [mapPlaces, setMapPlaces] = useState<PlaceCardDTO[]>([]);
  const [mapLoading, setMapLoading] = useState(false);

  // 태그 그룹 초기 로드
  useEffect(() => {
    fetchTagsGrouped()
      .then((data) => setTagGroups(Array.isArray(data) ? data : []))
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
        setPlaces(res.places ?? []);
        setHasNext(res.hasNext ?? false);
        lastIdRef.current = res.lastId ?? null;
      } catch {
        // 네트워크 오류 등 무시
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [],
  );

  // 지도용 전체 조회 — 페이지네이션 없이 필터 조건에 맞는 전체 로드
  const fetchAllForMap = useCallback(
    async (searchParams: PlaceSearchParams, searchKeyword: string) => {
      setMapLoading(true);
      try {
        const res: PlaceListResponse = await fetchPlaces({
          ...searchParams,
          keyword: searchKeyword || undefined,
          lastId: undefined,
          size: 9999,
        });
        setMapPlaces(res.places ?? []);
      } catch {
        // 네트워크 오류 등 무시
      } finally {
        setMapLoading(false);
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
      setPlaces((prev) => [...prev, ...(res.places ?? [])]);
      setHasNext(res.hasNext);
      lastIdRef.current = res.lastId;
    } catch {
      // 네트워크 오류 등 무시
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [hasNext, params, keyword]);

  // 최초 로드
  useEffect(() => {
    search(DEFAULT_PARAMS, "");
  }, [search]);

  const handleParamsChange = (partial: Partial<PlaceSearchParams>) => {
    const next = { ...params, ...partial, size: DEFAULT_SIZE };
    setParams(next);
    search(next, keyword);
    if (view === "map") fetchAllForMap(next, keyword);
  };

  const handleSearch = () => {
    search(params, keyword);
    if (view === "map") fetchAllForMap(params, keyword);
  };

  const handleReset = () => {
    setKeyword("");
    setParams(DEFAULT_PARAMS);
    search(DEFAULT_PARAMS, "");
    if (view === "map") fetchAllForMap(DEFAULT_PARAMS, "");
  };

  const handleViewChange = (next: "list" | "map") => {
    setView(next);
    if (next === "map") fetchAllForMap(params, keyword);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />

      {/* 헤더 */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #f0f0f0", padding: "32px 0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111", letterSpacing: -0.5, marginBottom: 4 }}>
            장소 대여
          </h1>
          <p style={{ fontSize: 14, color: "#888" }}>모임에 딱 맞는 장소를 찾아보세요</p>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 60px" }}>
        {/* 검색바 */}
        <div style={{ marginBottom: 12 }}>
          <PlaceSearchBar value={keyword} onChange={setKeyword} onSearch={handleSearch} />
        </div>

        {/* 필터 영역 래퍼 */}
        <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* 기본 필터 및 정렬 */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6, letterSpacing: 0.2 }}>
              기본 필터 및 정렬
            </p>
            <PlaceFilterBar
              params={params}
              tagGroups={tagGroups}
              onParamsChange={handleParamsChange}
              onReset={handleReset}
            />
          </div>

          {/* 태그별 필터 */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6, letterSpacing: 0.2 }}>
              태그별 필터
            </p>
            <PlaceTagSection
              tagGroups={tagGroups}
              selectedTagIds={params.tagIds ?? []}
              onChange={(ids) => handleParamsChange({ tagIds: ids })}
            />
          </div>
        </div>

        {/* 뷰 전환 + 결과 수 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: "#888" }}>
            {!loading && (
              <>
                <strong style={{ color: "#111" }}>{places.length}</strong>
                {hasNext ? "개 이상" : "개"} 장소
              </>
            )}
          </p>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            borderRadius: 10, border: "1px solid #e5e5e5", backgroundColor: "white",
            padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            <button
              onClick={() => handleViewChange("list")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 500,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                backgroundColor: view === "list" ? "#5F8F7B" : "transparent",
                color: view === "list" ? "white" : "#888",
              }}
            >
              <LayoutGrid style={{ width: 15, height: 15 }} />
              목록
            </button>
            <button
              onClick={() => handleViewChange("map")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 500,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                backgroundColor: view === "map" ? "#5F8F7B" : "transparent",
                color: view === "map" ? "white" : "#888",
              }}
            >
              <Map style={{ width: 15, height: 15 }} />
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
        ) : mapLoading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#888" }}>지도 데이터를 불러오는 중...</div>
        ) : (
          <PlaceMapView places={mapPlaces} />
        )}
      </div>

      <Footer />
    </div>
  );
}
