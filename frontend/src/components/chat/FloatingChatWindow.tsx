import { useState, useRef, useCallback, useEffect } from 'react';
import { chatApi } from '../../api/chatApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuthStore } from '../../store/authStore';
import { notificationApi } from '../../api/notificationApi';
import EmojiPicker from './EmojiPicker';
import type { ChatRoomSummary, ChatMessage } from '../../types/chat';
import type { Notification } from '../../types/notification';

const MIN_W = 520;
const MIN_H = 400;
const INIT_W = 700;
const INIT_H = 520;

export default function FloatingChatWindow() {
  const { userId } = useAuthStore();

  // 창 열림 여부 / 최소화
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // 위치 / 크기
  const [pos, setPos] = useState({ x: window.innerWidth - INIT_W - 40, y: window.innerHeight - INIT_H - 60 });
  const [size, setSize] = useState({ w: INIT_W, h: INIT_H });

  // 채팅 목록 / 선택된 방
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(false);

  // 알림
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const unreadNoti = notifications.filter((n) => !n.isRead).length;

  // 드래그 상태
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // 리사이즈 상태
  const resizing = useRef(false);
  const resizeDir = useRef('');
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });

  // 스크롤
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);

  // 채팅방 목록 로드
  const loadRooms = useCallback(async () => {
    try { setRooms(await chatApi.getMyRooms()); } catch {}
  }, []);

  // 알림 로드
  const loadNotifications = useCallback(async () => {
    try { setNotifications(await notificationApi.getAll()); } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    loadRooms();
    loadNotifications();
    const t = setInterval(() => { loadRooms(); loadNotifications(); }, 30000);
    return () => clearInterval(t);
  }, [open, loadRooms, loadNotifications]);

  // 메시지 로드
  useEffect(() => {
    if (!activeRoomId) return;
    setLoadingMsg(true);
    chatApi.getMessages(activeRoomId)
      .then((data) => { setMessages([...data].reverse()); chatApi.markAsRead(activeRoomId).catch(() => {}); })
      .finally(() => setLoadingMsg(false));
  }, [activeRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 실시간 수신
  const handleNewMessage = useCallback((msg: ChatMessage) => {
    if (msg.roomId === activeRoomId) {
      setMessages((prev) => [...prev, msg]);
      chatApi.markAsRead(msg.roomId).catch(() => {});
    }
    setRooms((prev) =>
      prev.map((r) =>
        r.roomId === msg.roomId
          ? { ...r, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: msg.roomId === activeRoomId ? 0 : r.unreadCount + 1 }
          : r
      )
    );
  }, [activeRoomId]);

  const { sendMessage } = useWebSocket({
    roomId: activeRoomId ?? 0,
    onMessage: handleNewMessage,
  });

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

  // ─── 드래그 ───────────────────────────────────────────
  const onDragMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - size.w, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragOffset.current.y)),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [size.w]);

  // ─── 리사이즈 ──────────────────────────────────────────
  const onResizeMouseDown = (dir: string) => (e: React.MouseEvent) => {
    resizing.current = true;
    resizeDir.current = dir;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h, px: pos.x, py: pos.y };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const { x, y, w, h, px, py } = resizeStart.current;
      const dx = e.clientX - x;
      const dy = e.clientY - y;
      const dir = resizeDir.current;

      let nw = w, nh = h, nx = px, ny = py;

      if (dir.includes('e')) nw = Math.max(MIN_W, w + dx);
      if (dir.includes('s')) nh = Math.max(MIN_H, h + dy);
      if (dir.includes('w')) { nw = Math.max(MIN_W, w - dx); nx = px + (w - nw); }
      if (dir.includes('n')) { nh = Math.max(MIN_H, h - dy); ny = py + (h - nh); }

      setSize({ w: nw, h: nh });
      setPos({ x: nx, y: ny });
    };
    const onUp = () => { resizing.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const roomLabel = (r: ChatRoomSummary) =>
    r.roomType === 'GROUP' ? `모임 #${r.circleId}` : `1:1 채팅 #${r.roomId}`;

  const openPopup = () => {
    window.open(
      '/chat/popup',
      'moa-chat',
      `width=${INIT_W},height=${INIT_H},resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`
    );
  };

  // ─── 렌더 ──────────────────────────────────────────────
  if (!open) {
    return (
      <div style={{ position: 'fixed', bottom: 28, right: 28, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 9998 }}>
        {/* 팝업 창으로 열기 */}
        <button onClick={openPopup} style={{ ...s.fab, background: '#43a047' }} title="별도 창으로 열기 (다른 모니터 이동 가능)">
          ↗
        </button>
        {/* 기존 플로팅 창 */}
        <button onClick={() => setOpen(true)} style={s.fab} title="현재 화면에서 열기">
          💬
          {unreadNoti > 0 && <span style={s.fabBadge}>{unreadNoti}</span>}
        </button>
      </div>
    );
  }

  return (
    <div style={{ ...s.window, left: pos.x, top: pos.y, width: size.w, height: minimized ? 44 : size.h }}>

      {/* 리사이즈 핸들 */}
      {!minimized && <>
        <div style={{ ...s.rHandle, ...s.rN }}  onMouseDown={onResizeMouseDown('n')} />
        <div style={{ ...s.rHandle, ...s.rS }}  onMouseDown={onResizeMouseDown('s')} />
        <div style={{ ...s.rHandle, ...s.rE }}  onMouseDown={onResizeMouseDown('e')} />
        <div style={{ ...s.rHandle, ...s.rW }}  onMouseDown={onResizeMouseDown('w')} />
        <div style={{ ...s.rHandle, ...s.rNE }} onMouseDown={onResizeMouseDown('ne')} />
        <div style={{ ...s.rHandle, ...s.rNW }} onMouseDown={onResizeMouseDown('nw')} />
        <div style={{ ...s.rHandle, ...s.rSE }} onMouseDown={onResizeMouseDown('se')} />
        <div style={{ ...s.rHandle, ...s.rSW }} onMouseDown={onResizeMouseDown('sw')} />
      </>}

      {/* 타이틀바 (드래그 핸들) */}
      <div style={s.titleBar} onMouseDown={onDragMouseDown}>
        <span style={s.title}>💬 MOA 채팅</span>
        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          {/* 알림 버튼 */}
          <div style={{ position: 'relative' }}>
            <button style={s.titleBtn} onClick={() => setShowNoti((v) => !v)}>
              🔔{unreadNoti > 0 && <span style={s.nBadge}>{unreadNoti}</span>}
            </button>
            {showNoti && (
              <div style={s.notiBox}>
                <div style={s.notiHeader}>
                  <span>알림</span>
                  <button style={s.notiReadAll} onClick={async () => { await notificationApi.readAll(); setNotifications((p) => p.map((n) => ({ ...n, isRead: true }))); }}>전체 읽음</button>
                </div>
                {notifications.length === 0
                  ? <div style={s.notiEmpty}>알림 없음</div>
                  : notifications.map((n) => (
                    <div key={n.id} style={{ ...s.notiItem, background: n.isRead ? '#f9f9f9' : '#eaf4ff' }}
                      onClick={async () => { if (!n.isRead) { await notificationApi.readOne(n.id); setNotifications((p) => p.map((x) => x.id === n.id ? { ...x, isRead: true } : x)); } }}>
                      <span style={s.notiMsg}>{n.message}</span>
                      <span style={s.notiTime}>{formatTime(n.createdAt)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <button style={s.titleBtn} onClick={() => setMinimized((v) => !v)}>{minimized ? '▲' : '▼'}</button>
          <button style={s.titleBtn} onClick={() => { setOpen(false); setActiveRoomId(null); }}>✕</button>
        </div>
      </div>

      {!minimized && (
        <div style={s.body}>
          {/* 왼쪽: 채팅 목록 */}
          <div style={s.sidebar}>
            <div style={s.sidebarTitle}>채팅</div>
            {rooms.length === 0
              ? <div style={s.sideEmpty}>채팅방 없음</div>
              : rooms.map((r) => (
                <div key={r.roomId}
                  style={{ ...s.roomItem, background: r.roomId === activeRoomId ? '#e3f2fd' : 'transparent' }}
                  onClick={() => setActiveRoomId(r.roomId)}>
                  <div style={s.roomAvatar}>{r.roomType === 'GROUP' ? '👥' : '👤'}</div>
                  <div style={s.roomInfo}>
                    <div style={s.roomRow}>
                      <span style={s.roomName}>{roomLabel(r)}</span>
                      <span style={s.roomTime}>{formatTime(r.lastMessageAt)}</span>
                    </div>
                    <div style={s.roomRow}>
                      <span style={s.roomLast}>{r.lastMessage ?? ''}</span>
                      {r.unreadCount > 0 && <span style={s.unreadBadge}>{r.unreadCount}</span>}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* 오른쪽: 채팅방 */}
          <div style={s.chatArea}>
            {!activeRoomId ? (
              <div style={s.noRoom}>채팅방을 선택하세요</div>
            ) : loadingMsg ? (
              <div style={s.noRoom}>불러오는 중...</div>
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
                            <div style={{ ...s.bubble, background: msg.isDeleted ? '#e0e0e0' : mine ? '#1976d2' : '#f0f0f0', color: msg.isDeleted ? '#999' : mine ? '#fff' : '#333', fontStyle: msg.isDeleted ? 'italic' : 'normal' }}>
                              {msg.isDeleted ? '삭제된 메시지' : msg.content}
                            </div>
                            <span style={s.msgTime}>{formatTime(msg.createdAt)}</span>
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
                  <button ref={emojiBtnRef} style={s.iconBtn} onClick={() => setShowEmoji((v) => !v)}>😊</button>
                  {showEmoji && (
                    <EmojiPicker
                      anchorRef={emojiBtnRef}
                      onSelect={(emoji) => setInput((prev) => prev + emoji)}
                      onClose={() => setShowEmoji(false)}
                    />
                  )}
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
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  // 플로팅 버튼
  fab: { position: 'fixed', bottom: 28, right: 28, width: 52, height: 52, borderRadius: '50%', background: '#1976d2', color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 9998 },
  fabBadge: { position: 'absolute', top: -4, right: -4, background: '#e53935', color: '#fff', borderRadius: '50%', fontSize: 10, padding: '2px 5px', fontWeight: 'bold' },

  // 창
  window: { position: 'fixed', background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden', userSelect: 'none' },

  // 타이틀바
  titleBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', height: 44, background: '#1976d2', cursor: 'grab', flexShrink: 0 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  titleBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, padding: '4px 6px', borderRadius: 4, position: 'relative' },
  nBadge: { position: 'absolute', top: -2, right: -2, background: '#e53935', color: '#fff', borderRadius: '50%', fontSize: 9, padding: '1px 4px', fontWeight: 'bold' },

  // 알림 드롭다운
  notiBox: { position: 'absolute', right: 0, top: 36, width: 280, maxHeight: 320, overflowY: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10000 },
  notiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: 13 },
  notiReadAll: { background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: 11 },
  notiEmpty: { padding: 16, textAlign: 'center', color: '#aaa', fontSize: 13 },
  notiItem: { padding: '8px 14px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 },
  notiMsg: { fontSize: 12, color: '#333' },
  notiTime: { fontSize: 11, color: '#aaa' },

  // 본문
  body: { display: 'flex', flex: 1, overflow: 'hidden' },

  // 사이드바 (채팅 목록)
  sidebar: { width: 200, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 },
  sidebarTitle: { padding: '12px 14px', fontWeight: 'bold', fontSize: 13, color: '#555', borderBottom: '1px solid #eee' },
  sideEmpty: { padding: 16, textAlign: 'center', color: '#aaa', fontSize: 12 },
  roomItem: { display: 'flex', alignItems: 'center', padding: '10px 12px', cursor: 'pointer', gap: 10, borderBottom: '1px solid #f5f5f5' },
  roomAvatar: { fontSize: 22, flexShrink: 0 },
  roomInfo: { flex: 1, minWidth: 0 },
  roomRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { fontSize: 13, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  roomTime: { fontSize: 10, color: '#aaa', flexShrink: 0, marginLeft: 4 },
  roomLast: { fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unreadBadge: { background: '#e53935', color: '#fff', borderRadius: 12, fontSize: 10, padding: '1px 5px', fontWeight: 'bold', flexShrink: 0 },

  // 채팅 영역
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  noRoom: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#bbb', fontSize: 14 },
  msgArea: { flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, background: '#f5f5f5' },
  msgRow: { display: 'flex', alignItems: 'flex-end' },
  nick: { fontSize: 10, color: '#888', marginBottom: 2, marginLeft: 4 },
  bubble: { padding: '7px 11px', borderRadius: 14, fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word', maxWidth: 200 },
  msgTime: { fontSize: 10, color: '#aaa', flexShrink: 0 },
  inputArea: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderTop: '1px solid #eee', background: '#fff', flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '0 2px' },
  textInput: { flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 20, fontSize: 13, outline: 'none' },
  sendBtn: { background: '#1976d2', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: 12 },

  // 리사이즈 핸들
  rHandle: { position: 'absolute', zIndex: 10001 },
  rN:  { top: 0, left: 8, right: 8, height: 5, cursor: 'n-resize' },
  rS:  { bottom: 0, left: 8, right: 8, height: 5, cursor: 's-resize' },
  rE:  { right: 0, top: 8, bottom: 8, width: 5, cursor: 'e-resize' },
  rW:  { left: 0, top: 8, bottom: 8, width: 5, cursor: 'w-resize' },
  rNE: { top: 0, right: 0, width: 10, height: 10, cursor: 'ne-resize' },
  rNW: { top: 0, left: 0, width: 10, height: 10, cursor: 'nw-resize' },
  rSE: { bottom: 0, right: 0, width: 10, height: 10, cursor: 'se-resize' },
  rSW: { bottom: 0, left: 0, width: 10, height: 10, cursor: 'sw-resize' },
};
