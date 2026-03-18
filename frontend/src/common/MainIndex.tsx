import { useState } from 'react';
import { MapPin, CalendarDays, Heart, Star, Users } from 'lucide-react';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

const categories = [
  '전체',
  '자기계발',
  '푸드·드링크',
  '액티비티',
  '문화·예술',
  '대화',
  '운동',
  '재테크',
  '취미',
];

const socialings = [
  {
    id: 1,
    title: '퇴근 후 전시 보고 와인 한 잔',
    location: '성수',
    date: '3월 15일(토) · 오후 7:00',
    price: '18,000원',
    people: '6/8명',
    tag: '문화·예술',
    rating: '4.9',
    reviews: 47,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: '한강 러닝크루 입문자 모임',
    location: '여의도',
    date: '3월 16일(일) · 오전 10:00',
    price: '12,000원',
    people: '10/12명',
    tag: '운동',
    rating: '4.8',
    reviews: 82,
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: '초보도 가능한 보드게임 번개',
    location: '홍대',
    date: '3월 16일(일) · 오후 3:00',
    price: '10,000원',
    people: '4/6명',
    tag: '취미',
    rating: '5.0',
    reviews: 31,
    image:
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    title: '직장인 독서 대화 모임',
    location: '강남',
    date: '3월 18일(화) · 오후 7:30',
    price: '15,000원',
    people: '7/10명',
    tag: '자기계발',
    rating: '4.7',
    reviews: 63,
    image:
      'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    title: '샐러드 만들고 브런치까지',
    location: '을지로',
    date: '3월 20일(목) · 오전 11:00',
    price: '22,000원',
    people: '5/8명',
    tag: '푸드·드링크',
    rating: '4.9',
    reviews: 29,
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    title: '요즘 관심사로 가볍게 대화해요',
    location: '합정',
    date: '3월 21일(금) · 오후 8:00',
    price: '9,000원',
    people: '9/10명',
    tag: '대화',
    rating: '4.8',
    reviews: 55,
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 7,
    title: 'ETF·주식 초보자 재테크 스터디',
    location: '강남',
    date: '3월 22일(토) · 오후 2:00',
    price: '20,000원',
    people: '8/10명',
    tag: '재테크',
    rating: '4.9',
    reviews: 41,
    image:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 8,
    title: '필라테스 입문 원데이 클래스',
    location: '서초',
    date: '3월 23일(일) · 오전 10:30',
    price: '35,000원',
    people: '3/6명',
    tag: '액티비티',
    rating: '5.0',
    reviews: 18,
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  },
];

export default function MeetingFindPage() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered =
    activeCategory === '전체'
      ? socialings
      : socialings.filter((s) => s.tag === activeCategory);

  return (
    <div
      style={{ minHeight: '100vh', backgroundColor: '#f7f7f8', color: '#111' }}
    >
      <Navbar />

      {/* 페이지 헤더 */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #f0f0f0',
          padding: '32px 0 0',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: '#111',
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
          >
            모임 찾기
          </h1>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
            취향 맞는 사람들과 특별한 경험을 함께하세요
          </p>

          {/* 카테고리 탭 */}
          <div
            className="hide-scrollbar"
            style={{ display: 'flex', gap: 0, overflowX: 'auto' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '14px 16px',
                  border: 'none',
                  borderBottom:
                    activeCategory === cat
                      ? '2px solid #111'
                      : '2px solid transparent',
                  background: 'none',
                  fontSize: 14,
                  fontWeight: activeCategory === cat ? 700 : 400,
                  color: activeCategory === cat ? '#111' : '#888',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 */}
      <main
        style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 60px' }}
      >
        <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
          총 <strong style={{ color: '#111' }}>{filtered.length}</strong>개의
          모임
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative', paddingTop: '66%' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    padding: '4px 10px',
                    borderRadius: 999,
                    backgroundColor: 'white',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#111',
                  }}
                >
                  {item.tag}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(item.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}
                >
                  <Heart
                    style={{
                      width: 16,
                      height: 16,
                      fill: likedItems.has(item.id) ? '#ff4d4f' : 'none',
                      color: likedItems.has(item.id) ? '#ff4d4f' : '#111',
                    }}
                  />
                </button>
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <h3
                  style={{
                    margin: '0 0 10px',
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    color: '#111',
                  }}
                >
                  {item.title}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 13,
                      color: '#666',
                    }}
                  >
                    <MapPin style={{ width: 13, height: 13 }} />
                    {item.location}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 13,
                      color: '#666',
                    }}
                  >
                    <CalendarDays style={{ width: 13, height: 13 }} />
                    {item.date}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 13,
                      color: '#666',
                    }}
                  >
                    <Users style={{ width: 13, height: 13 }} />
                    {item.people}
                  </div>
                </div>
                <div
                  style={{
                    height: 1,
                    backgroundColor: '#f0f0f0',
                    margin: '12px 0',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: 16, fontWeight: 800, color: '#111' }}
                    >
                      {item.price}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        marginTop: 2,
                      }}
                    >
                      <Star
                        style={{
                          width: 12,
                          height: 12,
                          fill: '#facc15',
                          color: '#facc15',
                        }}
                      />
                      <span
                        style={{ fontSize: 12, fontWeight: 600, color: '#111' }}
                      >
                        {item.rating}
                      </span>
                      <span style={{ fontSize: 12, color: '#aaa' }}>
                        ({item.reviews})
                      </span>
                    </div>
                  </div>
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: 999,
                      border: 'none',
                      backgroundColor: '#111',
                      color: 'white',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    신청하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
