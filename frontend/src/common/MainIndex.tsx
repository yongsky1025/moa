import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Search, Compass } from "lucide-react";
import Navbar from "../common/layout/Navbar";
import Footer from "../common/layout/Footer";
import CircleCard, { type CircleItem } from "../common/components/CircleCard";
import PlaceCard from "../common/components/PlaceCard";
import SectionHeader from "../common/components/SectionHeader";
import HeroCarousel from "../common/components/HeroCarousel";
import { circleApi } from "../api/circleApi";
import type { CircleResponse, RecommendationItem } from "../circle/types/circle";

const COLOR = {
  accent: "#E3886D",
  primary: "#5F8F7B",
  light: "#EAF4F0",
  text: "#1F2937",
};

const popularMeetups: CircleItem[] = [
  {
    id: 9001,
    title: "가볍게 만나서 산책하는 주말 모임",
    location: "성수",
    tag: "문화·야외",
    date: "찜 수가 높은 모임",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9002,
    title: "초보도 편하게 참여하는 러닝 입문",
    location: "사당",
    tag: "운동",
    date: "참여율이 높은 모임",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9003,
    title: "보드게임 처음이어도 괜찮은 번개 모임",
    location: "합정",
    tag: "취미",
    date: "이번 주 반응이 좋은 모임",
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9004,
    title: "퇴근 후 가볍게 모이는 커피챗",
    location: "강남",
    tag: "사교",
    date: "재방문율이 높은 모임",
    image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9005,
    title: "브런치와 함께 시작하는 새로운 네트워킹",
    location: "연남",
    tag: "이벤트",
    date: "신규 참여가 많은 모임",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },
];

const places = [
  {
    id: 1,
    name: "성수 카페 골목 라운지",
    location: "성수동",
    tag: "카페",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "망원 한강공원 피크닉 스팟",
    location: "마포구",
    tag: "야외",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "을지로 복합문화공간",
    location: "을지로",
    tag: "문화",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "강남 루프톱 바",
    location: "강남구",
    tag: "바",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "북촌 전시 갤러리",
    location: "종로구",
    tag: "갤러리",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
  },
];

const energyTypes = [
  { name: "고요한 몰입형", emoji: "📚", desc: "조용하고 깊이 있는 만남에서 편안함을 느끼는 유형이에요." },
  { name: "가벼운 교류형", emoji: "🌿", desc: "부담 없이 가볍게 어울리는 시간을 선호해요." },
  { name: "차분한 대화형", emoji: "☕", desc: "소수와 천천히 대화하며 친밀감을 쌓는 편이에요." },
  { name: "에너지 확산형", emoji: "✨", desc: "활기 있는 분위기 속에서 새로운 자극을 얻는 유형이에요." },
];

interface MainPageProps {
  isLoggedIn: boolean;
  isOnboardingCompleted?: boolean;
  authReady: boolean;
  onToggleLogin: () => void;
  isAdmin?: boolean;
}

function shuffleItems<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function toRecommendedCircleCard(item: RecommendationItem): CircleItem {
  return {
    id: item.circleId,
    title: item.name,
    location: `${item.currentMember}/${item.maxMember}명`,
    tag: item.categoryName,
    date: `적합도 ${Math.round(item.similarity * 100)}%`,
    image: item.coverImageUrl || "/hero/hero_circle.jpg",
  };
}

function toLatestCircleCard(item: CircleResponse): CircleItem {
  return {
    id: item.circleId,
    title: item.name,
    location: `${item.currentMember}/${item.maxMember}명`,
    tag: item.categoryName,
    date: item.status === "FULL" ? "정원 마감" : "모집중",
    image: item.coverImageUrl || "/hero/hero_circle.jpg",
  };
}

export default function MainPage({ isLoggedIn, isOnboardingCompleted, authReady }: MainPageProps) {
  const navigate = useNavigate();
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [likedPlaces, setLikedPlaces] = useState<Set<number>>(new Set());
  const [hoveredPrimary, setHoveredPrimary] = useState<number | null>(null);
  const [hoveredPopular, setHoveredPopular] = useState<number | null>(null);
  const [recommendedItems, setRecommendedItems] = useState<CircleItem[]>([]);
  const [latestItems, setLatestItems] = useState<CircleItem[]>([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [latestLoading, setLatestLoading] = useState(false);

  const canLoadRecommendations = authReady && isLoggedIn && isOnboardingCompleted === true;
  const shouldShowOnboardingPrompt = authReady && isLoggedIn && isOnboardingCompleted === false;

  const firstSectionItems = canLoadRecommendations ? recommendedItems : latestItems;
  const firstSectionLoading = canLoadRecommendations ? recommendationLoading : latestLoading;
  const firstSectionBadge = canLoadRecommendations ? "추천" : "최신";
  const firstSectionSubtitle = canLoadRecommendations ? "당신에게 맞는 모임을 추천해드려요!" : "최근 올라온 모임을 먼저 둘러보세요.";
  const firstSectionEmptyMessage = canLoadRecommendations ? "지금 보여드릴 추천 모임이 없습니다." : "지금 보여드릴 최신 모임이 없습니다.";
  const firstSectionLoadingMessage = canLoadRecommendations ? "추천 모임을 불러오는 중입니다..." : "최신 모임을 불러오는 중입니다...";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!canLoadRecommendations) {
      setRecommendedItems([]);
      setRecommendationLoading(false);
      return;
    }

    let cancelled = false;
    setRecommendationLoading(true);

    circleApi
      .getRecommendationBundle(10)
      .then((res) => {
        if (cancelled) return;
        const picked = shuffleItems(res.data.overall).slice(0, 5).map(toRecommendedCircleCard);
        setRecommendedItems(picked);
      })
      .catch(() => {
        if (cancelled) return;
        setRecommendedItems([]);
      })
      .finally(() => {
        if (!cancelled) setRecommendationLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canLoadRecommendations]);

  useEffect(() => {
    if (canLoadRecommendations) {
      setLatestItems([]);
      setLatestLoading(false);
      return;
    }

    let cancelled = false;
    setLatestLoading(true);

    circleApi
      .getCircles({ page: 1, size: 5 })
      .then((res) => {
        if (cancelled) return;
        const latest = res.data.dtoList.map(toLatestCircleCard);
        setLatestItems(latest);
      })
      .catch(() => {
        if (cancelled) return;
        setLatestItems([]);
      })
      .finally(() => {
        if (!cancelled) setLatestLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canLoadRecommendations]);

  const toggleLike = (id: number) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePlaceLike = (id: number) => {
    setLikedPlaces((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAF9", color: COLOR.text }}>
      <Navbar />
      <HeroCarousel />

      <div style={{ backgroundColor: "#FFFFFF", padding: "40px 0 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: COLOR.primary, letterSpacing: "0.06em", marginBottom: 4 }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: COLOR.text, margin: "0 0 8px" }}>나에게 맞는 모임, 이렇게 찾아요</h2>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 48px" }}>
            간단한 테스트로 에너지 유형을 확인하고, 지금 내 성향에 맞는 모임을 추천받을 수 있어요.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[
              { step: "01", icon: Zap, title: "질문에 답하기", desc: "5가지 질문으로 현재 에너지 상태를 확인해요." },
              { step: "02", icon: Search, title: "에너지 유형 분석", desc: "교류 방식과 활동 선호를 정리해드려요." },
              { step: "03", icon: Compass, title: "맞춤 모임 추천", desc: "내 성향에 어울리는 모임을 보여드려요." },
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

      <div style={{ backgroundColor: "#F8FAF9", padding: "72px 0 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLOR.text, margin: "0 0 8px" }}>이런 에너지 유형도 있어요</h2>
          <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 36px" }}>테스트를 하면 내 유형과 추천 카테고리를 바로 확인할 수 있습니다.</p>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
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

      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <SectionHeader title="이런 모임 어때요?" subtitle={firstSectionSubtitle} moreHref="/circle" />

          {shouldShowOnboardingPrompt && (
            <div style={emptyCardStyle}>
              <p style={{ fontSize: 16, fontWeight: 700, color: COLOR.text, margin: "0 0 8px" }}>추천을 받으려면 에너지 테스트가 필요합니다</p>
              <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.6 }}>
                온보딩과 에너지 테스트를 마치면 지금의 성향에 맞는 모임 5개를 추천해드릴게요.
              </p>
              <button onClick={() => navigate("/users/energy-test")} style={primaryButtonStyle}>
                테스트 하러 가기
              </button>
            </div>
          )}

          {firstSectionLoading && (
            <div style={emptyCardStyle}>
              <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>{firstSectionLoadingMessage}</p>
            </div>
          )}

          {!firstSectionLoading && firstSectionItems.length === 0 && (
            <div style={emptyCardStyle}>
              <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>{firstSectionEmptyMessage}</p>
            </div>
          )}

          {!firstSectionLoading && firstSectionItems.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {firstSectionItems.map((item) => (
                <CircleCard
                  key={item.id}
                  item={item}
                  badge={firstSectionBadge}
                  badgeColor={COLOR.primary}
                  isLiked={likedItems.has(item.id)}
                  isHovered={hoveredPrimary === item.id}
                  onLike={() => toggleLike(item.id)}
                  onMouseEnter={() => setHoveredPrimary(item.id)}
                  onMouseLeave={() => setHoveredPrimary(null)}
                  onClick={() => navigate(`/circle/${item.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <SectionHeader title="이런 모임도 있어요!" subtitle="지금 가장 인기 있는 모임들을 확인해보세요" moreHref="/circle" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {popularMeetups.map((item) => (
              <CircleCard
                key={item.id}
                item={item}
                badge="인기"
                badgeColor={COLOR.accent}
                isLiked={likedItems.has(item.id)}
                isHovered={hoveredPopular === item.id}
                onLike={() => toggleLike(item.id)}
                onMouseEnter={() => setHoveredPopular(item.id)}
                onMouseLeave={() => setHoveredPopular(null)}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <SectionHeader title="추천 플레이스" subtitle="모임하기 좋은 공간도 함께 살펴보세요." moreHref="/place/rental" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isLiked={likedPlaces.has(place.id)}
                onLike={() => togglePlaceLike(place.id)}
              />
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
