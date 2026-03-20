import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { chatApi } from "../../api/chatApi";
import { circleApi } from "../../api/circleApi";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuthStore } from "../../store/authStore";
import EmojiPicker from "../components/EmojiPicker";
import type { ChatMessage, ChatRoomSummary } from "../types/chat";
import type { CircleMember } from "../../circle/types/circle";

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const rid = Number(roomId);
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [menuId, setMenuId] = useState<number | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [roomInfo, setRoomInfo] = useState<ChatRoomSummary | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [headerCtx, setHeaderCtx] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [profileModal, setProfileModal] = useState<{ nickname: string; senderId: number } | null>(null);
  const headerCtxRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatApi.getMessages(rid);
      setMessages([...data].reverse());
      await chatApi.markAsRead(rid);
    } catch {
      setError("메시지를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [rid, navigate]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // 방 정보 및 멤버 로드
  useEffect(() => {
    chatApi
      .getMyRooms()
      .then((rooms) => {
        const room = rooms.find((r) => r.roomId === rid);
        if (!room) return;
        setRoomInfo(room);
        if (room.roomType === "GROUP" && room.circleId) {
          circleApi
            .getActiveMembers(room.circleId, { size: 100 })
            .then((res) => setMembers(res.data.dtoList ?? []))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [rid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 바깥 클릭 / ESC 시 메뉴 닫기
  useEffect(() => {
    const close = () => {
      setMenuId(null);
      setHeaderCtx(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuId(null);
        setHeaderCtx(null);
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

  const startDirectChat = (targetUserId: number) => {
    if (targetUserId === userId) return;
    const popup = window.open(
      `/chat/popup#direct-${targetUserId}`,
      "moa-chat",
      "width=760,height=600,resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no",
    );
    if (popup && !popup.closed) {
      setTimeout(() => {
        popup.location.hash = `direct-${targetUserId}`;
      }, 300);
    }
    setProfileModal(null);
  };

  const handleHeaderContextMenu = (e: React.MouseEvent) => {
    if (roomInfo?.roomType !== "GROUP") return;
    e.preventDefault();
    setHeaderCtx({ x: e.clientX, y: e.clientY });
  };

  const handleRenameConfirm = async () => {
    if (renaming === null || !renaming.trim()) return;
    try {
      await chatApi.updateRoomName(rid, renaming.trim());
      setRoomInfo((prev) => (prev ? { ...prev, name: renaming.trim() } : prev));
    } catch {
      alert("이름 변경 실패");
    }
    setRenaming(null);
  };

  const handleLeave = async () => {
    if (!confirm("채팅방을 나가시겠습니까?")) return;
    try {
      await chatApi.leaveRoom(rid);
      navigate("/chat");
    } catch {
      alert("나가기 실패");
    }
  };

  const handleNewMessage = useCallback(
    (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      chatApi.markAsRead(rid).catch(() => {});
    },
    [rid],
  );

  const { sendMessage } = useWebSocket({ roomId: rid, onMessage: handleNewMessage });

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    sendMessage(content);
    setInput("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fileUrl = await chatApi.uploadFile(file);
      sendMessage(fileUrl);
    } catch {
      alert("파일 업로드 실패");
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
      setMessages((prev) => prev.map((m) => (m.messageId === messageId ? updated : m)));
    } catch {
      alert("수정 실패");
    } finally {
      setEditingId(null);
    }
  };

  // 삭제
  const handleDelete = async (messageId: number) => {
    if (!confirm("메시지를 삭제할까요?")) return;
    try {
      const deleted = await chatApi.deleteMessage(messageId);
      setMessages((prev) => prev.map((m) => (m.messageId === messageId ? deleted : m)));
    } catch {
      alert("삭제 실패");
    }
    setMenuId(null);
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

  const isMyMessage = (msg: ChatMessage) => msg.senderId === userId;

  const AVATAR_COLORS = ["#F4A261", "#E76F51", "#2A9D8F", "#457B9D", "#6D6875", "#E9C46A", "#264653"];
  const nickColor = (nick: string) => {
    const idx = (nick?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  };

  if (loading) return <div style={styles.center}>불러오는 중...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/chat")} style={styles.backBtn}>
          ←
        </button>
        <span
          style={styles.headerTitle}
          onContextMenu={handleHeaderContextMenu}
          title={roomInfo?.roomType === "GROUP" ? "우클릭으로 설정" : undefined}
        >
          {roomInfo?.roomType === "DIRECT" ? (roomInfo.otherUserNickname ?? "1:1 채팅") : (roomInfo?.name ?? `채팅방 #${rid}`)}
        </span>
        {roomInfo?.roomType === "GROUP" && (
          <button onClick={() => setShowMembers((v) => !v)} style={styles.memberBtn}>
            👥 {members.length}명
          </button>
        )}
      </div>

      {/* 헤더 우클릭 컨텍스트 메뉴 */}
      {headerCtx && (
        <div ref={headerCtxRef} style={{ ...styles.ctxMenu, top: headerCtx.y, left: headerCtx.x }} onClick={(e) => e.stopPropagation()}>
          <button
            style={styles.ctxItem}
            onClick={() => {
              setRenaming(roomInfo?.name ?? `채팅방 #${rid}`);
              setHeaderCtx(null);
            }}
          >
            ✏️ 방 이름 변경
          </button>
          <button style={{ ...styles.ctxItem, color: "#c62828" }} onClick={handleLeave}>
            🚪 채팅방 나가기
          </button>
        </div>
      )}

      {/* 이름 변경 모달 */}
      {renaming !== null && (
        <div style={styles.modalOverlay} onClick={() => setRenaming(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>방 이름 변경</div>
            <input
              style={styles.modalInput}
              value={renaming}
              onChange={(e) => setRenaming(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameConfirm();
                if (e.key === "Escape") setRenaming(null);
              }}
              autoFocus
              maxLength={50}
            />
            <div style={styles.modalBtns}>
              <button style={styles.modalCancel} onClick={() => setRenaming(null)}>
                취소
              </button>
              <button style={styles.modalConfirm} onClick={handleRenameConfirm}>
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 패널 */}
      {showMembers && roomInfo?.roomType === "GROUP" && (
        <div style={styles.memberPanel}>
          <div style={styles.memberPanelTitle}>멤버 ({members.length}명)</div>
          {members.map((m) => (
            <div
              key={m.circleMemberId}
              style={{ ...styles.memberItem, cursor: m.userId !== userId ? "pointer" : "default" }}
              onClick={() => m.userId !== userId && setProfileModal({ nickname: m.nickname, senderId: m.userId })}
              title={m.userId !== userId ? "1:1 채팅" : undefined}
            >
              <span style={styles.memberAvatar}>{m.nickname.charAt(0)}</span>
              <span style={styles.memberNick}>{m.nickname}</span>
              {m.role === "LEADER" && <span style={styles.leaderBadge}>방장</span>}
            </div>
          ))}
        </div>
      )}

      <div style={styles.msgArea}>
        {messages.length === 0 && <div style={styles.empty}>첫 메시지를 보내보세요!</div>}
        {messages.map((msg) => {
          const mine = isMyMessage(msg);
          const avatarColor = nickColor(msg.senderNickname);
          return (
            <div key={msg.messageId} style={{ ...styles.msgRow, justifyContent: mine ? "flex-end" : "flex-start" }}>
              {!mine && (
                <div
                  style={{ ...styles.avatar, background: avatarColor, cursor: "pointer" }}
                  onClick={() => setProfileModal({ nickname: msg.senderNickname ?? "?", senderId: msg.senderId })}
                >
                  {msg.senderNickname?.charAt(0) ?? "?"}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", maxWidth: "65%" }}>
                {!mine && <span style={styles.nick}>{msg.senderNickname}</span>}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexDirection: mine ? "row-reverse" : "row" }}>
                  {/* 말풍선 */}
                  {editingId === msg.messageId ? (
                    <div style={styles.editBox}>
                      <input
                        style={styles.editInput}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmEdit(msg.messageId);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        <button style={styles.editConfirmBtn} onClick={() => confirmEdit(msg.messageId)}>
                          확인
                        </button>
                        <button style={styles.editCancelBtn} onClick={() => setEditingId(null)}>
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        ...styles.bubble,
                        background: msg.isDeleted ? "#e0e0e0" : mine ? "#d07856" : "#f2e8e0",
                        color: msg.isDeleted ? "#999" : mine ? "#fff" : "#262626",
                        fontStyle: msg.isDeleted ? "italic" : "normal",
                      }}
                    >
                      {msg.isDeleted ? "삭제된 메시지입니다." : msg.content}
                      {!msg.isDeleted && msg.updatedAt && <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 6 }}>(수정됨)</span>}
                    </div>
                  )}

                  <span style={styles.time}>{formatTime(msg.createdAt)}</span>

                  {/* 내 메시지 & 삭제 안 된 경우만 메뉴 */}
                  {mine && !msg.isDeleted && editingId !== msg.messageId && (
                    <div style={{ position: "relative" }}>
                      <button
                        style={styles.menuBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(menuId === msg.messageId ? null : msg.messageId);
                        }}
                      >
                        ···
                      </button>
                      {menuId === msg.messageId && (
                        <div style={styles.menuBox} onClick={(e) => e.stopPropagation()}>
                          <button style={styles.menuItem} onClick={() => startEdit(msg)}>
                            수정
                          </button>
                          <button style={{ ...styles.menuItem, color: "#e53935" }} onClick={() => handleDelete(msg.messageId)}>
                            삭제
                          </button>
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

      {/* 카카오 스타일 프로필 모달 */}
      {profileModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setProfileModal(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 20, width: 300, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 배경 */}
            <div
              style={{
                background: nickColor(profileModal.nickname),
                height: 100,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 0,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: nickColor(profileModal.nickname),
                  border: "4px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: -36,
                }}
              >
                {profileModal.nickname.charAt(0)}
              </div>
            </div>
            {/* 닉네임 */}
            <div style={{ paddingTop: 44, paddingBottom: 24, textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#262626" }}>{profileModal.nickname}</div>
            </div>
            {/* 버튼 */}
            <div style={{ borderTop: "1px solid #f2e8e0", padding: "14px 24px" }}>
              <button
                style={{
                  width: "100%",
                  padding: "12px 0",
                  background: "#d07856",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
                onClick={() => startDirectChat(profileModal.senderId)}
              >
                💬 1:1 채팅하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.inputArea}>
        <button onClick={() => fileInputRef.current?.click()} style={styles.fileBtn}>
          📎
        </button>
        <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileUpload} />
        <input
          style={styles.textInput}
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <button ref={emojiBtnRef} style={styles.fileBtn} onClick={() => setShowEmoji((v) => !v)}>
          😊
        </button>
        {showEmoji && (
          <EmojiPicker anchorRef={emojiBtnRef} onSelect={(emoji) => setInput((prev) => prev + emoji)} onClose={() => setShowEmoji(false)} />
        )}
        <button onClick={handleSend} style={styles.sendBtn} disabled={!input.trim()}>
          전송
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#fdf0e8",
  },
  center: { display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#888" },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    background: "#fff",
    borderBottom: "1px solid #f2e8e0",
    flexShrink: 0,
  },
  backBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "0 4px", color: "#d07856" },
  headerTitle: { fontWeight: "bold", fontSize: 16, flex: 1, color: "#262626" },
  memberBtn: {
    background: "#fdf0e8",
    border: "none",
    borderRadius: 16,
    padding: "5px 12px",
    cursor: "pointer",
    fontSize: 13,
    color: "#d07856",
    fontWeight: "bold",
  },
  memberPanel: {
    background: "#fff",
    borderBottom: "1px solid #f2e8e0",
    padding: "10px 16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    maxHeight: 200,
    overflowY: "auto" as const,
    flexShrink: 0,
  },
  memberPanelTitle: { fontWeight: "bold", fontSize: 13, color: "#555", marginBottom: 4 },
  memberItem: { display: "flex", alignItems: "center", gap: 8 },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#d07856",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: "bold",
    flexShrink: 0,
  } as React.CSSProperties,
  memberNick: { fontSize: 13, color: "#262626" },
  leaderBadge: { fontSize: 10, background: "#fdf0e8", color: "#b8643d", borderRadius: 8, padding: "2px 6px", fontWeight: "bold" },
  msgArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  empty: { textAlign: "center", color: "#bbb", fontSize: 14, marginTop: 40 },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  nick: { fontSize: 11, color: "#888", marginBottom: 3, marginLeft: 4 },
  bubble: { padding: "9px 13px", borderRadius: 16, fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" },
  time: { fontSize: 11, color: "#aaa", flexShrink: 0 },
  menuBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#aaa", padding: "0 2px", lineHeight: 1 },
  menuBox: {
    position: "absolute",
    right: 0,
    bottom: 24,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
    zIndex: 100,
    minWidth: 80,
  },
  menuItem: {
    display: "block",
    width: "100%",
    padding: "10px 16px",
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 13,
    color: "#262626",
  },
  editBox: { display: "flex", flexDirection: "column", maxWidth: 260 },
  editInput: { padding: "8px 12px", border: "1px solid #d07856", borderRadius: 8, fontSize: 14, outline: "none" },
  editConfirmBtn: { flex: 1, padding: "5px", background: "#d07856", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 },
  editCancelBtn: {
    flex: 1,
    padding: "5px",
    background: "#f2e8e0",
    color: "#262626",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  inputArea: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px",
    background: "#fff",
    borderTop: "1px solid #f2e8e0",
    flexShrink: 0,
  },
  fileBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "0 4px" },
  textInput: { flex: 1, padding: "10px 14px", border: "1px solid #f2e8e0", borderRadius: 24, fontSize: 14, outline: "none" },
  sendBtn: {
    background: "#d07856",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "10px 18px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 14,
  },
  ctxMenu: {
    position: "fixed" as const,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    zIndex: 9999,
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
  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  modal: { background: "#fff", borderRadius: 14, padding: "24px 24px 20px", width: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" },
  modalTitle: { fontWeight: "bold", fontSize: 15, color: "#262626", marginBottom: 14 },
  modalInput: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #d07856",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  modalBtns: { display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" },
  modalCancel: { padding: "8px 16px", background: "#f2e8e0", color: "#262626", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  modalConfirm: {
    padding: "8px 16px",
    background: "#d07856",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: "bold",
  },
};
