import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users } from 'lucide-react';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { circleApi } from '../../api/circleApi';
import { getErrorMessage } from '../../common/utils/errorMessage';
import type { CircleResponse, CircleMember } from '../types/circle';
import type { RootState } from '../../users/reducers/store';

const STATUS_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  OPEN:     { text: '모집중',   color: '#16a34a', bg: '#dcfce7' },
  FULL:     { text: '정원마감', color: '#dc2626', bg: '#fee2e2' },
  PENDING:  { text: '승인대기', color: '#d97706', bg: '#fef3c7' },
  REJECTED: { text: '거절됨',  color: '#6b7280', bg: '#f3f4f6' },
};


export default function CircleDetailPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const navigate = useNavigate();

  // circleId가 유효하지 않으면 목록으로
  if (!circleId || isNaN(cid)) {
    navigate('/circle', { replace: true });
    return null;
  }
  const { user, isLoggedIn } = useSelector((s: RootState) => s.auth);

  const [circle, setCircle] = useState<CircleResponse | null>(null);
  const [activeMembers, setActiveMembers] = useState<CircleMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<CircleMember[]>([]);
  const [myMember, setMyMember] = useState<CircleMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [circleRes, activeMembersRes] = await Promise.all([
        circleApi.getCircle(cid),
        circleApi.getActiveMembers(cid, { size: 100 }),
      ]);
      setCircle(circleRes.data);
      const actives = activeMembersRes.data.dtoList;
      setActiveMembers(actives);

      // 현재 로그인 유저의 멤버 정보 확인
      if (user) {
        const me = actives.find(m => m.nickname === user.nickname) ?? null;
        setMyMember(me);

        // 리더인 경우 가입 대기 멤버도 로드
        if (me?.role === 'LEADER') {
          try {
            const pendingRes = await circleApi.getMembers(cid, { status: 'PENDING', size: 100 });
            setPendingMembers(pendingRes.data.dtoList);
          } catch {
            // 리더 아니면 403, 무시
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [cid, user]);

  useEffect(() => { loadData(); }, [loadData]);

  const action = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      setMsg(successMsg);
      await loadData();
    } catch (e) {
      setMsg(`오류: ${getErrorMessage(e)}`);
    }
  };

  const handleJoin = () => action(() => circleApi.joinCircle(cid), '가입 신청이 완료됐습니다. 리더의 승인을 기다려주세요.');
  const handleLeave = () => {
    if (!confirm('서클에서 탈퇴하시겠습니까?')) return;
    action(() => circleApi.leaveCircle(cid), '탈퇴했습니다.');
  };
  const handleDelete = () => {
    if (!confirm('서클을 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    action(async () => { await circleApi.deleteCircle(cid); navigate('/circle'); }, '삭제됐습니다.');
  };
  const handleApprove = (memberId: number) =>
    action(() => circleApi.updateMemberStatus(cid, memberId, 'ACTIVE'), '승인했습니다.');
  const handleReject = (memberId: number) =>
    action(() => circleApi.updateMemberStatus(cid, memberId, 'REJECTED'), '거절했습니다.');
  const handleKick = (memberId: number, nickname: string) => {
    if (!confirm(`${nickname}님을 강퇴하시겠습니까?`)) return;
    action(() => circleApi.kickMember(cid, memberId), '강퇴했습니다.');
  };
  const handleDelegate = (memberId: number, nickname: string) => {
    if (!confirm(`${nickname}님에게 리더를 위임하시겠습니까?`)) return;
    action(() => circleApi.delegateLeader(cid, memberId), '리더를 위임했습니다.');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <p style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>로딩 중...</p>
      <Footer />
    </div>
  );

  if (!circle) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <p style={{ textAlign: 'center', padding: '80px 0', color: '#dc2626' }}>서클을 찾을 수 없습니다.</p>
      <Footer />
    </div>
  );

  const statusInfo = STATUS_LABEL[circle.status] ?? { text: circle.status, color: '#888', bg: '#f3f4f6' };
  const isLeader = myMember?.role === 'LEADER';
  const isMember = !!myMember;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* 피드백 메시지 */}
        {msg && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13,
            backgroundColor: msg.startsWith('오류') ? '#fef2f2' : '#f0fdf4',
            color: msg.startsWith('오류') ? '#dc2626' : '#16a34a',
          }}>
            {msg}
          </div>
        )}

        {/* 서클 헤더 카드 */}
        <div style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          {/* 대표 이미지 */}
          {circle.coverImageUrl && (
            <img
              src={circle.coverImageUrl}
              alt={circle.name}
              style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
            />
          )}
          <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, backgroundColor: '#f3f4f6', color: '#555' }}>
                  {circle.categoryName}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                  {statusInfo.text}
                </span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 8 }}>{circle.name}</h1>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>{circle.description || '소개글이 없습니다.'}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: '#333', justifyContent: 'flex-end' }}>
                <Users size={16} />
                <strong>{circle.currentMember}</strong>
                <span style={{ color: '#aaa' }}>/ {circle.maxMember}명</span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* 일정 보기 (활성 멤버만) */}
            {isMember && (
              <Link to={`/circle/${cid}/schedules`} style={{
                padding: '9px 20px', borderRadius: 8, backgroundColor: '#111', color: 'white',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
                일정 보기
              </Link>
            )}

            {/* 리더 전용 */}
            {isLeader && (
              <>
                <button onClick={() => navigate(`/circle/${cid}/edit`)} style={outlineBtnStyle}>
                  서클 수정
                </button>
                <button onClick={handleDelete} style={{ ...outlineBtnStyle, color: '#dc2626', borderColor: '#fca5a5' }}>
                  서클 삭제
                </button>
              </>
            )}

            {/* 일반 멤버 탈퇴 */}
            {isMember && !isLeader && (
              <button onClick={handleLeave} style={{ ...outlineBtnStyle, color: '#dc2626', borderColor: '#fca5a5' }}>
                탈퇴
              </button>
            )}

            {/* 비회원 가입 신청 */}
            {isLoggedIn && !isMember && circle.status === 'OPEN' && (
              <button onClick={handleJoin} style={{
                padding: '9px 20px', borderRadius: 8, backgroundColor: '#111', color: 'white',
                fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}>
                가입 신청
              </button>
            )}
            {!isLoggedIn && circle.status === 'OPEN' && (
              <button onClick={() => navigate('/user/login')} style={{
                padding: '9px 20px', borderRadius: 8, backgroundColor: '#111', color: 'white',
                fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}>
                로그인 후 가입 신청
              </button>
            )}
          </div>
          </div>
        </div>

        {/* 리더 전용: 가입 대기 멤버 */}
        {isLeader && pendingMembers.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            <h2 style={sectionTitleStyle}>가입 대기 ({pendingMembers.length}명)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingMembers.map(m => (
                <div key={m.circleMemberId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{m.nickname}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleApprove(m.circleMemberId)}
                      style={{ ...smallBtnStyle, background: '#16a34a', color: 'white', border: 'none' }}>
                      승인
                    </button>
                    <button onClick={() => handleReject(m.circleMemberId)}
                      style={{ ...smallBtnStyle, background: 'white', color: '#dc2626', border: '1px solid #fca5a5' }}>
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 활성 멤버 목록 */}
        <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={sectionTitleStyle}>멤버 ({activeMembers.length}명)</h2>
          {activeMembers.length === 0 ? (
            <p style={{ fontSize: 13, color: '#aaa' }}>멤버가 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {activeMembers.map(m => (
                <div key={m.circleMemberId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: '1px solid #f5f5f5',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      backgroundColor: m.role === 'LEADER' ? '#111' : '#e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={m.role === 'LEADER' ? 'white' : '#6b7280'}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{m.nickname}</span>
                      {m.role === 'LEADER' && (
                        <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: '#d97706', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: 4 }}>
                          리더
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 리더 전용 멤버 관리 버튼 */}
                  {isLeader && m.role !== 'LEADER' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleDelegate(m.circleMemberId, m.nickname)}
                        style={{ ...smallBtnStyle, background: 'white', color: '#6b7280', border: '1px solid #e5e5e5' }}>
                        리더 위임
                      </button>
                      <button onClick={() => handleKick(m.circleMemberId, m.nickname)}
                        style={{ ...smallBtnStyle, background: 'white', color: '#dc2626', border: '1px solid #fca5a5' }}>
                        강퇴
                      </button>
                    </div>
                  )}

                  {/* 내 계정 표시 */}
                  {m.nickname === user?.nickname && m.role !== 'LEADER' && (
                    <span style={{ fontSize: 12, color: '#aaa' }}>나</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16,
};
const outlineBtnStyle: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 8, border: '1px solid #e5e5e5',
  background: 'white', color: '#333', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const smallBtnStyle: React.CSSProperties = {
  padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
};
