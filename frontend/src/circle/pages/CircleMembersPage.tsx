import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { circleApi } from '../../api/circleApi';
import { getErrorMessage } from '../../common/utils/errorMessage';
import type { CircleMember } from '../types/circle';
import type { RootState } from '../../users/reducers/store';

export default function CircleMembersPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);

  const [activeMembers, setActiveMembers] = useState<CircleMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<CircleMember[]>([]);
  const [myMember, setMyMember] = useState<CircleMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await circleApi.getActiveMembers(cid, { size: 200 });
      const actives = res.data.dtoList;
      setActiveMembers(actives);

      if (user) {
        const me = actives.find(m => m.nickname === user.nickname) ?? null;
        setMyMember(me);

        if (me?.role === 'LEADER') {
          try {
            const pendingRes = await circleApi.getMembers(cid, { status: 'PENDING', size: 100 });
            setPendingMembers(pendingRes.data.dtoList);
          } catch {}
        }
      }
    } catch (e) {
      setMsg(`오류: ${getErrorMessage(e)}`);
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

  const isLeader = myMember?.role === 'LEADER';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 60px' }}>

        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate(`/circle/${cid}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', marginBottom: 6, padding: 0 }}
          >
            ← 서클로 돌아가기
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>멤버 목록</h1>
        </div>

        {msg && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13,
            backgroundColor: msg.startsWith('오류') ? '#fef2f2' : '#f0fdf4',
            color: msg.startsWith('오류') ? '#dc2626' : '#16a34a',
          }}>
            {msg}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>로딩 중...</p>
        ) : (
          <>
            {/* 가입 대기 (리더 전용) */}
            {isLeader && pendingMembers.length > 0 && (
              <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                <h2 style={sectionTitleStyle}>가입 대기 ({pendingMembers.length}명)</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {pendingMembers.map(m => (
                    <div key={m.circleMemberId} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 0', borderBottom: '1px solid #f5f5f5',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                          </svg>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{m.nickname}</span>
                      </div>
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

            {/* 활성 멤버 */}
            <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 style={sectionTitleStyle}>활성 멤버 ({activeMembers.length}명)</h2>
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
                          backgroundColor: m.role === 'LEADER' ? '#D07856' : '#e5e7eb',
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
                            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: '#D07856', backgroundColor: '#FDF0E8', padding: '2px 6px', borderRadius: 4 }}>
                              리더
                            </span>
                          )}
                          {m.nickname === user?.nickname && m.role !== 'LEADER' && (
                            <span style={{ marginLeft: 6, fontSize: 11, color: '#aaa' }}>나</span>
                          )}
                        </div>
                      </div>

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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16,
};
const smallBtnStyle: React.CSSProperties = {
  padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
};
