import { useState, useEffect, useRef, useCallback } from 'react';
import { chatApi } from '../api/chatApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuthStore } from '../store/authStore';
import { notificationApi } from '../api/notificationApi';
import type { ChatRoomSummary, ChatMessage } from '../types/chat';
import type { Notification } from '../types/notification';

export default function ChatPopupPage() {
  const { userId } = useAuthStore();
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unreadNoti = notifications.filter((n) => !n.isRead).length;

  const loadRooms = useCallback(async () => {
    try { setRooms(await chatApi.getMyRooms()); } catch {}
  }, []);

  const loadNotifications = useCallback(async () => {
    try { setNotifications(await notificationApi.getAll()); } catch {}
  }, []);

  useEffect(() => {
    loadRooms();
    loadNotifications();
    const t = setInterval(() => { loadRooms(); loadNotifications(); }, 30000);
    return () => clearInterval(t);
  }, [loadRooms, loadNotifications]);

  useEffect(() => {
    if (!activeRoomId) return;
    setLoading(true);
    chatApi.getMessages(activeRoomId)
      .then((data) => { setMessages([...data].reverse()); chatApi.markAsRead(activeRoomId).catch(() => {}); })
      .finally(() => setLoading(false));
  }, [activeRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewMessage = useCallback((msg: ChatMessage) => {
    if (msg.roomId === activeRoomId) {
      setMessages((prev) => [...prev, msg]);
      chatApi.markAsRead(msg.roomId).catch(() => {});
    }
    setRooms((prev) => prev.map((r) =>
      r.roomId === msg.roomId
        ? { ...r, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: msg.roomId === activeRoomId ? 0 : r.unreadCount + 1 }
        : r
    ));
  }, [activeRoomId]);

  const { sendMessage } = useWebSocket({ roomId: activeRoomId ?? 0, onMessage: handleNewMessage });

  const handleSend = () => {
    if (!input.trim() || !activeRoomId) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoomId) return;
    try { sendMessage(await chatApi.uploadFile(file)); } catch { alert('업로드 실패'); }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const roomLabel = (r: ChatRoomSummary) =>
    r.roomType === 'GROUP' ? `모임 #${r.circleId}` : `1:1 #${r.roomId}`;

  return (
    <div style={s.root}>
      {/* 타이틀바 */}
      <div style={s.titleBar}>
        <span style={s.title}>💬 MOA 채팅</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ position: 'relative' }}>
            <button style={s.titleBtn} onClick={() => setShowNoti((v) => !v)}>
              🔔{unreadNoti > 0 && <span style={s.badge}>{unreadNoti}</span>}
            </button>
            {showNoti && (
              <div style={s.notiBox}>
                <div style={s.notiHeader}>
                  <span>알림</span>
                  <button style={s.notiReadAll} onClick={async () => {
                    await notificationApi.readAll();
                    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
                  }}>전체 읽음</button>
                </div>
                {notifications.length === 0
                  ? <div style={s.notiEmpty}>알림 없음</div>
                  : notifications.map((n) => (
                    <div key={n.id} style={{ ...s.notiItem, background: n.isRead ? '#f9f9f9' : '#eaf4ff' }}
                      onClick={async () => {
                        if (!n.isRead) {
                          await notificationApi.readOne(n.id);
                          setNotifications((p) => p.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
                        }
                      }}>
                      <span style={{ fontSize: 12 }}>{n.message}</span>
                      <span style={{ fontSize: 10, color: '#aaa' }}>{formatTime(n.createdAt)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={s.body}>
        {/* 왼쪽: 채팅 목록 */}
        <div style={s.sidebar}>
          {rooms.length === 0
            ? <div style={s.empty}>채팅방 없음</div>
            : rooms.map((r) => (
              <div key={r.roomId}
                style={{ ...s.roomItem, background: r.roomId === activeRoomId ? '#e3f2fd' : 'transparent' }}
                onClick={() => setActiveRoomId(r.roomId)}>
                <div style={{ fontSize: 20 }}>{r.roomType === 'GROUP' ? '👥' : '👤'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.roomRow}>
                    <span style={s.roomName}>{roomLabel(r)}</span>
                    <span style={s.roomTime}>{formatTime(r.lastMessageAt)}</span>
                  </div>
                  <div style={s.roomRow}>
                    <span style={s.roomLast}>{r.lastMessage ?? ''}</span>
                    {r.unreadCount > 0 && <span style={s.unread}>{r.unreadCount}</span>}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* 오른쪽: 채팅 */}
        <div style={s.chat}>
          {!activeRoomId ? (
            <div style={s.placeholder}>채팅방을 선택하세요</div>
          ) : loading ? (
            <div style={s.placeholder}>불러오는 중...</div>
          ) : (
            <>
              <div style={s.msgArea}>
                {messages.map((msg) => {
                  const mine = msg.senderId === userId;
                  return (
                    <div key={msg.messageId} style={{ ...s.msgRow, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '65%' }}>
                        {!mine && <span style={s.nick}>#{msg.senderId}</span>}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexDirection: mine ? 'row-reverse' : 'row' }}>
                          <div style={{ ...s.bubble, background: msg.isDeleted ? '#e0e0e0' : mine ? '#1976d2' : '#f0f0f0', color: msg.isDeleted ? '#999' : mine ? '#fff' : '#333' }}>
                            {msg.isDeleted ? '삭제된 메시지' : msg.content}
                          </div>
                          <span style={s.time}>{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div style={s.inputArea}>
                <button onClick={() => fileInputRef.current?.click()} style={s.iconBtn}>📎</button>
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
                <input
                  style={s.textInput}
                  placeholder="메시지 입력..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <button onClick={handleSend} style={s.sendBtn} disabled={!input.trim()}>전송</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden' },
  titleBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', height: 44, background: '#1976d2', flexShrink: 0 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  titleBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, padding: '4px 6px', position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -2, background: '#e53935', color: '#fff', borderRadius: '50%', fontSize: 9, padding: '1px 4px', fontWeight: 'bold' },
  notiBox: { position: 'absolute', right: 0, top: 36, width: 260, maxHeight: 300, overflowY: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 1000 },
  notiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: 12 },
  notiReadAll: { background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: 11 },
  notiEmpty: { padding: 14, textAlign: 'center', color: '#aaa', fontSize: 12 },
  notiItem: { padding: '8px 12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: 180, borderRight: '1px solid #eee', overflowY: 'auto', flexShrink: 0 },
  empty: { padding: 16, textAlign: 'center', color: '#aaa', fontSize: 12 },
  roomItem: { display: 'flex', alignItems: 'center', padding: '10px 10px', cursor: 'pointer', gap: 8, borderBottom: '1px solid #f5f5f5' },
  roomRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { fontSize: 12, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  roomTime: { fontSize: 10, color: '#aaa', flexShrink: 0, marginLeft: 2 },
  roomLast: { fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unread: { background: '#e53935', color: '#fff', borderRadius: 10, fontSize: 10, padding: '1px 5px', fontWeight: 'bold', flexShrink: 0 },
  chat: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  placeholder: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#bbb', fontSize: 13 },
  msgArea: { flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7, background: '#f5f5f5' },
  msgRow: { display: 'flex', alignItems: 'flex-end' },
  nick: { fontSize: 10, color: '#888', marginBottom: 2, marginLeft: 3 },
  bubble: { padding: '7px 11px', borderRadius: 14, fontSize: 13, lineHeight: 1.4, wordBreak: 'break-word', maxWidth: 200 },
  time: { fontSize: 10, color: '#aaa', flexShrink: 0 },
  inputArea: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderTop: '1px solid #eee', background: '#fff', flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', fontSize: 17, cursor: 'pointer' },
  textInput: { flex: 1, padding: '7px 11px', border: '1px solid #ddd', borderRadius: 18, fontSize: 13, outline: 'none' },
  sendBtn: { background: '#1976d2', color: '#fff', border: 'none', borderRadius: 14, padding: '7px 13px', fontWeight: 'bold', cursor: 'pointer', fontSize: 12 },
};
