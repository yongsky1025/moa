import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users, Sparkles } from 'lucide-react';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { circleApi } from '../../api/circleApi';
import type { CircleResponse, RecommendationBundle, RecommendationItem } from '../types/circle';
import type { RootState } from '../../users/reducers/store';

const CATEGORY_COLORS: Record<string, string> = {
  '자기계발': 'linear-gradient(135deg, #5f8f7b 0%, #3d5f52 100%)',
  '푸드·드링크': 'linear-gradient(135deg, #e3886d 0%, #c8674e 100%)',
  '액티비티': 'linear-gradient(135deg, #4e7c69 0%, #a9c8bb 100%)',
  '문화·예술': 'linear-gradient(135deg, #a9c8bb 0%, #5f8f7b 100%)',
  '대화': 'linear-gradient(135deg, #e3886d 0%, #a9c8bb 100%)',
  '운동': 'linear-gradient(135deg, #3d5f52 0%, #5f8f7b 100%)',
  '재테크': 'linear-gradient(135deg, #5f8f7b 0%, #eaf4f0 100%)',
  '취미': 'linear-gradient(135deg, #e3886d 0%, #fdf1ec 100%)',
};
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #a9c8bb 0%, #eaf4f0 100%)';

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
  const [recommendBundle, setRecommendBundle] = useState<RecommendationBundle | null>(null);
  const [recommendFilter, setRecommendFilter] = useState<'overall' | 'social' | 'activity' | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
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
  const [statusType, setStatusType] = useState<'ALL' | 'OPEN' | 'FULL'>('ALL');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    circleApi.getCategories().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    circleApi.getRecommendationBundle()
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
          ...(statusType !== 'ALL' ? { type: statusType } : {}),
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
      setSelectedCategoryIds(prev =>
        prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
      );
    }
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(inputValue);
    setPage(1);
  };


  const isRecFiltered = recommendFilter !== null && !!recommendBundle;
  const selectedCategoryNames = new Set(
    categories.filter(c => selectedCategoryIds.includes(c.categoryId)).map(c => c.categoryName)
  );
  const recItems: RecommendationItem[] = isRecFiltered
    ? (recommendBundle![recommendFilter as 'overall' | 'social' | 'activity'] as RecommendationItem[])
        .filter(c => selectedCategoryNames.size === 0 || selectedCategoryNames.has(c.categoryName))
    : [];

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
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: '#5f8f7b', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
            >
              + 모임 만들기
            </button>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 60px' }}>
        <main>
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', marginBottom: 20, border: '1px solid #e5e5e5', borderRadius: 999, backgroundColor: 'white' }}>
            {/* 상태 드롭다운 */}
            <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setDropdownOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4,
                  width: 88, padding: '11px 12px 11px 16px',
                  border: 'none', borderRight: '1px solid #e5e5e5',
                  backgroundColor: 'transparent',
                  color: statusType !== 'ALL' ? '#5f8f7b' : '#555',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {{ ALL: '전체', OPEN: '모집중', FULL: '모집완료' }[statusType]}
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
                  backgroundColor: 'white', borderRadius: 10,
                  border: '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                  overflow: 'hidden', minWidth: 96,
                }}>
                  {([['ALL', '전체'], ['OPEN', '모집중'], ['FULL', '모집완료']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setStatusType(val); setPage(1); setDropdownOpen(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '9px 16px', border: 'none', cursor: 'pointer',
                        backgroundColor: statusType === val ? '#f0f7f4' : 'white',
                        color: statusType === val ? '#5f8f7b' : '#333',
                        fontSize: 13, fontWeight: statusType === val ? 700 : 400,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* 검색 입력 */}
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="검색어를 입력해주세요"
              style={{
                flex: 1, padding: '11px 18px',
                border: 'none', outline: 'none',
                fontSize: 14, color: '#111', backgroundColor: 'transparent',
              }}
            />
            {/* 돋보기 검색 버튼 */}
            <button
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 14px', border: 'none',
                backgroundColor: 'transparent', color: '#5f8f7b',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>

          {/* 필터 섹션 */}
          <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #f0f0f0', padding: '14px 20px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 추천 행 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: '#111', minWidth: 64, flexShrink: 0 }}>
                <Sparkles style={{ width: 13, height: 13, color: '#f59e0b' }} />
                추천
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
                {([
                  { key: 'overall', label: '전체' },
                  { key: 'social',  label: '사교' },
                  { key: 'activity', label: '활동' },
                ] as { key: 'overall' | 'social' | 'activity'; label: string }[]).map(({ key, label }) => {
                  const active = recommendFilter === key;
                  const disabled = !isLoggedIn || !recommendBundle;
                  return (
                    <button
                      key={key}
                      disabled={disabled}
                      onClick={() => { setRecommendFilter(active ? null : key); setPage(1); }}
                      title={disabled ? (isLoggedIn ? '에너지 프로필이 필요합니다' : '로그인이 필요합니다') : undefined}
                      style={{
                        padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        border: `1px solid ${active ? '#5f8f7b' : '#e5e5e5'}`,
                        backgroundColor: active ? '#5f8f7b' : 'white',
                        color: active ? 'white' : disabled ? '#ccc' : '#555',
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 구분선 */}
            <div style={{ borderTop: '1px solid #f0f0f0' }} />

            {/* 카테고리 행 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111', minWidth: 64, flexShrink: 0 }}>카테고리</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {[{ categoryId: null as null, categoryName: '전체' }, ...categories].map((cat) => {
                  const active = cat.categoryId === null ? selectedCategoryIds.length === 0 : selectedCategoryIds.includes(cat.categoryId);
                  return (
                    <button
                      key={cat.categoryId ?? 'all'}
                      onClick={() => handleCategoryClick(cat.categoryId)}
                      style={{
                        padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${active ? '#5f8f7b' : '#e5e5e5'}`,
                        backgroundColor: active ? '#5f8f7b' : 'white',
                        color: active ? 'white' : '#555',
                        transition: 'all 0.15s',
                      }}
                    >
                      {cat.categoryName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {isRecFiltered ? (
            /* 추천 필터 활성 */
            <>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
                <strong style={{ color: '#5f8f7b' }}>
                  {recommendFilter === 'overall' ? '5축 전체' : recommendFilter === 'social' ? '사교 성향' : '활동 스타일'}
                </strong> 기반 추천 모임 {recItems.length > 0 && <strong style={{ color: '#111' }}>{recItems.length}개</strong>}
              </p>
              {recItems.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>추천 모임이 없습니다.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                  {recItems.map((c) => {
                    const statusInfo = STATUS_LABEL[c.status] ?? { text: String(c.status), color: '#888' };
                    const bgGradient = CATEGORY_COLORS[c.categoryName] ?? DEFAULT_GRADIENT;
                    return (
                      <div
                        key={c.circleId}
                        onClick={() => navigate(`/circle/${c.circleId}`)}
                        style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ position: 'relative', height: 160, background: c.coverImageUrl ? 'none' : bgGradient, flexShrink: 0 }}>
                          {c.coverImageUrl && <img src={c.coverImageUrl} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                          <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.55)', fontSize: 11, fontWeight: 700, color: 'white' }}>{c.categoryName}</div>
                          <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 8px', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: 700, color: statusInfo.color }}>{statusInfo.text}</div>
                          <div style={{ position: 'absolute', bottom: 8, right: 10, padding: '2px 7px', borderRadius: 999, backgroundColor: 'rgba(95,143,123,0.9)', fontSize: 11, fontWeight: 700, color: 'white' }}>
                            {Math.round(c.similarity * 100)}% 일치
                          </div>
                        </div>
                        <div style={{ padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800, lineHeight: 1.4, color: '#1f2937', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.name}</h3>
                          <p style={{ margin: '0 0 10px', fontSize: 12, color: '#6b7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{c.description || '소개글이 없습니다.'}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
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
            <p style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>로딩 중...</p>
          ) : (
            <>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
                총 <strong style={{ color: '#111' }}>{totalCount}</strong>개의 모임
              </p>

              {circles.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>모임이 없습니다.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                  {circles.map((circle) => {
                    const statusInfo = STATUS_LABEL[circle.status] ?? { text: circle.status, color: '#888' };
                    const bgGradient = CATEGORY_COLORS[circle.categoryName] ?? DEFAULT_GRADIENT;

                    return (
                      <div
                        key={circle.circleId}
                        onClick={() => navigate(`/circle/${circle.circleId}`)}
                        style={{
                          backgroundColor: 'white', borderRadius: 16, overflow: 'hidden',
                          border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s',
                          display: 'flex', flexDirection: 'column',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* 이미지 영역 */}
                        <div style={{ position: 'relative', height: 160, background: circle.coverImageUrl ? 'none' : bgGradient, flexShrink: 0 }}>
                          {circle.coverImageUrl
                            ? <img src={circle.coverImageUrl} alt={circle.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            : null
                          }
                          <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.55)', fontSize: 11, fontWeight: 700, color: 'white' }}>
                            {circle.categoryName}
                          </div>
                          <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 8px', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: 700, color: statusInfo.color }}>
                            {statusInfo.text}
                          </div>
                        </div>

                        {/* 정보 영역 */}
                        <div style={{ padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <h3 style={{
                            margin: '0 0 4px', fontSize: 14, fontWeight: 800, lineHeight: 1.4, color: '#1f2937',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {circle.name}
                          </h3>
                          <p style={{
                            margin: '0 0 10px', fontSize: 12, color: '#6b7280', lineHeight: 1.5,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            flex: 1,
                          }}>
                            {circle.description || '소개글이 없습니다.'}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
                              <Users style={{ width: 12, height: 12 }} />
                              {circle.currentMember}/{circle.maxMember}명
                            </div>
                            {(circle.likeCount ?? 0) > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#e3886d' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#e3886d" stroke="#e3886d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      style={{ padding: '6px 12px', border: `1px solid ${page === p ? '#5f8f7b' : '#e5e5e5'}`, borderRadius: 6, background: page === p ? '#5f8f7b' : 'white', color: page === p ? 'white' : '#111', cursor: 'pointer', fontSize: 13, fontWeight: page === p ? 700 : 400 }}
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
