import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatApi } from "../../api/chatApi";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuthStore } from "../../store/authStore";
import { notificationApi } from "../../api/notificationApi";
import EmojiPicker from "./EmojiPicker";
import type { ChatRoomSummary, ChatMessage } from "../types/chat";
import type { Notification } from "../../types/notification";

const IMAGE_EXTS = /\.(png|jpg|jpeg|gif|webp)$/i;
function renderMsgContent(content: string, mine: boolean) {
  if (content.startsWith('/api/chat/files/')) {
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
  return content;
}

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

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const unreadNoti = notifications.filter((n) => !n.isRead).length;

  // 드래그 상태
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // 리사이즈 상태
  const resizing = useRef(false);
  const resizeDir = useRef("");
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });

  const [showEmoji, setShowEmoji] = useState(false);
  const [roomCtxMenu, setRoomCtxMenu] = useState<{ x: number; y: number; room: ChatRoomSummary } | null>(null);
  const [renaming, setRenaming] = useState<{ roomId: number; value: string } | null>(null);
  const [readStatus, setReadStatus] = useState<Record<number, string>>({});
  const [menuId, setMenuId] = useState<number | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const [editMsgContent, setEditMsgContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);

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
      }
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!activeRoomId) return;
    setLoadingMsg(true);
    chatApi
      .getMessages(activeRoomId)
      .then((data) => {
        setMessages([...data].reverse());
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
  }, [activeRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
            ? { ...r, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: msg.roomId === activeRoomId ? 0 : r.unreadCount + 1 }
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
      if (prev.some((n) => n.id === noti.id)) return prev;
      return [noti, ...prev];
    });
  }, []);

  const { sendMessage } = useWebSocket({
    roomId: activeRoomId ?? 0,
    userId: userId ?? undefined,
    onMessage: handleNewMessage,
    onReadEvent: handleReadEvent,
    onNotification: handleNotification,
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
        // 플로팅 창에서 채팅 목록을 보여줌
        setActiveRoomId(null);
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

  const handleSend = () => {
    const content = input.trim();
    if (!content || !activeRoomId) return;
    const tempMsg: ChatMessage = {
      messageId: -Date.now(),
      roomId: activeRoomId,
      senderId: userId!,
      senderNickname: user?.nickname ?? '?',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isDeleted: false,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setRooms((prev) => prev.map((r) =>
      r.roomId === activeRoomId
        ? { ...r, lastMessage: content, lastMessageAt: tempMsg.createdAt }
        : r
    ));
    setInput("");
    sendMessage(content);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoomId) return;
    try {
      const fileUrl = await chatApi.uploadFile(file);
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
    } catch {
      alert("업로드 실패");
    }
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
      // 클램핑 없음 → 멀티모니터에서 자유롭게 이동 가능
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

      let nw = w,
        nh = h,
        nx = px,
        ny = py;

      if (dir.includes("e")) nw = Math.max(MIN_W, w + dx);
      if (dir.includes("s")) nh = Math.max(MIN_H, h + dy);
      if (dir.includes("w")) {
        nw = Math.max(MIN_W, w - dx);
        nx = px + (w - nw);
      }
      if (dir.includes("n")) {
        nh = Math.max(MIN_H, h - dy);
        ny = py + (h - nh);
      }

      setSize({ w: nw, h: nh });
      setPos({ x: nx, y: ny });
    };
    const onUp = () => {
      resizing.current = false;
    };
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

  const roomLabel = (r: ChatRoomSummary) => {
    if (r.roomType === 'GROUP') return r.name ?? `모임 #${r.circleId}`;
    if (r.roomType === 'SCHEDULE') return r.name ?? `일정 채팅 #${r.scheduleId}`;
    return r.otherUserNickname ?? `1:1 채팅 #${r.roomId}`;
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
          style={{
            position: "fixed",
            top: roomCtxMenu.y,
            left: roomCtxMenu.x,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            zIndex: 10002,
            minWidth: 140,
            border: "1px solid #E5E7EB",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {roomCtxMenu.room.roomType === "GROUP" && (
            <button
              style={{
                display: "block",
                width: "100%",
                padding: "10px 14px",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 13,
                color: "#262626",
              }}
              onClick={() => {
                setRenaming({ roomId: roomCtxMenu.room.roomId, value: roomCtxMenu.room.name ?? roomLabel(roomCtxMenu.room) });
                setRoomCtxMenu(null);
              }}
            >
              ✏️ 방 이름 변경
            </button>
          )}
          <button
            style={{
              display: "block",
              width: "100%",
              padding: "10px 14px",
              background: "none",
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              fontSize: 13,
              color: "#c62828",
            }}
            onClick={() => handleRoomLeave(roomCtxMenu.room.roomId)}
          >
            🚪 채팅방 나가기
          </button>
        </div>
      )}

      {/* 이름 변경 모달 */}
      {renaming && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10003,
          }}
          onClick={() => setRenaming(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 12, padding: "22px 22px 18px", width: 280, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: "bold", fontSize: 14, color: "#262626", marginBottom: 12 }}>방 이름 변경</div>
            <input
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #5F8F7B",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
              value={renaming.value}
              onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameConfirm();
                if (e.key === "Escape") setRenaming(null);
              }}
              autoFocus
              maxLength={50}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button
                style={{
                  padding: "7px 14px",
                  background: "#EAF4F0",
                  color: "#262626",
                  border: "none",
                  borderRadius: 7,
                  cursor: "pointer",
                  fontSize: 12,
                }}
                onClick={() => setRenaming(null)}
              >
                취소
              </button>
              <button
                style={{
                  padding: "7px 14px",
                  background: "#5F8F7B",
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
                onClick={handleRenameConfirm}
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 드래그 중 다른 요소가 마우스 이벤트 가로채지 못하도록 오버레이 */}
      {isDragging && <div style={{ position: "fixed", inset: 0, zIndex: 9998, cursor: "grabbing" }} />}

      <div style={{ ...s.window, left: pos.x, top: pos.y, width: size.w, height: size.h }}>
        {/* 리사이즈 핸들 */}
        {
          <>
            <div style={{ ...s.rHandle, ...s.rN }} onMouseDown={onResizeMouseDown("n")} />
            <div style={{ ...s.rHandle, ...s.rS }} onMouseDown={onResizeMouseDown("s")} />
            <div style={{ ...s.rHandle, ...s.rE }} onMouseDown={onResizeMouseDown("e")} />
            <div style={{ ...s.rHandle, ...s.rW }} onMouseDown={onResizeMouseDown("w")} />
            <div style={{ ...s.rHandle, ...s.rNE }} onMouseDown={onResizeMouseDown("ne")} />
            <div style={{ ...s.rHandle, ...s.rNW }} onMouseDown={onResizeMouseDown("nw")} />
            <div style={{ ...s.rHandle, ...s.rSE }} onMouseDown={onResizeMouseDown("se")} />
            <div style={{ ...s.rHandle, ...s.rSW }} onMouseDown={onResizeMouseDown("sw")} />
          </>
        }

        {/* 타이틀바 (드래그 핸들) */}
        <div style={s.titleBar} onMouseDown={onDragMouseDown}>
          <span style={s.title}>💬 MOA 채팅</span>
          <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
            {/* 알림 버튼 */}
            <div style={{ position: "relative" }}>
              <button style={s.titleBtn} onClick={() => setShowNoti((v) => !v)}>
                🔔{unreadNoti > 0 && <span style={s.nBadge}>{unreadNoti}</span>}
              </button>
              {showNoti && (
                <div style={s.notiBox}>
                  <div style={s.notiHeader}>
                    <span>알림</span>
                    <button
                      style={s.notiReadAll}
                      onClick={async () => {
                        await notificationApi.readAll();
                        setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
                      }}
                    >
                      전체 읽음
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={s.notiEmpty}>알림 없음</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{ ...s.notiItem, background: n.isRead ? "#f9f9f9" : "#eaf4ff" }}
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
            {/* 별도 창으로 분리 (브라우저 독립 창) */}
            <button
              style={s.titleBtn}
              onClick={() => {
                openPopup();
                onClose();
                setActiveRoomId(null);
              }}
              title="별도 창으로 분리"
            >
              ▼
            </button>
            <button
              style={s.titleBtn}
              onClick={() => {
                onClose();
                setActiveRoomId(null);
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={s.body}>
            {/* 왼쪽: 채팅 목록 */}
            <div style={s.sidebar}>
              <div style={s.sidebarTitle}>채팅</div>
              {rooms.length === 0
                ? <div style={s.sideEmpty}>채팅방 없음</div>
                : rooms.map((r) => (
                  <div key={r.roomId}
                    style={{ ...s.roomItem, background: r.roomId === activeRoomId ? '#e3f2fd' : 'transparent' }}
                    onClick={() => setActiveRoomId(r.roomId)}
                    onContextMenu={(e) => handleRoomContextMenu(e, r)}>
                    <div style={s.roomAvatar}>{r.roomType === 'GROUP' ? '👥' : r.roomType === 'SCHEDULE' ? '📅' : '👤'}</div>
                    <div style={s.roomInfo}>
                      <div style={s.roomRow}>
                        <span style={s.roomName}>{roomLabel(r)}</span>
                        <span style={s.roomTime}>{formatTime(r.lastMessageAt)}</span>
                      </div>
                      <div style={s.roomRow}>
                        <span style={s.roomLast}>{r.lastMessage ?? ''}</span>
                      </div>
                    </div>
                  </div>
              ))
            }
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
                      const initial = (msg.senderNickname ?? '?')[0].toUpperCase();
                      const avatarColor = `hsl(${(msg.senderId * 47) % 360}, 55%, 55%)`;
                      return (
                        <div key={msg.messageId} style={{ ...s.msgRow, justifyContent: mine ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
                          {/* 상대방 아바타 */}
                          {!mine && (
                            <div style={{ ...s.avatar, background: avatarColor, flexShrink: 0 }}>
                              {initial}
                            </div>
                          )}
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
                                    background: msg.isDeleted ? '#e0e0e0' : !msg.content.startsWith('/api/chat/files/') ? (mine ? '#5F8F7B' : '#fff') : 'transparent',
                                    color: msg.isDeleted ? '#999' : mine ? '#fff' : '#1a1a1a',
                                    fontStyle: msg.isDeleted ? 'italic' : 'normal',
                                    borderRadius: msg.content.startsWith('/api/chat/files/') && !msg.isDeleted ? 8 : 18,
                                    padding: msg.content.startsWith('/api/chat/files/') && !msg.isDeleted ? 0 : undefined,
                                    boxShadow: msg.content.startsWith('/api/chat/files/') && !msg.isDeleted ? 'none' : mine ? '0 2px 6px rgba(95,143,123,0.35)' : '0 2px 6px rgba(0,0,0,0.10)',
                                    border: !msg.content.startsWith('/api/chat/files/') && !mine && !msg.isDeleted ? '1px solid #E5E7EB' : 'none',
                                  }}
                                  onContextMenu={mine && !msg.isDeleted ? (e) => { e.preventDefault(); e.stopPropagation(); setMenuId(menuId === msg.messageId ? null : msg.messageId); } : undefined}
                                >
                                  {msg.isDeleted ? '삭제된 메시지' : renderMsgContent(msg.content, mine)}
                                  {msg.updatedAt && !msg.isDeleted && <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 4 }}>(수정됨)</span>}
                                  {menuId === msg.messageId && (
                                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 100, minWidth: 90, overflow: 'hidden' }}>
                                      <button style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#262626' }} onClick={() => { setMenuId(null); startEditMsg(msg); }}>수정</button>
                                      <button style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#e53935' }} onClick={() => { setMenuId(null); handleDeleteMsg(msg.messageId); }}>삭제</button>
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
                          </div>
                        </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <div style={s.inputArea}>
                  <button onClick={() => fileInputRef.current?.click()} style={s.iconBtn}>
                    📎
                  </button>
                  <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileUpload} />
                  <button ref={emojiBtnRef} style={s.iconBtn} onClick={() => setShowEmoji((v) => !v)}>
                    😊
                  </button>
                  {showEmoji && (
                    <EmojiPicker anchorRef={emojiBtnRef} onSelect={(emoji) => setInput((prev) => prev + emoji)} onClose={() => setShowEmoji(false)} />
                  )}
                  <input
                    style={s.textInput}
                    placeholder="메시지 입력..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  />
                  <button onClick={handleSend} style={s.sendBtn} disabled={!input.trim()}>
                    전송
                  </button>
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
    background: "#5F8F7B",
    cursor: "grab",
    flexShrink: 0,
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

  sidebar: { width: 200, borderRight: "1px solid #eee", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 },
  sidebarTitle: { padding: "12px 14px", fontWeight: "bold", fontSize: 13, color: "#555", borderBottom: "1px solid #eee" },
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
  noRoom: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#bbb', fontSize: 14 },
  msgArea: { flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10, background: '#EAF4F0' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 6 },
  avatar: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 'bold', flexShrink: 0, alignSelf: 'flex-start' },
  nick: { fontSize: 11, color: '#666', fontWeight: 600, marginBottom: 4 },
  bubble: { padding: '8px 12px', borderRadius: 18, fontSize: 13, lineHeight: 1.45, wordBreak: 'break-word', width: 'fit-content', maxWidth: 240, textAlign: 'left' as const },
  msgTime: { fontSize: 10, color: '#bbb', flexShrink: 0, marginBottom: 2 },
  unreadCount: { fontSize: 11, color: '#E9C46A', fontWeight: 'bold', flexShrink: 0, marginBottom: 2, lineHeight: 1 },
  inputArea: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderTop: '1px solid #eee', background: '#fff', flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '0 2px' },
  textInput: { flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 20, fontSize: 13, outline: 'none' },
  sendBtn: { background: '#5F8F7B', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: 12 },

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
