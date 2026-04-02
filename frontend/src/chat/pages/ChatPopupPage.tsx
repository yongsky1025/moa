import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Bell, BellOff, Pencil, List, LogOut, UserRound, UsersRound, CalendarDays } from "lucide-react";
import { createPortal } from "react-dom";
import { chatApi } from "../../api/chatApi";
import { circleApi } from "../../api/circleApi";
import { notificationApi } from "../../api/notificationApi";
import { useWebSocket, type TypingEvent, type NoticeEvent } from "../hooks/useWebSocket";
import { useAuthStore } from "../../store/authStore";
import type { ChatRoomSummary, ChatMessage } from "../types/chat";
import type { Notification } from "../../types/notification";
type RoomMember = { userId: number; nickname: string; circleMemberId?: number; role?: string };
import EmojiPicker from "../components/EmojiPicker";

const AVATAR_COLORS = ["#F4A261", "#E76F51", "#2A9D8F", "#457B9D", "#6D6875", "#E9C46A", "#264653"];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const nickColor = (nick: string) => AVATAR_COLORS[(nick?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];


const IMAGE_EXTS = /\.(png|jpg|jpeg|gif|webp)$/i;
const isFileUrl = (c: string) => c.startsWith('/uploads/') || c.startsWith('/api/chat/files/');
function renderMsgContent(content: string, mine: boolean) {
  if (isFileUrl(content)) {
    if (IMAGE_EXTS.test(content)) {
      return (
        <img
          src={content}
          alt="이미지"
          style={{ maxWidth: 220, maxHeight: 220, borderRadius: 12, display: 'block', cursor: 'pointer', objectFit: 'cover' }}
          onClick={() => window.open(content, '_blank')}
        />
      );
    }
    const fileName = content.split('/').pop() ?? '파일';
    return (
      <a href={content} download style={{ color: mine ? '#fff' : '#5F8F7B', textDecoration: 'underline', fontSize: 13 }}>
        📎 {fileName}
      </a>
    );
  }
  return content;
}

interface ChatInputAreaProps {
  activeRoom: ChatRoomSummary | null;
  replyTo: { messageId: number; content: string; nickname: string } | null;
  onCancelReply: () => void;
  onSend: (content: string, replyToId?: number | null) => void;
  onFileUpload: (file: File) => Promise<void>;
  sendTyping: (nickname: string) => void;
  userNickname: string;
}

function ChatInputArea({ activeRoom, replyTo, onCancelReply, onSend, onFileUpload, sendTyping, userNickname }: ChatInputAreaProps) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ quickReplies: string[]; draft: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const typingCooldownRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const content = input.trim();
    if (!content || !activeRoom) return;
    onSend(content, replyTo?.messageId);
    setInput("");
    setShowEmoji(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoom) return;
    try {
      await onFileUpload(file);
    } catch {
      alert("업로드 실패");
    }
    e.target.value = "";
  };

  return (
    <>
      {showEmoji && (
        <EmojiPicker
          anchorRef={emojiBtnRef}
          onSelect={(emoji) => setInput((p) => p + emoji)}
          onClose={() => setShowEmoji(false)}
        />
      )}
      {replyTo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: '#F0F7F4', borderTop: '1px solid #D1E8DF', borderLeft: '3px solid #5F8F7B', flexShrink: 0 }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, color: '#5F8F7B', fontWeight: 600 }}>{replyTo.nickname}에게 답장</div>
            <div style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.content}</div>
          </div>
          <button onClick={onCancelReply} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 16, padding: '0 2px', flexShrink: 0 }}>✕</button>
        </div>
      )}
      {aiSuggestions && (
        <div style={s.aiSuggestWrap}>
          <div style={s.aiSuggestHeader}>
            <span style={{ fontSize: 11, color: '#5F8F7B', fontWeight: 600 }}>✨ AI 스마트 답변</span>
            <button style={s.aiCloseBtn} onClick={() => setAiSuggestions(null)}>✕</button>
          </div>
          <div style={s.aiQuickReplies}>
            {aiSuggestions.quickReplies.map((r, i) => (
              <button key={i} style={s.aiChip} onClick={() => { setInput(r); setAiSuggestions(null); textareaRef.current?.focus(); }}>
                {r}
              </button>
            ))}
          </div>
          {aiSuggestions.draft && (
            <button style={s.aiDraftBtn} onClick={() => { setInput(aiSuggestions.draft); setAiSuggestions(null); textareaRef.current?.focus(); }}>
              <span style={{ fontSize: 11, color: '#888', marginRight: 4 }}>초안</span>
              {aiSuggestions.draft}
            </button>
          )}
        </div>
      )}
      <div style={s.inputWrap}>
        <div style={s.inputToolbar}>
          <button className="chat-icon-btn" style={s.toolBtn} onClick={() => fileInputRef.current?.click()}>📎</button>
          <button ref={emojiBtnRef} className="chat-icon-btn" style={s.toolBtn} onClick={() => setShowEmoji((v) => !v)}>😊</button>
          <button
            style={{ ...s.toolBtn, color: aiLoading ? '#aaa' : '#5F8F7B', fontSize: 15 }}
            disabled={aiLoading || !activeRoom}
            onClick={async () => {
              if (!activeRoom) return;
              setAiLoading(true);
              try {
                const result = await chatApi.suggestReply(activeRoom.roomId);
                setAiSuggestions(result);
              } finally {
                setAiLoading(false);
              }
            }}
            title="AI 스마트 답변"
          >
            {aiLoading ? '...' : '✨'}
          </button>
          <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFile} />
        </div>
        <div style={s.inputRow}>
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            style={s.textarea}
            placeholder="메시지를 입력하세요"
            value={input}
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
              if (!typingCooldownRef.current && e.target.value.trim()) {
                sendTyping(userNickname);
                typingCooldownRef.current = true;
                setTimeout(() => { typingCooldownRef.current = false; }, 2000);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="chat-send-btn" style={{ ...s.sendBtn, opacity: input.trim() ? 1 : 0.4 }} onClick={handleSend} disabled={!input.trim()}>
            전송
          </button>
        </div>
      </div>
    </>
  );
}

export default function ChatPopupPage() {
  const { userId, user } = useAuthStore();

  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoomSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [editingRoomName, setEditingRoomName] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [menuId, setMenuId] = useState<number | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const [editMsgContent, setEditMsgContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ messageId: number; content: string; nickname: string } | null>(null);
  const [roomCtxMenu, setRoomCtxMenu] = useState<{ x: number; y: number; room: ChatRoomSummary } | null>(null);
  const [renaming, setRenaming] = useState<{ roomId: number; value: string } | null>(null);
  const [profileModal, setProfileModal] = useState<{ nickname: string; senderId: number } | null>(null);
  const [profileChatError, setProfileChatError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeContent, setNoticeContent] = useState<string | null>(null);
  const [noticeMessageId, setNoticeMessageId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [unreadOnEnter, setUnreadOnEnter] = useState(0);
  const [readStatus, setReadStatus] = useState<Record<number, string>>({});
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({});
  const typingTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const [mutedRooms, setMutedRooms] = useState<Set<number>>(() =>
    new Set(JSON.parse(localStorage.getItem('moa_muted_rooms') ?? '[]'))
  );
  const mutedRoomsRef = useRef(mutedRooms);
  mutedRoomsRef.current = mutedRooms;

  const [sidebarWidth, setSidebarWidth] = useState(280);
  const sidebarDragging = useRef(false);
  const sidebarDragStartX = useRef(0);
  const sidebarDragStartW = useRef(0);

  const onSidebarResizeMouseDown = (e: React.MouseEvent) => {
    sidebarDragging.current = true;
    sidebarDragStartX.current = e.clientX;
    sidebarDragStartW.current = sidebarWidth;
    e.preventDefault();
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  const msgAreaRef = useRef<HTMLDivElement>(null);
  const firstUnreadMsgIdRef = useRef<number | null>(null);
  const shouldScrollToUnreadRef = useRef(false);
  const ctxMenuRef = useRef<HTMLDivElement>(null);

  const chatNotifications = notifications.filter((n) => n.type === 'CHAT_MESSAGE');
  const unreadNoti = chatNotifications.filter((n) => !n.isRead).length;

  const loadRooms = useCallback(async () => {
    try {
      setRooms(await chatApi.getMyRooms());
    } catch {}
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setNotifications(await notificationApi.getAll());
    } catch {}
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!sidebarDragging.current) return;
      const delta = e.clientX - sidebarDragStartX.current;
      const newW = Math.max(180, Math.min(480, sidebarDragStartW.current + delta));
      setSidebarWidth(newW);
    };
    const onMouseUp = () => { sidebarDragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    loadRooms();
    loadNotifications();
    const t = setInterval(() => {
      loadRooms();
      loadNotifications();
    }, 30000);
    return () => clearInterval(t);
  }, [loadRooms, loadNotifications]);

  // #room-{roomId} 또는 #direct-{userId} 처리 함수 (마운트 + hashchange 공통)
  const handleRoomHash = useCallback(async () => {
    const hash = window.location.hash;
    const roomMatch = hash.match(/^#room-(\d+)$/);
    const directMatch = hash.match(/^#direct-(\d+)$/);
    if (!roomMatch && !directMatch) return;
    window.location.hash = "";
    try {
      let roomId: number;
      if (directMatch) {
        roomId = await chatApi.getOrCreateDirectRoom(Number(directMatch[1]));
      } else {
        roomId = Number(roomMatch![1]);
      }
      let updated = await chatApi.getMyRooms();
      let found = updated.find((r) => r.roomId === roomId);
      if (!found) {
        await new Promise((res) => setTimeout(res, 500));
        updated = await chatApi.getMyRooms();
        found = updated.find((r) => r.roomId === roomId);
      }
      setRooms(updated);
      if (found) setActiveRoom(found);
    } catch (e) {
      console.error("[handleRoomHash] 에러:", e);
    }
  }, []);

  // 마운트 시 + 팝업 재사용 시(hashchange) 모두 처리
  useEffect(() => {
    handleRoomHash();
    window.addEventListener("hashchange", handleRoomHash);
    return () => window.removeEventListener("hashchange", handleRoomHash);
  }, [handleRoomHash]);

  useEffect(() => {
    if (!activeRoom) return;
    setTypingUsers({});
    Object.values(typingTimersRef.current).forEach(clearTimeout);
    typingTimersRef.current = {};
    const roomUnread = activeRoom.unreadCount;
    setUnreadOnEnter(roomUnread);
    firstUnreadMsgIdRef.current = null;
    shouldScrollToUnreadRef.current = roomUnread > 0;
    setRooms((prev) => prev.map((r) => r.roomId === activeRoom.roomId ? { ...r, unreadCount: 0 } : r));
    setLoadingMsg(true);
    chatApi
      .getMessages(activeRoom.roomId)
      .then((data) => {
        const msgs = [...data].reverse();
        if (roomUnread > 0 && msgs.length > 0) {
          const idx = Math.max(0, msgs.length - roomUnread);
          firstUnreadMsgIdRef.current = msgs[idx]?.messageId ?? null;
        }
        setMessages(msgs);
        chatApi.markAsRead(activeRoom.roomId).catch(() => {});
      })
      .finally(() => setLoadingMsg(false));
    chatApi.getReadStatus(activeRoom.roomId)
      .then((list) => {
        const map: Record<number, string> = {};
        list.forEach((r) => { map[r.userId] = r.lastReadAt; });
        setReadStatus(map);
      })
      .catch(() => {});

    // 모임/일정 채팅방이면 멤버 로드
    if (activeRoom.roomType === "GROUP" && activeRoom.circleId) {
      circleApi
        .getActiveMembers(activeRoom.circleId, { size: 100 })
        .then((res) => setMembers(res.data.dtoList ?? []))
        .catch(() => setMembers([]));
    } else if (activeRoom.roomType === "SCHEDULE") {
      chatApi.getRoomMembers(activeRoom.roomId)
        .then((list) => setMembers(list))
        .catch(() => setMembers([]));
    } else {
      setMembers([]);
    }
    setShowMembers(false);
    setNoticeMessageId(activeRoom?.noticeMessageId ?? null);
    setNoticeContent(activeRoom?.noticeContent ?? null);
  }, [activeRoom]);

  useEffect(() => {
    if (shouldScrollToUnreadRef.current) {
      shouldScrollToUnreadRef.current = false;
      const el = msgAreaRef.current?.querySelector<HTMLElement>('[data-first-unread]');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const close = () => {
      setMenuId(null);
      setRoomCtxMenu(null);
      setShowNoti(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuId(null);
        setRoomCtxMenu(null);
        setShowNoti(false);
        setProfileModal(null);
      }
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleRoomContextMenu = (e: React.MouseEvent, room: ChatRoomSummary) => {
    e.preventDefault();
    e.stopPropagation();
    setRoomCtxMenu({ x: e.clientX, y: e.clientY, room });
  };

  const handleRoomLeave = async (roomId: number) => {
    if (!confirm("채팅방을 나가시겠습니까?")) return;
    try {
      await chatApi.leaveRoom(roomId);
      if (activeRoom?.roomId === roomId) setActiveRoom(null);
      await loadRooms();
    } catch {
      alert("나가기 실패");
    }
    setRoomCtxMenu(null);
  };

  const handleRenameConfirm = async () => {
    if (!renaming || !renaming.value.trim()) return;
    try {
      await chatApi.updateRoomName(renaming.roomId, renaming.value.trim());
      const newName = renaming.value.trim();
      setRooms((prev) => prev.map((r) => (r.roomId === renaming.roomId ? { ...r, name: newName } : r)));
      if (activeRoom?.roomId === renaming.roomId) setActiveRoom((prev) => (prev ? { ...prev, name: newName } : prev));
    } catch {
      alert("이름 변경 실패");
    }
    setRenaming(null);
  };

  const handleNewMessage = useCallback(
    (msg: ChatMessage) => {
      if (msg.roomId === activeRoom?.roomId) {
        setMessages((prev) => {
          const tempIdx = prev.findIndex(
            (m) => m.messageId < 0 && m.senderId === msg.senderId && m.content === msg.content
          );
          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = msg;
            return next;
          }
          return [...prev, msg];
        });
        chatApi.markAsRead(msg.roomId).catch(() => {});
      }
      setRooms((prev) =>
        prev.map((r) =>
          r.roomId === msg.roomId
            ? { ...r, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: (r.roomId === activeRoom?.roomId || mutedRoomsRef.current.has(r.roomId)) ? 0 : r.unreadCount + 1 }
            : r,
        ),
      );
    },
    [activeRoom],
  );

  const handleReadEvent = useCallback((event: { userId: number; lastReadAt: string }) => {
    setReadStatus((prev) => ({ ...prev, [event.userId]: event.lastReadAt }));
  }, []);

  // 메인창에서 뮤트 변경 시 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'moa_muted_rooms') {
        setMutedRooms(new Set(JSON.parse(e.newValue ?? '[]')));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleTogglePin = async (roomId: number) => {
    try {
      const isPinned = await chatApi.togglePin(roomId);
      setRooms(prev => {
        const updated = prev.map(r => r.roomId === roomId ? { ...r, isPinned } : r);
        return [...updated].sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          const ta = a.lastMessageAt ?? '';
          const tb = b.lastMessageAt ?? '';
          return tb.localeCompare(ta);
        });
      });
    } catch { /* 무시 */ }
    setRoomCtxMenu(null);
  };

  const toggleMute = (roomId: number) => {
    setMutedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) { next.delete(roomId); } else { next.add(roomId); }
      localStorage.setItem('moa_muted_rooms', JSON.stringify([...next]));
      return next;
    });
  };

  const handleTyping = useCallback((event: TypingEvent) => {
    if (event.userId === userId) return;
    setTypingUsers((prev) => ({ ...prev, [event.userId]: event.nickname }));
    if (typingTimersRef.current[event.userId]) clearTimeout(typingTimersRef.current[event.userId]);
    typingTimersRef.current[event.userId] = setTimeout(() => {
      setTypingUsers((prev) => { const next = { ...prev }; delete next[event.userId]; return next; });
    }, 3000);
  }, [userId]);

  const handleNotification = useCallback((noti: import('../../types/notification').Notification) => {
    setNotifications((prev) => {
      if (noti.id != null && prev.some((n) => n.id === noti.id)) return prev;
      return [noti, ...prev];
    });
    if (noti.type === 'CHAT_MESSAGE' && noti.referenceId && !mutedRoomsRef.current.has(noti.referenceId)) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomId === noti.referenceId && r.roomId !== activeRoom?.roomId
            ? { ...r, unreadCount: r.unreadCount + 1 }
            : r,
        ),
      );
    }
  }, [activeRoom]);

  const handleReaction = useCallback((msg: ChatMessage) => {
    setMessages(prev => prev.map(m => m.messageId === msg.messageId ? { ...m, reactions: msg.reactions } : m));
  }, []);

  const handleNoticeEvent = useCallback((event: NoticeEvent) => {
    setNoticeMessageId(event.noticeMessageId);
    setNoticeContent(event.noticeContent);
  }, []);

  const handleSetNotice = async (messageId: number, content: string) => {
    if (!activeRoom) return;
    try {
      await chatApi.setNotice(activeRoom.roomId, messageId);
      setNoticeMessageId(messageId);
      setNoticeContent(content.length > 500 ? content.substring(0, 500) : content);
    } catch { setErrorMsg('공지 등록 실패'); }
  };

  const handleClearNotice = async () => {
    if (!activeRoom) return;
    try {
      await chatApi.clearNotice(activeRoom.roomId);
      setNoticeMessageId(null);
      setNoticeContent(null);
    } catch { setErrorMsg('공지 해제 실패'); }
  };

  const handleToggleReaction = async (messageId: number, emoji: string) => {
    setMenuId(null);
    try {
      const updated = await chatApi.toggleReaction(messageId, emoji);
      setMessages(prev => prev.map(m => m.messageId === messageId ? { ...m, reactions: updated.reactions } : m));
    } catch {}
  };

  const handleSystemEvent = useCallback((event: { type: string; nickname: string; createdAt: string }) => {
    const text = event.type === 'LEAVE' ? `${event.nickname}님이 퇴장했습니다.`
      : event.type === 'KICK' ? `${event.nickname}님이 강퇴되었습니다.`
      : `${event.nickname}님이 입장했습니다.`;
    const systemMsg: ChatMessage = {
      messageId: -Date.now(),
      roomId: activeRoom?.roomId ?? 0,
      senderId: 0,
      senderNickname: '',
      content: text,
      createdAt: event.createdAt,
      updatedAt: null,
      isDeleted: false,
      messageType: 'SYSTEM',
    };
    setMessages((prev) => [...prev, systemMsg]);
  }, [activeRoom?.roomId]);

  const { sendMessage, sendTyping } = useWebSocket({
    roomId: activeRoom?.roomId ?? 0,
    userId: userId ?? undefined,
    onMessage: handleNewMessage,
    onReadEvent: handleReadEvent,
    onNotification: handleNotification,
    onSystemEvent: handleSystemEvent,
    onTyping: handleTyping,
    onReaction: handleReaction,
    onNotice: handleNoticeEvent,
  });

  const handleSend = useCallback((content: string, replyToId?: number | null) => {
    if (!content || !activeRoom) return;
    const tempMsg: ChatMessage = {
      messageId: -Date.now(),
      roomId: activeRoom.roomId,
      senderId: userId!,
      senderNickname: user?.nickname ?? '?',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isDeleted: false,
      replyToId: replyToId ?? null,
      replyToContent: replyTo?.content ?? null,
      replyToNickname: replyTo?.nickname ?? null,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setRooms((prev) => prev.map((r) =>
      r.roomId === activeRoom.roomId
        ? { ...r, lastMessage: content, lastMessageAt: tempMsg.createdAt }
        : r
    ));
    sendMessage(content, replyToId);
    setReplyTo(null);
  }, [activeRoom, userId, user, replyTo, sendMessage]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!activeRoom) return;
    const fileUrl = await chatApi.uploadFile(file);
    const tempMsg: ChatMessage = {
      messageId: -Date.now(),
      roomId: activeRoom.roomId,
      senderId: userId!,
      senderNickname: user?.nickname ?? '?',
      content: fileUrl,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isDeleted: false,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setRooms((prev) => prev.map((r) =>
      r.roomId === activeRoom.roomId
        ? { ...r, lastMessage: fileUrl, lastMessageAt: tempMsg.createdAt }
        : r
    ));
    sendMessage(fileUrl);
  }, [activeRoom, userId, user, sendMessage]);

  const formatTime = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  const roomLabel = (r: ChatRoomSummary) => {
    if (r.roomType === 'GROUP') return r.name ?? `모임 채팅 #${r.circleId}`;
    if (r.roomType === 'SCHEDULE') return r.name ?? `일정 채팅 #${r.scheduleId}`;
    return r.otherUserNickname ?? '1:1 채팅';
  };

  const handleDeleteMsg = async (messageId: number) => {
    if (!confirm("메시지를 삭제할까요?")) return;
    try {
      const deleted = await chatApi.deleteMessage(messageId);
      setMessages((prev) => prev.map((m) => (m.messageId === messageId ? deleted : m)));
    } catch {
      alert("삭제 실패");
    }
    setMenuId(null);
  };

  const startEditMsg = (msg: { messageId: number; content: string }) => {
    setEditingMsgId(msg.messageId);
    setEditMsgContent(msg.content);
    setMenuId(null);
  };

  const confirmEditMsg = async (messageId: number) => {
    if (!editMsgContent.trim()) return;
    try {
      const updated = await chatApi.editMessage(messageId, editMsgContent.trim());
      setMessages((prev) => prev.map((m) => (m.messageId === messageId ? updated : m)));
    } catch {
      alert("수정 실패");
    }
    setEditingMsgId(null);
  };

  const handleRoomNameSave = async () => {
    if (!activeRoom || !roomNameInput.trim()) return;
    try {
      await chatApi.updateRoomName(activeRoom.roomId, roomNameInput.trim());
      const updated = { ...activeRoom, name: roomNameInput.trim() };
      setActiveRoom(updated);
      setRooms((prev) => prev.map((r) => (r.roomId === activeRoom.roomId ? updated : r)));
    } catch {
      alert("이름 변경 실패");
    }
    setEditingRoomName(false);
  };


  const startDirectChat = async (targetUserId: number) => {
    if (targetUserId === userId) return;
    try {
      const roomId = await chatApi.getOrCreateDirectRoom(targetUserId);
      let updatedRooms = await chatApi.getMyRooms();
      let found = updatedRooms.find((r) => r.roomId === roomId);
      if (!found) {
        await new Promise((res) => setTimeout(res, 500));
        updatedRooms = await chatApi.getMyRooms();
        found = updatedRooms.find((r) => r.roomId === roomId);
      }
      setRooms(updatedRooms);
      if (found) setActiveRoom(found);
    } catch (e) {
      console.error("[startDirectChat] 에러:", e);
      alert("채팅방 생성 실패");
    }
  };

  const handleNotiClick = async (n: import('../../types/notification').Notification) => {
    if (!n.isRead) {
      await notificationApi.readOne(n.id);
      setNotifications((p) => p.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    }
    setShowNoti(false);
    switch (n.type) {
      case 'CHAT_MESSAGE': {
        const target = rooms.find((r) => r.roomId === n.referenceId);
        setActiveRoom(target ?? null);
        break;
      }
      case 'JOIN_REQUEST':
      case 'JOIN_APPROVED':
      case 'JOIN_REJECTED':
      case 'KICKED':
      case 'CIRCLE_DISBANDED':
        // 부모(메인) 창을 내 모임 페이지로 이동
        if (window.opener) {
          window.opener.location.href = '/circle/my';
        } else {
          window.location.href = '/circle/my';
        }
        break;
    }
  };

  const filteredRooms = rooms.filter((r) => roomLabel(r).includes(search) || (r.lastMessage ?? "").includes(search));

  const totalUnread = rooms.reduce((s, r) => s + r.unreadCount, 0);

  return (
    <>
    <div style={s.root}>
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .typing-dots { display: flex; gap: 4px; align-items: center; height: 14px; }
        .typing-dots span { width: 7px; height: 7px; border-radius: 50%; background: #9CA3AF; animation: typing-bounce 1.2s infinite; display: inline-block; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
      {/* 에러 토스트 */}
      {errorMsg && (
        <div style={s.errorToast}>
          {errorMsg}
          <button style={s.errorClose} onClick={() => setErrorMsg(null)}>✕</button>
        </div>
      )}
      {/* ── 사이드바 ── */}
      <div style={{ ...s.sidebar, width: sidebarWidth, position: 'relative' }}>
        {/* 사이드바 헤더 */}
        <div style={s.sideHeader}>
          <span style={s.sideTitle}>채팅</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {/* 알림 */}
            <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <button style={{ ...s.iconBtn, display: 'flex', alignItems: 'center', position: 'relative' }} onClick={() => setShowNoti((v) => !v)}>
                <Bell size={16} />
                {unreadNoti > 0 && <span style={s.dot}>{unreadNoti}</span>}
              </button>
              {showNoti && (
                <div style={s.notiDropdown}>
                  <div style={s.notiHead}>
                    <b>알림</b>
                    <button
                      style={s.notiAll}
                      onClick={async () => {
                        await notificationApi.readAll();
                        setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
                      }}
                    >
                      전체 읽음
                    </button>
                  </div>
                  {chatNotifications.length === 0 ? (
                    <p style={s.notiEmpty}>알림 없음</p>
                  ) : (
                    chatNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="chat-noti-item" style={{ ...s.notiItem, background: n.isRead ? '#F8FAF9' : '#FDF1EC', cursor: 'pointer' }}
                        onClick={() => handleNotiClick(n)}
                      >
                        <span style={s.notiMsg}>{n.message}</span>
                        <span style={s.notiTime}>{formatTime(n.createdAt)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div style={s.searchWrap}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} style={{ position: 'absolute', left: 12, color: '#9CA3AF', pointerEvents: 'none' }} />
            <input style={{ ...s.searchInput, paddingLeft: 32 }} placeholder="채팅방 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* 채팅방 목록 */}
        <div style={s.roomList}>
          {filteredRooms.length === 0 ? (
            <div style={s.noRoom}>채팅방이 없습니다</div>
          ) : (
            filteredRooms.map((r) => (
              <div
                key={r.roomId}
                className="chat-room-item" style={{ ...s.roomItem, background: r.roomId === activeRoom?.roomId ? "#EAF4F0" : "transparent" }}
                onClick={() => setActiveRoom(r)}
                onContextMenu={(e) => handleRoomContextMenu(e, r)}
              >
                <div style={{ ...s.roomAvatar, background: r.roomType === 'GROUP' ? '#5F8F7B' : r.roomType === 'SCHEDULE' ? '#F9B88A' : '#3D5F52', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {r.roomType === 'GROUP' ? <UsersRound size={18} color="#fff" /> : r.roomType === 'SCHEDULE' ? <CalendarDays size={18} color="#fff" /> : <UserRound size={18} color="#fff" />}
                </div>
                <div style={s.roomMeta}>
                  <div style={s.roomTop}>
                    <span style={s.roomName}>{r.isPinned && <span style={{ color: '#F4A261', marginRight: 3, fontSize: 11 }}>⭐</span>}{roomLabel(r)}</span>
                    <span style={s.roomTime}>{formatTime(r.lastMessageAt)}</span>
                  </div>
                  <div style={s.roomTop}>
                    <span style={s.roomLast}>{r.lastMessage ?? ""}</span>
                    {mutedRooms.has(r.roomId)
                      ? <span style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center' }}><BellOff size={13} /></span>
                      : r.unreadCount > 0 && <span style={s.unreadBadge}>{r.unreadCount}</span>
                    }
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 하단 전체 미읽음 */}
        {totalUnread > 0 && <div style={s.totalUnread}>읽지 않은 메시지 {totalUnread}개</div>}
      </div>

      {/* 우클릭 컨텍스트 메뉴 */}
      {roomCtxMenu && (
        <div ref={ctxMenuRef} style={{ ...s.ctxMenu, top: roomCtxMenu.y, left: roomCtxMenu.x }} onClick={(e) => e.stopPropagation()}>
          {roomCtxMenu.room.roomType === "GROUP" && (
            <button
              className="chat-ctx-item" style={s.ctxItem}
              onClick={() => {
                setRenaming({ roomId: roomCtxMenu.room.roomId, value: roomCtxMenu.room.name ?? roomLabel(roomCtxMenu.room) });
                setRoomCtxMenu(null);
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Pencil size={14} /> 방 이름 변경</span>
            </button>
          )}
          <button className="chat-ctx-item" style={s.ctxItem} onClick={() => handleTogglePin(roomCtxMenu.room.roomId)}>
{roomCtxMenu.room.isPinned ? '⭐ 즐겨찾기 해제' : '☆ 즐겨찾기 추가'}
          </button>
          <button className="chat-ctx-item" style={s.ctxItem} onClick={() => { toggleMute(roomCtxMenu.room.roomId); setRoomCtxMenu(null); }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {mutedRooms.has(roomCtxMenu.room.roomId) ? <><Bell size={14} /> 알림 켜기</> : <><BellOff size={14} /> 알림 끄기</>}
            </span>
          </button>
          <button style={{ ...s.ctxItem, color: "#c62828" }} onClick={() => handleRoomLeave(roomCtxMenu.room.roomId)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><LogOut size={14} /> 채팅방 나가기</span>
          </button>
        </div>
      )}

      {/* 이름 변경 모달 */}
      {renaming && (
        <div style={s.modalOverlay} onClick={() => setRenaming(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>방 이름 변경</div>
            <input
              style={s.modalInput}
              value={renaming.value}
              onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameConfirm();
                if (e.key === "Escape") setRenaming(null);
              }}
              autoFocus
              maxLength={50}
            />
            <div style={s.modalBtns}>
              <button style={s.modalCancel} onClick={() => setRenaming(null)}>
                취소
              </button>
              <button style={s.modalConfirm} onClick={handleRenameConfirm}>
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프로필 모달 */}
      {profileModal && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}
          onClick={() => { setProfileModal(null); setProfileChatError(null); }}
        >
          <div
            style={{ background: "#fff", borderRadius: 20, width: 280, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: nickColor(profileModal.nickname),
                height: 90,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: nickColor(profileModal.nickname),
                  border: "4px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: -34,
                }}
              >
                {profileModal.nickname.charAt(0)}
              </div>
            </div>
            <div style={{ paddingTop: 42, paddingBottom: 20, textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#262626" }}>{profileModal.nickname}</div>
            </div>
            {profileChatError && (
              <div style={{ margin: '0 20px 12px', padding: '10px 14px', background: '#fff3f3', border: '1px solid #f5c6c6', borderRadius: 8, fontSize: 13, color: '#c62828', textAlign: 'center' as const }}>
                {profileChatError}
              </div>
            )}
            <div style={{ borderTop: "1px solid #E5E7EB", padding: "12px 20px" }}>
              <button
                style={{ width: "100%", padding: "11px 0", background: "#5F8F7B", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); startDirectChat(profileModal.senderId); }}
              >
                💬 1:1 채팅하기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 사이드바 리사이즈 핸들 */}
      <div
        onMouseDown={onSidebarResizeMouseDown}
        style={{ width: 4, cursor: 'col-resize', background: '#E5E7EB', flexShrink: 0, zIndex: 10, alignSelf: 'stretch' }}
      />

      {/* ── 채팅 영역 ── */}
      <div style={s.chat}>
        {!activeRoom ? (
          <div style={s.placeholder}>
            <span style={{ fontSize: 40 }}>💬</span>
            <span style={{ marginTop: 12, color: "#aaa", fontSize: 14 }}>채팅방을 선택하세요</span>
          </div>
        ) : (
          <>
            {/* 채팅 헤더 */}
            <div style={s.chatHeader}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingRoomName && activeRoom.roomType === "GROUP" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      style={s.roomNameInput}
                      value={roomNameInput}
                      onChange={(e) => setRoomNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRoomNameSave();
                        if (e.key === "Escape") setEditingRoomName(false);
                      }}
                      autoFocus
                      maxLength={100}
                    />
                    <button style={s.nameConfirmBtn} onClick={handleRoomNameSave}>
                      확인
                    </button>
                    <button style={s.nameCancelBtn} onClick={() => setEditingRoomName(false)}>
                      취소
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={s.chatTitle}>{roomLabel(activeRoom)}</div>
                  </div>
                )}
                {(activeRoom.roomType === "GROUP" || activeRoom.roomType === "SCHEDULE") && <div style={s.chatSub}>{members.length}명 참여 중</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setShowSearch(v => !v); if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 50); else setSearchQuery(""); }}
                  className="chat-header-btn" style={{ ...s.headerBtn, background: showSearch ? '#EAF4F0' : 'none', border: 'none', display: 'flex', alignItems: 'center', color: showSearch ? '#5F8F7B' : '#9CA3AF' }}
                  title="메시지 검색"
                >
                  <Search size={16} />
                </button>
                {(activeRoom.roomType === "GROUP" || activeRoom.roomType === "SCHEDULE") && (
                  <button className="chat-header-btn" style={{ ...s.headerBtn, display: 'flex', alignItems: 'center', padding: '4px 6px' }} onClick={() => setShowMembers((v) => !v)}>
                    <List size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* 멤버 패널 */}
            {showMembers && (
              <div style={s.memberPanel}>
                {members.map((m) => (
                  <div
                    key={m.userId}
                    style={{ ...s.memberItem, cursor: m.userId !== userId ? "pointer" : "default" }}
                    onClick={(e) => {
                      if (m.userId === userId) return;
                      e.stopPropagation();
                      setProfileModal({ nickname: m.nickname, senderId: m.userId });
                    }}
                  >
                    <div style={{ ...s.memberAvatar, background: avatarColor(m.userId) }}>{m.nickname.charAt(0)}</div>
                    <span style={s.memberNick}>{m.nickname}</span>
                    {m.role === "LEADER" && <span style={s.leaderTag}>방장</span>}
                  </div>
                ))}
              </div>
            )}

            {/* 검색 바 */}
            {showSearch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', flexShrink: 0 }}>
                <Search size={14} style={{ color: '#6B7280', flexShrink: 0 }} />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="메시지 검색..."
                  style={{ flex: 1, border: '1px solid #D1D5DB', borderRadius: 6, padding: '4px 8px', fontSize: 13, outline: 'none' }}
                  onKeyDown={(e) => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(""); } }}
                  autoFocus
                />
                {searchQuery && (
                  <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                    {messages.filter(m => !m.isDeleted && m.messageType !== 'SYSTEM' && m.content.toLowerCase().includes(searchQuery.toLowerCase())).length}건
                  </span>
                )}
                <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
              </div>
            )}

            {/* 공지 배너 (카카오톡 스타일) */}
            {noticeContent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#FFF9C4', borderBottom: '2px solid #FFE500', flexShrink: 0 }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>📢</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: '#856404', fontWeight: 700, marginBottom: 1 }}>공지</div>
                  <div style={{ fontSize: 13, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{noticeContent}</div>
                </div>
                <button onClick={handleClearNotice} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B8A200', fontSize: 16, padding: '0 2px', flexShrink: 0, lineHeight: 1 }} title="공지 해제">✕</button>
              </div>
            )}

            {/* 메시지 영역 */}
            <div ref={msgAreaRef} style={s.msgArea}>
              {loadingMsg
                ? <div style={s.placeholder}>불러오는 중...</div>
                : messages.length === 0
                  ? <div style={s.firstMsg}>첫 메시지를 보내보세요! 👋</div>
                  : (searchQuery.trim() ? messages.filter(m => !m.isDeleted && m.messageType !== 'SYSTEM' && m.content.toLowerCase().includes(searchQuery.toLowerCase())) : messages).map((msg) => {
                    const mine = msg.senderId === userId;
                    return (
                      <div key={msg.messageId} {...(firstUnreadMsgIdRef.current === msg.messageId ? { 'data-first-unread': 'true' } : {})} style={{ ...s.msgRow, flexDirection: mine ? 'row-reverse' : 'row' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '65%', minWidth: 0 }}>
                          {!mine && <span style={s.senderName}>{msg.senderNickname ?? `사용자 #${msg.senderId}`}</span>}
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexDirection: mine ? 'row-reverse' : 'row' }}>
                            {editingMsgId === msg.messageId ? (
                              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 240 }}>
                                <input
                                  style={s.editInput}
                                  value={editMsgContent}
                                  onChange={(e) => setEditMsgContent(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') confirmEditMsg(msg.messageId);
                                    if (e.key === 'Escape') setEditingMsgId(null);
                                  }}
                                  autoFocus
                                />
                                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                                  <button style={s.editConfirmBtn} onClick={() => confirmEditMsg(msg.messageId)}>확인</button>
                                  <button style={s.editCancelBtn} onClick={() => setEditingMsgId(null)}>취소</button>
                                </div>
                              </div>
                            ) : (
                              <div
                                style={{
                                  ...s.bubble,
                                  position: 'relative',
                                  background: msg.isDeleted ? '#F3F4F6' : !isFileUrl(msg.content) ? (mine ? '#5F8F7B' : '#fff') : 'transparent',
                                  color: msg.isDeleted ? '#9CA3AF' : mine ? '#fff' : '#1F2937',
                                  border: (!msg.isDeleted && !mine && !isFileUrl(msg.content)) ? '1px solid #E5E7EB' : undefined,
                                  fontStyle: msg.isDeleted ? 'italic' : 'normal',
                                  borderRadius: msg.isDeleted ? 18 : isFileUrl(msg.content) ? 8 : (mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px'),
                                  padding: (isFileUrl(msg.content) && !msg.isDeleted) || msg.replyToId ? 0 : '8px 12px',
                                  overflow: msg.replyToId ? 'hidden' : undefined,
                                  boxShadow: isFileUrl(msg.content) && !msg.isDeleted ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                                }}
                                onContextMenu={!msg.isDeleted ? (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMenuId(menuId === msg.messageId ? null : msg.messageId);
                                } : undefined}
                              >
                                {/* 답장 인용 */}
                                {msg.replyToId && (
                                  <div style={{ background: mine ? 'rgba(255,255,255,0.15)' : '#F3F4F6', padding: '7px 12px 6px', borderBottom: '1px solid ' + (mine ? 'rgba(255,255,255,0.1)' : '#E5E7EB') }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: mine ? 'rgba(0,0,0,0.7)' : '#5F8F7B', marginBottom: 2 }}>{msg.replyToNickname}에게 답장</div>
                                    <div style={{ fontSize: 11, color: mine ? 'rgba(0,0,0,0.5)' : '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.replyToContent}</div>
                                  </div>
                                )}
                                <div style={msg.replyToId ? { padding: '8px 12px' } : undefined}>
                                  {msg.isDeleted ? '삭제된 메시지입니다.' : renderMsgContent(msg.content, mine)}
                                  {!msg.isDeleted && msg.updatedAt && (
                                    <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 6 }}>(수정됨)</span>
                                  )}
                                </div>
                                {menuId === msg.messageId && (
                                  <div style={s.menuBox} onClick={(e) => e.stopPropagation()}>
                                    {/* 리액션 */}
                                    <div style={{ display: 'flex', gap: 4, padding: '8px 10px', borderBottom: '1px solid #f0f0f0' }}>
                                      {['👍', '❤️'].map(emoji => {
                                        const r = msg.reactions?.find(x => x.emoji === emoji);
                                        return (
                                          <button key={emoji} onClick={() => handleToggleReaction(msg.messageId, emoji)} style={{ background: r?.myReaction ? '#EAF4F0' : 'none', border: '1px solid #e5e7eb', borderRadius: 16, padding: '4px 8px', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 3 }}>
                                            {emoji}{r && r.count > 0 ? <span style={{ fontSize: 11, color: '#374151' }}>{r.count}</span> : null}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <button style={s.menuItem} onClick={() => { setReplyTo({ messageId: msg.messageId, content: isFileUrl(msg.content) ? '📎 파일' : msg.content, nickname: msg.senderNickname ?? '?' }); setMenuId(null); }}>답장</button>
                                    {!isFileUrl(msg.content) && (
                                      <button style={s.menuItem} onClick={() => { navigator.clipboard.writeText(msg.content); setMenuId(null); }}>복사</button>
                                    )}
                                    {!isFileUrl(msg.content) && (
                                      noticeMessageId === msg.messageId
                                        ? <button style={{ ...s.menuItem, color: '#856404' }} onClick={() => { setMenuId(null); handleClearNotice(); }}>공지 해제</button>
                                        : <button style={{ ...s.menuItem, color: '#856404' }} onClick={() => { setMenuId(null); handleSetNotice(msg.messageId, msg.content); }}>공지</button>
                                    )}
                                    {mine ? (
                                      <>
                                        <button style={s.menuItem} onClick={() => startEditMsg(msg)}>수정</button>
                                        <button style={{ ...s.menuItem, color: '#e53935' }} onClick={() => handleDeleteMsg(msg.messageId)}>삭제</button>
                                      </>
                                    ) : (
                                      <button style={{ ...s.menuItem, color: '#e53935' }} onClick={() => { setMenuId(null); window.open(`/report-form?targetType=CHAT_MESSAGE&targetId=${msg.messageId}`, '_blank', 'width=420,height=600,resizable=no'); }}>신고</button>
                                    )}
                                  </div>
                                )}
                              </div>
                          )}
                          {mine && !msg.isDeleted && (() => {
                            const unread = Object.entries(readStatus).filter(
                              ([uid, time]) => Number(uid) !== msg.senderId && new Date(time) < new Date(msg.createdAt)
                            ).length;
                            return unread > 0 ? <span style={s.unreadCount}>{unread}</span> : null;
                          })()}
                          <span style={s.msgTime}>{formatTime(msg.createdAt)}</span>
                        </div>
                        {/* 리액션 표시 */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                            {msg.reactions.map(r => (
                              <button key={r.emoji} onClick={() => handleToggleReaction(msg.messageId, r.emoji)} style={{ background: r.myReaction ? '#EAF4F0' : '#F3F4F6', border: '1px solid ' + (r.myReaction ? '#5F8F7B' : '#E5E7EB'), borderRadius: 16, padding: '3px 8px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 3, color: '#374151' }}>
                                {r.emoji} <span style={{ fontSize: 11 }}>{r.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              }
              {Object.entries(typingUsers).map(([uid, nickname]) => (
                <div key={uid} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={s.senderName}>{nickname}</span>
                    <div className="bubble-other" style={{ ...s.bubble, position: 'relative', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 2px 6px rgba(0,0,0,0.10)', padding: '12px 16px' }}>
                      <div className="typing-dots"><span /><span /><span /></div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* 읽지 않은 메시지 이동 버튼 */}
            {unreadOnEnter > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', background: '#F8FAF9', flexShrink: 0 }}>
                <button
                  onClick={() => {
                    const el = msgAreaRef.current?.querySelector<HTMLElement>('[data-first-unread]');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setUnreadOnEnter(0);
                    firstUnreadMsgIdRef.current = null;
                  }}
                  style={{ background: '#5F8F7B', color: '#fff', border: 'none', borderRadius: 16, padding: '5px 16px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                >
                  {unreadOnEnter}개 안 읽은 메시지 ↓
                </button>
              </div>
            )}

            <ChatInputArea
              activeRoom={activeRoom}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              onSend={handleSend}
              onFileUpload={handleFileUpload}
              sendTyping={sendTyping}
              userNickname={user?.nickname ?? ''}
            />
          </>
        )}
      </div>
    </div>

    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    height: "100vh",
    fontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
    overflow: "hidden",
    background: "#F8FAF9",
  },

  // 사이드바
  sidebar: { width: 280, display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #E5E7EB", flexShrink: 0 },
  sideHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px 8px", flexShrink: 0 },
  sideTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  iconBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", position: "relative", padding: 4, color: "#6B7280" },
  dot: {
    position: "absolute",
    top: 0,
    right: 0,
    background: "#E38B6D",
    color: "#fff",
    borderRadius: "50%",
    fontSize: 9,
    padding: "1px 4px",
    fontWeight: "bold",
  },
  searchWrap: { padding: "6px 12px 10px", flexShrink: 0 },
  searchInput: {
    width: "100%",
    padding: "8px 14px",
    border: "1px solid #E5E7EB",
    borderRadius: 20,
    background: "#F8FAF9",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box" as const,
    color: "#1F2937",
  },
  roomList: { flex: 1, overflowY: "auto" as const },
  noRoom: { textAlign: "center" as const, padding: 24, color: "#A9CBBB", fontSize: 13 },
  roomItem: { display: "flex", alignItems: "center", padding: "10px 14px", cursor: "pointer", gap: 12, borderBottom: "1px solid #F3F4F6" },
  roomAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
    background: "#EAF4F0",
  },
  roomMeta: { flex: 1, minWidth: 0 },
  roomTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  roomName: { fontSize: 14, fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, color: "#1F2937" },
  roomTime: { fontSize: 11, color: "#6B7280", flexShrink: 0, marginLeft: 4 },
  roomLast: { fontSize: 12, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  unreadBadge: { background: "#E38B6D", color: "#fff", borderRadius: 10, fontSize: 10, padding: "2px 6px", fontWeight: "bold", flexShrink: 0 },
  totalUnread: {
    padding: "10px 16px",
    background: "#F8FAF9",
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center" as const,
    borderTop: "1px solid #E5E7EB",
  },

  // 알림
  notiDropdown: {
    position: "absolute" as const,
    left: 0,
    top: 40,
    width: 300,
    maxHeight: 340,
    overflowY: "auto" as const,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    zIndex: 1000,
    border: "1px solid #E5E7EB",
  },
  notiHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #E5E7EB" },
  notiAll: { background: "none", border: "none", color: "#5F8F7B", cursor: "pointer", fontSize: 12, fontWeight: 600 },
  notiEmpty: { padding: 20, textAlign: "center" as const, color: "#A9CBBB", fontSize: 13 },
  notiItem: { padding: "10px 14px", borderBottom: "1px solid #F3F4F6", cursor: "pointer", display: "flex", flexDirection: "column" as const, gap: 3 },
  notiMsg: { fontSize: 13, color: "#1F2937" },
  notiTime: { fontSize: 11, color: "#6B7280" },

  // 채팅 영역
  chat: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#F8FAF9" },
  placeholder: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#A9CBBB",
    background: "#F8FAF9",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#fff",
    borderBottom: "1px solid #E5E7EB",
    flexShrink: 0,
  },
  chatTitle: { fontWeight: "700", fontSize: 15, color: "#1F2937" },
  chatSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  headerBtn: {
    background: "#F8FAF9",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: 12,
    color: "#5F8F7B",
    fontWeight: 600,
  },
  editNameBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "0 2px", opacity: 0.5 },
  roomNameInput: { flex: 1, padding: "5px 10px", border: "1px solid #5F8F7B", borderRadius: 8, fontSize: 14, outline: "none", minWidth: 0 },
  nameConfirmBtn: {
    background: "#5F8F7B",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: 12,
    flexShrink: 0,
  },
  nameCancelBtn: {
    background: "#F8FAF9",
    color: "#6B7280",
    border: "1px solid #E5E7EB",
    borderRadius: 6,
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: 12,
    flexShrink: 0,
  },

  // 멤버 패널
  memberPanel: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 10,
    padding: "10px 16px",
    background: "#F8FAF9",
    borderBottom: "1px solid #E5E7EB",
    maxHeight: 120,
    overflowY: "auto" as const,
    flexShrink: 0,
  },
  memberItem: { display: "flex", alignItems: "center", gap: 6 },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  memberNick: { fontSize: 12, color: "#1F2937" },
  leaderTag: { fontSize: 10, background: "#EAF4F0", color: "#3D5F52", borderRadius: 6, padding: "1px 5px" },

  // 메시지
  msgArea: { flex: 1, overflowY: 'auto' as const, padding: '20px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 },
  firstMsg: { textAlign: 'center' as const, color: '#A9CBBB', fontSize: 13, marginTop: 20 },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14, flexShrink: 0, alignSelf: 'flex-start' },
  senderName: { fontSize: 11, color: '#6B7280', marginBottom: 4, marginLeft: 4 },
  bubble: { padding: '9px 14px', borderRadius: 18, fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' as const, wordWrap: 'break-word' as const, width: 'fit-content', maxWidth: 320, textAlign: 'left' as const },
  msgTime: { fontSize: 11, color: '#A9CBBB', flexShrink: 0, marginBottom: 10 },
  unreadCount: { fontSize: 11, color: '#E38B6D', fontWeight: 'bold', flexShrink: 0, marginBottom: 10, lineHeight: 1 },

  // 메시지 수정/삭제 메뉴
  menuBox: { position: 'absolute' as const, right: 0, top: '100%', marginTop: 4, background: '#fff', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 100, overflow: 'hidden' as const, border: '1px solid #E5E7EB' },
  menuItem: { display: 'block', width: '100%', padding: '11px 16px', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', textAlign: 'left' as const, cursor: 'pointer', fontSize: 13, color: '#1F2937' },
  editInput: { padding: '7px 10px', border: '1px solid #5F8F7B', borderRadius: 8, fontSize: 13, outline: 'none' },
  editConfirmBtn: { flex: 1, padding: '4px', background: '#5F8F7B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  editCancelBtn: { flex: 1, padding: '4px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 },

  // AI 스마트 답변
  aiSuggestWrap: { background: "#F8FAF9", borderTop: "1px solid #E5E7EB", padding: "8px 12px 6px", flexShrink: 0 },
  aiSuggestHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  aiCloseBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#A9CBBB", padding: "0 2px" },
  aiQuickReplies: { display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 4 },
  aiChip: { background: "#fff", border: "1px solid #5F8F7B", color: "#5F8F7B", borderRadius: 16, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontWeight: 500 },
  aiDraftBtn: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", color: "#1F2937", textAlign: "left" as const, width: "100%", display: "flex", alignItems: "center" },

  // 입력창
  inputWrap: { background: "#fff", borderTop: "1px solid #E5E7EB", flexShrink: 0 },
  inputToolbar: { display: "flex", gap: 4, padding: "8px 12px 0" },
  toolBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: "4px 6px", borderRadius: 6, color: "#6B7280" },
  inputRow: { display: "flex", alignItems: "flex-end", gap: 8, padding: "6px 12px 10px" },
  textarea: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #E5E7EB",
    borderRadius: 22,
    fontSize: 14,
    outline: "none",
    resize: "none" as const,
    lineHeight: 1.5,
    maxHeight: 120,
    overflowY: "auto" as const,
    fontFamily: "inherit",
    background: "#F8FAF9",
    color: "#1F2937",
  },
  sendBtn: {
    background: "#5F8F7B",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "10px 18px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: 14,
    flexShrink: 0,
  },
  // 컨텍스트 메뉴
  ctxMenu: {
    position: "fixed" as const,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    zIndex: 10001,
    minWidth: 160,
    border: "1px solid #E5E7EB",
    overflow: "hidden",
  },
  ctxItem: {
    display: "block",
    width: "100%",
    padding: "11px 16px",
    background: "none",
    border: "none",
    textAlign: "left" as const,
    cursor: "pointer",
    fontSize: 13,
    color: "#1F2937",
  },
  // 모달
  modalOverlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002 },
  modal: { background: '#fff', borderRadius: 14, padding: '24px 24px 20px', width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle: { fontWeight: 'bold', fontSize: 15, color: '#1F2937', marginBottom: 14 },
  modalInput: { width: '100%', padding: '10px 14px', border: '1px solid #5F8F7B', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
  modalBtns: { display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' },
  modalCancel: { padding: '8px 16px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  modalConfirm: { padding: '8px 16px', background: '#5F8F7B', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' },
  // 에러 토스트
  errorToast: { position: 'fixed' as const, top: 16, left: '50%', transform: 'translateX(-50%)', background: '#c62828', color: '#fff', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', zIndex: 99999, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', maxWidth: 380, whiteSpace: 'pre-wrap' as const },
  errorClose: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: 0, flexShrink: 0 },
};
