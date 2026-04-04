import { useState, useEffect } from "react";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import {
  ComposableMap,
  Geographies,
  Geography,
  type Coordinates,
} from "@vnedyalk0v/react19-simple-maps";
import type { CityDistDTO, DistrictDistDTO } from "../../types/adminTypes";
import { fetchPlaceDistrictDist } from "../../api/adminStatsApi";

const GEO_URL =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-topo-simple.json";

// DB 도시명 → TopoJSON name 프로퍼티 매핑
const CITY_TO_GEO: Record<string, string> = {
  서울: "서울특별시",
  부산: "부산광역시",
  대구: "대구광역시",
  인천: "인천광역시",
  광주: "광주광역시",
  대전: "대전광역시",
  울산: "울산광역시",
  세종: "세종특별자치시",
  경기: "경기도",
  강원: "강원도",
  충북: "충청북도",
  충남: "충청남도",
  전북: "전라북도",
  전남: "전라남도",
  경북: "경상북도",
  경남: "경상남도",
  제주: "제주특별자치도",
};

interface Props {
  data: CityDistDTO[];
  loading: boolean;
}

export default function CityDistributionCard({ data, loading }: Props) {
  const [geoData, setGeoData] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [districtData, setDistrictData] = useState<DistrictDistDTO[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);

  // TopoJSON 직접 fetch → GeoJSON 변환
  useEffect(() => {
    fetch(GEO_URL)
      .then((res) => res.json())
      .then((topology: Topology) => {
        const objKey = Object.keys(topology.objects)[0];
        const geoJson = feature(
          topology,
          topology.objects[objKey],
        ) as FeatureCollection<Geometry, GeoJsonProperties>;
        setGeoData(geoJson);
      })
      .catch(() => setGeoData(null));
  }, []);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getColor = (geoName: string) => {
    const found = data.find((d) => CITY_TO_GEO[d.city] === geoName);
    if (!found) return "#E5E7EB";
    const intensity = Math.min(found.percentage / 40, 1); // 40% 이상이면 최대 농도
    const r = Math.round(234 - (234 - 95) * intensity);
    const g = Math.round(244 - (244 - 143) * intensity);
    const b = Math.round(240 - (240 - 123) * intensity);
    return `rgb(${r},${g},${b})`;
  };

  useEffect(() => {
    if (!selectedCity) {
      setDistrictData([]);
      return;
    }
    setDrillLoading(true);
    fetchPlaceDistrictDist(selectedCity)
      .then(setDistrictData)
      .catch(() => setDistrictData([]))
      .finally(() => setDrillLoading(false));
  }, [selectedCity]);

  const handleGeoClick = (geoName: string) => {
    const dbCity = Object.entries(CITY_TO_GEO).find(
      ([, v]) => v === geoName,
    )?.[0];
    if (!dbCity) return;
    setSelectedCity((prev) => (prev === dbCity ? null : dbCity));
  };

  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="admin-card h-full">
      <div className="mb-4 flex items-center justify-between">
        <p className="admin-card-title mb-0">지역별 장소 이용 분포</p>
        <div className="flex flex-col items-end gap-0.5">
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ background: "#EAF4F0", color: "#5F8F7B" }}
          >
            최근 30일 기준
          </span>
          <span className="m-0.5 text-[11px] text-moa-subtle">
            클릭 시 구·군 세부 보기
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-6">
          <div className="skeleton h-80 w-48 shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-8 rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* 전국 지도 */}
          <div className="shrink-0" style={{ width: 210 }}>
            {geoData ? (
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 3200,
                  center: [128, 36.2] as unknown as Coordinates,
                }}
                width={210}
                height={320}
                style={{ outline: "none" }}
              >
                <Geographies geography={geoData}>
                  {({ geographies }) =>
                    geographies.map((geo, idx) => {
                      const geoName: string = geo.properties?.name ?? "";
                      const dbCity =
                        Object.entries(CITY_TO_GEO).find(
                          ([, v]) => v === geoName,
                        )?.[0] ?? "";
                      const isSelected = selectedCity === dbCity;
                      return (
                        <Geography
                          key={geoName || idx}
                          geography={geo}
                          onClick={() => handleGeoClick(geoName)}
                          style={{
                            default: {
                              fill: isSelected ? "#E3886D" : getColor(geoName),
                              stroke: "#fff",
                              strokeWidth: 0.8,
                              outline: "none",
                              cursor: "pointer",
                            },
                            hover: {
                              fill: isSelected ? "#D06C54" : "#A8C5BB",
                              stroke: "#fff",
                              strokeWidth: 0.8,
                              outline: "none",
                              cursor: "pointer",
                            },
                            pressed: { fill: "#D06C54", outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            ) : (
              <div
                className="flex items-center justify-center rounded-xl bg-gray-50 text-xs text-gray-300"
                style={{ width: 210, height: 290 }}
              >
                지도 로딩 중…
              </div>
            )}
            <p className="mt-1 text-center text-[10px] text-moa-subtle">
              진할수록 이용 비중 높음
            </p>
          </div>

          {/* 우측: 수평 막대 or 구·군 드릴다운 */}
          <div className="flex min-w-0 flex-1 flex-col">
            {selectedCity ? (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCity(null)}
                    className="text-[11px] text-moa-subtle hover:text-moa-primary"
                  >
                    ← 전체
                  </button>
                  <span className="text-sm font-bold text-moa-text">
                    {selectedCity} 구·군별
                  </span>
                </div>

                {drillLoading ? (
                  <div className="flex flex-col gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="skeleton h-7 rounded" />
                    ))}
                  </div>
                ) : districtData.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-300">
                    데이터 없음
                  </p>
                ) : (
                  <div
                    className="flex flex-col gap-1.5 overflow-y-auto"
                    style={{ maxHeight: 280 }}
                  >
                    {districtData.map((d) => {
                      const changeColor =
                        d.monthOverMonthChange > 0
                          ? "#10B981"
                          : d.monthOverMonthChange < 0
                            ? "#F43F5E"
                            : "#9CA3AF";
                      const changeArrow =
                        d.monthOverMonthChange > 0
                          ? "▲"
                          : d.monthOverMonthChange < 0
                            ? "▼"
                            : "–";
                      return (
                        <div
                          key={d.district}
                          className="grid grid-cols-[1fr_3.5rem_4rem] items-center gap-2 rounded-lg border border-gray-100 px-2.5 py-1.5"
                        >
                          <span className="truncate text-xs text-moa-secondary">
                            {d.district}
                          </span>
                          <span className="text-right text-xs font-bold text-moa-text">
                            {d.count.toLocaleString("ko-KR")}건
                          </span>
                          <span
                            className="text-right text-[11px] font-semibold"
                            style={{ color: changeColor }}
                          >
                            {changeArrow}{" "}
                            {Math.abs(d.monthOverMonthChange).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-2 grid grid-cols-[4rem_1fr_3.5rem_3rem] items-center gap-2 px-1">
                  <span className="text-[11px] font-semibold text-moa-subtle">
                    지역
                  </span>
                  <span className="text-[11px] font-semibold text-moa-subtle">
                    비중
                  </span>
                  <span className="text-right text-[11px] font-semibold text-moa-subtle">
                    예약수
                  </span>
                  <span className="text-right text-[11px] font-semibold text-moa-subtle">
                    비율
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {sorted.map((d) => {
                    const barPct = Math.round((d.count / maxCount) * 100);
                    return (
                      <button
                        key={d.city}
                        onClick={() => setSelectedCity(d.city)}
                        className="grid grid-cols-[4rem_1fr_3.5rem_3rem] items-center gap-2 rounded-lg border border-gray-100 px-2.5 py-1.5 text-left transition-colors hover:bg-moa-light"
                      >
                        <span className="truncate text-xs font-semibold text-moa-text">
                          {d.city}
                        </span>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${barPct}%`,
                              background: "#5F8F7B",
                            }}
                          />
                        </div>
                        <span className="text-right text-xs font-bold text-moa-text">
                          {d.count.toLocaleString("ko-KR")}
                        </span>
                        <span
                          className="text-right text-xs font-semibold"
                          style={{ color: "#5F8F7B" }}
                        >
                          {d.percentage.toFixed(1)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
