import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Zap, Search, Compass } from "lucide-react";
import Navbar from "../common/layout/Navbar";
import Footer from "../common/layout/Footer";
import CircleCard from "../common/components/CircleCard";
import type { CircleItem } from "../common/components/CircleCard";
import PlaceCard from "../common/components/PlaceCard";
import SectionHeader from "../common/components/SectionHeader";
import HeroCarousel from "../common/components/HeroCarousel";
import { circleApi } from "../api/circleApi";
import { energyProfileApi } from "../api/usersApi";
import { placeApi } from "../api/placeApi";
import type { PopularPlaceItem } from "../api/placeApi";
import api from "../api/axiosInstance";
import AdminConfirmModal from "../admin/component/AdminConfirmModal";

if (typeof window !== "undefined") {
  window.history.scrollRestoration = "manual";
}

// ─── 디자인 토큰 ───

const COLOR = {
  accent: "#E3886D",
  primary: "#5F8F7B",
  secondary: "#3D5F52",
  light: "#EAF4F0",
  muted: "#A9C8BB",
  text: "#1F2937",
};

// ─── 히어로 슬라이드 데이터 ───

interface HeroSlide {
  image: string;
  label: string;
  title: string;
  description: string;
  primaryCta: string;
  primaryHref: string;
  primaryColor: string;
  secondaryCta: string;
  secondaryHref: string;
}

const heroSlides: HeroSlide[] = [
  {
    image: "/hero/hero_test.jpg",
    label: "ENERGY TEST",
    title: "내 에너지에 맞는\n모임을 찾아보세요",
    description: "몇 가지 질문만으로 지금의 에너지 상태를 분석하고,\n부담 없이 편안한 모임을 추천해드려요.",
    primaryCta: "에너지 테스트 시작하기",
    primaryHref: "/users/energy-test",
    primaryColor: COLOR.accent,
    secondaryCta: "결과 예시 보기",
    secondaryHref: "/users/energy-test/result",
  },
  {
    image: "/hero/hero_circle.jpg",
    label: "MOA MEETUP",
    title: "오늘의 에너지로\n가볍게 만나는 모임",
    description: "소수와의 대화, 취향 기반 모임,\n지금의 리듬에 맞는 활동을 편안하게 둘러보세요.",
    primaryCta: "추천 모임 둘러보기",
    primaryHref: "/circle",
    primaryColor: COLOR.primary,
    secondaryCta: "인기 모임 보기",
    secondaryHref: "/circle",
  },
  {
    image: "/hero/hero_place.jpg",
    label: "PLACE",
    title: "모임에 어울리는 공간도\n함께 찾아보세요",
    description: "대화, 클래스, 전시, 소규모 모임에 맞는\n차분한 공간을 쉽고 빠르게 확인할 수 있어요.",
    primaryCta: "플레이스 보기",
    primaryHref: "/place/rental",
    primaryColor: COLOR.secondary,
    secondaryCta: "대여 장소 확인하기",
    secondaryHref: "/place/rental",
  },
];

// ─── 히어로 오버레이 스타일 ───

const heroOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: [
    "linear-gradient(90deg, rgba(24,33,43,0.46) 0%, rgba(24,33,43,0.22) 40%, rgba(24,33,43,0.08) 100%)",
    "linear-gradient(180deg, rgba(24,33,43,0.08) 0%, rgba(24,33,43,0.28) 100%)",
  ].join(", "),
};

// ─── 기본 이미지 ───

function toCircleItem(c: {
  circleId: number;
  name: string;
  description?: string;
  categoryName: string;
  currentMember: number;
  maxMember: number;
  coverImageUrl?: string;
  starRating?: number;
}): CircleItem {
  return {
    id: c.circleId,
    title: c.name,
    location: c.categoryName,
    tag: `${c.currentMember}/${c.maxMember}명`,
    description: c.description || "",
    data: "",
    image: c.coverImageUrl || "",
    starRating: c.starRating,
  };
}


// ─── 에너지 타입 미리보기 데이터 ───

const energyTypes = [
  { name: "고요한 몰입형", emoji: "📖", desc: "혼자 조용히 몰입하는 걸 좋아해요" },
  { name: "가벼운 산책형", emoji: "🌿", desc: "부담 없는 움직임을 즐겨요" },
  { name: "조용한 교류형", emoji: "☕", desc: "소수와 깊이 있는 대화를 선호해요" },
  { name: "에너지 확산형", emoji: "🔥", desc: "활발한 교류에서 에너지를 얻어요" },
];

// ─── 컴포넌트 ───

interface MainPageProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
  isAdmin?: boolean;
}

export default function MainPage({ isLoggedIn }: MainPageProps) {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [likedCircles, setLikedCircles] = useState<Set<number>>(new Set());
  const [likedPlaces, setLikedPlaces] = useState<Set<number>>(new Set());
  const [hoveredRec, setHoveredRec] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recommendedCircles, setRecommendedCircles] = useState<CircleItem[]>([]);
  const [popularCircles, setPopularCircles] = useState<CircleItem[]>([]);
  const [needsEnergyTest, setNeedsEnergyTest] = useState(false);
  const [popularPlaces, setPopularPlaces] = useState<PopularPlaceItem[]>([]);
  const [hoveredPlace, setHoveredPlace] = useState<number | null>(null);
  const [loginModal, setLoginModal] = useState(false);

  // 모임 데이터 fetch
  useEffect(() => {
    const fetchCircles = async () => {
      // 인기 모임(독립)
      try {
        const popularRes = await api.get("/api/admin/circles/popular-circles");
        setPopularCircles(
          popularRes.data.map((c: { circleId: number; circleName: string; categoryName: string; currentMember: number; score: number }) => ({
            id: c.circleId,
            title: c.circleName,
            location: c.categoryName,
            tag: `${c.currentMember}명 참여 중`,
            description: "",
            data: "",
            image: "",
          })),
        );
      } catch {
        setPopularCircles([]);
      }

      try {
        if (isLoggedIn) {
          // 에너지 프로필 존재 여부 확인
          try {
            await energyProfileApi.check();
          } catch {
            // 프로필 없음 → 테스트 유도
            setNeedsEnergyTest(true);
            const res = await circleApi.getCircles({ page: 1, size: 5 });
            setRecommendedCircles(res.data.dtoList.map(toCircleItem));
            return;
          }
          // 프로필 있음 → 추천
          const res = await circleApi.getRecommendationBundle(5);
          setRecommendedCircles(res.data.overall.map(toCircleItem));
        } else {
          // 게스트: 최근 생성된 모임 5개
          const res = await circleApi.getCircles({ page: 1, size: 5 });
          setRecommendedCircles(res.data.dtoList.map(toCircleItem));
        }
      } catch {
        setRecommendedCircles([]);
      }
    };
    fetchCircles();
  }, [isLoggedIn]);

  useEffect(() => {
    placeApi.getPopularPlaces()
      .then((res) => setPopularPlaces(res.data))
      .catch(() => setPopularPlaces([]));
  }, []);

  const goTo = useCallback((idx: number) => {
    setSlideIndex(((idx % heroSlides.length) + heroSlides.length) % heroSlides.length);
  }, []);

  // 자동 슬라이드 (5.5초, hover 시 정지)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => goTo(slideIndex + 1), 5500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slideIndex, isPaused, goTo]);

  const toggleCircleLike = (id: number) => {
    setLikedCircles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePlaceLike = async (id: number) => {
    try {
      const res = await placeApi.togglePlaceLike(id);
      setLikedPlaces((prev) => {
        const next = new Set(prev);
        if (res.data.liked) next.add(id);
        else next.delete(id);
        return next;
      });
    } catch {
      // 실패 시 무시
    }
  };

  const slide = heroSlides[slideIndex];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAF9", color: COLOR.text }}>
      <Navbar />
      <HeroCarousel />

      {/* ━━━ Hero Carousel ━━━ */}
      {false && (
        <div
          style={{ position: "relative", height: 520, overflow: "hidden" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 배경 이미지 */}
          {heroSlides.map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${s.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: i === slideIndex ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            />
          ))}

          {/* 오버레이 */}
          <div style={heroOverlay} />

          {/* 콘텐츠 */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ maxWidth: 580, paddingLeft: "2%" }}>
              {/* 라벨 */}
              <span
                style={{
                  display: "inline-block",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.82)",
                  marginBottom: 16,
                }}
              >
                {slide.label}
              </span>

              {/* 제목 */}
              <h1
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  lineHeight: 1.18,
                  color: "#FFFFFF",
                  margin: "0 0 18px",
                  whiteSpace: "pre-line",
                }}
              >
                {slide.title}
              </h1>

              {/* 설명 */}
              <p
                style={{
                  fontSize: 17,
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.88)",
                  margin: "0 0 32px",
                  whiteSpace: "pre-line",
                }}
              >
                {slide.description}
              </p>

              {/* CTA */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button
                  onClick={() => navigate(slide.primaryHref)}
                  style={{
                    height: 52,
                    padding: "0 32px",
                    backgroundColor: slide.primaryColor,
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 17,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {slide.primaryCta}
                </button>
                <button
                  onClick={() => navigate(slide.secondaryHref)}
                  style={{
                    height: 52,
                    padding: "0 20px",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(255,255,255,0.28)",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    backdropFilter: "blur(4px)",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
                >
                  {slide.secondaryCta}
                </button>
              </div>
            </div>
          </div>

          {/* 좌우 화살표 */}
          <button onClick={() => goTo(slideIndex - 1)} aria-label="이전 슬라이드" style={arrowStyle("left")}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => goTo(slideIndex + 1)} aria-label="다음 슬라이드" style={arrowStyle("right")}>
            <ChevronRight size={24} />
          </button>

          {/* 인디케이터 */}
          <div
            style={{
              position: "absolute",
              bottom: 28,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 8,
              zIndex: 3,
            }}
          >
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`슬라이드 ${i + 1}`}
                style={{
                  width: i === slideIndex ? 28 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: i === slideIndex ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ━━━ 에너지 테스트 3-Step 설명 ━━━ */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "40px 0 64px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: COLOR.primary,
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            HOW IT WORKS
          </p>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: COLOR.text,
              margin: "0 0 8px",
            }}
          >
            나에게 맞는 모임, 이렇게 찾아요
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#6B7280",
              margin: "0 0 48px",
            }}
          >
            간단한 테스트 하나로 에너지 유형을 알아보고, 딱 맞는 모임을 추천받으세요.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
            {[
              { step: "01", icon: Zap, title: "질문에 답하기", desc: "5가지 질문에 편하게 답해요" },
              { step: "02", icon: Search, title: "에너지 유형 확인", desc: "나의 에너지 스타일을 분석해요" },
              { step: "03", icon: Compass, title: "맞춤 모임 추천", desc: "나와 맞는 모임을 찾아드려요" },
            ].map((item) => (
              <div key={item.step} style={{ flex: "0 1 280px", textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    backgroundColor: COLOR.light,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <item.icon size={28} color={COLOR.primary} strokeWidth={1.8} />
                </div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLOR.primary,
                    marginBottom: 6,
                  }}
                >
                  STEP {item.step}
                </p>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: COLOR.text,
                    marginBottom: 6,
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/users/energy-test")}
            style={{
              marginTop: 40,
              height: 50,
              padding: "0 36px",
              backgroundColor: COLOR.accent,
              color: "#FFFFFF",
              border: "none",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            에너지 테스트 시작하기
          </button>
        </div>
      </div>

      {/* ━━━ 에너지 유형 미리보기 ━━━ */}
      <div style={{ backgroundColor: "#F8FAF9", padding: "72px 0 64px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 20px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: COLOR.text,
              margin: "0 0 8px",
            }}
          >
            이런 에너지 유형이 있어요
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#6B7280",
              margin: "0 0 36px",
            }}
          >
            나는 어떤 유형일까? 테스트하고 확인해보세요.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            {energyTypes.map((type) => (
              <div
                key={type.name}
                style={{
                  flex: "0 1 240px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: "28px 20px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>{type.emoji}</span>
                <p style={{ fontSize: 16, fontWeight: 700, color: COLOR.text, marginBottom: 6 }}>{type.name}</p>
                <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ━━━ 추천 모임 ━━━ */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          {/* 에너지 테스트 유도 배너 */}
          {isLoggedIn && needsEnergyTest && (
            <div
              style={{
                backgroundColor: COLOR.light,
                borderRadius: 16,
                padding: "28px 32px",
                marginBottom: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: COLOR.text, margin: "0 0 6px" }}>아직 에너지 테스트를 안 하셨네요!</p>
                <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>간단한 테스트로 나에게 딱 맞는 모임을 추천받아 보세요.</p>
              </div>
              <button
                onClick={() => navigate("/users/energy-test")}
                style={{
                  flexShrink: 0,
                  height: 44,
                  padding: "0 24px",
                  backgroundColor: COLOR.accent,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                테스트 하러 가기
              </button>
            </div>
          )}

          <SectionHeader
            title="이런 모임 어떠세요?"
            subtitle={isLoggedIn && !needsEnergyTest ? "당신에게 맞는 모임을 추천해드려요!" : "최근 개설된 모임을 소개해드려요!"}
            moreHref="/circle"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {recommendedCircles.map((item) => (
              <CircleCard
                key={item.id}
                item={item}
                badge="인기"
                badgeColor={COLOR.accent}
                isLiked={likedCircles.has(item.id)}
                isHovered={hoveredRec === item.id}
                onLike={() => (isLoggedIn ? toggleCircleLike(item.id) : setLoginModal(true))}
                onMouseEnter={() => setHoveredRec(item.id)}
                onMouseLeave={() => setHoveredRec(null)}
                onClick={() => navigate(`/circle/${item.id}`)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ━━━ 인기 모임 ━━━ */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <SectionHeader title="이런 모임이 뜨고 있어요!" subtitle={"지금 가장 인기 있는 모임을 확인해 보세요!"} moreHref="/circle" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {popularCircles.map((item) => (
              <CircleCard
                key={item.id}
                item={item}
                badge={isLoggedIn && !needsEnergyTest ? "추천" : "NEW"}
                badgeColor={isLoggedIn && !needsEnergyTest ? COLOR.primary : COLOR.accent}
                isLiked={likedCircles.has(item.id)}
                isHovered={hoveredRec === item.id}
                onLike={() => (isLoggedIn ? toggleCircleLike(item.id) : setLoginModal(true))}
                onMouseEnter={() => setHoveredRec(item.id)}
                onMouseLeave={() => setHoveredRec(null)}
                onClick={() => navigate(`/circle/${item.id}`)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ━━━ 장소 ━━━ */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <SectionHeader title="이런 장소 어떠세요?" subtitle="모임하기 좋은 공간을 소개해드려요!" moreHref="/place/rental" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {popularPlaces.map((place) => (
              <PlaceCard
                key={place.placeId}
                place={{
                  id: place.placeId,
                  name: place.name,
                  location: place.city,
                  tags: place.tags,
                  image: place.imageUrl ?? "",
                }}
                badge="추천"
                badgeColor={COLOR.accent}
                isLiked={likedPlaces.has(place.placeId)}
                isHovered={hoveredPlace === place.placeId}
                onLike={() => (isLoggedIn ? togglePlaceLike(place.placeId) : setLoginModal(true))}
                onMouseEnter={() => setHoveredPlace(place.placeId)}
                onMouseLeave={() => setHoveredPlace(null)}
                onClick={() => navigate(`/place/${place.placeId}`)}
              />
            ))}
          </div>
        </div>
      </div>

      <AdminConfirmModal
        open={loginModal}
        title="로그인 필요"
        message="로그인이 필요한 작업입니다. 로그인 페이지로 이동하시겠습니까?"
        confirmLabel="로그인하기"
        confirmColor="green"
        onConfirm={() => {
          setLoginModal(false);
          navigate("/users/login");
        }}
        onCancel={() => setLoginModal(false)}
      />
      <Footer />
    </div>
  );
}

// ─── 화살표 버튼 스타일 ───

function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    [side]: 24,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 3,
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backdropFilter: "blur(4px)",
    transition: "background-color 0.15s",
    padding: 0,
  };
}
