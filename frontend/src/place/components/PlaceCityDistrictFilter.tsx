import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

// ── 시/도 → 구/시/군 매핑 ────────────────────────────────────────────────────
export const CITY_DISTRICTS: Record<string, string[]> = {
  서울특별시: [
    "종로구","중구","용산구","성동구","광진구","동대문구","중랑구","성북구",
    "강북구","도봉구","노원구","은평구","서대문구","마포구","양천구","강서구",
    "구로구","금천구","영등포구","동작구","관악구","서초구","강남구","송파구","강동구",
  ],
  부산광역시: [
    "중구","서구","동구","영도구","부산진구","동래구","남구","북구",
    "해운대구","사하구","금정구","강서구","연제구","수영구","사상구","기장군",
  ],
  대구광역시: ["중구","동구","서구","남구","북구","수성구","달서구","달성군"],
  인천광역시: [
    "중구","동구","미추홀구","연수구","남동구","부평구","계양구","서구","강화군","옹진군",
  ],
  광주광역시: ["동구","서구","남구","북구","광산구"],
  대전광역시: ["동구","중구","서구","유성구","대덕구"],
  울산광역시: ["중구","남구","동구","북구","울주군"],
  세종특별자치시: [],
  경기도: [
    "수원시","성남시","의정부시","안양시","부천시","광명시","평택시","동두천시",
    "안산시","고양시","과천시","구리시","남양주시","오산시","시흥시","군포시",
    "의왕시","하남시","용인시","파주시","이천시","안성시","김포시","화성시",
    "광주시","양주시","포천시","여주시","연천군","가평군","양평군",
  ],
  강원도: [
    "춘천시","원주시","강릉시","동해시","태백시","속초시","삼척시",
    "홍천군","횡성군","영월군","평창군","정선군","철원군","화천군","양구군","인제군","고성군","양양군",
  ],
  충청북도: [
    "청주시","충주시","제천시","보은군","옥천군","영동군","증평군","진천군","괴산군","음성군","단양군",
  ],
  충청남도: [
    "천안시","공주시","보령시","아산시","서산시","논산시","계룡시","당진시",
    "금산군","부여군","서천군","청양군","홍성군","예산군","태안군",
  ],
  전라북도: [
    "전주시","군산시","익산시","정읍시","남원시","김제시",
    "완주군","진안군","무주군","장수군","임실군","순창군","고창군","부안군",
  ],
  전라남도: [
    "목포시","여수시","순천시","나주시","광양시","담양군","곡성군","구례군",
    "고흥군","보성군","화순군","장흥군","강진군","해남군","영암군","무안군",
    "함평군","영광군","장성군","완도군","진도군","신안군",
  ],
  경상북도: [
    "포항시","경주시","김천시","안동시","구미시","영주시","영천시","상주시","문경시","경산시",
    "군위군","의성군","청송군","영양군","영덕군","청도군","고령군","성주군","칠곡군","예천군","봉화군","울진군","울릉군",
  ],
  경상남도: [
    "창원시","진주시","통영시","사천시","김해시","밀양시","거제시","양산시",
    "의령군","함안군","창녕군","고성군","남해군","하동군","산청군","함양군","거창군","합천군",
  ],
  제주특별자치도: ["제주시","서귀포시"],
};

const CITIES = Object.keys(CITY_DISTRICTS);

function shortCity(city: string) {
  return city.replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, "").replace(/시$/, "");
}

interface Props {
  city?: string;
  districts?: string[];
  onChange: (city?: string, districts?: string[]) => void;
}

export default function PlaceCityDistrictFilter({ city, districts, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [hoverCity, setHoverCity] = useState<string | undefined>(city);
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 패널 열릴 때 hover를 현재 선택된 city로 초기화
  useEffect(() => {
    if (open) setHoverCity(city);
  }, [open, city]);

  const activeDistricts = districts ?? [];
  const availableDistricts = hoverCity ? CITY_DISTRICTS[hoverCity] ?? [] : [];

  const handleCityClick = (c: string) => {
    setHoverCity(c);
    if (c !== city) {
      // 시/도가 바뀌면 구 선택 초기화
      onChange(c, []);
    }
  };

  const handleDistrictToggle = (d: string) => {
    if (!hoverCity) return;
    // 다른 시/도 선택 상태에서 구를 고를 때 city도 같이 업데이트
    const currentCity = hoverCity;
    const currentDistricts = city === currentCity ? activeDistricts : [];
    const next = currentDistricts.includes(d)
      ? currentDistricts.filter((x) => x !== d)
      : [...currentDistricts, d];
    onChange(currentCity, next);
  };

  const handleReset = () => {
    onChange(undefined, []);
    setHoverCity(undefined);
    setOpen(false);
  };

  // 버튼 레이블
  const isActive = !!city || activeDistricts.length > 0;
  let label = "지역";
  if (city) {
    const short = shortCity(city);
    if (activeDistricts.length === 0) label = short;
    else if (activeDistricts.length === 1) label = `${short} · ${activeDistricts[0]}`;
    else label = `${short} · ${activeDistricts[0]} 외 ${activeDistricts.length - 1}개`;
  }

  return (
    <div ref={ref} className="relative">
      {/* 트리거 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        {label}
        {isActive ? (
          <span
            onMouseDown={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-[#d4ebe2]"
          >
            <X className="h-3 w-3" />
          </span>
        ) : (
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* 드롭다운 패널 */}
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* 왼쪽: 시/도 목록 */}
          <div className="w-36 overflow-y-auto border-r border-gray-100" style={{ maxHeight: 320 }}>
            <button
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                !hoverCity
                  ? "bg-[#EAF4F0] font-semibold text-[#4E7C69]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => { onChange(undefined, []); setHoverCity(undefined); setOpen(false); }}
            >
              전체 지역
            </button>
            {CITIES.map((c) => (
              <button
                key={c}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  hoverCity === c
                    ? "bg-[#EAF4F0] font-semibold text-[#4E7C69]"
                    : city === c
                    ? "font-medium text-[#4E7C69]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleCityClick(c)}
              >
                {shortCity(c)}
                {city === c && activeDistricts.length > 0 && (
                  <span className="ml-1 text-xs text-[#5F8F7B]">({activeDistricts.length})</span>
                )}
              </button>
            ))}
          </div>

          {/* 오른쪽: 구/시/군 체크박스 */}
          <div className="w-56 overflow-y-auto" style={{ maxHeight: 320 }}>
            {!hoverCity ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                시/도를 먼저 선택해주세요
              </p>
            ) : availableDistricts.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                단일 행정구역입니다
              </p>
            ) : (
              <div className="p-3">
                {/* 전체 선택/해제 */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    {shortCity(hoverCity)} 내 선택
                  </span>
                  {city === hoverCity && activeDistricts.length > 0 && (
                    <button
                      onClick={() => onChange(hoverCity, [])}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      전체 해제
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {availableDistricts.map((d) => {
                    const checked = city === hoverCity && activeDistricts.includes(d);
                    return (
                      <label
                        key={d}
                        className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleDistrictToggle(d)}
                          className="h-3.5 w-3.5 rounded accent-[#5F8F7B]"
                        />
                        <span className={checked ? "font-semibold text-[#4E7C69]" : "text-gray-700"}>
                          {d}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
