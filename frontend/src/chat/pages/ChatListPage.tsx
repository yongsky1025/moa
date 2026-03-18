import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../../api/chatApi';
import type { ChatRoomSummary } from '../types/chat';

export default function ChatListPage() {
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; room: ChatRoomSummary } | null>(null);
  const [renaming, setRenaming] = useState<{ roomId: number; value: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await chatApi.getMyRooms();
      setRooms(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setContextMenu(null); };
    document.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, room: ChatRoomSummary) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, room });
  };

  const handleRename = async () => {
    if (!renaming || !renaming.value.trim()) return;
    try {
      await chatApi.updateRoomName(renaming.roomId, renaming.value.trim());
      await load();
    } catch {
      alert('이름 변경 실패');
    } finally {
      setRenaming(null);
    }
  };

  const handleLeave = async (roomId: number) => {
    if (!confirm('채팅방을 나가시겠습니까?')) return;
    try {
      await chatApi.leaveRoom(roomId);
      await load();
    } catch {
      alert('나가기 실패');
    }
    setContextMenu(null);
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const roomLabel = (room: ChatRoomSummary) => {
    if (room.name) return room.name;
    return room.roomType === 'GROUP' ? `모임 채팅 #${room.circleId}` : `1:1 채팅 #${room.roomId}`;
  };

  if (loading) return <div style={styles.center}>불러오는 중...</div>;

  return (
    <div style={styles.container} onClick={() => setContextMenu(null)}>
      <div style={styles.header}>
        <h3 style={styles.title}>채팅 목록</h3>
      </div>

      {rooms.length === 0 ? (
        <div style={styles.empty}>참여 중인 채팅방이 없습니다.</div>
      ) : (
        rooms.map((room) => (
          <div
            key={room.roomId}
            style={styles.item}
            onClick={() => navigate(`/chat/room/${room.roomId}`)}
            onContextMenu={(e) => handleContextMenu(e, room)}
          >
            <div style={styles.avatar}>{room.roomType === 'GROUP' ? '👥' : '👤'}</div>
            <div style={styles.info}>
              <div style={styles.row}>
                <span style={styles.name}>{roomLabel(room)}</span>
                <span style={styles.time}>{formatTime(room.lastMessageAt)}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.last}>{room.lastMessage ?? '메시지 없음'}</span>
                {room.unreadCount > 0 && <span style={styles.badge}>{room.unreadCount}</span>}
              </div>
            </div>
          </div>
        ))
      )}

      {/* 우클릭 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ ...styles.ctxMenu, top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.room.roomType === 'GROUP' && (
            <button
              style={styles.ctxItem}
              onClick={() => {
                setRenaming({ roomId: contextMenu.room.roomId, value: roomLabel(contextMenu.room) });
                setContextMenu(null);
              }}
            >
              ✏️ 방 이름 변경
            </button>
          )}
          <button
            style={{ ...styles.ctxItem, color: '#c62828' }}
            onClick={() => handleLeave(contextMenu.room.roomId)}
          >
            🚪 채팅방 나가기
          </button>
        </div>
      )}

      {/* 이름 변경 모달 */}
      {renaming && (
        <div style={styles.modalOverlay} onClick={() => setRenaming(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>방 이름 변경</div>
            <input
              style={styles.modalInput}
              value={renaming.value}
              onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(null); }}
              autoFocus
              maxLength={50}
            />
            <div style={styles.modalBtns}>
              <button style={styles.modalCancel} onClick={() => setRenaming(null)}>취소</button>
              <button style={styles.modalConfirm} onClick={handleRename}>변경</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { height: '100%', overflowY: 'auto', background: '#fdf0e8', position: 'relative' },
  header: { padding: '16px 20px', borderBottom: '1px solid #f2e8e0', background: '#fff' },
  title: { margin: 0, fontSize: 18, fontWeight: 'bold', color: '#262626' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' },
  empty: { textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 },
  item: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f2e8e0', cursor: 'pointer', gap: 14, background: '#fff' },
  avatar: { fontSize: 28, flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: 'bold', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#262626' },
  time: { fontSize: 12, color: '#999', flexShrink: 0, marginLeft: 8 },
  last: { fontSize: 13, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: { background: '#d07856', color: '#fff', borderRadius: 12, fontSize: 11, padding: '2px 7px', fontWeight: 'bold', flexShrink: 0, marginLeft: 8 },
  // 컨텍스트 메뉴
  ctxMenu: { position: 'fixed', background: '#fff', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 9999, minWidth: 160, border: '1px solid #f2e8e0', overflow: 'hidden' },
  ctxItem: { display: 'block', width: '100%', padding: '11px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#262626' },
  // 모달
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 },
  modal: { background: '#fff', borderRadius: 14, padding: '24px 24px 20px', width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  modalTitle: { fontWeight: 'bold', fontSize: 15, color: '#262626', marginBottom: 14 },
  modalInput: { width: '100%', padding: '10px 14px', border: '1px solid #d07856', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' },
  modalCancel: { padding: '8px 16px', background: '#f2e8e0', color: '#262626', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  modalConfirm: { padding: '8px 16px', background: '#d07856', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' },
};
