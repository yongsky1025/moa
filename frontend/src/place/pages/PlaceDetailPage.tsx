import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  MapPin,
  Users,
  Star,
  Heart,
  Clock,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Tag,
  MessageSquare,
  X,
} from "lucide-react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import PlaceImageGallery from "../components/PlaceImageGallery";
import PlaceReservationPanel from "../components/PlaceReservationPanel";
import {
  fetchPlaceDetail,
  fetchPlaceReviews,
  togglePlaceLike,
} from "../api/placeRentalApi";
import { toAssetUrl } from "../../common/utils/assetUrl";
import type { PlaceDetailDTO, PlaceReviewDTO } from "../types/placeTypes";
import ReportButton from "../../common/components/ReportButton";

/** description에서 [섹션 제목] 패턴을 파싱해 섹션 배열로 변환 */
function parseDescriptionSections(
  text: string,
): Array<{ title: string; content: string }> {
  const parts = text.split(/(\[[^\]]+\])/);
  const sections: Array<{ title: string; content: string }> = [];
  let currentTitle = "";
  let currentContent = "";

  for (const part of parts) {
    if (/^\[[^\]]+\]$/.test(part)) {
      if (currentTitle || currentContent.trim()) {
        sections.push({ title: currentTitle, content: currentContent.trim() });
      }
      currentTitle = part.slice(1, -1);
      currentContent = "";
    } else {
      currentContent += part;
    }
  }
  if (currentTitle || currentContent.trim()) {
    sections.push({ title: currentTitle, content: currentContent.trim() });
  }
  return sections;
}

const DAY_KO: Record<string, string> = {
  MONDAY: "월요일",
  TUESDAY: "화요일",
  WEDNESDAY: "수요일",
  THURSDAY: "목요일",
  FRIDAY: "금요일",
  SATURDAY: "토요일",
  SUNDAY: "일요일",
};

const SUB_NAV_ITEMS = [
  { key: "intro", label: "장소 소개" },
  { key: "info", label: "이용 안내" },
  { key: "location", label: "위치" },
  { key: "review", label: "후기" },
] as const;

type SectionKey = (typeof SUB_NAV_ITEMS)[number]["key"];

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{
            width: 14,
            height: 14,
            fill: s <= Math.round(rating) ? "#f59e0b" : "none",
            color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db",
          }}
        />
      ))}
    </span>
  );
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (cb: () => void) => void;
        Map: new (
          el: HTMLElement,
          opts: object,
        ) => { setCenter: (latlng: object) => void };
        LatLng: new (lat: number, lng: number) => object;
        Marker: new (opts: object) => { setMap: (m: object) => void };
      };
    };
  }
}

function PlaceMiniMap({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const containerId = "place-detail-map";
  useEffect(() => {
    const init = () => {
      const el = document.getElementById(containerId);
      if (!el || !window.kakao?.maps) return;
      window.kakao.maps.load(() => {
        const latlng = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(el, { center: latlng, level: 4 });
        const marker = new window.kakao.maps.Marker({ position: latlng, map });
        marker.setMap(map);
      });
    };
    if (window.kakao?.maps) init();
    else {
      const script = document.getElementById("kakao-map-script");
      if (script) script.addEventListener("load", init);
    }
  }, [lat, lng]);

  return (
    <div
      id={containerId}
      style={{
        width: "100%",
        height: 220,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#f3f4f6",
      }}
      aria-label={`${name} 위치 지도`}
    />
  );
}

// ── JS 기반 sticky hook ─────────────────────────────────────────────────────
// CSS sticky가 body overflow-y:auto 조합에서 신뢰할 수 없어 직접 구현
function useJsSticky(offsetTop: number, ready: boolean) {
  const wrapRef = useRef<HTMLDivElement>(null); // 레이아웃 공간 유지용 외부 div
  const [fixed, setFixed] = useState(false);
  const dimsRef = useRef({ left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!ready) return;

    let naturalTop: number | null = null;
    let isFixed = false;

    const check = () => {
      if (naturalTop === null) return;
      const shouldFix = window.scrollY + offsetTop >= naturalTop;
      if (shouldFix === isFixed) return;
      isFixed = shouldFix;
      if (shouldFix && wrapRef.current) {
        const r = wrapRef.current.getBoundingClientRect();
        dimsRef.current = { left: r.left, width: r.width, height: r.height };
      }
      setFixed(shouldFix);
    };

    const raf = requestAnimationFrame(() => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      naturalTop = r.top + window.scrollY;
      if (dimsRef.current.height === 0) {
        dimsRef.current = { left: r.left, width: r.width, height: r.height };
      }
      check();
    });

    window.addEventListener("scroll", check, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", check);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, offsetTop]);

  return { wrapRef, fixed, dimsRef };
}

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialDate = searchParams.get("date") ?? undefined;
  const initialScheduleId = (location.state as { scheduleId?: number } | null)
    ?.scheduleId;
  const { isLoggedIn } = useAuthStore();
  const [place, setPlace] = useState<PlaceDetailDTO | null>(null);
  const [reviews, setReviews] = useState<PlaceReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionKey>("intro");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [reviewLightbox, setReviewLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  // JS sticky — subnav (navbar 실제 높이 68px), 예약 패널 (84px)
  const subnavSticky = useJsSticky(0, !!place);
  const panelSticky = useJsSticky(60, !!place);

  // 섹션 refs
  const introRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  const sectionRefs: Record<
    SectionKey,
    React.RefObject<HTMLDivElement | null>
  > = {
    intro: introRef,
    info: infoRef,
    location: locationRef,
    review: reviewRef,
  };

  useEffect(() => {
    if (!id) return;
    const placeId = Number(id);
    setLoading(true);
    Promise.all([fetchPlaceDetail(placeId), fetchPlaceReviews(placeId)])
      .then(([detail, revs]) => {
        setPlace(detail);
        setLikeCount(detail.likeCount);
        setLiked(detail.liked ?? false);
        setReviews(revs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // IntersectionObserver — 현재 보이는 섹션 active
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const entries: Record<SectionKey, boolean> = {
      intro: false,
      info: false,
      location: false,
      review: false,
    };
    SUB_NAV_ITEMS.forEach(({ key }) => {
      const el = sectionRefs[key].current;
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          entries[key] = entry.isIntersecting;
          const first = SUB_NAV_ITEMS.find((s) => entries[s.key]);
          if (first) setActiveSection(first.key);
        },
        { rootMargin: "-110px 0px -55% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!place) return;
    try {
      const res = await togglePlaceLike(place.id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {}
  };

  const scrollTo = (key: SectionKey) => {
    const el = sectionRefs[key].current;
    if (!el) return;
    const offset = el.getBoundingClientRect().top + window.scrollY - 114;
    window.scrollTo({ top: offset, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "white" }}>
        <Navbar />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                height: 420,
                borderRadius: 12,
                backgroundColor: "#f3f4f6",
              }}
            />
            <div
              style={{
                height: 32,
                width: "40%",
                borderRadius: 8,
                backgroundColor: "#f3f4f6",
              }}
            />
            <div
              style={{
                height: 20,
                width: "60%",
                borderRadius: 8,
                backgroundColor: "#f3f4f6",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "white" }}>
        <Navbar />
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 20px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 18, color: "#888" }}>
            장소를 찾을 수 없습니다.
          </p>
          <button
            onClick={() => navigate("/place/rental")}
            style={{
              marginTop: 20,
              padding: "10px 24px",
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              backgroundColor: "white",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const locationText = [place.city, place.district, place.dong]
    .filter(Boolean)
    .join(" ");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Navbar />

      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 80px" }}
      >
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 20,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: "#666",
          }}
        >
          <ChevronLeft style={{ width: 18, height: 18 }} />
          목록으로
        </button>

        {/* 이미지 갤러리 */}
        <div style={{ marginBottom: 28 }}>
          <PlaceImageGallery images={place.images} name={place.name} />
        </div>

        {/* 본문: 2컬럼 flex */}
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
          {/* 왼쪽: 상세 정보 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 제목 + 메타 */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#111",
                    margin: 0,
                  }}
                >
                  {place.name}
                </h1>
                <button
                  onClick={handleLike}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 13px",
                    borderRadius: 999,
                    border: `1.5px solid ${liked ? "#ef4444" : "#e5e7eb"}`,
                    background: liked ? "#fff5f5" : "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    color: liked ? "#ef4444" : "#888",
                    transition: "all 0.15s",
                    flexShrink: 0,
                  }}
                >
                  <Heart
                    style={{
                      width: 14,
                      height: 14,
                      fill: liked ? "#ef4444" : "none",
                      color: liked ? "#ef4444" : "#888",
                    }}
                  />
                  좋아요
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 14,
                  color: "#666",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin style={{ width: 14, height: 14, color: "#5F8F7B" }} />
                  {locationText}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star
                    style={{
                      width: 14,
                      height: 14,
                      fill: "#f59e0b",
                      color: "#f59e0b",
                    }}
                  />
                  <strong style={{ color: "#111" }}>
                    {place.avgRating.toFixed(1)}
                  </strong>
                  <span style={{ color: "#aaa" }}>
                    ({place.reviewCount}개 리뷰)
                  </span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Heart
                    style={{
                      width: 14,
                      height: 14,
                      fill: liked ? "#ef4444" : "none",
                      color: "#ef4444",
                    }}
                  />
                  {likeCount.toLocaleString()}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Users style={{ width: 14, height: 14 }} />
                  최대 {place.capacity}명
                </span>
              </div>
            </div>

            <div
              style={{
                height: 1,
                backgroundColor: "#f0f0f0",
                marginBottom: 24,
              }}
            />

            {/* 태그 */}
            {place.tags.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Tag style={{ width: 16, height: 16, color: "#5F8F7B" }} />
                  태그
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {place.tags.map((tag) => (
                    <span
                      key={tag.id}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 999,
                        backgroundColor: "#EAF4F0",
                        color: "#4E7C69",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── 서브 네비게이션 바: JS sticky ── */}
            {/* outer: fixed 전환 시 레이아웃 공간 유지 */}
            <div
              ref={subnavSticky.wrapRef}
              style={{
                height: subnavSticky.fixed
                  ? subnavSticky.dimsRef.current.height
                  : undefined,
                marginBottom: 24,
                marginLeft: -4,
              }}
            >
              <div
                style={{
                  ...(subnavSticky.fixed
                    ? {
                        position: "fixed" as const,
                        top: 0,
                        left: subnavSticky.dimsRef.current.left,
                        width: subnavSticky.dimsRef.current.width,
                      }
                    : {}),
                  zIndex: 30,
                  backgroundColor: "white",
                  borderTop: "1px solid #f0f0f0",
                  borderBottom: "1px solid #f0f0f0",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  display: "flex",
                  gap: 0,
                }}
              >
                {SUB_NAV_ITEMS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => scrollTo(key)}
                    style={{
                      padding: "13px 18px",
                      fontSize: 14,
                      fontWeight: activeSection === key ? 700 : 500,
                      color: activeSection === key ? "#5F8F7B" : "#666",
                      background: "none",
                      border: "none",
                      borderBottom:
                        activeSection === key
                          ? "2px solid #5F8F7B"
                          : "2px solid transparent",
                      cursor: "pointer",
                      transition: "color 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 장소 소개 */}
            <div
              ref={introRef}
              style={{ marginBottom: 28, scrollMarginTop: 114 }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: 12,
                }}
              >
                장소 소개
              </h2>
              {(() => {
                const sections = parseDescriptionSections(place.description);
                if (sections.length === 0) return null;
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {sections.map((section, i) => {
                      const items = section.content
                        .split(/ · | \/ /)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      return (
                        <div key={i}>
                          {section.title && (
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#5F8F7B",
                                marginBottom: 6,
                              }}
                            >
                              [{section.title}]
                            </p>
                          )}
                          {items.length > 1 ? (
                            <ul
                              style={{
                                margin: 0,
                                paddingLeft: 16,
                                listStyle: "disc",
                              }}
                            >
                              {items.map((item, j) => (
                                <li
                                  key={j}
                                  style={{
                                    fontSize: 14,
                                    color: "#444",
                                    lineHeight: 1.8,
                                  }}
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                fontSize: 14,
                                color: "#444",
                                lineHeight: 1.8,
                                margin: 0,
                              }}
                            >
                              {section.content}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div
              style={{
                height: 1,
                backgroundColor: "#f0f0f0",
                marginBottom: 24,
              }}
            />

            {/* 이용 안내 */}
            <div
              ref={infoRef}
              style={{ marginBottom: 28, scrollMarginTop: 114 }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Clock style={{ width: 16, height: 16, color: "#5F8F7B" }} />
                이용 안내
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  {
                    label: "운영 시간",
                    value: `${place.openTime?.slice(0, 5)} ~ ${place.closeTime?.slice(0, 5)}`,
                  },
                  { label: "수용 인원", value: `최대 ${place.capacity}명` },
                  {
                    label: "최소 예약",
                    value: formatMinutes(place.minReservationMinutes),
                  },
                  {
                    label: "최대 예약",
                    value: formatMinutes(place.maxReservationMinutes),
                  },
                  {
                    label: "시간당 가격",
                    value: `${place.pricePerHour.toLocaleString()}원`,
                  },
                  { label: "주소", value: place.address },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      padding: "14px 16px",
                      backgroundColor: "#f8faf9",
                      borderRadius: 10,
                    }}
                  >
                    <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 휴무일 */}
            {place.closedDays.length > 0 && (
              <>
                <div
                  style={{
                    height: 1,
                    backgroundColor: "#f0f0f0",
                    marginBottom: 24,
                  }}
                />
                <div style={{ marginBottom: 28 }}>
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#111",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <CalendarX
                      style={{ width: 16, height: 16, color: "#ef4444" }}
                    />
                    휴무일
                  </h2>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {place.closedDays.map((cd, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: 8,
                          backgroundColor: "#fff7f7",
                          border: "1px solid #fee2e2",
                          fontSize: 13,
                        }}
                      >
                        <span style={{ color: "#111", fontWeight: 500 }}>
                          {cd.dayOfWeek
                            ? `매주 ${DAY_KO[cd.dayOfWeek] ?? cd.dayOfWeek}`
                            : (cd.date ?? "-")}
                          {cd.closedType === "WEEKLY" && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 11,
                                color: "#888",
                                backgroundColor: "#f3f4f6",
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              정기휴무
                            </span>
                          )}
                        </span>
                        <span style={{ color: "#888" }}>{cd.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div
              style={{
                height: 1,
                backgroundColor: "#f0f0f0",
                marginBottom: 24,
              }}
            />

            {/* 위치 지도 */}
            <div
              ref={locationRef}
              style={{ marginBottom: 28, scrollMarginTop: 114 }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MapPin style={{ width: 16, height: 16, color: "#5F8F7B" }} />
                위치
              </h2>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>
                {place.address}
              </p>
              <PlaceMiniMap
                lat={place.latitude}
                lng={place.longitude}
                name={place.name}
              />
            </div>

            <div
              style={{
                height: 1,
                backgroundColor: "#f0f0f0",
                marginBottom: 24,
              }}
            />

            {/* 리뷰 */}
            <div ref={reviewRef} style={{ scrollMarginTop: 114 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MessageSquare
                  style={{ width: 16, height: 16, color: "#5F8F7B" }}
                />
                후기
                <span style={{ fontSize: 14, fontWeight: 400, color: "#888" }}>
                  ({place.reviewCount}개)
                </span>
              </h2>
              {reviews.length === 0 ? (
                <div
                  style={{
                    padding: "32px 0",
                    textAlign: "center",
                    color: "#bbb",
                    fontSize: 14,
                  }}
                >
                  아직 리뷰가 없습니다
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: "16px",
                        border: "1px solid #f0f0f0",
                        borderRadius: 12,
                        backgroundColor: "white",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              backgroundColor: "#EAF4F0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#5F8F7B",
                            }}
                          >
                            {r.reviewerNickname?.charAt(0) ?? "?"}
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#111",
                            }}
                          >
                            {r.reviewerNickname}
                          </span>
                          {isLoggedIn && (
                            <ReportButton
                              targetType="PLACE_REVIEW"
                              targetId={r.id}
                              className="text-[11px] text-gray-400 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-0 ml-1"
                              label="신고"
                            />
                          )}
                        </div>
                        <StarRating rating={r.rating} />
                      </div>
                      <p
                        style={{ fontSize: 13, color: "#444", lineHeight: 1.7 }}
                      >
                        {r.comment}
                      </p>
                      {r.images && r.images.length > 0 && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          {r.images.map((path, idx) => (
                            <img
                              key={path}
                              src={toAssetUrl(path)}
                              alt={`후기 이미지 ${idx + 1}`}
                              onClick={() =>
                                setReviewLightbox({
                                  images: r.images!,
                                  index: idx,
                                })
                              }
                              style={{
                                width: 72,
                                height: 72,
                                borderRadius: 10,
                                objectFit: "cover",
                                border: "1px solid #f0f0f0",
                                cursor: "pointer",
                                transition: "opacity 0.15s",
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 예약 패널 — JS sticky */}
          {/* outer: fixed 전환 시 레이아웃 공간 유지 */}
          <div
            ref={panelSticky.wrapRef}
            style={{
              width: 340,
              flexShrink: 0,
              minHeight: panelSticky.fixed
                ? panelSticky.dimsRef.current.height
                : undefined,
            }}
          >
            <div
              style={
                panelSticky.fixed
                  ? {
                      position: "fixed",
                      top: 50,
                      left: panelSticky.dimsRef.current.left,
                      width: panelSticky.dimsRef.current.width,
                    }
                  : {}
              }
            >
              <PlaceReservationPanel
                place={place}
                initialDate={initialDate}
                initialScheduleId={initialScheduleId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 리뷰 이미지 라이트박스 ── */}
      {reviewLightbox &&
        (() => {
          const imgs = reviewLightbox.images.map((p) => toAssetUrl(p));
          const idx = reviewLightbox.index;
          const prevImg = () =>
            setReviewLightbox((prev) =>
              prev
                ? {
                    ...prev,
                    index:
                      (prev.index - 1 + prev.images.length) %
                      prev.images.length,
                  }
                : null,
            );
          const nextImg = () =>
            setReviewLightbox((prev) =>
              prev
                ? { ...prev, index: (prev.index + 1) % prev.images.length }
                : null,
            );
          return (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                backgroundColor: "rgba(0,0,0,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setReviewLightbox(null)}
            >
              <button
                onClick={() => setReviewLightbox(null)}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X style={{ width: 22, height: 22, color: "white" }} />
              </button>
              {imgs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImg();
                  }}
                  style={{
                    position: "absolute",
                    left: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: 48,
                    height: 48,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronLeft
                    style={{ width: 26, height: 26, color: "white" }}
                  />
                </button>
              )}
              <img
                src={imgs[idx]}
                alt={`후기 이미지 ${idx + 1}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxHeight: "90vh",
                  maxWidth: "90vw",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
              {imgs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImg();
                  }}
                  style={{
                    position: "absolute",
                    right: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: 48,
                    height: 48,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronRight
                    style={{ width: 26, height: 26, color: "white" }}
                  />
                </button>
              )}
              {imgs.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 20,
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                  }}
                >
                  {idx + 1} / {imgs.length}
                </div>
              )}
            </div>
          );
        })()}

      <Footer />
    </div>
  );
}

function formatMinutes(m: number) {
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min === 0 ? `${h}시간` : `${h}시간 ${min}분`;
}
