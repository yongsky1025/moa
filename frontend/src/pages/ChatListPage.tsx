import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../api/chatApi';
import type { ChatRoomSummary } from '../types/chat';

export default function ChatListPage() {
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await chatApi.getMyRooms();
      setRooms(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
    return room.roomType === 'GROUP' ? `모임 채팅 #${room.circleId}` : `1:1 채팅 #${room.roomId}`;
  };

  if (loading) return <div style={styles.center}>불러오는 중...</div>;

  return (
    <div style={styles.container}>
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
          >
            <div style={styles.avatar}>
              {room.roomType === 'GROUP' ? '👥' : '👤'}
            </div>
            <div style={styles.info}>
              <div style={styles.row}>
                <span style={styles.name}>{roomLabel(room)}</span>
                <span style={styles.time}>{formatTime(room.lastMessageAt)}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.last}>{room.lastMessage ?? '메시지 없음'}</span>
                {room.unreadCount > 0 && (
                  <span style={styles.badge}>{room.unreadCount}</span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { height: '100%', overflowY: 'auto', background: '#fff' },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
  },
  title: { margin: 0, fontSize: 18, fontWeight: 'bold' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' },
  empty: { textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    gap: 14,
  },
  avatar: { fontSize: 28, flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: 'bold', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  time: { fontSize: 12, color: '#999', flexShrink: 0, marginLeft: 8 },
  last: { fontSize: 13, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: {
    background: '#e53935',
    color: '#fff',
    borderRadius: 12,
    fontSize: 11,
    padding: '2px 7px',
    fontWeight: 'bold',
    flexShrink: 0,
    marginLeft: 8,
  },
};
