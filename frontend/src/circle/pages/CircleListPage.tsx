import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Users, Sparkles, Search, X, RotateCcw, ChevronDown } from "lucide-react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import { circleApi } from "../../api/circleApi";
import type { CircleResponse, RecommendationBundle, RecommendationItem } from "../types/circle";

const CATEGORY_COLORS: Record<string, string> = {
  자기계발: "linear-gradient(135deg, #5f8f7b 0%, #3d5f52 100%)",
  "푸드·드링크": "linear-gradient(135deg, #e3886d 0%, #c8674e 100%)",
  액티비티: "linear-gradient(135deg, #4e7c69 0%, #a9c8bb 100%)",
  "문화·예술": "linear-gradient(135deg, #a9c8bb 0%, #5f8f7b 100%)",
  대화: "linear-gradient(135deg, #e3886d 0%, #a9c8bb 100%)",
  운동: "linear-gradient(135deg, #3d5f52 0%, #5f8f7b 100%)",
  재테크: "linear-gradient(135deg, #5f8f7b 0%, #eaf4f0 100%)",
  취미: "linear-gradient(135deg, #e3886d 0%, #fdf1ec 100%)",
};
const DEFAULT_GRADIENT = "linear-gradient(135deg, #a9c8bb 0%, #eaf4f0 100%)";

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  OPEN: { text: "모집중", color: "#16a34a" },
  FULL: { text: "정원마감", color: "#dc2626" },
  PENDING: { text: "승인대기", color: "#d97706" },
  REJECTED: { text: "거절됨", color: "#6b7280" },
  CLOSED: { text: "종료됨", color: "#6b7280" },
};

const PAGE_SIZE = 12;

export default function CircleListPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  const [circles, setCircles] = useState<CircleResponse[]>([]);
  const [categories, setCategories] = useState<{ categoryId: number; categoryName: string }[]>([]);
  const [recommendBundle, setRecommendBundle] = useState<RecommendationBundle | null>(null);
  const [recommendFilter, setRecommendFilter] = useState<"overall" | "social" | "activity" | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [keyword, setKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumList, setPageNumList] = useState<number[]>([]);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [prevPage, setPrevPage] = useState(0);
  const [nextPage, setNextPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusType, setStatusType] = useState<"ALL" | "OPEN" | "FULL">("ALL");
  const [searchFocused, setSearchFocused] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [recOpen, setRecOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    circleApi.getCategories().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
      if (recRef.current && !recRef.current.contains(e.target as Node)) setRecOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    circleApi
      .getRecommendationBundle()
      .then((res) => setRecommendBundle(res.data))
      .catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    if (recommendFilter !== null) return; // 추천 필터 중엔 페이지네이션 스킵
    const fetchCircles = async () => {
      setLoading(true);
      try {
        const res = await circleApi.getCircles({
          ...(selectedCategoryIds.length > 0 ? { categoryIds: selectedCategoryIds } : {}),
          ...(keyword ? { keyword } : {}),
          ...(statusType !== "ALL" ? { type: statusType } : {}),
          page,
          size: PAGE_SIZE,
        });
        const data = res.data;
        setCircles(data.dtoList);
        setTotalCount(data.totalCount);
        setPageNumList(data.pageNumList);
        setHasPrev(data.prev);
        setHasNext(data.next);
        setPrevPage(data.prevPage);
        setNextPage(data.nextPage);
      } finally {
        setLoading(false);
      }
    };
    fetchCircles();
  }, [selectedCategoryIds, keyword, page, statusType, recommendFilter]);

  const handleCategoryClick = (categoryId: number | null) => {
    if (categoryId === null) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]));
    }
    setPage(1);
  };

  const handleSearch = () => {
    setKeyword(inputValue);
    setPage(1);
  };

  const handleReset = () => {
    setStatusType("ALL");
    setSelectedCategoryIds([]);
    setRecommendFilter(null);
    setKeyword("");
    setInputValue("");
    setPage(1);
  };

  const hasActiveFilter = statusType !== "ALL" || selectedCategoryIds.length > 0 || recommendFilter !== null || !!keyword;

  const statusLabel = { ALL: "전체", OPEN: "모집중", FULL: "모집완료" }[statusType];
  const recLabel = recommendFilter
    ? { overall: "추천 · 전체", social: "추천 · 사교", activity: "추천 · 활동" }[recommendFilter]
    : "추천";
  const recDisabled = !isLoggedIn || !recommendBundle;

  const isRecFiltered = recommendFilter !== null && !!recommendBundle;
  const selectedCategoryNames = new Set(categories.filter((c) => selectedCategoryIds.includes(c.categoryId)).map((c) => c.categoryName));
  const recItems: RecommendationItem[] = isRecFiltered
    ? (recommendBundle![recommendFilter as "overall" | "social" | "activity"] as RecommendationItem[]).filter(
        (c) => selectedCategoryNames.size === 0 || selectedCategoryNames.has(c.categoryName),
      )
    : [];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white", color: "#111" }}>
      <Navbar />

      {/* 헤더 */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #f0f0f0", padding: "32px 0 24px" }}>
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111", letterSpacing: -0.5, marginBottom: 4 }}>모임 찾기</h1>
            <p style={{ fontSize: 14, color: "#888" }}>취향 맞는 사람들과 특별한 경험을 함께하세요</p>
          </div>
          {isLoggedIn && (
            <button
              onClick={() => navigate("/circle/create")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#5f8f7b",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 4,
              }}
            >
              + 모임 만들기
            </button>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 60px" }}>
        <main>
          {/* 검색바 */}
          <div
            className={`mb-3 flex items-center gap-3 rounded-full border-2 bg-white px-5 py-3.5 shadow-sm transition-all duration-200 ${
              searchFocused ? "border-[#5F8F7B] shadow-md shadow-[#5F8F7B]/10" : "border-gray-200"
            }`}
          >
            <Search className={`h-5 w-5 shrink-0 transition-colors ${searchFocused ? "text-[#5F8F7B]" : "text-gray-400"}`} />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="모임명, 카테고리로 검색해보세요"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            {inputValue && (
              <button
                onClick={() => { setInputValue(""); setKeyword(""); setPage(1); }}
                className="rounded-full p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="rounded-full bg-[#5F8F7B] px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#4E7C69] active:scale-95"
            >
              검색
            </button>
          </div>

          {/* 필터 박스 */}
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            {/* 카테고리 행 */}
            <div className="flex flex-wrap gap-2">
              {[{ categoryId: null as null, categoryName: "전체" }, ...categories].map((cat) => {
                const active = cat.categoryId === null ? selectedCategoryIds.length === 0 : selectedCategoryIds.includes(cat.categoryId);
                return (
                  <button
                    key={cat.categoryId ?? "all"}
                    onClick={() => handleCategoryClick(cat.categoryId)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {cat.categoryName}
                  </button>
                );
              })}
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-100" />

            {/* 드롭다운 행 */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 모집 상태 드롭다운 */}
              <div ref={statusRef} className="relative">
                <button
                  onClick={() => setStatusOpen((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    statusType !== "ALL"
                      ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {statusLabel}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${statusOpen ? "rotate-180" : ""}`} />
                </button>
                {statusOpen && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    {(["ALL", "OPEN", "FULL"] as const).map((val) => (
                      <button
                        key={val}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          statusType === val ? "bg-[#EAF4F0] font-semibold text-[#4E7C69]" : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => { setStatusType(val); setPage(1); setStatusOpen(false); }}
                      >
                        {{ ALL: "전체", OPEN: "모집중", FULL: "모집완료" }[val]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 추천 드롭다운 */}
              <div ref={recRef} className="relative">
                <button
                  disabled={recDisabled}
                  title={recDisabled ? (isLoggedIn ? "에너지 프로필이 필요합니다" : "로그인이 필요합니다") : undefined}
                  onClick={() => !recDisabled && setRecOpen((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    recommendFilter !== null
                      ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
                      : recDisabled
                      ? "cursor-not-allowed border-gray-100 bg-white text-gray-300"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  {recLabel}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${recOpen ? "rotate-180" : ""}`} />
                </button>
                {recOpen && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    {([
                      { key: null, label: "없음" },
                      { key: "overall", label: "전체" },
                      { key: "social", label: "사교" },
                      { key: "activity", label: "활동" },
                    ] as { key: "overall" | "social" | "activity" | null; label: string }[]).map(({ key, label }) => (
                      <button
                        key={key ?? "none"}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          recommendFilter === key ? "bg-[#EAF4F0] font-semibold text-[#4E7C69]" : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => { setRecommendFilter(key); setPage(1); setRecOpen(false); }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 초기화 */}
              {hasActiveFilter && (
                <button
                  onClick={handleReset}
                  className="ml-auto flex items-center gap-1 text-sm text-gray-400 transition hover:text-gray-600"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  초기화
                </button>
              )}
            </div>
          </div>

          {isRecFiltered ? (
            /* 추천 필터 활성 */
            <>
              <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>
                <strong style={{ color: "#5f8f7b" }}>
                  {recommendFilter === "overall" ? "5축 전체" : recommendFilter === "social" ? "사교 성향" : "활동 스타일"}
                </strong>{" "}
                기반 추천 모임 {recItems.length > 0 && <strong style={{ color: "#111" }}>{recItems.length}개</strong>}
              </p>
              {recItems.length === 0 ? (
                <p style={{ textAlign: "center", color: "#aaa", padding: "60px 0" }}>추천 모임이 없습니다.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                  {recItems.map((c) => {
                    const statusInfo = STATUS_LABEL[c.status] ?? { text: String(c.status), color: "#888" };
                    const bgGradient = CATEGORY_COLORS[c.categoryName] ?? DEFAULT_GRADIENT;
                    return (
                      <div
                        key={c.circleId}
                        onClick={() => navigate(`/circle/${c.circleId}`)}
                        style={{
                          backgroundColor: "white",
                          borderRadius: 16,
                          overflow: "hidden",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          cursor: "pointer",
                          transition: "box-shadow 0.2s, transform 0.2s",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <div style={{ position: "relative", height: 160, background: c.coverImageUrl ? "none" : bgGradient, flexShrink: 0 }}>
                          {c.coverImageUrl && (
                            <img src={c.coverImageUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          )}
                          <div
                            style={{
                              position: "absolute",
                              top: 10,
                              left: 10,
                              padding: "3px 8px",
                              borderRadius: 999,
                              backgroundColor: "rgba(0,0,0,0.55)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "white",
                            }}
                          >
                            {c.categoryName}
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              padding: "3px 8px",
                              borderRadius: 999,
                              backgroundColor: "rgba(255,255,255,0.92)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: statusInfo.color,
                            }}
                          >
                            {statusInfo.text}
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              bottom: 8,
                              right: 10,
                              padding: "2px 7px",
                              borderRadius: 999,
                              backgroundColor: "rgba(95,143,123,0.9)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "white",
                            }}
                          >
                            {Math.round(c.similarity * 100)}% 일치
                          </div>
                        </div>
                        <div style={{ padding: "12px 14px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                          <h3
                            style={{
                              margin: "0 0 4px",
                              fontSize: 14,
                              fontWeight: 800,
                              lineHeight: 1.4,
                              color: "#1f2937",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {c.name}
                          </h3>
                          <p
                            style={{
                              margin: "0 0 10px",
                              fontSize: 12,
                              color: "#6b7280",
                              lineHeight: 1.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              flex: 1,
                            }}
                          >
                            {c.description || "소개글이 없습니다."}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280" }}>
                            <Users style={{ width: 12, height: 12 }} />
                            {c.currentMember}/{c.maxMember}명
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : loading ? (
            <p style={{ textAlign: "center", color: "#888", padding: "60px 0" }}>로딩 중...</p>
          ) : (
            <>
              <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>
                총 <strong style={{ color: "#111" }}>{totalCount}</strong>개의 모임
              </p>

              {circles.length === 0 ? (
                <p style={{ textAlign: "center", color: "#aaa", padding: "60px 0" }}>모임이 없습니다.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                  {circles.map((circle) => {
                    const statusInfo = STATUS_LABEL[circle.status] ?? { text: circle.status, color: "#888" };
                    const bgGradient = CATEGORY_COLORS[circle.categoryName] ?? DEFAULT_GRADIENT;

                    return (
                      <div
                        key={circle.circleId}
                        onClick={() => navigate(`/circle/${circle.circleId}`)}
                        style={{
                          backgroundColor: "white",
                          borderRadius: 16,
                          overflow: "hidden",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          cursor: "pointer",
                          transition: "box-shadow 0.2s, transform 0.2s",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {/* 이미지 영역 */}
                        <div style={{ position: "relative", height: 160, background: circle.coverImageUrl ? "none" : bgGradient, flexShrink: 0 }}>
                          {circle.coverImageUrl ? (
                            <img
                              src={circle.coverImageUrl}
                              alt={circle.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                          ) : null}
                          <div
                            style={{
                              position: "absolute",
                              top: 10,
                              left: 10,
                              padding: "3px 8px",
                              borderRadius: 999,
                              backgroundColor: "rgba(0,0,0,0.55)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "white",
                            }}
                          >
                            {circle.categoryName}
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              padding: "3px 8px",
                              borderRadius: 999,
                              backgroundColor: "rgba(255,255,255,0.92)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: statusInfo.color,
                            }}
                          >
                            {statusInfo.text}
                          </div>
                        </div>

                        {/* 정보 영역 */}
                        <div style={{ padding: "12px 14px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                          <h3
                            style={{
                              margin: "0 0 4px",
                              fontSize: 14,
                              fontWeight: 800,
                              lineHeight: 1.4,
                              color: "#1f2937",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {circle.name}
                          </h3>
                          <p
                            style={{
                              margin: "0 0 10px",
                              fontSize: 12,
                              color: "#6b7280",
                              lineHeight: 1.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              flex: 1,
                            }}
                          >
                            {circle.description || "소개글이 없습니다."}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280" }}>
                              <Users style={{ width: 12, height: 12 }} />
                              {circle.currentMember}/{circle.maxMember}명
                            </div>
                            {(circle.likeCount ?? 0) > 0 && (
                              <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#e3886d" }}>
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="#e3886d"
                                  stroke="#e3886d"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                {circle.likeCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 페이지네이션 */}
              {pageNumList.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 40 }}>
                  {hasPrev && (
                    <button
                      onClick={() => setPage(prevPage)}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e5e5e5",
                        borderRadius: 6,
                        background: "white",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      이전
                    </button>
                  )}
                  {pageNumList.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        padding: "6px 12px",
                        border: `1px solid ${page === p ? "#5f8f7b" : "#e5e5e5"}`,
                        borderRadius: 6,
                        background: page === p ? "#5f8f7b" : "white",
                        color: page === p ? "white" : "#111",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: page === p ? 700 : 400,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  {hasNext && (
                    <button
                      onClick={() => setPage(nextPage)}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e5e5e5",
                        borderRadius: 6,
                        background: "white",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      다음
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
