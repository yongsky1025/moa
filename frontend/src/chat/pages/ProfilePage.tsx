import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, type UserProfile } from '../../api/profileApi';

const AVATAR_COLORS = ['#F4A261', '#E76F51', '#2A9D8F', '#457B9D', '#6D6875', '#E9C46A', '#264653'];
const nickColor = (nick: string) => AVATAR_COLORS[(nick?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 닉네임 편집
  const [editingNick, setEditingNick] = useState(false);
  const [nickInput, setNickInput] = useState('');
  const [nickError, setNickError] = useState('');
  const [nickChecking, setNickChecking] = useState(false);

  // 상태 메시지 편집
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState('');

  useEffect(() => {
    profileApi.getMyProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  const openNickEdit = () => {
    setNickInput(profile?.nickname ?? '');
    setNickError('');
    setEditingNick(true);
  };

  const handleNickSave = async () => {
    const trimmed = nickInput.trim();
    if (!trimmed) return;
    if (trimmed === profile?.nickname) { setEditingNick(false); return; }
    if (!/^[가-힣a-zA-Z0-9]{2,10}$/.test(trimmed)) {
      setNickError('2~10자, 공백·특수문자 제외');
      return;
    }
    setNickChecking(true);
    try {
      await profileApi.checkNickname(trimmed);
    } catch {
      setNickError('이미 사용 중인 닉네임입니다.');
      setNickChecking(false);
      return;
    }
    try {
      await profileApi.updateNickname(trimmed);
      setProfile((p) => p ? { ...p, nickname: trimmed } : p);
      setEditingNick(false);
    } catch {
      setNickError('저장에 실패했습니다.');
    } finally {
      setNickChecking(false);
    }
  };

  const openStatusEdit = () => {
    setStatusInput(profile?.statusMessage ?? '');
    setEditingStatus(true);
  };

  const handleStatusSave = async () => {
    const trimmed = statusInput.trim();
    try {
      await profileApi.updateStatusMessage(trimmed);
      setProfile((p) => p ? { ...p, statusMessage: trimmed || null } : p);
      setEditingStatus(false);
    } catch {
      alert('저장에 실패했습니다.');
    }
  };

  if (loading) return <div style={styles.center}>불러오는 중...</div>;
  if (!profile) return <div style={styles.center}>프로필을 불러올 수 없습니다.</div>;

  const avatarBg = nickColor(profile.nickname);

  return (
    <div style={styles.page}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
        <span style={styles.headerTitle}>프로필</span>
        <div style={{ width: 36 }} />
      </div>

      {/* 프로필 카드 (카카오 스타일) */}
      <div style={styles.card}>
        {/* 아바타 */}
        <div style={{ ...styles.avatar, background: avatarBg }}>
          {profile.nickname.charAt(0)}
        </div>

        {/* 닉네임 */}
        {editingNick ? (
          <div style={styles.editRow}>
            <input
              style={styles.editInput}
              value={nickInput}
              onChange={(e) => { setNickInput(e.target.value); setNickError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNickSave(); if (e.key === 'Escape') setEditingNick(false); }}
              maxLength={10}
              autoFocus
            />
            <div style={styles.editBtns}>
              <button style={styles.saveBtn} onClick={handleNickSave} disabled={nickChecking}>확인</button>
              <button style={styles.cancelBtn} onClick={() => setEditingNick(false)}>취소</button>
            </div>
            {nickError && <span style={styles.error}>{nickError}</span>}
          </div>
        ) : (
          <div style={styles.nicknameRow} onClick={openNickEdit}>
            <span style={styles.nickname}>{profile.nickname}</span>
            <span style={styles.editHint}>✏️</span>
          </div>
        )}

        {/* 상태 메시지 */}
        {editingStatus ? (
          <div style={styles.editRow}>
            <input
              style={{ ...styles.editInput, fontSize: 13, color: '#666' }}
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleStatusSave(); if (e.key === 'Escape') setEditingStatus(false); }}
              placeholder="상태 메시지를 입력하세요"
              maxLength={100}
              autoFocus
            />
            <div style={styles.editBtns}>
              <button style={styles.saveBtn} onClick={handleStatusSave}>확인</button>
              <button style={styles.cancelBtn} onClick={() => setEditingStatus(false)}>취소</button>
            </div>
          </div>
        ) : (
          <div style={styles.statusRow} onClick={openStatusEdit}>
            <span style={styles.statusMsg}>
              {profile.statusMessage || '상태 메시지를 설정해보세요'}
            </span>
            <span style={styles.editHint}>✏️</span>
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <div style={styles.infoSection}>
        <div style={styles.infoTitle}>기본 정보</div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>이름</span>
          <span style={styles.infoValue}>{profile.name}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>이메일</span>
          <span style={styles.infoValue}>{profile.email}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>나이</span>
          <span style={styles.infoValue}>{profile.age}세</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>성별</span>
          <span style={styles.infoValue}>{profile.userGender === 'MALE' ? '남성' : '여성'}</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#888' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', height: 52, background: '#fff',
    borderBottom: '1px solid #eee', flexShrink: 0,
  },
  backBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', width: 36 },
  headerTitle: { fontWeight: 'bold', fontSize: 16 },
  card: {
    background: '#fff', margin: '16px', borderRadius: 16,
    padding: '32px 24px 24px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  avatar: {
    width: 80, height: 80, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 'bold', fontSize: 32, marginBottom: 4,
  },
  nicknameRow: {
    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    padding: '4px 8px', borderRadius: 8,
  },
  nickname: { fontWeight: 'bold', fontSize: 20 },
  statusRow: {
    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    padding: '2px 8px', borderRadius: 8,
  },
  statusMsg: { fontSize: 14, color: '#888' },
  editHint: { fontSize: 12, color: '#bbb' },
  editRow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' },
  editInput: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8,
    fontSize: 16, outline: 'none', textAlign: 'center', width: '80%',
  },
  editBtns: { display: 'flex', gap: 8 },
  saveBtn: {
    padding: '6px 18px', background: '#1976d2', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
  },
  cancelBtn: {
    padding: '6px 18px', background: '#eee', color: '#555',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
  },
  error: { fontSize: 12, color: '#e53935' },
  infoSection: {
    background: '#fff', margin: '0 16px 16px', borderRadius: 16,
    padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  infoTitle: { fontWeight: 'bold', fontSize: 13, color: '#999', marginBottom: 12 },
  infoItem: {
    display: 'flex', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid #f5f5f5',
  },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 14, fontWeight: 500 },
};
