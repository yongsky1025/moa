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

const ROLE_BADGE: Record<string, { text: string; bg: string; color: string }> = {
  LEADER:     { text: '리더',   bg: '#5f8f7b', color: 'white' },
  SUB_LEADER: { text: '부리더', bg: '#4E7C69', color: 'white' },
  MEMBER:     { text: '멤버',   bg: 'rgba(0,0,0,0.45)', color: 'white' },
};

type Tab = 'all' | 'leader' | 'sub_leader' | 'member';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',        label: '전체' },
  { key: 'leader',     label: '내가 리더' },
  { key: 'sub_leader', label: '내가 부리더' },
  { key: 'member',     label: '참여중' },
];

const EMPTY_MSG: Record<Tab, string> = {
  all:        '아직 가입한 모임이 없습니다.',
  leader:     '리더로 있는 모임이 없습니다.',
  sub_leader: '부리더로 있는 모임이 없습니다.',
  member:     '참여 중인 모임이 없습니다.',
};

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
    if (tab === 'leader')     return c.myRole === 'LEADER';
    if (tab === 'sub_leader') return c.myRole === 'SUB_LEADER';
    if (tab === 'member')     return c.myRole === 'MEMBER';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 60px' }}>

        <button
          onClick={() => navigate('/users/profile')}
          style={{ fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, padding: 0 }}
        >
          ← 마이페이지로 돌아가기
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1f2937', marginBottom: 24 }}>가입한 모임</h1>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '2px solid #f0f0f0' }}>
          {TABS.map(({ key, label }) => {
            const count = key === 'all'
              ? circles.length
              : circles.filter(c => c.myRole === key.toUpperCase()).length;
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: '12px 20px', fontSize: 14, fontWeight: active ? 700 : 500,
                  color: active ? '#5f8f7b' : '#888',
                  background: 'none', border: 'none',
                  borderBottom: active ? '2px solid #5f8f7b' : '2px solid transparent',
                  marginBottom: -2, cursor: 'pointer', transition: 'color 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {label}
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                  backgroundColor: active ? '#EAF4F0' : '#f3f4f6',
                  color: active ? '#4E7C69' : '#999',
                }}>
                  {count}
                </span>
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
            <p style={{ fontSize: 15, marginBottom: 12 }}>{EMPTY_MSG[tab]}</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {filtered.map(circle => {
              const statusInfo = STATUS_LABEL[circle.status] ?? { text: circle.status, color: '#888' };
              const bgGradient = CATEGORY_COLORS[circle.categoryName] ?? DEFAULT_GRADIENT;
              const roleBadge = circle.myRole ? ROLE_BADGE[circle.myRole] : null;
              const canManage = circle.myRole === 'LEADER' || circle.myRole === 'SUB_LEADER';

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
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* 이미지 영역 */}
                  <div style={{ position: 'relative', height: 160, background: circle.coverImageUrl ? 'none' : bgGradient, flexShrink: 0 }}>
                    {(circle.coverThumbnailUrl || circle.coverImageUrl) && (
                      <img src={circle.coverThumbnailUrl || circle.coverImageUrl} alt={circle.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    )}

                    {/* 카테고리 (좌상단) */}
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      padding: '3px 8px', borderRadius: 999,
                      backgroundColor: 'rgba(0,0,0,0.55)',
                      fontSize: 11, fontWeight: 700, color: 'white',
                    }}>
                      {circle.categoryName}
                    </div>

                    {/* 상태 (우상단) */}
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      padding: '3px 8px', borderRadius: 999,
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      fontSize: 11, fontWeight: 700, color: statusInfo.color,
                    }}>
                      {statusInfo.text}
                    </div>

                    {/* 역할 뱃지 (좌하단) */}
                    {roleBadge && (
                      <div style={{
                        position: 'absolute', bottom: 8, left: 10,
                        padding: '3px 8px', borderRadius: 999,
                        backgroundColor: roleBadge.bg,
                        fontSize: 11, fontWeight: 700, color: roleBadge.color,
                      }}>
                        {roleBadge.text}
                      </div>
                    )}

                    {/* 좋아요 수 (우하단) */}
                    {(circle.likeCount ?? 0) > 0 && (
                      <div style={{
                        position: 'absolute', bottom: 8, right: 10,
                        display: 'flex', alignItems: 'center', gap: 3,
                        padding: '2px 7px', borderRadius: 999,
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        fontSize: 11, fontWeight: 700, color: 'white',
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#ff8a8a" stroke="#ff8a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {circle.likeCount}
                      </div>
                    )}
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
                      margin: '0 0 10px', fontSize: 12, color: '#6b7280', lineHeight: 1.5, flex: 1,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {circle.description || '소개글이 없습니다.'}
                    </p>

                    {/* 인원 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280', marginBottom: canManage ? 10 : 0 }}>
                      <Users style={{ width: 12, height: 12 }} />
                      {circle.currentMember}/{circle.maxMember}명
                    </div>

                    {/* 관리하기 버튼 (리더/부리더만) */}
                    {canManage && (
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/circle/${circle.circleId}/manage`); }}
                        style={{
                          width: '100%', padding: '7px 0', borderRadius: 8,
                          backgroundColor: '#5f8f7b', color: 'white',
                          border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        관리하기
                      </button>
                    )}
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
