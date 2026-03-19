import { useState, useEffect } from "react";
import Navbar from "../common/layout/Navbar";
import Footer from "../common/layout/Footer";
import CircleCard from "../common/components/CircleCard";
import PlaceCard from "../common/components/PlaceCard";
import SectionHeader from "../common/components/SectionHeader";

const socialings = [
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
    liked: false,
  },
  {
    id: 2,
    title: "한강 러닝크루 입문자 모임",
    location: "여의도",
    date: "3월 16일(일) · 오전 10:00",
    price: "12,000원",
    people: "10/12명",
    tag: "운동",
    rating: "4.8",
    reviews: 82,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    liked: false,
  },
  {
    id: 3,
    title: "초보도 가능한 보드게임 번개",
    location: "홍대",
    date: "3월 16일(일) · 오후 3:00",
    price: "10,000원",
    people: "4/6명",
    tag: "취미",
    rating: "5.0",
    reviews: 31,
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
    liked: false,
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
    liked: false,
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
    liked: false,
  },
  {
    id: 6,
    title: "요즘 관심사로 가볍게 대화해요",
    location: "합정",
    date: "3월 21일(금) · 오후 8:00",
    price: "9,000원",
    people: "9/10명",
    tag: "대화",
    rating: "4.8",
    reviews: 55,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    liked: false,
  },
  {
    id: 7,
    title: "ETF·주식 초보자 재테크 스터디",
    location: "강남",
    date: "3월 22일(토) · 오후 2:00",
    price: "20,000원",
    people: "8/10명",
    tag: "재테크",
    rating: "4.9",
    reviews: 41,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    liked: false,
  },
  {
    id: 8,
    title: "필라테스 입문 원데이 클래스",
    location: "서초",
    date: "3월 23일(일) · 오전 10:30",
    price: "35,000원",
    people: "3/6명",
    tag: "액티비티",
    rating: "5.0",
    reviews: 18,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    liked: false,
  },
];

interface MainPageProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
  isAdmin?: boolean;
}

export default function MainPage({ isLoggedIn, onToggleLogin, isAdmin }: MainPageProps) {
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [bannerIndex, setBannerIndex] = useState(0);
  const [hoveredRec, setHoveredRec] = useState<number | null>(null);
  const [hoveredPop, setHoveredPop] = useState<number | null>(null);

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

  const banners = [
    {
      bg: "#5F8F7B",
      title: "지금 바로 모임에 참여해보세요",
      sub: "취향 맞는 사람들과 특별한 경험을",
    },
    {
      bg: "#4E7C69",
      title: "이번 주말, 어떤 모임 어때요?",
      sub: "다양한 소셜링이 당신을 기다립니다",
    },
    {
      bg: "#3D6A58",
      title: "새로운 인연, 새로운 취미",
      sub: "moa에서 시작해보세요",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const toggleLike = (id: number) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAF9", color: "#1F2937" }}>
      <Navbar />

      {/* Banner Slider */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            backgroundColor: banners[bannerIndex].bg,
            height: 420,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.4s",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "white",
              marginBottom: 10,
            }}
          >
            {banners[bannerIndex].title}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{banners[bannerIndex].sub}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
            {banners.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === bannerIndex ? 20 : 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: i === bannerIndex ? "white" : "rgba(255,255,255,0.35)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
                onClick={() => setBannerIndex(i)}
              />
            ))}
          </div>
        </div>
        <button
          onClick={() => setBannerIndex((bannerIndex - 1 + banners.length) % banners.length)}
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          &#60;
        </button>
        <button
          onClick={() => setBannerIndex((bannerIndex + 1) % banners.length)}
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          &#62;
        </button>
      </div>

      {/* 추천 소셜링 */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <SectionHeader
            title="✨ 이런 모임 어떠세요?"
            subtitle={isLoggedIn ? "당신에게 맞는 모임을 추천해드려요!" : "이번주 인기 있는 모임을 추천해드려요!"}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {socialings.slice(0, 5).map((item) => (
              <CircleCard
                key={item.id}
                item={item}
                badge="추천"
                badgeColor="#5F8F7B"
                isLiked={likedItems.has(item.id)}
                isHovered={hoveredRec === item.id}
                onLike={() => toggleLike(item.id)}
                onMouseEnter={() => setHoveredRec(item.id)}
                onMouseLeave={() => setHoveredRec(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 이런 모임이 뜨고 있어요! */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <SectionHeader title="🔥 이런 모임이 뜨고 있어요!" subtitle="지금 가장 인기 있는 모임을 확인해보세요" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {socialings.slice(3).map((item) => (
              <CircleCard
                key={item.id}
                item={item}
                badge="인기"
                badgeColor="#E38B6D"
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

      {/* 이런 장소 어떠세요? */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "72px 0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <SectionHeader title="📍 이런 장소 어떠세요?" subtitle="모임하기 좋은 공간을 소개해드려요!" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
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
