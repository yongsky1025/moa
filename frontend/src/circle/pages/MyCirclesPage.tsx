import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
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

type Tab = 'all' | 'leader' | 'member';

export default function MyCirclesPage() {
  const navigate = useNavigate();
  const [circles, setCircles] = useState<CircleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    circleApi.getMyCircles()
      .then(res => setCircles(res.data))
      .catch(e => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = circles.filter(c => {
    if (tab === 'leader') return c.myRole === 'LEADER';
    if (tab === 'member') return c.myRole === 'MEMBER';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px 60px' }}>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1f2937', marginBottom: 24 }}>내 모임</h1>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['all', 'leader', 'member'] as Tab[]).map(t => {
            const label = t === 'all' ? '전체' : t === 'leader' ? '내가 리더' : '참여 중';
            const count = t === 'all' ? circles.length
              : t === 'leader' ? circles.filter(c => c.myRole === 'LEADER').length
              : circles.filter(c => c.myRole === 'MEMBER').length;
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${active ? '#5f8f7b' : '#e5e5e5'}`,
                  backgroundColor: active ? '#5f8f7b' : 'white',
                  color: active ? 'white' : '#555',
                  transition: 'all 0.15s',
                }}
              >
                {label} {count > 0 && <span style={{ opacity: 0.8 }}>({count})</span>}
              </button>
            );
          })}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#fef2f2', color: '#dc2626', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>로딩 중...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>
            <p style={{ fontSize: 15, marginBottom: 12 }}>
              {tab === 'all' ? '아직 가입한 모임이 없습니다.' : tab === 'leader' ? '리더로 있는 모임이 없습니다.' : '참여 중인 모임이 없습니다.'}
            </p>
            {tab === 'all' && (
              <button
                onClick={() => navigate('/circle')}
                style={{ padding: '10px 20px', borderRadius: 8, backgroundColor: '#5f8f7b', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                모임 찾아보기
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(circle => {
              const statusInfo = STATUS_LABEL[circle.status] ?? { text: circle.status, color: '#888' };
              const bgGradient = CATEGORY_COLORS[circle.categoryName] ?? DEFAULT_GRADIENT;
              const isLeader = circle.myRole === 'LEADER';

              return (
                <div
                  key={circle.circleId}
                  style={{
                    display: 'flex', alignItems: 'stretch', gap: 0,
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
                      {/* 상단: 역할 뱃지 + 카테고리 + 상태 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                          backgroundColor: isLeader ? '#eaf4f0' : '#f3f4f6',
                          color: isLeader ? '#5f8f7b' : '#6b7280',
                        }}>
                          {isLeader ? '리더' : '멤버'}
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
                      <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                        {isLeader && (
                          <button
                            onClick={() => navigate(`/circle/${circle.circleId}/manage`)}
                            style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', backgroundColor: '#5f8f7b', color: 'white', border: 'none' }}
                          >
                            관리하기
                          </button>
                        )}
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
