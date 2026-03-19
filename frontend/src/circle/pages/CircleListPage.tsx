import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users, Sparkles } from 'lucide-react';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { circleApi } from '../../api/circleApi';
import type { CircleResponse } from '../types/circle';
import type { RootState } from '../../users/reducers/store';

const CATEGORY_COLORS: Record<string, string> = {
  '자기계발': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '푸드·드링크': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  '액티비티': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  '문화·예술': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  '대화': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  '운동': 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
  '재테크': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  '취미': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
};
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #d3cce3 0%, #e9e4f0 100%)';

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  OPEN:     { text: '모집중',   color: '#16a34a' },
  FULL:     { text: '정원마감', color: '#dc2626' },
  PENDING:  { text: '승인대기', color: '#d97706' },
  REJECTED: { text: '거절됨',  color: '#6b7280' },
  CLOSED:   { text: '종료됨',  color: '#6b7280' },
};

const PAGE_SIZE = 12;

export default function CircleListPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((s: RootState) => s.auth);

  const [circles, setCircles] = useState<CircleResponse[]>([]);
  const [categories, setCategories] = useState<{ categoryId: number; categoryName: string }[]>([]);
  const [recommended, setRecommended] = useState<CircleResponse[]>([]);
  const [noEnergyProfile, setNoEnergyProfile] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumList, setPageNumList] = useState<number[]>([]);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [prevPage, setPrevPage] = useState(0);
  const [nextPage, setNextPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [onlyOpen, setOnlyOpen] = useState(false);

  useEffect(() => {
    circleApi.getCategories().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    circleApi.getRecommendedCircles()
      .then((res) => setRecommended(res.data))
      .catch(() => { setNoEnergyProfile(true); });
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchCircles = async () => {
      setLoading(true);
      try {
        const res = await circleApi.getCircles({
          ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
          ...(keyword ? { keyword } : {}),
          ...(onlyOpen ? { type: 'OPEN' } : {}),
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
  }, [selectedCategoryId, keyword, page, onlyOpen]);

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(inputValue);
    setPage(1);
  };


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8', color: '#111' }}>
      <Navbar />

      {/* 헤더 */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #f0f0f0', padding: '32px 0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: -0.5, marginBottom: 4 }}>
              모임 찾기
            </h1>
            <p style={{ fontSize: 14, color: '#888' }}>취향 맞는 사람들과 특별한 경험을 함께하세요</p>
          </div>
          {isLoggedIn && (
            <button
              onClick={() => navigate('/circle/create')}
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: '#111', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
            >
              + 모임 만들기
            </button>
          )}
        </div>
      </div>

      {/* 본문: 사이드바 + 메인 */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 60px', display: 'flex', gap: 28, alignItems: 'flex-start' }}>

        {/* 사이드바 */}
        <aside style={{ width: 200, flexShrink: 0 }}>

          {/* 에너지 프로필 없을 때 안내 */}
          {(!isLoggedIn || noEnergyProfile) && (
            <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #f0f0f0', padding: '16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles style={{ width: 14, height: 14, color: '#f59e0b' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>나의 추천 모임</span>
              </div>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 12 }}>
                에너지 프로필을 설정하면 나와 잘 맞는 모임을 추천해드려요.
              </p>
              <button
                style={{
                  width: '100%', padding: '9px 0', borderRadius: 8,
                  border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5',
                  fontSize: 12, fontWeight: 600, color: '#555', cursor: 'not-allowed',
                }}
              >
                에너지 프로필 측정하기
              </button>
            </div>
          )}

          {/* 추천 모임 */}
          {isLoggedIn && recommended.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #f0f0f0', padding: '16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Sparkles style={{ width: 14, height: 14, color: '#f59e0b' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>나의 추천 모임</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recommended.slice(0, 5).map((c, idx) => (
                  <div
                    key={c.circleId}
                    onClick={() => navigate(`/circle/${c.circleId}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      padding: '7px 0',
                      borderBottom: idx < Math.min(recommended.length, 5) - 1 ? '1px solid #f5f5f5' : 'none',
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                      background: c.coverImageUrl ? 'none' : (CATEGORY_COLORS[c.categoryName] ?? DEFAULT_GRADIENT),
                    }}>
                      {c.coverImageUrl && (
                        <img src={c.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{c.categoryName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 카테고리 */}
          <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #f0f0f0', padding: '16px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 10 }}>카테고리</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer' }}>
              <input
                type="radio"
                name="category"
                checked={selectedCategoryId === null}
                onChange={() => handleCategoryClick(null)}
                style={{ accentColor: '#111', width: 15, height: 15, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, color: '#111', fontWeight: selectedCategoryId === null ? 700 : 400 }}>전체</span>
            </label>
            {categories.map((cat) => (
              <label key={cat.categoryId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategoryId === cat.categoryId}
                  onChange={() => handleCategoryClick(cat.categoryId)}
                  style={{ accentColor: '#111', width: 15, height: 15, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 14, color: '#555', fontWeight: selectedCategoryId === cat.categoryId ? 700 : 400 }}>
                  {cat.categoryName}
                </span>
              </label>
            ))}
          </div>
        </aside>

        {/* 메인 */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, flex: 1 }}>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="모임 이름으로 검색해보세요"
              style={{
                flex: 1, padding: '11px 18px', borderRadius: '10px 0 0 10px',
                border: '1px solid #e5e5e5', borderRight: 'none',
                fontSize: 14, color: '#111', outline: 'none', backgroundColor: 'white',
              }}
            />
            <button
              type="submit"
              style={{ padding: '11px 24px', borderRadius: '0 10px 10px 0', border: '1px solid #111', backgroundColor: '#111', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              검색
            </button>
          </form>
          <button
            type="button"
            onClick={() => { setOnlyOpen(v => !v); setPage(1); }}
            style={{
              padding: '11px 18px', borderRadius: 10, border: `1px solid ${onlyOpen ? '#16a34a' : '#e5e5e5'}`,
              backgroundColor: onlyOpen ? '#f0fdf4' : 'white',
              color: onlyOpen ? '#16a34a' : '#888',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            모집중만 보기
          </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>로딩 중...</p>
          ) : (
            <>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
                총 <strong style={{ color: '#111' }}>{totalCount}</strong>개의 모임
              </p>

              {circles.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>모임이 없습니다.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                  {circles.map((circle) => {
                    const statusInfo = STATUS_LABEL[circle.status] ?? { text: circle.status, color: '#888' };
                    const bgGradient = CATEGORY_COLORS[circle.categoryName] ?? DEFAULT_GRADIENT;

                    return (
                      <div
                        key={circle.circleId}
                        onClick={() => navigate(`/circle/${circle.circleId}`)}
                        style={{
                          backgroundColor: 'white', borderRadius: 16, overflow: 'hidden',
                          border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                          cursor: 'pointer', transition: 'box-shadow 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)')}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)')}
                      >
                        <div style={{ position: 'relative', height: 120, background: circle.coverImageUrl ? 'none' : bgGradient }}>
                          {circle.coverImageUrl && (
                            <img src={circle.coverImageUrl} alt={circle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                          <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600, color: '#111' }}>
                            {circle.categoryName}
                          </div>
                          <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 700, color: statusInfo.color }}>
                            {statusInfo.text}
                          </div>
                        </div>

                        <div style={{ padding: '14px 16px 16px' }}>
                          <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: '#111' }}>
                            {circle.name}
                          </h3>
                          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {circle.description || '소개글이 없습니다.'}
                          </p>

                          <div style={{ height: 1, backgroundColor: '#f0f0f0', margin: '12px 0' }} />

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#666' }}>
                              <Users style={{ width: 13, height: 13 }} />
                              {circle.currentMember}/{circle.maxMember}명
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/circle/${circle.circleId}`); }}
                              style={{ padding: '8px 16px', borderRadius: 999, border: 'none', backgroundColor: '#111', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                            >
                              자세히 보기
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 페이지네이션 */}
              {pageNumList.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 40 }}>
                  {hasPrev && (
                    <button onClick={() => setPage(prevPage)} style={{ padding: '6px 12px', border: '1px solid #e5e5e5', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 13 }}>
                      이전
                    </button>
                  )}
                  {pageNumList.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{ padding: '6px 12px', border: '1px solid #e5e5e5', borderRadius: 6, background: page === p ? '#111' : 'white', color: page === p ? 'white' : '#111', cursor: 'pointer', fontSize: 13, fontWeight: page === p ? 700 : 400 }}
                    >
                      {p}
                    </button>
                  ))}
                  {hasNext && (
                    <button onClick={() => setPage(nextPage)} style={{ padding: '6px 12px', border: '1px solid #e5e5e5', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 13 }}>
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
