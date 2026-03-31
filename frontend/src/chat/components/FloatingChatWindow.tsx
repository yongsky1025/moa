import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { chatApi } from "../../api/chatApi";
import { circleApi } from "../../api/circleApi";
import { useWebSocket, type TypingEvent, type NoticeEvent } from "../hooks/useWebSocket";
import { useAuthStore } from "../../store/authStore";
import { notificationApi } from "../../api/notificationApi";
import EmojiPicker from "./EmojiPicker";
import type { ChatRoomSummary, ChatMessage } from "../types/chat";
import type { Notification } from "../../types/notification";
import type { CircleMember } from "../../circle/types/circle";

const IMAGE_EXTS = /\.(png|jpg|jpeg|gif|webp)$/i;
const isFileUrl = (c: string) => c.startsWith('/uploads/') || c.startsWith('/api/chat/files/');

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: '#FFE58F', borderRadius: 2, padding: '0 1px', color: '#1a1a1a' }}>{part}</mark>
      : part
  );
}

function renderMsgContent(content: string, mine: boolean, searchQuery = "") {
  if (isFileUrl(content)) {
    if (IMAGE_EXTS.test(content)) {
      return (
        <img
          src={content}
          alt="이미지"
          style={{ maxWidth: 180, maxHeight: 180, borderRadius: 12, display: 'block', cursor: 'pointer', objectFit: 'cover' }}
          onClick={() => window.open(content, '_blank')}
        />
      );
    }
    const fileName = content.split('/').pop() ?? '파일';
    return (
      <a href={content} download style={{ color: mine ? '#fff' : '#5F8F7B', textDecoration: 'underline', fontSize: 12 }}>
        📎 {fileName}
      </a>
    );
  }
  return content.split('\n').map((line, i, arr) =>
    i < arr.length - 1
      ? <span key={i}>{highlightText(line, searchQuery)}<br /></span>
      : <span key={i}>{highlightText(line, searchQuery)}</span>
  );
}

const AVATAR_COLORS = ["#F4A261", "#E76F51", "#2A9D8F", "#457B9D", "#6D6875", "#E9C46A", "#264653"];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const nickColor = (nick: string) => AVATAR_COLORS[(nick?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const MIN_W = 520;
const MIN_H = 400;
const INIT_W = 700;
const INIT_H = 520;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FloatingChatWindow({ open, onClose }: Props) {
  const { userId, user } = useAuthStore();

  const [pos, setPos] = useState({ x: window.innerWidth - INIT_W - 40, y: window.innerHeight - INIT_H - 60 });
  const [size, setSize] = useState({ w: INIT_W, h: INIT_H });

  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [search, setSearch] = useState("");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const chatNotifications = notifications.filter((n) => n.type === 'CHAT_MESSAGE');
  const unreadNoti = chatNotifications.filter((n) => !n.isRead).length;

  // 드래그 상태
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // 리사이즈 상태
  const resizing = useRef(false);
  const resizeDir = useRef("");
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const [roomCtxMenu, setRoomCtxMenu] = useState<{ x: number; y: number; room: ChatRoomSummary } | null>(null);
  const [renaming, setRenaming] = useState<{ roomId: number; value: string } | null>(null);
  const [readStatus, setReadStatus] = useState<Record<number, string>>({});
  const [mutedRooms, setMutedRooms] = useState<Set<number>>(() =>
    new Set(JSON.parse(localStorage.getItem('moa_muted_rooms') ?? '[]'))
  );
  const mutedRoomsRef = useRef(mutedRooms);
  mutedRoomsRef.current = mutedRooms;
  const [menuId, setMenuId] = useState<number | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const [editMsgContent, setEditMsgContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ messageId: number; content: string; nickname: string } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [noticeContent, setNoticeContent] = useState<string | null>(null);
  const [noticeMessageId, setNoticeMessageId] = useState<number | null>(null);
  const [unreadOnEnter, setUnreadOnEnter] = useState(0);

  // ChatPopupPage 동기화 기능
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [editingRoomName, setEditingRoomName] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [profileModal, setProfileModal] = useState<{ nickname: string; senderId: number } | null>(null);
  const [profileChatError, setProfileChatError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({});
  const typingTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const typingCooldownRef = useRef(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgAreaRef = useRef<HTMLDivElement>(null);
  const firstUnreadMsgIdRef = useRef<number | null>(null);
  const shouldScrollToUnreadRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;

  const roomLabel = (r: ChatRoomSummary) => {
    if (r.roomType === 'GROUP') return r.name ?? `모임 #${r.circleId}`;
    if (r.roomType === 'SCHEDULE') return r.name ?? `일정 채팅 #${r.scheduleId}`;
    return r.otherUserNickname ?? `1:1 채팅 #${r.roomId}`;
  };

  // 파생 값
  const activeRoom = rooms.find(r => r.roomId === activeRoomId) ?? null;
  const filteredRooms = rooms.filter(r => roomLabel(r).includes(search) || (r.lastMessage ?? '').includes(search));
  const totalUnread = rooms.reduce((s, r) => s + r.unreadCount, 0);

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
    if (!open) return;
    loadRooms();
    loadNotifications();
    const t = setInterval(() => {
      loadRooms();
      loadNotifications();
    }, 30000);
    return () => clearInterval(t);
  }, [open, loadRooms, loadNotifications]);

  useEffect(() => {
    const close = () => {
      setShowNoti(false);
      setRoomCtxMenu(null);
      setMenuId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNoti(false);
        setRoomCtxMenu(null);
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

  // #room-{roomId} 또는 #direct-{userId} 처리
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
      if (found) setActiveRoomId(found.roomId);
    } catch (e) {
      console.error("[handleRoomHash] 에러:", e);
    }
  }, []);

  useEffect(() => {
    handleRoomHash();
    window.addEventListener("hashchange", handleRoomHash);
    return () => window.removeEventListener("hashchange", handleRoomHash);
  }, [handleRoomHash]);

  useEffect(() => {
    if (!activeRoomId) return;
    // 타이핑 초기화
    setTypingUsers({});
    Object.values(typingTimersRef.current).forEach(clearTimeout);
    typingTimersRef.current = {};
    setReplyTo(null);
    setSearchQuery("");
    setShowSearch(false);
    const currentRoom = roomsRef.current.find(r => r.roomId === activeRoomId);
    const roomUnread = currentRoom?.unreadCount ?? 0;
    setUnreadOnEnter(roomUnread);
    firstUnreadMsgIdRef.current = null;
    shouldScrollToUnreadRef.current = roomUnread > 0;
    setRooms((prev) => prev.map((r) => r.roomId === activeRoomId ? { ...r, unreadCount: 0 } : r));
    setLoadingMsg(true);
    chatApi
      .getMessages(activeRoomId)
      .then((data) => {
        const msgs = [...data].reverse();
        if (roomUnread > 0 && msgs.length > 0) {
          const idx = Math.max(0, msgs.length - roomUnread);
          firstUnreadMsgIdRef.current = msgs[idx]?.messageId ?? null;
        }
        setMessages(msgs);
        chatApi.markAsRead(activeRoomId).catch(() => {});
      })
      .finally(() => setLoadingMsg(false));
    chatApi.getReadStatus(activeRoomId)
      .then((list) => {
        const map: Record<number, string> = {};
        list.forEach((r) => { map[r.userId] = r.lastReadAt; });
        setReadStatus(map);
      })
      .catch(() => {});
    // 모임방이면 멤버 로드
    const room = roomsRef.current.find(r => r.roomId === activeRoomId);
    if (room?.roomType === "GROUP" && room?.circleId) {
      circleApi
        .getActiveMembers(room.circleId, { size: 100 })
        .then((res) => setMembers(res.data.dtoList ?? []))
        .catch(() => setMembers([]));
    } else {
      setMembers([]);
    }
    setShowMembers(false);
    setEditingRoomName(false);
    setNoticeMessageId(room?.noticeMessageId ?? null);
    setNoticeContent(room?.noticeContent ?? null);
  }, [activeRoomId]);

  useEffect(() => {
    if (searchQuery) return;
    if (shouldScrollToUnreadRef.current) {
      shouldScrollToUnreadRef.current = false;
      const el = msgAreaRef.current?.querySelector<HTMLElement>('[data-first-unread]');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, searchQuery]);

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

  // 다른 창에서 뮤트 변경 시 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'moa_muted_rooms') {
        setMutedRooms(new Set(JSON.parse(e.newValue ?? '[]')));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleTyping = useCallback((event: TypingEvent) => {
    if (event.userId === userId) return;
    setTypingUsers((prev) => ({ ...prev, [event.userId]: event.nickname }));
    if (typingTimersRef.current[event.userId]) clearTimeout(typingTimersRef.current[event.userId]);
    typingTimersRef.current[event.userId] = setTimeout(() => {
      setTypingUsers((prev) => { const next = { ...prev }; delete next[event.userId]; return next; });
    }, 3000);
  }, [userId]);

  const handleNewMessage = useCallback(
    (msg: ChatMessage) => {
      if (msg.roomId === activeRoomId) {
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
            ? { ...r, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: (msg.roomId === activeRoomId || mutedRoomsRef.current.has(r.roomId)) ? 0 : r.unreadCount + 1 }
            : r,
        ),
      );
    },
    [activeRoomId],
  );

  const handleReadEvent = useCallback((event: { userId: number; lastReadAt: string }) => {
    setReadStatus((prev) => ({ ...prev, [event.userId]: event.lastReadAt }));
  }, []);

  const handleNotification = useCallback((noti: Notification) => {
    setNotifications((prev) => {
      if (noti.id != null && prev.some((n) => n.id === noti.id)) return prev;
      return [noti, ...prev];
    });
    if (noti.type === 'CHAT_MESSAGE' && noti.referenceId && noti.referenceId !== activeRoomId && !mutedRoomsRef.current.has(noti.referenceId)) {
      setRooms((prev) => prev.map((r) =>
        r.roomId === noti.referenceId ? { ...r, unreadCount: r.unreadCount + 1 } : r
      ));
    }
  }, [activeRoomId]);

  const handleSystemEvent = useCallback((event: { type: string; nickname: string; createdAt: string }) => {
    const text = event.type === 'LEAVE' ? `${event.nickname}님이 퇴장했습니다.` : `${event.nickname}님이 입장했습니다.`;
    const systemMsg: ChatMessage = {
      messageId: -Date.now(),
      roomId: activeRoomId ?? 0,
      senderId: 0,
      senderNickname: '',
      content: text,
      createdAt: event.createdAt,
      updatedAt: null,
      isDeleted: false,
      messageType: 'SYSTEM',
    };
    setMessages((prev) => [...prev, systemMsg]);
  }, [activeRoomId]);

  const handleReaction = useCallback((msg: ChatMessage) => {
    setMessages(prev => prev.map(m => m.messageId === msg.messageId ? { ...m, reactions: msg.reactions } : m));
  }, []);

  const handleNoticeEvent = useCallback((event: NoticeEvent) => {
    setNoticeMessageId(event.noticeMessageId);
    setNoticeContent(event.noticeContent);
  }, []);

  const handleSetNotice = async (messageId: number, content: string) => {
    if (!activeRoomId) return;
    try {
      await chatApi.setNotice(activeRoomId, messageId);
      setNoticeMessageId(messageId);
      setNoticeContent(content.length > 500 ? content.substring(0, 500) : content);
    } catch { setErrorMsg('공지 등록 실패'); }
  };

  const handleClearNotice = async () => {
    if (!activeRoomId) return;
    try {
      await chatApi.clearNotice(activeRoomId);
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

  const { sendMessage, sendTyping } = useWebSocket({
    roomId: activeRoomId ?? 0,
    userId: userId ?? undefined,
    onMessage: handleNewMessage,
    onReadEvent: handleReadEvent,
    onNotification: handleNotification,
    onSystemEvent: handleSystemEvent,
    onTyping: handleTyping,
    onReaction: handleReaction,
    onNotice: handleNoticeEvent,
  });

  const navigate = useNavigate();

  const handleNotiClick = async (n: Notification) => {
    if (!n.isRead) {
      await notificationApi.readOne(n.id);
      setNotifications((p) => p.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    }
    setShowNoti(false);
    switch (n.type) {
      case 'CHAT_MESSAGE':
        setActiveRoomId(n.referenceId ?? null);
        break;
      case 'JOIN_REQUEST':
      case 'JOIN_APPROVED':
      case 'JOIN_REJECTED':
      case 'KICKED':
      case 'CIRCLE_DISBANDED':
        navigate('/circle/my');
        break;
    }
  };

  const cancelPendingFile = () => {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(null);
    setPendingPreviewUrl(null);
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content && !pendingFile) return;
    if (!activeRoomId) return;

    if (pendingFile) {
      try {
        const fileUrl = await chatApi.uploadFile(pendingFile);
        const tempMsg: ChatMessage = {
          messageId: -Date.now(),
          roomId: activeRoomId,
          senderId: userId!,
          senderNickname: user?.nickname ?? '?',
          content: fileUrl,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          isDeleted: false,
        };
        setMessages((prev) => [...prev, tempMsg]);
        setRooms((prev) => prev.map((r) =>
          r.roomId === activeRoomId
            ? { ...r, lastMessage: fileUrl, lastMessageAt: tempMsg.createdAt }
            : r
        ));
        sendMessage(fileUrl);
        cancelPendingFile();
      } catch {
        alert("업로드 실패");
        return;
      }
    }

    if (content) {
      const tempMsg: ChatMessage = {
        messageId: -Date.now(),
        roomId: activeRoomId,
        senderId: userId!,
        senderNickname: user?.nickname ?? '?',
        content,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        isDeleted: false,
        replyToId: replyTo?.messageId ?? null,
        replyToContent: replyTo?.content ?? null,
        replyToNickname: replyTo?.nickname ?? null,
      };
      setMessages((prev) => [...prev, tempMsg]);
      setRooms((prev) => prev.map((r) =>
        r.roomId === activeRoomId
          ? { ...r, lastMessage: content, lastMessageAt: tempMsg.createdAt }
          : r
      ));
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      sendMessage(content, replyTo?.messageId);
      setReplyTo(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(file);
    setPendingPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
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
      if (found) setActiveRoomId(found.roomId);
      setProfileModal(null);
      setProfileChatError(null);
    } catch {
      setProfileChatError("채팅방 생성 실패");
    }
  };

  const handleRoomNameSave = async () => {
    if (!activeRoom || !roomNameInput.trim()) return;
    try {
      await chatApi.updateRoomName(activeRoom.roomId, roomNameInput.trim());
      const newName = roomNameInput.trim();
      setRooms((prev) => prev.map((r) => (r.roomId === activeRoom.roomId ? { ...r, name: newName } : r)));
    } catch {
      alert("이름 변경 실패");
    }
    setEditingRoomName(false);
  };

  // ─── 드래그 ───────────────────────────────────────────
  const onDragMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onUp = () => {
      dragging.current = false;
      setIsDragging(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

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

      if (dir.includes("e")) nw = Math.max(MIN_W, w + dx);
      if (dir.includes("s")) nh = Math.max(MIN_H, h + dy);
      if (dir.includes("w")) { nw = Math.max(MIN_W, w - dx); nx = px + (w - nw); }
      if (dir.includes("n")) { nh = Math.max(MIN_H, h - dy); ny = py + (h - nh); }

      setSize({ w: nw, h: nh });
      setPos({ x: nx, y: ny });
    };
    const onUp = () => { resizing.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const formatTime = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  const handleRoomContextMenu = (e: React.MouseEvent, room: ChatRoomSummary) => {
    e.preventDefault();
    e.stopPropagation();
    setRoomCtxMenu({ x: e.clientX, y: e.clientY, room });
  };

  const handleRoomLeave = async (roomId: number) => {
    if (!confirm("채팅방을 나가시겠습니까?")) return;
    try {
      await chatApi.leaveRoom(roomId);
      if (activeRoomId === roomId) setActiveRoomId(null);
      await loadRooms();
    } catch {
      alert("나가기 실패");
    }
    setRoomCtxMenu(null);
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

  const handleRenameConfirm = async () => {
    if (!renaming || !renaming.value.trim()) return;
    try {
      await chatApi.updateRoomName(renaming.roomId, renaming.value.trim());
      setRooms((prev) => prev.map((r) => (r.roomId === renaming.roomId ? { ...r, name: renaming.value.trim() } : r)));
    } catch {
      alert("이름 변경 실패");
    }
    setRenaming(null);
  };

  const openPopup = () => {
    window.open(
      "/chat/popup",
      "moa-chat",
      `width=${INIT_W},height=${INIT_H},resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`,
    );
  };

  // ─── 렌더 ──────────────────────────────────────────────
  if (!open) return null;

  return (
    <>
      {/* 우클릭 컨텍스트 메뉴 */}
      {roomCtxMenu && (
        <div
          style={{ position: "fixed", top: roomCtxMenu.y, left: roomCtxMenu.x, background: "#fff", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 10002, minWidth: 140, border: "1px solid #E5E7EB", overflow: "hidden" }}
          onClick={(e) => e.stopPropagation()}
        >
          {roomCtxMenu.room.roomType === "GROUP" && (
            <button
              style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#262626" }}
              onClick={() => { setRenaming({ roomId: roomCtxMenu.room.roomId, value: roomCtxMenu.room.name ?? roomLabel(roomCtxMenu.room) }); setRoomCtxMenu(null); }}
            >
              ✏️ 방 이름 변경
            </button>
          )}
          <button
            style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#262626" }}
            onClick={() => handleTogglePin(roomCtxMenu.room.roomId)}
          >
            {roomCtxMenu.room.isPinned ? '⭐ 즐겨찾기 해제' : '☆ 즐겨찾기 추가'}
          </button>
          <button
            style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#262626" }}
            onClick={() => { toggleMute(roomCtxMenu.room.roomId); setRoomCtxMenu(null); }}
          >
            {mutedRooms.has(roomCtxMenu.room.roomId) ? '🔔 알림 켜기' : '🔕 알림 끄기'}
          </button>
          <button
            style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#c62828" }}
            onClick={() => handleRoomLeave(roomCtxMenu.room.roomId)}
          >
            🚪 채팅방 나가기
          </button>
        </div>
      )}

      {/* 이름 변경 모달 */}
      {renaming && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10003 }} onClick={() => setRenaming(null)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "22px 22px 18px", width: 280, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: "bold", fontSize: 14, color: "#262626", marginBottom: 12 }}>방 이름 변경</div>
            <input
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #5F8F7B", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
              value={renaming.value}
              onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") handleRenameConfirm(); if (e.key === "Escape") setRenaming(null); }}
              autoFocus
              maxLength={50}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button style={{ padding: "7px 14px", background: "#EAF4F0", color: "#262626", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12 }} onClick={() => setRenaming(null)}>취소</button>
              <button style={{ padding: "7px 14px", background: "#5F8F7B", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: "bold" }} onClick={handleRenameConfirm}>변경</button>
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
          <div style={{ background: "#fff", borderRadius: 20, width: 280, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: nickColor(profileModal.nickname), height: 90, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: nickColor(profileModal.nickname), border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: -34 }}>
                {profileModal.nickname.charAt(0)}
              </div>
            </div>
            <div style={{ paddingTop: 42, paddingBottom: 20, textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#262626" }}>{profileModal.nickname}</div>
            </div>
            {profileChatError && (
              <div style={{ margin: '0 20px 12px', padding: '10px 14px', background: '#fff3f3', border: '1px solid #f5c6c6', borderRadius: 8, fontSize: 13, color: '#c62828', textAlign: 'center' }}>
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


      {/* 드래그 중 오버레이 */}
      {isDragging && <div style={{ position: "fixed", inset: 0, zIndex: 9998, cursor: "grabbing" }} />}

      <div style={{ ...s.window, left: pos.x, top: pos.y, width: size.w, height: size.h }}>
        <style>{`
          @keyframes typing-bounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-5px); opacity: 1; }
          }
          .typing-dots { display: flex; gap: 4px; align-items: center; height: 14px; }
          .typing-dots span { width: 6px; height: 6px; border-radius: 50%; background: #9CA3AF; animation: typing-bounce 1.2s infinite; display: inline-block; }
          .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
          .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        `}</style>

        {/* 리사이즈 핸들 */}
        <div style={{ ...s.rHandle, ...s.rN }} onMouseDown={onResizeMouseDown("n")} />
        <div style={{ ...s.rHandle, ...s.rS }} onMouseDown={onResizeMouseDown("s")} />
        <div style={{ ...s.rHandle, ...s.rE }} onMouseDown={onResizeMouseDown("e")} />
        <div style={{ ...s.rHandle, ...s.rW }} onMouseDown={onResizeMouseDown("w")} />
        <div style={{ ...s.rHandle, ...s.rNE }} onMouseDown={onResizeMouseDown("ne")} />
        <div style={{ ...s.rHandle, ...s.rNW }} onMouseDown={onResizeMouseDown("nw")} />
        <div style={{ ...s.rHandle, ...s.rSE }} onMouseDown={onResizeMouseDown("se")} />
        <div style={{ ...s.rHandle, ...s.rSW }} onMouseDown={onResizeMouseDown("sw")} />

        {/* 타이틀바 */}
        <div style={s.titleBar} onMouseDown={onDragMouseDown}>
          <span style={s.title}>💬 MOA 채팅</span>
          <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
            {/* 에러 토스트 */}
            {errorMsg && (
              <div style={{ position: 'absolute', top: 48, left: '50%', transform: 'translateX(-50%)', background: '#c62828', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, zIndex: 10004, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
                {errorMsg}
                <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, padding: 0 }}>✕</button>
              </div>
            )}
            {/* 알림 */}
            <div style={{ position: "relative" }}>
              <button style={s.titleBtn} onClick={() => setShowNoti((v) => !v)}>
                🔔{unreadNoti > 0 && <span style={s.nBadge}>{unreadNoti}</span>}
              </button>
              {showNoti && (
                <div style={s.notiBox}>
                  <div style={s.notiHeader}>
                    <span>알림</span>
                    <button style={s.notiReadAll} onClick={async () => { await notificationApi.readAll(); setNotifications((p) => p.map((n) => ({ ...n, isRead: true }))); }}>전체 읽음</button>
                  </div>
                  {chatNotifications.length === 0 ? (
                    <div style={s.notiEmpty}>알림 없음</div>
                  ) : (
                    chatNotifications.map((n) => (
                      <div key={n.id} style={{ ...s.notiItem, background: n.isRead ? "#f9f9f9" : "#eaf4ff" }} onClick={() => handleNotiClick(n)}>
                        <span style={s.notiMsg}>{n.message}</span>
                        <span style={s.notiTime}>{formatTime(n.createdAt)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* 메시지 검색 */}
            {activeRoomId && (
              <button
                onClick={() => { setShowSearch(v => !v); if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 50); else setSearchQuery(""); }}
                style={{ ...s.titleBtn, background: showSearch ? 'rgba(255,255,255,0.2)' : 'none' }}
                title="메시지 검색"
              >
                🔍
              </button>
            )}
            {/* 별도 창으로 분리 */}
            <button style={s.titleBtn} onClick={() => { openPopup(); onClose(); setActiveRoomId(null); }} title="별도 창으로 분리">▼</button>
            <button style={s.titleBtn} onClick={() => { onClose(); setActiveRoomId(null); }}>✕</button>
          </div>
        </div>

        <div style={s.body}>
          {/* 왼쪽: 채팅 목록 */}
          <div style={s.sidebar}>
            <div style={s.sidebarTitle}>채팅</div>
            {/* 채팅방 검색 */}
            <div style={{ padding: '6px 10px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
              <input
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 16, background: '#EAF4F0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                placeholder="🔍 채팅방 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredRooms.length === 0
                ? <div style={s.sideEmpty}>채팅방 없음</div>
                : filteredRooms.map((r) => (
                  <div key={r.roomId}
                    style={{ ...s.roomItem, background: r.roomId === activeRoomId ? '#e3f2fd' : 'transparent' }}
                    onClick={() => setActiveRoomId(r.roomId)}
                    onContextMenu={(e) => handleRoomContextMenu(e, r)}>
                    <div style={s.roomAvatar}>{r.roomType === 'GROUP' ? '👥' : r.roomType === 'SCHEDULE' ? '📅' : '👤'}</div>
                    <div style={s.roomInfo}>
                      <div style={s.roomRow}>
                        <span style={s.roomName}>{r.isPinned && <span style={{ color: '#F4A261', marginRight: 3, fontSize: 11 }}>⭐</span>}{roomLabel(r)}</span>
                        <span style={s.roomTime}>{formatTime(r.lastMessageAt)}</span>
                      </div>
                      <div style={s.roomRow}>
                        <span style={s.roomLast}>{r.lastMessage ?? ''}</span>
                        {mutedRooms.has(r.roomId)
                          ? <span style={{ fontSize: 13, color: '#9CA3AF' }}>🔕</span>
                          : r.unreadCount > 0 && <span style={s.unreadBadge}>{r.unreadCount > 99 ? '99+' : r.unreadCount}</span>
                        }
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            {/* 전체 미읽음 */}
            {totalUnread > 0 && (
              <div style={{ padding: '8px 12px', background: '#EAF4F0', fontSize: 11, color: '#5F8F7B', textAlign: 'center', borderTop: '1px solid #eee', flexShrink: 0 }}>
                읽지 않은 메시지 {totalUnread}개
              </div>
            )}
          </div>

          {/* 오른쪽: 채팅방 */}
          <div style={s.chatArea}>
            {!activeRoomId ? (
              <div style={s.noRoom}>채팅방을 선택하세요</div>
            ) : loadingMsg ? (
              <div style={s.noRoom}>불러오는 중...</div>
            ) : (
              <>
                {/* 채팅 헤더 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #eee', background: '#fff', flexShrink: 0 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingRoomName && activeRoom?.roomType === "GROUP" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          style={{ flex: 1, padding: '4px 8px', border: '1px solid #5F8F7B', borderRadius: 6, fontSize: 13, outline: 'none' }}
                          value={roomNameInput}
                          onChange={(e) => setRoomNameInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRoomNameSave(); if (e.key === "Escape") setEditingRoomName(false); }}
                          autoFocus
                          maxLength={100}
                        />
                        <button style={{ padding: '4px 8px', background: '#5F8F7B', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11 }} onClick={handleRoomNameSave}>확인</button>
                        <button style={{ padding: '4px 8px', background: '#EAF4F0', color: '#262626', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11 }} onClick={() => setEditingRoomName(false)}>취소</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1F2937' }}>
                          {activeRoom ? roomLabel(activeRoom) : ''}
                        </span>
                        {activeRoom?.roomType === "GROUP" && (
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#9CA3AF', padding: '2px 4px' }} onClick={() => { setRoomNameInput(activeRoom.name ?? roomLabel(activeRoom)); setEditingRoomName(true); }}>✏️</button>
                        )}
                      </div>
                    )}
                    {activeRoom?.roomType === "GROUP" && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{members.length}명 참여 중</div>}
                  </div>
                  {activeRoom?.roomType === "GROUP" && (
                    <button style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: '#374151' }} onClick={() => setShowMembers((v) => !v)}>
                      👥 멤버
                    </button>
                  )}
                </div>

                {/* 멤버 패널 */}
                {showMembers && (
                  <div style={{ borderBottom: '1px solid #eee', background: '#F9FAFB', overflowY: 'auto', maxHeight: 140, flexShrink: 0 }}>
                    {members.map((m) => (
                      <div
                        key={m.circleMemberId}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', cursor: m.userId !== userId ? 'pointer' : 'default' }}
                        onClick={(e) => { if (m.userId === userId) return; e.stopPropagation(); setProfileModal({ nickname: m.nickname, senderId: m.userId }); }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: avatarColor(m.userId), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 'bold', flexShrink: 0 }}>{m.nickname.charAt(0)}</div>
                        <span style={{ fontSize: 13, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nickname}</span>
                        {m.role === "LEADER" && <span style={{ fontSize: 10, background: '#5F8F7B', color: '#fff', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>방장</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* 검색 바 */}
                {showSearch && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>🔍</span>
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
                    <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 14, padding: '0 2px' }}>✕</button>
                  </div>
                )}

                {/* 공지 배너 (카카오톡 스타일) */}
                {noticeContent && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#FFF9C4', borderBottom: '2px solid #FFE500', flexShrink: 0, cursor: 'default' }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>📢</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#856404', fontWeight: 700, marginBottom: 1 }}>공지</div>
                      <div style={{ fontSize: 12, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{noticeContent}</div>
                    </div>
                    <button onClick={handleClearNotice} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B8A200', fontSize: 16, padding: '0 2px', flexShrink: 0, lineHeight: 1 }} title="공지 해제">✕</button>
                  </div>
                )}

                {/* 메시지 영역 */}
                <div ref={msgAreaRef} style={s.msgArea}>
                  {(searchQuery.trim()
                    ? messages.filter(m => !m.isDeleted && m.messageType !== 'SYSTEM' && m.content.toLowerCase().includes(searchQuery.toLowerCase()))
                    : messages
                  ).map((msg) => {
                    if (msg.messageType === 'SYSTEM') {
                      return (
                        <div key={msg.messageId} style={{ textAlign: 'center', margin: '8px 0', fontSize: 12, color: '#9CA3AF' }}>
                          {msg.content}
                        </div>
                      );
                    }
                    const mine = msg.senderId === userId;
                    return (
                      <div key={msg.messageId} {...(firstUnreadMsgIdRef.current === msg.messageId ? { 'data-first-unread': 'true' } : {})} style={{ ...s.msgRow, justifyContent: mine ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                          {!mine && <span style={s.nick}>{msg.senderNickname}</span>}
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexDirection: mine ? 'row-reverse' : 'row' }}>
                            {editingMsgId === msg.messageId ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 200 }}>
                                <input
                                  style={{ padding: '6px 10px', border: '1px solid #5F8F7B', borderRadius: 8, fontSize: 12, outline: 'none' }}
                                  value={editMsgContent}
                                  onChange={(e) => setEditMsgContent(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') confirmEditMsg(msg.messageId); if (e.key === 'Escape') setEditingMsgId(null); }}
                                  autoFocus
                                />
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button style={{ flex: 1, padding: '3px', background: '#5F8F7B', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11 }} onClick={() => confirmEditMsg(msg.messageId)}>확인</button>
                                  <button style={{ flex: 1, padding: '3px', background: '#EAF4F0', color: '#262626', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11 }} onClick={() => setEditingMsgId(null)}>취소</button>
                                </div>
                              </div>
                            ) : (
                              <div
                                style={{
                                  ...s.bubble,
                                  position: 'relative',
                                  background: msg.isDeleted ? '#e0e0e0' : !isFileUrl(msg.content) ? (mine ? '#FEE500' : '#F0F0F0') : 'transparent',
                                  color: msg.isDeleted ? '#999' : '#1A1A1A',
                                  fontStyle: msg.isDeleted ? 'italic' : 'normal',
                                  borderRadius: msg.isDeleted ? 18 : isFileUrl(msg.content) ? 8 : (mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px'),
                                  padding: (isFileUrl(msg.content) && !msg.isDeleted) || msg.replyToId ? 0 : '8px 12px',
                                  overflow: msg.replyToId ? 'hidden' : undefined,
                                  boxShadow: isFileUrl(msg.content) && !msg.isDeleted ? 'none' : mine ? '0 1px 3px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.12)',
                                  border: !isFileUrl(msg.content) && !mine && !msg.isDeleted ? '1px solid rgba(0,0,0,0.08)' : 'none',
                                }}
                                onContextMenu={!msg.isDeleted ? (e) => { e.preventDefault(); e.stopPropagation(); setMenuId(menuId === msg.messageId ? null : msg.messageId); } : undefined}
                              >
                                {/* 답장 인용 */}
                                {msg.replyToId && (
                                  <div style={{ background: mine ? 'rgba(0,0,0,0.1)' : '#F0F0F0', padding: '7px 12px 6px', borderBottom: '1px solid ' + (mine ? 'rgba(0,0,0,0.08)' : '#DDE1E6') }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: mine ? 'rgba(0,0,0,0.7)' : '#5F8F7B', marginBottom: 2 }}>{msg.replyToNickname}에게 답장</div>
                                    <div style={{ fontSize: 11, color: mine ? 'rgba(0,0,0,0.5)' : '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.replyToContent}</div>
                                  </div>
                                )}
                                <div style={msg.replyToId ? { padding: '8px 12px' } : undefined}>
                                  {msg.isDeleted ? '삭제된 메시지' : renderMsgContent(msg.content, mine, searchQuery)}
                                  {msg.updatedAt && !msg.isDeleted && <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 4 }}>(수정됨)</span>}
                                </div>
                                {menuId === msg.messageId && (
                                  <div style={{ position: 'absolute', right: mine ? 0 : undefined, left: mine ? undefined : 0, top: '100%', marginTop: 4, background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 100, minWidth: 110, overflow: 'hidden' }}>
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
                                    <button style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#262626' }} onClick={() => { setReplyTo({ messageId: msg.messageId, content: isFileUrl(msg.content) ? '📎 파일' : msg.content, nickname: msg.senderNickname }); setMenuId(null); textareaRef.current?.focus(); }}>답장</button>
                                    {!isFileUrl(msg.content) && (
                                      <button style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#262626' }} onClick={() => { navigator.clipboard.writeText(msg.content); setMenuId(null); }}>복사</button>
                                    )}
                                    {!isFileUrl(msg.content) && (
                                      noticeMessageId === msg.messageId
                                        ? <button style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#856404' }} onClick={() => { setMenuId(null); handleClearNotice(); }}>공지 해제</button>
                                        : <button style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#856404' }} onClick={() => { setMenuId(null); handleSetNotice(msg.messageId, msg.content); }}>공지</button>
                                    )}
                                    {mine ? (
                                      <>
                                        <button style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#262626' }} onClick={() => { setMenuId(null); startEditMsg(msg); }}>수정</button>
                                        <button style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#e53935' }} onClick={() => { setMenuId(null); handleDeleteMsg(msg.messageId); }}>삭제</button>
                                      </>
                                    ) : (
                                      <button style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#e53935' }} onClick={() => { setMenuId(null); window.open(`/report-form?targetType=CHAT_MESSAGE&targetId=${msg.messageId}`, '_blank', 'width=420,height=600,resizable=no'); }}>신고</button>
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
                  })}
                  {/* 타이핑 인디케이터 */}
                  {Object.entries(typingUsers).map(([uid, nickname]) => (
                    <div key={uid} style={{ display: 'flex', alignItems: 'flex-end', gap: 6, justifyContent: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={s.nick}>{nickname}</span>
                        <div style={{ ...s.bubble, background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 2px 6px rgba(0,0,0,0.10)', padding: '12px 16px' }}>
                          <div className="typing-dots"><span /><span /><span /></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* 읽지 않은 메시지 이동 버튼 */}
                {unreadOnEnter > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '5px 0', background: '#fff', borderTop: '1px solid #EAF4F0', flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        const el = msgAreaRef.current?.querySelector<HTMLElement>('[data-first-unread]');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setUnreadOnEnter(0);
                        firstUnreadMsgIdRef.current = null;
                      }}
                      style={{ background: '#5F8F7B', color: '#fff', border: 'none', borderRadius: 16, padding: '4px 14px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                    >
                      {unreadOnEnter}개 안 읽은 메시지 ↓
                    </button>
                  </div>
                )}

                {/* 입력 영역 */}
                <div style={{ ...s.inputArea, flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
                  {/* 답장 미리보기 */}
                  {replyTo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#F0F7F4', borderBottom: '1px solid #D1E8DF', borderLeft: '3px solid #5F8F7B' }}>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 11, color: '#5F8F7B', fontWeight: 600 }}>{replyTo.nickname}에게 답장</div>
                        <div style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.content}</div>
                      </div>
                      <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 14, padding: '0 2px', flexShrink: 0 }}>✕</button>
                    </div>
                  )}
                  {/* 파일 미리보기 */}
                  {pendingFile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: '1px solid #e5e7eb' }}>
                      {pendingPreviewUrl ? (
                        <img src={pendingPreviewUrl} alt="미리보기" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5E7EB' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F3F4F6', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#374151' }}>
                          📎 {pendingFile.name}
                        </div>
                      )}
                      <button onClick={cancelPendingFile} style={{ background: '#e5e7eb', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0 }}>✕</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px' }}>
                    <button onClick={() => fileInputRef.current?.click()} style={s.iconBtn}>📎</button>
                    <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileSelect} />
                    <button ref={emojiBtnRef} style={s.iconBtn} onClick={() => setShowEmoji((v) => !v)}>😊</button>
                    {showEmoji && (
                      <EmojiPicker anchorRef={emojiBtnRef} onSelect={(emoji) => setInput((prev) => prev + emoji)} onClose={() => setShowEmoji(false)} />
                    )}
                    <textarea
                      ref={textareaRef}
                      style={s.textInput}
                      placeholder="메시지 입력..."
                      value={input}
                      rows={1}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                        if (!typingCooldownRef.current && e.target.value.trim()) {
                          sendTyping(user?.nickname ?? '');
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
                    <button onClick={handleSend} style={s.sendBtn} disabled={!input.trim() && !pendingFile}>전송</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  window: {
    position: "fixed",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    userSelect: "none",
  },

  titleBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 12px",
    height: 44,
    background: "#2E7A62",
    cursor: "grab",
    flexShrink: 0,
    position: "relative",
  },
  title: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  titleBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    padding: "4px 6px",
    borderRadius: 4,
    position: "relative",
  },
  nBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    background: "#e53935",
    color: "#fff",
    borderRadius: "50%",
    fontSize: 9,
    padding: "1px 4px",
    fontWeight: "bold",
  },

  notiBox: {
    position: "absolute",
    right: 0,
    top: 36,
    width: 280,
    maxHeight: 320,
    overflowY: "auto",
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    zIndex: 10000,
  },
  notiHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #eee",
    fontWeight: "bold",
    fontSize: 13,
  },
  notiReadAll: { background: "none", border: "none", color: "#5F8F7B", cursor: "pointer", fontSize: 11 },
  notiEmpty: { padding: 16, textAlign: "center", color: "#aaa", fontSize: 13 },
  notiItem: { padding: "8px 14px", borderBottom: "1px solid #f0f0f0", cursor: "pointer", display: "flex", flexDirection: "column", gap: 2 },
  notiMsg: { fontSize: 12, color: "#333" },
  notiTime: { fontSize: 11, color: "#aaa" },

  body: { display: "flex", flex: 1, overflow: "hidden" },

  sidebar: { width: 200, borderRight: "1px solid #eee", display: "flex", flexDirection: "column", flexShrink: 0, background: '#EAF5DC' },
  sidebarTitle: { padding: "10px 12px", fontWeight: "bold", fontSize: 13, color: "#555", borderBottom: "1px solid #eee", flexShrink: 0 },
  sideEmpty: { padding: 16, textAlign: "center", color: "#aaa", fontSize: 12 },
  roomItem: { display: "flex", alignItems: "center", padding: "10px 12px", cursor: "pointer", gap: 10, borderBottom: "1px solid #EAF4F0" },
  roomAvatar: { fontSize: 22, flexShrink: 0 },
  roomInfo: { flex: 1, minWidth: 0 },
  roomRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  roomName: { fontSize: 13, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  roomTime: { fontSize: 10, color: "#aaa", flexShrink: 0, marginLeft: 4 },
  roomLast: { fontSize: 11, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  unreadBadge: { background: "#e53935", color: "#fff", borderRadius: 12, fontSize: 10, padding: "1px 5px", fontWeight: "bold", flexShrink: 0 },

  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  noRoom: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#bbb', fontSize: 14, background: '#EAF5DC' },
  msgArea: { flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10, background: '#EAF5DC' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 6 },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 'bold', flexShrink: 0, alignSelf: 'flex-start' },
  nick: { fontSize: 12, color: '#333', fontWeight: 600, marginBottom: 4 },
  bubble: { padding: '8px 12px', borderRadius: 18, fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word', width: 'fit-content', maxWidth: 240, textAlign: 'left' as const },
  msgTime: { fontSize: 11, color: '#999', flexShrink: 0, marginBottom: 2 },
  unreadCount: { fontSize: 11, color: '#E9C46A', fontWeight: 'bold', flexShrink: 0, marginBottom: 2, lineHeight: 1 },
  inputArea: { display: 'flex', alignItems: 'center', borderTop: '1px solid #eee', background: '#EAF5DC', flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '0 2px', flexShrink: 0 },
  textInput: { flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 20, fontSize: 13, outline: 'none', resize: 'none' as const, lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' as const, fontFamily: 'inherit' },
  sendBtn: { background: '#5F8F7B', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: 12, flexShrink: 0 },

  rHandle: { position: "absolute", zIndex: 10001 },
  rN: { top: 0, left: 8, right: 8, height: 5, cursor: "n-resize" },
  rS: { bottom: 0, left: 8, right: 8, height: 5, cursor: "s-resize" },
  rE: { right: 0, top: 8, bottom: 8, width: 5, cursor: "e-resize" },
  rW: { left: 0, top: 8, bottom: 8, width: 5, cursor: "w-resize" },
  rNE: { top: 0, right: 0, width: 10, height: 10, cursor: "ne-resize" },
  rNW: { top: 0, left: 0, width: 10, height: 10, cursor: "nw-resize" },
  rSE: { bottom: 0, right: 0, width: 10, height: 10, cursor: "se-resize" },
  rSW: { bottom: 0, left: 0, width: 10, height: 10, cursor: "sw-resize" },
};
