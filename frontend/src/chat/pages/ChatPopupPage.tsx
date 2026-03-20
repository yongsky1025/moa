import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { chatApi } from "../../api/chatApi";
import { circleApi } from "../../api/circleApi";
import { notificationApi } from "../../api/notificationApi";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuthStore } from "../../store/authStore";
import type { ChatRoomSummary, ChatMessage } from "../types/chat";
import type { Notification } from "../../types/notification";
import type { CircleMember } from "../../circle/types/circle";

const AVATAR_COLORS = ["#F4A261", "#E76F51", "#2A9D8F", "#457B9D", "#6D6875", "#E9C46A"];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "😎",
  "🥺",
  "😭",
  "😡",
  "🤔",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "✨",
  "🎉",
  "😊",
  "🙏",
  "💪",
  "😅",
  "🤣",
  "😇",
  "😘",
  "🥳",
  "😴",
  "🤯",
  "😱",
];

const IMAGE_EXTS = /\.(png|jpg|jpeg|gif|webp)$/i;
function renderMsgContent(content: string, mine: boolean) {
  if (content.startsWith('/api/chat/files/')) {
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
      <a href={content} download style={{ color: mine ? '#fff' : '#d07856', textDecoration: 'underline', fontSize: 13 }}>
        📎 {fileName}
      </a>
    );
  }
  return content;
}

export default function ChatPopupPage() {
  const { userId } = useAuthStore();

  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoomSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [editingRoomName, setEditingRoomName] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [menuId, setMenuId] = useState<number | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const [editMsgContent, setEditMsgContent] = useState("");
  const [roomCtxMenu, setRoomCtxMenu] = useState<{ x: number; y: number; room: ChatRoomSummary } | null>(null);
  const [renaming, setRenaming] = useState<{ roomId: number; value: string } | null>(null);
  const [profileModal, setProfileModal] = useState<{ nickname: string; senderId: number } | null>(null);
  const [profileChatError, setProfileChatError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ctxMenuRef = useRef<HTMLDivElement>(null);

  const unreadNoti = notifications.filter((n) => !n.isRead).length;

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
    setLoadingMsg(true);
    chatApi
      .getMessages(activeRoom.roomId)
      .then((data) => {
        setMessages([...data].reverse());
        chatApi.markAsRead(activeRoom.roomId).catch(() => {});
      })
      .finally(() => setLoadingMsg(false));

    // 모임방이면 멤버 로드
    if (activeRoom.roomType === "GROUP" && activeRoom.circleId) {
      circleApi
        .getActiveMembers(activeRoom.circleId, { size: 100 })
        .then((res) => setMembers(res.data.dtoList ?? []))
        .catch(() => setMembers([]));
    } else {
      setMembers([]);
    }
    setShowMembers(false);
  }, [activeRoom]);

  useEffect(() => {
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
        setMessages((prev) => [...prev, msg]);
        chatApi.markAsRead(msg.roomId).catch(() => {});
      }
      setRooms((prev) =>
        prev.map((r) =>
          r.roomId === msg.roomId
            ? { ...r, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: r.roomId === activeRoom?.roomId ? 0 : r.unreadCount + 1 }
            : r,
        ),
      );
    },
    [activeRoom],
  );

  const { sendMessage } = useWebSocket({ roomId: activeRoom?.roomId ?? 0, onMessage: handleNewMessage });

  const handleSend = () => {
    if (!input.trim() || !activeRoom) return;
    sendMessage(input.trim());
    setInput("");
    setShowEmoji(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoom) return;
    try {
      sendMessage(await chatApi.uploadFile(file));
    } catch {
      alert("업로드 실패");
    }
  };

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

  const AVATAR_COLORS2 = ["#F4A261", "#E76F51", "#2A9D8F", "#457B9D", "#6D6875", "#E9C46A", "#264653"];
  const nickColor = (nick: string) => AVATAR_COLORS2[(nick?.charCodeAt(0) ?? 0) % AVATAR_COLORS2.length];

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
      console.log("[startDirectChat] found:", found);
      if (found) setActiveRoom(found);
    } catch (e) {
      console.error("[startDirectChat] 에러:", e);
      alert("채팅방 생성 실패");
    }
  };

  const filteredRooms = rooms.filter((r) => roomLabel(r).includes(search) || (r.lastMessage ?? "").includes(search));

  const totalUnread = rooms.reduce((s, r) => s + r.unreadCount, 0);

  return (
    <div style={s.root}>
      {/* 에러 토스트 */}
      {errorMsg && (
        <div style={s.errorToast}>
          {errorMsg}
          <button style={s.errorClose} onClick={() => setErrorMsg(null)}>✕</button>
        </div>
      )}
      {/* ── 사이드바 ── */}
      <div style={s.sidebar}>
        {/* 사이드바 헤더 */}
        <div style={s.sideHeader}>
          <span style={s.sideTitle}>채팅</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {/* 알림 */}
            <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <button style={s.iconBtn} onClick={() => setShowNoti((v) => !v)}>
                🔔
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
                  {notifications.length === 0 ? (
                    <p style={s.notiEmpty}>알림 없음</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{ ...s.notiItem, background: n.isRead ? "#fafafa" : "#fdf0e8" }}
                        onClick={async () => {
                          if (!n.isRead) {
                            await notificationApi.readOne(n.id);
                            setNotifications((p) => p.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
                          }
                        }}
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
          <input style={s.searchInput} placeholder="🔍  채팅방 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* 채팅방 목록 */}
        <div style={s.roomList}>
          {filteredRooms.length === 0 ? (
            <div style={s.noRoom}>채팅방이 없습니다</div>
          ) : (
            filteredRooms.map((r) => (
              <div
                key={r.roomId}
                style={{ ...s.roomItem, background: r.roomId === activeRoom?.roomId ? "#fdf0e8" : "transparent" }}
                onClick={() => setActiveRoom(r)}
                onContextMenu={(e) => handleRoomContextMenu(e, r)}
              >
                <div style={{ ...s.roomAvatar, background: r.roomType === 'GROUP' ? '#d07856' : r.roomType === 'SCHEDULE' ? '#5b8def' : '#b8643d' }}>
                  {r.roomType === 'GROUP' ? '👥' : r.roomType === 'SCHEDULE' ? '📅' : '👤'}
                </div>
                <div style={s.roomMeta}>
                  <div style={s.roomTop}>
                    <span style={s.roomName}>{roomLabel(r)}</span>
                    <span style={s.roomTime}>{formatTime(r.lastMessageAt)}</span>
                  </div>
                  <div style={s.roomTop}>
                    <span style={s.roomLast}>{r.lastMessage ?? ""}</span>
                    {r.unreadCount > 0 && <span style={s.unreadBadge}>{r.unreadCount}</span>}
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
              style={s.ctxItem}
              onClick={() => {
                setRenaming({ roomId: roomCtxMenu.room.roomId, value: roomCtxMenu.room.name ?? roomLabel(roomCtxMenu.room) });
                setRoomCtxMenu(null);
              }}
            >
              ✏️ 방 이름 변경
            </button>
          )}
          <button style={{ ...s.ctxItem, color: "#c62828" }} onClick={() => handleRoomLeave(roomCtxMenu.room.roomId)}>
            🚪 채팅방 나가기
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
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
            }}
            onClick={() => setProfileModal(null)}
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
              <div style={{ borderTop: "1px solid #f2e8e0", padding: "12px 20px" }}>
                <button
                  style={{
                    width: "100%",
                    padding: "11px 0",
                    background: "#d07856",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startDirectChat(profileModal.senderId);
                  }}
                >
                  💬 1:1 채팅하기
                </button>
              </div>
            </div>
            <div style={{ paddingTop: 42, paddingBottom: 20, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#262626' }}>{profileModal.nickname}</div>
            </div>
            {profileChatError && (
              <div style={{ margin: '0 20px 12px', padding: '10px 14px', background: '#fff3f3', border: '1px solid #f5c6c6', borderRadius: 8, fontSize: 13, color: '#c62828', textAlign: 'center' as const }}>
                {profileChatError}
              </div>
            )}
            <div style={{ borderTop: '1px solid #f2e8e0', padding: '12px 20px' }}>
              <button
                style={{ width: '100%', padding: '11px 0', background: '#d07856', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); startDirectChat(profileModal.senderId); }}
              >
                💬 1:1 채팅하기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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
                {activeRoom.roomType === "GROUP" && <div style={s.chatSub}>{members.length}명 참여 중</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {activeRoom.roomType === "GROUP" && (
                  <button style={s.headerBtn} onClick={() => setShowMembers((v) => !v)}>
                    👥 멤버
                  </button>
                )}
              </div>
            </div>

            {/* 멤버 패널 */}
            {showMembers && (
              <div style={s.memberPanel}>
                {members.map((m) => (
                  <div
                    key={m.circleMemberId}
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

            {/* 메시지 영역 */}
            <div style={s.msgArea}>
              {loadingMsg
                ? <div style={s.placeholder}>불러오는 중...</div>
                : messages.length === 0
                  ? <div style={s.firstMsg}>첫 메시지를 보내보세요! 👋</div>
                  : messages.map((msg) => {
                    const mine = msg.senderId === userId;
                    return (
                      <div key={msg.messageId} style={{ ...s.msgRow, flexDirection: mine ? 'row-reverse' : 'row' }}>
                        {!mine && (
                          <div
                            style={{ ...s.avatar, background: avatarColor(msg.senderId), cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); setProfileModal({ nickname: msg.senderNickname ?? '?', senderId: msg.senderId }); }}
                          >
                            {(msg.senderNickname ?? String(msg.senderId)).charAt(0)}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '80%', minWidth: 0 }}>
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
                                  background: msg.isDeleted ? '#e0e0e0' : !msg.content.startsWith('/api/chat/files/') ? (mine ? '#d07856' : '#fff') : 'transparent',
                                  color: msg.isDeleted ? '#999' : mine ? '#fff' : '#1a1a1a',
                                  fontStyle: msg.isDeleted ? 'italic' : 'normal',
                                  borderRadius: msg.content.startsWith('/api/chat/files/') && !msg.isDeleted ? 8 : 6,
                                  padding: msg.content.startsWith('/api/chat/files/') && !msg.isDeleted ? 0 : undefined,
                                  boxShadow: msg.content.startsWith('/api/chat/files/') && !msg.isDeleted ? 'none' : mine ? '0 2px 6px rgba(208,120,86,0.35)' : '0 2px 6px rgba(0,0,0,0.12)',
                                  border: !msg.content.startsWith('/api/chat/files/') && !mine && !msg.isDeleted ? '1px solid #e8e8e8' : 'none',
                                }}
                                onContextMenu={mine && !msg.isDeleted ? (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMenuId(menuId === msg.messageId ? null : msg.messageId);
                                } : undefined}
                              >
                                {msg.isDeleted ? '삭제된 메시지입니다.' : renderMsgContent(msg.content, mine)}
                                {!msg.isDeleted && msg.updatedAt && (
                                  <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 6 }}>(수정됨)</span>
                                )}
                                {menuId === msg.messageId && (
                                  <div style={s.menuBox} onClick={(e) => e.stopPropagation()}>
                                    <button style={s.menuItem} onClick={() => startEditMsg(msg)}>수정</button>
                                    <button style={{ ...s.menuItem, color: '#e53935' }} onClick={() => handleDeleteMsg(msg.messageId)}>삭제</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                ...s.bubble,
                                position: "relative",
                                background: msg.isDeleted ? "#e0e0e0" : mine ? "#d07856" : "#fff",
                                color: msg.isDeleted ? "#999" : mine ? "#fff" : "#262626",
                                fontStyle: msg.isDeleted ? "italic" : "normal",
                              }}
                              onContextMenu={
                                mine && !msg.isDeleted
                                  ? (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setMenuId(menuId === msg.messageId ? null : msg.messageId);
                                    }
                                  : undefined
                              }
                            >
                              {msg.isDeleted ? "삭제된 메시지입니다." : msg.content}
                              {!msg.isDeleted && msg.updatedAt && <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 6 }}>(수정됨)</span>}
                              {menuId === msg.messageId && (
                                <div style={s.menuBox} onClick={(e) => e.stopPropagation()}>
                                  <button style={s.menuItem} onClick={() => startEditMsg(msg)}>
                                    수정
                                  </button>
                                  <button style={{ ...s.menuItem, color: "#e53935" }} onClick={() => handleDeleteMsg(msg.messageId)}>
                                    삭제
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          <span style={s.msgTime}>{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* 이모티콘 피커 */}
            {showEmoji && (
              <div style={s.emojiPicker}>
                {EMOJIS.map((e) => (
                  <button key={e} style={s.emojiBtn} onClick={() => setInput((p) => p + e)}>
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* 입력 영역 */}
            <div style={s.inputWrap}>
              <div style={s.inputToolbar}>
                <button style={s.toolBtn} onClick={() => fileInputRef.current?.click()}>
                  📎
                </button>
                <button style={s.toolBtn} onClick={() => setShowEmoji((v) => !v)}>
                  😊
                </button>
                <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFile} />
              </div>
              <div style={s.inputRow}>
                <textarea
                  style={s.textarea}
                  placeholder="메시지를 입력하세요"
                  value={input}
                  rows={1}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button style={{ ...s.sendBtn, opacity: input.trim() ? 1 : 0.4 }} onClick={handleSend} disabled={!input.trim()}>
                  전송
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    height: "100vh",
    fontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
    overflow: "hidden",
    background: "#fdf0e8",
  },

  // 사이드바
  sidebar: { width: 280, display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #f2e8e0", flexShrink: 0 },
  sideHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px 8px", flexShrink: 0 },
  sideTitle: { fontSize: 18, fontWeight: "bold", color: "#262626" },
  iconBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", position: "relative", padding: 4 },
  dot: {
    position: "absolute",
    top: 0,
    right: 0,
    background: "#b8643d",
    color: "#fff",
    borderRadius: "50%",
    fontSize: 9,
    padding: "1px 4px",
    fontWeight: "bold",
  },
  searchWrap: { padding: "6px 12px 10px", flexShrink: 0 },
  searchInput: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #f2e8e0",
    borderRadius: 20,
    background: "#fdf0e8",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  roomList: { flex: 1, overflowY: "auto" as const },
  noRoom: { textAlign: "center" as const, padding: 24, color: "#aaa", fontSize: 13 },
  roomItem: { display: "flex", alignItems: "center", padding: "10px 14px", cursor: "pointer", gap: 12, borderBottom: "1px solid #f2e8e0" },
  roomAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  roomMeta: { flex: 1, minWidth: 0 },
  roomTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  roomName: { fontSize: 14, fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, color: "#262626" },
  roomTime: { fontSize: 11, color: "#aaa", flexShrink: 0, marginLeft: 4 },
  roomLast: { fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  unreadBadge: { background: "#d07856", color: "#fff", borderRadius: 10, fontSize: 10, padding: "2px 6px", fontWeight: "bold", flexShrink: 0 },
  totalUnread: {
    padding: "10px 16px",
    background: "#fdf0e8",
    fontSize: 12,
    color: "#b8643d",
    textAlign: "center" as const,
    borderTop: "1px solid #f2e8e0",
  },

  // 알림
  notiDropdown: {
    position: "absolute" as const,
    left: 0,
    top: 36,
    width: 280,
    maxHeight: 320,
    overflowY: "auto" as const,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    zIndex: 1000,
  },
  notiHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #f2e8e0" },
  notiAll: { background: "none", border: "none", color: "#d07856", cursor: "pointer", fontSize: 12 },
  notiEmpty: { padding: 16, textAlign: "center" as const, color: "#aaa", fontSize: 13 },
  notiItem: { padding: "10px 14px", borderBottom: "1px solid #f2e8e0", cursor: "pointer", display: "flex", flexDirection: "column" as const, gap: 2 },
  notiMsg: { fontSize: 13, color: "#333" },
  notiTime: { fontSize: 11, color: "#aaa" },

  // 채팅 영역
  chat: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fdf0e8" },
  placeholder: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#aaa",
    background: "#fdf0e8",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#fff",
    borderBottom: "1px solid #f2e8e0",
    flexShrink: 0,
  },
  chatTitle: { fontWeight: "bold", fontSize: 15, color: "#262626" },
  chatSub: { fontSize: 12, color: "#888", marginTop: 2 },
  headerBtn: {
    background: "#fdf0e8",
    border: "1px solid #f2bb9b",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: 12,
    color: "#b8643d",
  },
  editNameBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "0 2px", opacity: 0.5 },
  roomNameInput: { flex: 1, padding: "5px 10px", border: "1px solid #d07856", borderRadius: 8, fontSize: 14, outline: "none", minWidth: 0 },
  nameConfirmBtn: {
    background: "#d07856",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: 12,
    flexShrink: 0,
  },
  nameCancelBtn: {
    background: "#f2e8e0",
    color: "#262626",
    border: "none",
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
    background: "#fff",
    borderBottom: "1px solid #f2e8e0",
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
  memberNick: { fontSize: 12, color: "#262626" },
  leaderTag: { fontSize: 10, background: "#fdf0e8", color: "#b8643d", borderRadius: 6, padding: "1px 5px" },

  // 메시지
  msgArea: { flex: 1, overflowY: 'auto' as const, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 12 },
  firstMsg: { textAlign: 'center' as const, color: '#888', fontSize: 13, marginTop: 20 },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14, flexShrink: 0, alignSelf: 'flex-start' },
  senderName: { fontSize: 11, color: '#666', marginBottom: 3, marginLeft: 2 },
  bubble: { padding: '11px 15px', borderRadius: 4, fontSize: 15, lineHeight: 1.5, wordBreak: 'break-word' as const, width: 'fit-content', maxWidth: 400, textAlign: 'left' as const },
  msgTime: { fontSize: 11, color: '#bbb', flexShrink: 0, marginBottom: 2 },

  // 메시지 수정/삭제 메뉴
  menuBox: { position: 'absolute' as const, right: 0, top: '100%', marginTop: 4, background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 100, minWidth: 90, overflow: 'hidden' as const },
  menuItem: { display: 'block', width: '100%', padding: '11px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', textAlign: 'left' as const, cursor: 'pointer', fontSize: 13, color: '#262626' },
  editInput: { padding: '7px 10px', border: '1px solid #d07856', borderRadius: 8, fontSize: 13, outline: 'none' },
  editConfirmBtn: { flex: 1, padding: '4px', background: '#d07856', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  editCancelBtn: { flex: 1, padding: '4px', background: '#f2e8e0', color: '#262626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 },

  // 이모지 피커
  emojiPicker: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 4,
    padding: "8px 14px",
    background: "#fff",
    borderTop: "1px solid #f2e8e0",
    flexShrink: 0,
  },
  emojiBtn: { background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 2 },

  // 입력창
  inputWrap: { background: "#fff", borderTop: "1px solid #f2e8e0", flexShrink: 0 },
  inputToolbar: { display: "flex", gap: 4, padding: "8px 12px 0" },
  toolBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: "4px 6px", borderRadius: 6 },
  inputRow: { display: "flex", alignItems: "flex-end", gap: 8, padding: "6px 12px 10px" },
  textarea: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #f2e8e0",
    borderRadius: 22,
    fontSize: 14,
    outline: "none",
    resize: "none" as const,
    lineHeight: 1.5,
    maxHeight: 100,
    overflowY: "auto" as const,
    fontFamily: "inherit",
  },
  sendBtn: {
    background: "#d07856",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "10px 18px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 14,
    flexShrink: 0,
  },
  // 컨텍스트 메뉴
  ctxMenu: {
    position: "fixed" as const,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    zIndex: 10001,
    minWidth: 160,
    border: "1px solid #f2e8e0",
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
    color: "#262626",
  },
  // 모달
  modalOverlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002 },
  modal: { background: '#fff', borderRadius: 14, padding: '24px 24px 20px', width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  modalTitle: { fontWeight: 'bold', fontSize: 15, color: '#262626', marginBottom: 14 },
  modalInput: { width: '100%', padding: '10px 14px', border: '1px solid #d07856', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
  modalBtns: { display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' },
  modalCancel: { padding: '8px 16px', background: '#f2e8e0', color: '#262626', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  modalConfirm: { padding: '8px 16px', background: '#d07856', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' },
  // 에러 토스트
  errorToast: { position: 'fixed' as const, top: 16, left: '50%', transform: 'translateX(-50%)', background: '#c62828', color: '#fff', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', zIndex: 99999, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', maxWidth: 380, whiteSpace: 'pre-wrap' as const },
  errorClose: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: 0, flexShrink: 0 },
};
