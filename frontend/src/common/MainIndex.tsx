import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Zap, Search, Compass } from "lucide-react";
import Navbar from "../common/layout/Navbar";
import Footer from "../common/layout/Footer";
import CircleCard, { type CircleItem } from "../common/components/CircleCard";
import PlaceCard from "../common/components/PlaceCard";
import SectionHeader from "../common/components/SectionHeader";
import HeroCarousel from "../common/components/HeroCarousel";
import { circleApi } from "../api/circleApi";
import type { CircleResponse, RecommendationItem } from "../circle/types/circle";
import HeroCarousel from "../common/components/HeroCarousel";

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

// ─── 샘플 데이터 ───

const COLOR = {
  accent: "#E3886D",
  primary: "#5F8F7B",
  light: "#EAF4F0",
  text: "#1F2937",
};

const popularMeetups: CircleItem[] = [
  {
    id: 1,
    title: "퇴근 후 전시 보고 와인 한 잔",
    location: "성수",
    date: "3월 15일(토) · 오후 7:00",
    price: "18,000원",
    people: "6/8명",
    tag: "문화·예술",
    rating: "4.9",
    reviews: 47,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "한강 러닝크루 입문자 모임",
    location: "여의도",
    date: "3월 16일(일) · 오전 10:00",
    price: "12,000원",
    people: "10/12명",
    tag: "운동",
    date: "참여율이 높은 모임",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "초보도 가능한 보드게임 번개",
    location: "홍대",
    date: "3월 16일(일) · 오후 3:00",
    price: "10,000원",
    people: "4/6명",
    tag: "취미",
    date: "이번 주 반응이 좋은 모임",
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "직장인 독서 대화 모임",
    location: "강남",
    date: "3월 18일(화) · 오후 7:30",
    price: "15,000원",
    people: "7/10명",
    tag: "자기계발",
    rating: "4.7",
    reviews: 63,
    image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "샐러드 만들고 브런치까지",
    location: "을지로",
    date: "3월 20일(목) · 오전 11:00",
    price: "22,000원",
    people: "5/8명",
    tag: "푸드·드링크",
    rating: "4.9",
    reviews: 29,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },
];

const places = [
  {
    id: 1,
    name: "성수 카페 골목",
    location: "성수동",
    tag: "카페",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "한강 노을 공원",
    location: "마포구",
    tag: "야외",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "홍대 복합문화공간",
    location: "홍대",
    tag: "문화",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "강남 루프탑 바",
    location: "강남",
    tag: "바",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "북촌 한옥 갤러리",
    location: "종로",
    tag: "갤러리",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
  },
];

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
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [hoveredRec, setHoveredRec] = useState<number | null>(null);
  const [hoveredPop, setHoveredPop] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const toggleLike = (id: number) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

      <div style={{ backgroundColor: "#F8FAF9", padding: "72px 0 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLOR.text, margin: "0 0 8px" }}>이런 에너지 유형도 있어요</h2>
          <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 36px" }}>테스트를 하면 내 유형과 추천 카테고리를 바로 확인할 수 있습니다.</p>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            {energyTypes.map((type) => (
              <div
                key={type.name}
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

      {/* ━━━ 히어로 → HOW IT WORKS 전환 그라데이션 ━━━ */}
      {/* <div style={{ height: 80, background: "linear-gradient(180deg, #1f2937 0%, #FFFFFF 100%)" }} /> */}

      {/* ━━━ 에너지 테스트 3-Step 설명 ━━━ */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "40px 0 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: COLOR.primary, letterSpacing: "0.06em", marginBottom: 4 }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: COLOR.text, margin: "0 0 8px" }}>나에게 맞는 모임, 이렇게 찾아요</h2>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 48px" }}>
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
                <p style={{ fontSize: 12, fontWeight: 700, color: COLOR.primary, marginBottom: 6 }}>STEP {item.step}</p>
                <p style={{ fontSize: 17, fontWeight: 700, color: COLOR.text, marginBottom: 6 }}>{item.title}</p>
                <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>{item.desc}</p>
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
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLOR.text, margin: "0 0 8px" }}>이런 에너지 유형이 있어요</h2>
          <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 36px" }}>나는 어떤 유형일까? 테스트하고 확인해보세요.</p>

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
          <SectionHeader
            title="이런 모임 어떠세요?"
            subtitle={isLoggedIn ? "당신에게 맞는 모임을 추천해드려요!" : "이번주 인기 있는 모임을 추천해드려요!"}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {socialings.slice(0, 5).map((item) => (
              <CircleCard
                key={item.id}
                item={item}
                badge="추천"
                badgeColor={COLOR.primary}
                isLiked={likedItems.has(item.id)}
                isHovered={hoveredRec === item.id}
                onLike={() => toggleLike(item.id)}
                onMouseEnter={() => setHoveredRec(item.id)}
                onMouseLeave={() => setHoveredRec(null)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ━━━ 인기 모임 ━━━ */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <SectionHeader title="이런 모임도 있어요!" subtitle="지금 가장 인기 있는 모임들을 확인해보세요" moreHref="/circle" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {popularMeetups.map((item) => (
          <SectionHeader title="이런 모임이 뜨고 있어요!" subtitle="지금 가장 인기 있는 모임을 확인해보세요" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {socialings.slice(3).map((item) => (
              <CircleCard
                key={item.id}
                item={item}
                badge="인기"
                badgeColor={COLOR.accent}
                isLiked={likedItems.has(item.id)}
                isHovered={hoveredPop === item.id}
                onLike={() => toggleLike(item.id)}
                onMouseEnter={() => setHoveredPop(item.id)}
                onMouseLeave={() => setHoveredPop(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ━━━ 장소 ━━━ */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <SectionHeader title="추천 플레이스" subtitle="모임하기 좋은 공간도 함께 살펴보세요." moreHref="/place/rental" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          <SectionHeader title="이런 장소 어떠세요?" subtitle="모임하기 좋은 공간을 소개해드려요!" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const emptyCardStyle: CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 18,
  backgroundColor: "#F8FAF9",
  padding: "28px 24px",
  textAlign: "center",
};

const primaryButtonStyle: CSSProperties = {
  height: 46,
  padding: "0 22px",
  backgroundColor: COLOR.primary,
  color: "#FFFFFF",
  border: "none",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

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
