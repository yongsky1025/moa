import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { circleApi } from '../../api/circleApi';
import { getErrorMessage } from '../../common/utils/errorMessage';
import { useDirectChat } from '../../chat/hooks/useDirectChat';
import type { CircleMember } from '../types/circle';

export default function CircleMembersPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeMembers, setActiveMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [profileModal, setProfileModal] = useState<CircleMember | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await circleApi.getActiveMembers(cid, { size: 200 });
      setActiveMembers(res.data.dtoList);
    } catch (e) {
      setMsg(`오류: ${getErrorMessage(e)}`);
    } finally {
      setLoading(false);
    }
  }, [cid]);

  useEffect(() => { loadData(); }, [loadData]);

  const { startDirectChat, directChatError, clearDirectChatError } = useDirectChat();

  const nickColor = (nickname: string) => `hsl(${[...nickname].reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 55%, 55%)`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      {profileModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => { setProfileModal(null); clearDirectChatError(); }}
        >
          <div
            style={{ background: '#fff', borderRadius: 20, width: 300, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: nickColor(profileModal.nickname), height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: nickColor(profileModal.nickname), border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: -36 }}>
                {profileModal.nickname.charAt(0)}
              </div>
            </div>
            <div style={{ paddingTop: 44, paddingBottom: 24, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>{profileModal.nickname}</div>
              {profileModal.role === 'LEADER' && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: 4, marginTop: 6, display: 'inline-block' }}>리더</span>
              )}
            </div>
            {directChatError && (
              <div style={{ margin: '0 24px 12px', padding: '10px 14px', background: '#fff3f3', border: '1px solid #f5c6c6', borderRadius: 8, fontSize: 13, color: '#c62828', textAlign: 'center' }}>
                {directChatError}
              </div>
            )}
            <div style={{ borderTop: '1px solid #f0f0f0', padding: '14px 24px' }}>
              <button
                style={{ width: '100%', padding: '12px 0', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                onClick={() => startDirectChat(profileModal.userId)}
              >
                💬 1:1 채팅하기
              </button>
            </div>
          </div>
        </div>
      )}
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
          <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={sectionTitleStyle}>멤버 ({activeMembers.length}명)</h2>
            {activeMembers.length === 0 ? (
              <p style={{ fontSize: 13, color: '#aaa' }}>멤버가 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activeMembers.map(m => (
                  <div key={m.circleMemberId} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0', borderBottom: '1px solid #f5f5f5',
                  }}>
                    <div
                      onClick={() => { if (m.nickname !== user?.nickname) setProfileModal(m); }}
                      style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: nickColor(m.nickname),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: m.nickname !== user?.nickname ? 'pointer' : 'default',
                        fontSize: 16, fontWeight: 700, color: '#fff',
                      }}>
                      {m.nickname.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{m.nickname}</span>
                        {m.role === 'LEADER' && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#D07856', backgroundColor: '#FDF0E8', padding: '2px 6px', borderRadius: 4 }}>
                            리더
                          </span>
                        )}
                        {m.nickname === user?.nickname && (
                          <span style={{ fontSize: 11, color: '#aaa' }}>나</span>
                        )}
                      </div>
                      {m.statusMessage && (
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.statusMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
