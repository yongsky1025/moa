import { useState, useEffect } from 'react';
import { notificationApi } from '../../api/notificationApi';
import type { Notification } from '../../types/notification';

const typeLabel: Record<string, string> = {
  CHAT_MESSAGE: '새 메시지',
  CIRCLE_JOIN_REQUEST: '가입 신청',
  CIRCLE_JOIN_APPROVED: '가입 승인',
  CIRCLE_JOIN_REJECTED: '가입 거절',
  CIRCLE_KICKED: '강퇴',
  CIRCLE_DISBANDED: '모임 해산',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Notification[]>([]);

  const unread = list.filter((n) => !n.isRead).length;

  const load = async () => {
    try {
      const data = await notificationApi.getAll();
      setList(data);
    } catch {
      // 조용히 실패
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleReadAll = async () => {
    await notificationApi.readAll();
    setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleReadOne = async (id: number) => {
    await notificationApi.readOne(id);
    setList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen((o) => !o)} style={styles.bellBtn}>
        🔔
        {unread > 0 && <span style={styles.badge}>{unread}</span>}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <div style={styles.dropHeader}>
            <span>알림</span>
            {unread > 0 && (
              <button onClick={handleReadAll} style={styles.readAllBtn}>
                전체 읽음
              </button>
            )}
          </div>
          {list.length === 0 ? (
            <div style={styles.empty}>알림이 없습니다</div>
          ) : (
            list.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleReadOne(n.id)}
                style={{
                  ...styles.item,
                  background: n.isRead ? '#f9f9f9' : '#eaf4ff',
                  cursor: n.isRead ? 'default' : 'pointer',
                }}
              >
                <span style={styles.tag}>[{typeLabel[n.type] ?? n.type}]</span>
                <span style={styles.msg}>{n.message}</span>
                <span style={styles.time}>
                  {new Date(n.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bellBtn: {
    background: 'none',
    border: 'none',
    fontSize: 22,
    cursor: 'pointer',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    background: '#e53935',
    color: '#fff',
    borderRadius: '50%',
    fontSize: 11,
    padding: '1px 5px',
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 36,
    width: 300,
    maxHeight: 400,
    overflowY: 'auto',
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    zIndex: 1000,
  },
  dropHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderBottom: '1px solid #eee',
    fontWeight: 'bold',
  },
  readAllBtn: {
    background: 'none',
    border: 'none',
    color: '#1976d2',
    cursor: 'pointer',
    fontSize: 12,
  },
  empty: {
    padding: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
  item: {
    padding: '10px 14px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  tag: { fontSize: 11, color: '#1976d2', fontWeight: 'bold' },
  msg: { fontSize: 13, color: '#333' },
  time: { fontSize: 11, color: '#aaa' },
};
