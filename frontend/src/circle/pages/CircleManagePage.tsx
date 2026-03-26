import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Settings, Trash2, Users, Calendar } from 'lucide-react';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { circleApi } from '../../api/circleApi';
import { scheduleApi } from '../../api/scheduleApi';
import { getErrorMessage } from '../../common/utils/errorMessage';
import type { CircleResponse, CircleMember } from '../types/circle';
import type { ScheduleResponse } from '../../schedule/types/schedule';

type Menu = 'edit' | 'delete' | 'members' | 'schedules';

const MENU_ITEMS: { key: Menu; label: string; icon: React.ReactNode }[] = [
  { key: 'edit',      label: '서클 수정',  icon: <Settings size={16} /> },
  { key: 'delete',    label: '서클 삭제',  icon: <Trash2 size={16} /> },
  { key: 'members',   label: '멤버 관리',  icon: <Users size={16} /> },
  { key: 'schedules', label: '일정 관리',  icon: <Calendar size={16} /> },
];

export default function CircleManagePage() {
  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeMenu, setActiveMenu] = useState<Menu>('edit');
  const [circle, setCircle] = useState<CircleResponse | null>(null);
  const [activeMembers, setActiveMembers] = useState<CircleMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<CircleMember[]>([]);
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // 서클 수정 폼
  const [editForm, setEditForm] = useState({ name: '', description: '', maxMember: 10 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [circleRes, membersRes, schedulesRes] = await Promise.all([
        circleApi.getCircle(cid),
        circleApi.getActiveMembers(cid, { size: 200 }),
        scheduleApi.getSchedules(cid),
      ]);
      const c = circleRes.data;
      setCircle(c);
      setEditForm({ name: c.name, description: c.description ?? '', maxMember: c.maxMember });
      setActiveMembers(membersRes.data.dtoList);
      setSchedules(schedulesRes.data);

      try {
        const pendingRes = await circleApi.getMembers(cid, { status: 'PENDING', size: 100 });
        setPendingMembers(pendingRes.data.dtoList);
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [cid]);

  useEffect(() => {
    if (!circleId || isNaN(cid)) { navigate('/circle', { replace: true }); return; }
    loadData();
  }, [loadData]);

  // 리더 아닌 경우 접근 차단
  useEffect(() => {
    if (!loading && activeMembers.length > 0 && user) {
      const me = activeMembers.find(m => m.nickname === user.nickname);
      if (!me || me.role !== 'LEADER') {
        navigate(`/circle/${cid}`, { replace: true });
      }
    }
  }, [loading, activeMembers, user]);

  const action = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      setMsg(successMsg);
      await loadData();
    } catch (e) {
      setMsg(`오류: ${getErrorMessage(e)}`);
    }
  };

  // 서클 수정
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setMsg('');
    try {
      await circleApi.updateCircle(cid, {
        name: editForm.name,
        description: editForm.description,
        maxMember: editForm.maxMember,
      });
      if (imageFile) await circleApi.uploadCoverImage(cid, imageFile);
      setMsg('서클 정보가 수정됐습니다.');
      await loadData();
    } catch (e) {
      setMsg(`오류: ${getErrorMessage(e)}`);
    } finally {
      setEditLoading(false);
    }
  };

  // 서클 삭제
  const handleDelete = () => {
    if (!confirm('서클을 삭제하시겠습니까? 모든 데이터가 사라지며 복구할 수 없습니다.')) return;
    action(async () => { await circleApi.deleteCircle(cid); navigate('/circle'); }, '삭제됐습니다.');
  };

  // 멤버 관련
  const handleApprove = (id: number) => action(() => circleApi.updateMemberStatus(cid, id, 'ACTIVE'), '승인했습니다.');
  const handleRejectMember = (id: number) => action(() => circleApi.updateMemberStatus(cid, id, 'REJECTED'), '거절했습니다.');
  const handleKick = (id: number, nickname: string) => {
    if (!confirm(`${nickname}님을 강퇴하시겠습니까?`)) return;
    action(() => circleApi.kickMember(cid, id), '강퇴했습니다.');
  };
  const handleDelegate = (id: number, nickname: string) => {
    if (!confirm(`${nickname}님에게 리더를 위임하시겠습니까?`)) return;
    action(() => circleApi.delegateLeader(cid, id), '리더를 위임했습니다.');
  };

  // 일정 삭제
  const handleDeleteSchedule = (sid: number, title: string) => {
    if (!confirm(`"${title}" 일정을 삭제하시겠습니까?`)) return;
    action(() => scheduleApi.deleteSchedule(cid, sid), '일정이 삭제됐습니다.');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <p style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>로딩 중...</p>
      <Footer />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* 상단 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate(`/circle/${cid}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', padding: 0, marginBottom: 6 }}
          >
            ← 서클로 돌아가기
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>
            {circle?.name} · 관리
          </h1>
        </div>

        {/* 피드백 메시지 */}
        {msg && (
          <div style={{
            marginBottom: 20, padding: '10px 14px', borderRadius: 8, fontSize: 13,
            backgroundColor: msg.startsWith('오류') ? '#fef2f2' : '#f0fdf4',
            color: msg.startsWith('오류') ? '#dc2626' : '#16a34a',
          }}>
            {msg}
          </div>
        )}

        {/* 2컬럼 레이아웃 */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* 왼쪽 사이드바 */}
          <aside style={{ width: 200, flexShrink: 0 }}>
            <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              {MENU_ITEMS.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setActiveMenu(item.key); setMsg(''); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: activeMenu === item.key ? 700 : 400,
                    backgroundColor: activeMenu === item.key ? '#f5f5f5' : 'transparent',
                    color: item.key === 'delete'
                      ? (activeMenu === item.key ? '#dc2626' : '#dc2626')
                      : (activeMenu === item.key ? '#111' : '#555'),
                    textAlign: 'left',
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          {/* 오른쪽 컨텐츠 */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ── 서클 수정 ── */}
            {activeMenu === 'edit' && (
              <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h2 style={panelTitleStyle}>서클 수정</h2>
                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={labelStyle}>서클 이름 <span style={{ color: '#aaa', fontWeight: 400 }}>(최대 20자)</span></label>
                    <input
                      type="text"
                      value={editForm.name}
                      maxLength={20}
                      onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>소개 <span style={{ color: '#aaa', fontWeight: 400 }}>(최대 255자)</span></label>
                    <textarea
                      value={editForm.description}
                      maxLength={255}
                      rows={4}
                      onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>최대 인원 <span style={{ color: '#aaa', fontWeight: 400 }}>(최소 {Math.max(10, circle?.currentMember ?? 1)}명)</span></label>
                    <input
                      type="number"
                      value={editForm.maxMember}
                      min={Math.max(10, circle?.currentMember ?? 1)}
                      max={250}
                      onChange={e => setEditForm(p => ({ ...p, maxMember: Number(e.target.value) }))}
                      style={{ ...inputStyle, maxWidth: 120 }}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>대표 이미지 <span style={{ color: '#aaa', fontWeight: 400 }}>(선택, 최대 10MB)</span></label>
                    {(previewUrl || circle?.coverImageUrl) && (
                      <img
                        src={previewUrl || circle?.coverImageUrl}
                        alt="미리보기"
                        style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) { setImageFile(f); setPreviewUrl(URL.createObjectURL(f)); }
                      }}
                      style={{ ...inputStyle, padding: '8px 12px', cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button
                      type="submit"
                      disabled={editLoading}
                      style={{ padding: '11px 24px', borderRadius: 8, border: 'none', backgroundColor: '#111', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: editLoading ? 0.6 : 1 }}
                    >
                      {editLoading ? '저장 중...' : '저장하기'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── 서클 삭제 ── */}
            {activeMenu === 'delete' && (
              <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h2 style={{ ...panelTitleStyle, color: '#dc2626' }}>서클 삭제</h2>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: 12, marginBottom: 24, border: '1px solid #fecaca' }}>
                  <p style={{ fontSize: 14, color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>⚠ 주의: 이 작업은 되돌릴 수 없습니다.</p>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                    서클을 삭제하면 모든 멤버 정보, 일정, 관련 데이터가 영구적으로 삭제됩니다.
                  </p>
                </div>
                <div style={{ padding: '16px 20px', backgroundColor: '#f5f5f5', borderRadius: 10, marginBottom: 24 }}>
                  <p style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>삭제할 서클</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{circle?.name}</p>
                  <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>멤버 {circle?.currentMember}명 · 최대 {circle?.maxMember}명</p>
                </div>
                <button
                  onClick={handleDelete}
                  style={{ padding: '11px 24px', borderRadius: 8, border: 'none', backgroundColor: '#dc2626', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  서클 영구 삭제
                </button>
              </div>
            )}

            {/* ── 멤버 관리 ── */}
            {activeMenu === 'members' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* 가입 대기 */}
                <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <h2 style={panelTitleStyle}>가입 대기 ({pendingMembers.length}명)</h2>
                  {pendingMembers.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#aaa' }}>대기 중인 신청이 없습니다.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {pendingMembers.map(m => (
                        <div key={m.circleMemberId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                              </svg>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{m.nickname}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleApprove(m.circleMemberId)}
                              style={{ ...smallBtnStyle, backgroundColor: '#16a34a', color: 'white', border: 'none' }}>
                              승인
                            </button>
                            <button onClick={() => handleRejectMember(m.circleMemberId)}
                              style={{ ...smallBtnStyle, backgroundColor: 'white', color: '#dc2626', border: '1px solid #fca5a5' }}>
                              거절
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 활성 멤버 */}
                <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <h2 style={panelTitleStyle}>활성 멤버 ({activeMembers.length}명)</h2>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {activeMembers.map(m => (
                      <div key={m.circleMemberId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
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
                            {m.nickname === user?.nickname && m.role !== 'LEADER' && (
                              <span style={{ marginLeft: 6, fontSize: 11, color: '#aaa' }}>나</span>
                            )}
                          </div>
                        </div>
                        {m.role !== 'LEADER' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleDelegate(m.circleMemberId, m.nickname)}
                              style={{ ...smallBtnStyle, backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e5e5' }}>
                              리더 위임
                            </button>
                            <button onClick={() => handleKick(m.circleMemberId, m.nickname)}
                              style={{ ...smallBtnStyle, backgroundColor: 'white', color: '#dc2626', border: '1px solid #fca5a5' }}>
                              강퇴
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 일정 관리 ── */}
            {activeMenu === 'schedules' && (
              <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ ...panelTitleStyle, marginBottom: 0 }}>일정 관리</h2>
                  <button
                    onClick={() => navigate(`/circle/${cid}/schedules/create`)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: '#111', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    + 일정 만들기
                  </button>
                </div>
                {schedules.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', padding: '40px 0' }}>일정이 없습니다.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {schedules.map(s => (
                      <div key={s.scheduleId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f5f5f5', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.title}
                          </p>
                          <p style={{ fontSize: 12, color: '#888' }}>
                            {new Date(s.startAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {' · '}최대 {s.maxMember}명
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => navigate(`/circle/${cid}/schedules/${s.scheduleId}/edit`)}
                            style={{ ...smallBtnStyle, backgroundColor: 'white', color: '#333', border: '1px solid #e5e5e5' }}
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(s.scheduleId, s.title)}
                            style={{ ...smallBtnStyle, backgroundColor: 'white', color: '#dc2626', border: '1px solid #fca5a5' }}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const panelTitleStyle: React.CSSProperties = {
  fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 20,
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8,
  fontSize: 14, color: '#111', boxSizing: 'border-box', outline: 'none',
};
const smallBtnStyle: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
};
