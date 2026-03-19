import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi } from '../../api/chatApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuthStore } from '../../store/authStore';
import EmojiPicker from '../components/EmojiPicker';
import type { ChatMessage } from '../types/chat';

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const rid = Number(roomId);
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [menuId, setMenuId] = useState<number | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatApi.getMessages(rid);
      setMessages([...data].reverse());
      await chatApi.markAsRead(rid);
    } finally {
      setLoading(false);
    }
  }, [rid]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    const close = () => setMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleNewMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    chatApi.markAsRead(rid).catch(() => {});
  }, [rid]);

  const { sendMessage } = useWebSocket({ roomId: rid, onMessage: handleNewMessage });

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    sendMessage(content);
    setInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fileUrl = await chatApi.uploadFile(file);
      sendMessage(fileUrl);
    } catch {
      alert('파일 업로드 실패');
    }
  };

  // 수정 시작
  const startEdit = (msg: ChatMessage) => {
    setEditingId(msg.messageId);
    setEditContent(msg.content);
    setMenuId(null);
  };

  // 수정 확정
  const confirmEdit = async (messageId: number) => {
    if (!editContent.trim()) return;
    try {
      const updated = await chatApi.editMessage(messageId, editContent.trim());
      setMessages((prev) => prev.map((m) => m.messageId === messageId ? updated : m));
    } catch {
      alert('수정 실패');
    } finally {
      setEditingId(null);
    }
  };

  // 삭제
  const handleDelete = async (messageId: number) => {
    if (!confirm('메시지를 삭제할까요?')) return;
    try {
      const deleted = await chatApi.deleteMessage(messageId);
      setMessages((prev) => prev.map((m) => m.messageId === messageId ? deleted : m));
    } catch {
      alert('삭제 실패');
    }
    setMenuId(null);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  const isMyMessage = (msg: ChatMessage) => msg.senderId === userId;

  const AVATAR_COLORS = ['#F4A261', '#E76F51', '#2A9D8F', '#457B9D', '#6D6875', '#E9C46A', '#264653'];
  const nickColor = (nick: string) => {
    const idx = (nick?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  };

  if (loading) return <div style={styles.center}>불러오는 중...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/chat')} style={styles.backBtn}>←</button>
        <span style={styles.headerTitle}>채팅방 #{rid}</span>
      </div>

      <div style={styles.msgArea}>
        {messages.length === 0 && <div style={styles.empty}>첫 메시지를 보내보세요!</div>}
        {messages.map((msg) => {
          const mine = isMyMessage(msg);
          const avatarColor = nickColor(msg.senderNickname);
          return (
            <div key={msg.messageId} style={{ ...styles.msgRow, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              {!mine && (
                <div style={{ ...styles.avatar, background: avatarColor }}>
                  {msg.senderNickname?.charAt(0) ?? '?'}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '65%' }}>
                {!mine && <span style={styles.nick}>{msg.senderNickname}</span>}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: mine ? 'row-reverse' : 'row' }}>

                  {/* 말풍선 */}
                  {editingId === msg.messageId ? (
                    <div style={styles.editBox}>
                      <input
                        style={styles.editInput}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmEdit(msg.messageId);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <button style={styles.editConfirmBtn} onClick={() => confirmEdit(msg.messageId)}>확인</button>
                        <button style={styles.editCancelBtn} onClick={() => setEditingId(null)}>취소</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        ...styles.bubble,
                        background: msg.isDeleted ? '#e0e0e0' : mine ? '#1976d2' : '#f0f0f0',
                        color: msg.isDeleted ? '#999' : mine ? '#fff' : '#333',
                        fontStyle: msg.isDeleted ? 'italic' : 'normal',
                      }}
                    >
                      {msg.isDeleted ? '삭제된 메시지입니다.' : msg.content}
                      {!msg.isDeleted && msg.updatedAt && (
                        <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 6 }}>(수정됨)</span>
                      )}
                    </div>
                  )}

                  <span style={styles.time}>{formatTime(msg.createdAt)}</span>

                  {/* 내 메시지 & 삭제 안 된 경우만 메뉴 */}
                  {mine && !msg.isDeleted && editingId !== msg.messageId && (
                    <div style={{ position: 'relative' }}>
                      <button
                        style={styles.menuBtn}
                        onClick={(e) => { e.stopPropagation(); setMenuId(menuId === msg.messageId ? null : msg.messageId); }}
                      >
                        ···
                      </button>
                      {menuId === msg.messageId && (
                        <div style={styles.menuBox} onClick={(e) => e.stopPropagation()}>
                          <button style={styles.menuItem} onClick={() => startEdit(msg)}>수정</button>
                          <button style={{ ...styles.menuItem, color: '#e53935' }} onClick={() => handleDelete(msg.messageId)}>삭제</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputArea}>
        <button onClick={() => fileInputRef.current?.click()} style={styles.fileBtn}>📎</button>
        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        <input
          style={styles.textInput}
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button ref={emojiBtnRef} style={styles.fileBtn} onClick={() => setShowEmoji((v) => !v)}>😊</button>
        {showEmoji && (
          <EmojiPicker
            anchorRef={emojiBtnRef}
            onSelect={(emoji) => setInput((prev) => prev + emoji)}
            onClose={() => setShowEmoji(false)}
          />
        )}
        <button onClick={handleSend} style={styles.sendBtn} disabled={!input.trim()}>전송</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f0f2f5',
  },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#fff',
    borderBottom: '1px solid #eee',
    flexShrink: 0,
  },
  backBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: '0 4px' },
  headerTitle: { fontWeight: 'bold', fontSize: 16 },
  msgArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  empty: { textAlign: 'center', color: '#bbb', fontSize: 14, marginTop: 40 },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 'bold', fontSize: 15,
    flexShrink: 0, alignSelf: 'flex-start',
  },
  nick: { fontSize: 11, color: '#888', marginBottom: 3, marginLeft: 4 },
  bubble: { padding: '9px 13px', borderRadius: 16, fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' },
  time: { fontSize: 11, color: '#aaa', flexShrink: 0 },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#aaa', padding: '0 2px', lineHeight: 1 },
  menuBox: { position: 'absolute', right: 0, bottom: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', zIndex: 100, minWidth: 80 },
  menuItem: { display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13 },
  editBox: { display: 'flex', flexDirection: 'column', maxWidth: 260 },
  editInput: { padding: '8px 12px', border: '1px solid #1976d2', borderRadius: 8, fontSize: 14, outline: 'none' },
  editConfirmBtn: { flex: 1, padding: '5px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  editCancelBtn: { flex: 1, padding: '5px', background: '#eee', color: '#333', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  inputArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    background: '#fff',
    borderTop: '1px solid #eee',
    flexShrink: 0,
  },
  fileBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: '0 4px' },
  textInput: { flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 24, fontSize: 14, outline: 'none' },
  sendBtn: { background: '#1976d2', color: '#fff', border: 'none', borderRadius: 20, padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 },
};
