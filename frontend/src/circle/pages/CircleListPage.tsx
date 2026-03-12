import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users } from 'lucide-react';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { circleApi } from '../../api/circleApi';
import type { CircleResponse } from '../types/circle';
import type { RootState } from '../../users/reducers/store';

// 카테고리별 배경색 (이미지 대신 그라데이션)
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
  OPEN:     { text: '모집중',    color: '#16a34a' },
  FULL:     { text: '정원마감',  color: '#dc2626' },
  PENDING:  { text: '승인대기',  color: '#d97706' },
  REJECTED: { text: '거절됨',   color: '#6b7280' },
};

// 서클 목록에서 중복 없는 카테고리 추출
function extractCategories(circles: CircleResponse[]) {
  const seen = new Set<number>();
  const result: { categoryId: number; categoryName: string }[] = [];
  for (const c of circles) {
    if (!seen.has(c.categoryId)) {
      seen.add(c.categoryId);
      result.push({ categoryId: c.categoryId, categoryName: c.categoryName });
    }
  }
  return result.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
}

const PAGE_SIZE = 12;

export default function CircleListPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((s: RootState) => s.auth);

  const [circles, setCircles] = useState<CircleResponse[]>([]);
  const [categories, setCategories] = useState<{ categoryId: number; categoryName: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumList, setPageNumList] = useState<number[]>([]);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [prevPage, setPrevPage] = useState(0);
  const [nextPage, setNextPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // 서클 목록 조회
  useEffect(() => {
    const fetchCircles = async () => {
      setLoading(true);
      try {
        const res = await circleApi.getCircles({
          ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
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

        // 전체 탭일 때만 카테고리 목록 갱신 (첫 로드 시)
        if (!selectedCategoryId && page === 1) {
          setCategories(extractCategories(data.dtoList));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCircles();
  }, [selectedCategoryId, page]);

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8', color: '#111' }}>
      <Navbar />

      {/* 페이지 헤더 + 카테고리 탭 */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #f0f0f0', padding: '32px 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: -0.5, marginBottom: 4 }}>
                모임 찾기
              </h1>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
                취향 맞는 사람들과 특별한 경험을 함께하세요
              </p>
            </div>
            {isLoggedIn && (
              <button
                onClick={() => navigate('/circle/create')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#111',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                + 모임 만들기
              </button>
            )}
          </div>

          {/* 카테고리 탭 */}
          <div className="hide-scrollbar" style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            <button
              onClick={() => handleCategoryClick(null)}
              style={{
                padding: '14px 16px',
                border: 'none',
                borderBottom: selectedCategoryId === null ? '2px solid #111' : '2px solid transparent',
                background: 'none',
                fontSize: 14,
                fontWeight: selectedCategoryId === null ? 700 : 400,
                color: selectedCategoryId === null ? '#111' : '#888',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => handleCategoryClick(cat.categoryId)}
                style={{
                  padding: '14px 16px',
                  border: 'none',
                  borderBottom: selectedCategoryId === cat.categoryId ? '2px solid #111' : '2px solid transparent',
                  background: 'none',
                  fontSize: 14,
                  fontWeight: selectedCategoryId === cat.categoryId ? 700 : 400,
                  color: selectedCategoryId === cat.categoryId ? '#111' : '#888',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 60px' }}>
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 20,
                }}
              >
                {circles.map((circle) => {
                  const statusInfo = STATUS_LABEL[circle.status] ?? { text: circle.status, color: '#888' };
                  const bgGradient = CATEGORY_COLORS[circle.categoryName] ?? DEFAULT_GRADIENT;

                  return (
                    <div
                      key={circle.circleId}
                      onClick={() => navigate(`/circle/${circle.circleId}`)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)')}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)')}
                    >
                      {/* 카드 상단: 대표 이미지 또는 그라데이션 */}
                      <div style={{
                        position: 'relative', height: 120,
                        background: circle.coverImageUrl ? 'none' : bgGradient,
                      }}>
                        {circle.coverImageUrl && (
                          <img
                            src={circle.coverImageUrl}
                            alt={circle.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                        <div
                          style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            padding: '4px 10px',
                            borderRadius: 999,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#111',
                          }}
                        >
                          {circle.categoryName}
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            padding: '4px 10px',
                            borderRadius: 999,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            fontSize: 12,
                            fontWeight: 700,
                            color: statusInfo.color,
                          }}
                        >
                          {statusInfo.text}
                        </div>
                      </div>

                      {/* 카드 본문 */}
                      <div style={{ padding: '14px 16px 16px' }}>
                        <h3
                          style={{
                            margin: '0 0 6px',
                            fontSize: 15,
                            fontWeight: 700,
                            lineHeight: 1.4,
                            color: '#111',
                          }}
                        >
                          {circle.name}
                        </h3>
                        <p
                          style={{
                            margin: '0 0 12px',
                            fontSize: 13,
                            color: '#666',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {circle.description || '소개글이 없습니다.'}
                        </p>

                        <div style={{ height: 1, backgroundColor: '#f0f0f0', margin: '12px 0' }} />

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#666' }}
                          >
                            <Users style={{ width: 13, height: 13 }} />
                            {circle.currentMember}/{circle.maxMember}명
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/circle/${circle.circleId}`);
                            }}
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
                  <button
                    onClick={() => setPage(prevPage)}
                    style={{ padding: '6px 12px', border: '1px solid #e5e5e5', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 13 }}
                  >
                    이전
                  </button>
                )}
                {pageNumList.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: 6,
                      background: page === p ? '#111' : 'white',
                      color: page === p ? 'white' : '#111',
                      cursor: 'pointer',
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
                    style={{ padding: '6px 12px', border: '1px solid #e5e5e5', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 13 }}
                  >
                    다음
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
