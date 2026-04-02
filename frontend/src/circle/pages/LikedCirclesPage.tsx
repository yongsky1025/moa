import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart } from 'lucide-react';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { circleApi } from '../../api/circleApi';
import { getErrorMessage } from '../../common/utils/errorMessage';
import type { CircleResponse } from '../types/circle';

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

export default function LikedCirclesPage() {
  const navigate = useNavigate();
  const [circles, setCircles] = useState<CircleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    circleApi.getLikedCircles()
      .then(res => setCircles(res.data))
      .catch(e => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px 60px' }}>

        <button
          onClick={() => navigate('/users/profile')}
          style={{ fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, padding: 0 }}
        >
          ← 마이페이지로 돌아가기
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1f2937', marginBottom: 24 }}>찜한 모임</h1>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#fef2f2', color: '#dc2626', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>로딩 중...</p>
        ) : circles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>
            <p style={{ fontSize: 15, marginBottom: 12 }}>좋아요한 모임이 없습니다.</p>
            <button
              onClick={() => navigate('/circle')}
              style={{ padding: '10px 20px', borderRadius: 8, backgroundColor: '#5f8f7b', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              모임 찾아보기
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {circles.map(circle => {
              const statusInfo = STATUS_LABEL[circle.status] ?? { text: circle.status, color: '#888' };
              const bgGradient = CATEGORY_COLORS[circle.categoryName] ?? DEFAULT_GRADIENT;

              return (
                <div
                  key={circle.circleId}
                  style={{
                    display: 'flex', alignItems: 'stretch',
                    backgroundColor: 'white', borderRadius: 16, overflow: 'hidden',
                    border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onClick={() => navigate(`/circle/${circle.circleId}`)}
                >
                  {/* 썸네일 */}
                  <div style={{ width: 110, flexShrink: 0, background: circle.coverImageUrl ? 'none' : bgGradient, position: 'relative' }}>
                    {circle.coverImageUrl && (
                      <img src={circle.coverImageUrl} alt={circle.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    )}
                  </div>

                  {/* 정보 */}
                  <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                    <div>
                      {/* 뱃지 행 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, backgroundColor: '#fdf1ec', color: '#e3886d' }}>
                          <Heart style={{ width: 10, height: 10, fill: '#e3886d' }} /> 좋아요
                        </span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{circle.categoryName}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: statusInfo.color }}>{statusInfo.text}</span>
                      </div>

                      {/* 모임 이름 */}
                      <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {circle.name}
                      </h3>

                      {/* 설명 */}
                      <p style={{ margin: 0, fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {circle.description || '소개글이 없습니다.'}
                      </p>
                    </div>

                    {/* 하단: 인원 + 버튼 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9ca3af' }}>
                        <Users style={{ width: 13, height: 13 }} />
                        {circle.currentMember}/{circle.maxMember}명
                      </div>
                      <div onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/circle/${circle.circleId}`)}
                          style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', backgroundColor: 'white', color: '#5f8f7b', border: '1px solid #5f8f7b' }}
                        >
                          바로가기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
