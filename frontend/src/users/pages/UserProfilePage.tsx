import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi, energyProfileApi, type UserProfile, type EnergyProfileResponse } from "../../api/usersApi";
import { circleApi } from "../../api/circleApi";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import { Zap, PlusCircle, Calendar, Heart, PenLine, MessageSquare, Settings, ChevronRight } from "lucide-react";

const AVATAR_COLORS = ["#F4A261", "#E76F51", "#2A9D8F", "#457B9D", "#6D6875", "#E9C46A", "#264653"];
const nickColor = (nick: string) => AVATAR_COLORS[(nick?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [energy, setEnergy] = useState<EnergyProfileResponse | null>(null);
  const [circleCount, setCircleCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingNick, setEditingNick] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [nickInput, setNickInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [nickError, setNickError] = useState("");
  const [nickAvailable, setNickAvailable] = useState<boolean | null>(null);
  const [nickChecking, setNickChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    Promise.all([
      profileApi.getMyProfile(),
      energyProfileApi
        .check()
        .then((r) => r.data)
        .catch(() => null),
      circleApi
        .getMyCircles()
        .then((r) => r.data.length)
        .catch(() => null),
    ])
      .then(([p, e, cc]) => {
        setProfile(p);
        setEnergy(e);
        setCircleCount(cc);
      })
      .finally(() => setLoading(false));
  }, []);

  const openEditNick = () => {
    setNickInput(profile?.nickname ?? "");
    setNickError("");
    setNickAvailable(null);
    setEditingNick(true);
  };

  const openEditStatus = () => {
    setStatusInput(profile?.statusMessage ?? "");
    setEditingStatus(true);
  };

  const handleCheckNickname = async () => {
    const nick = nickInput.trim();
    if (!nick) return;
    if (!/^[가-힣a-zA-Z0-9]{2,10}$/.test(nick)) {
      setNickError("2~10자, 공백·특수문자 제외");
      setNickAvailable(null);
      return;
    }
    if (nick === profile?.nickname) {
      setNickError("현재 닉네임과 동일합니다.");
      setNickAvailable(null);
      return;
    }
    setNickChecking(true);
    setNickError("");
    try {
      await profileApi.checkNickname(nick);
      setNickAvailable(true);
    } catch {
      setNickAvailable(false);
    } finally {
      setNickChecking(false);
    }
  };

  const handleSaveNick = async () => {
    const nick = nickInput.trim();
    if (!nick || nick === profile?.nickname) {
      setEditingNick(false);
      return;
    }
    if (nickAvailable !== true) {
      setNickError("닉네임 중복 확인을 해주세요.");
      return;
    }
    setSaving(true);
    try {
      await profileApi.updateNickname(nick);
      setProfile((p) => (p ? { ...p, nickname: nick } : p));
      setEditingNick(false);
    } catch {
      setNickError("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStatus = async () => {
    const status = statusInput.trim();
    setSaving(true);
    try {
      await profileApi.updateStatusMessage(status);
      setProfile((p) => (p ? { ...p, statusMessage: status || null } : p));
      setEditingStatus(false);
    } catch {
      // 실패 시 모달 유지
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={s.center}>불러오는 중...</div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div style={s.center}>프로필을 불러올 수 없습니다.</div>
      </>
    );
  }

  const avatarBg = nickColor(profile.nickname);

  return (
    <div style={s.page}>
      <Navbar />

      <div style={s.container}>
        {/* 프로필 카드 */}
        <div style={s.profileCard}>
          <div style={s.profileTop}>
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt="프로필" style={s.avatarImg} />
            ) : (
              <div style={{ ...s.avatar, background: avatarBg }}>{profile.nickname.charAt(0)}</div>
            )}
            <div style={s.nameBlock}>
              {editingNick ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ position: "relative" }}>
                    <input
                      style={s.inlineInput}
                      value={nickInput}
                      onChange={(e) => {
                        setNickInput(e.target.value);
                        setNickAvailable(null);
                        setNickError("");
                      }}
                      maxLength={10}
                      autoFocus
                    />
                    {nickError && <p style={s.inlineFeedback}>{nickError}</p>}
                    {!nickError && nickAvailable === true && <p style={{ ...s.inlineFeedback, color: "#5F8F7B" }}>사용 가능합니다.</p>}
                    {!nickError && nickAvailable === false && <p style={s.inlineFeedback}>이미 사용 중입니다.</p>}
                  </div>
                  <button style={s.checkBtn} onClick={handleCheckNickname} disabled={nickChecking}>
                    {nickChecking ? "확인 중" : "중복 확인"}
                  </button>
                  <button style={s.inlineSaveBtn} onClick={handleSaveNick} disabled={saving}>
                    {saving ? "..." : "저장"}
                  </button>
                  <button style={s.inlineCancelBtn} onClick={() => setEditingNick(false)}>
                    취소
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={s.name}>{profile.nickname}</span>
                  {energy && <span style={s.energyTag}>{energy.energyTypeName}</span>}
                  <button style={s.editBtn} onClick={openEditNick}>
                    변경
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 자기소개 */}
          <div style={s.bioBox}>
            {editingStatus ? (
              <>
                <input
                  style={{ ...s.inlineInput, flex: 1 }}
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  placeholder="상태 메시지를 입력하세요"
                  maxLength={100}
                  autoFocus
                />
                <button style={s.inlineCancelBtn} onClick={() => setEditingStatus(false)}>
                  취소
                </button>
                <button style={s.inlineSaveBtn} onClick={handleSaveStatus} disabled={saving}>
                  {saving ? "..." : "저장"}
                </button>
              </>
            ) : (
              <>
                <p style={{ ...(profile.statusMessage ? s.bio : s.bioPlaceholder), margin: 0, flex: 1 }}>
                  {profile.statusMessage || "상태 메시지를 설정해보세요"}
                </p>
                <button style={s.editBtn} onClick={openEditStatus}>
                  편집
                </button>
              </>
            )}
          </div>

          {/* 통계 */}
          <div style={s.statsRow}>
            <div style={s.statBox}>
              <span style={s.statNum}>{circleCount ?? 0}</span>
              <span style={s.statLabel}>가입 모임</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.statBox}>
              <span style={s.statNum}>0</span>
              <span style={s.statLabel}>참석 일정</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.statBox}>
              <span style={s.statNum}>0</span>
              <span style={s.statLabel}>찜한 모임</span>
            </div>
          </div>
        </div>
        {/* profileCard */}

        {/* 내 에너지 프로필 */}
        <div style={s.sectionLabel}>내 에너지 프로필</div>
        <div style={s.card}>
          <button style={s.row} onClick={() => navigate("/users/energy-test/result")}>
            <div style={s.energyIconWrap}>
              <Zap size={18} color="#5F8F7B" />
            </div>
            <div style={s.rowBody}>
              <span style={s.rowTitle}>{energy?.energyTypeName ?? "에너지 프로필 없음"}</span>
              <span style={s.rowSub}>5축 점수 · 유형 상세 · 재검사</span>
            </div>
            <ChevronRight size={18} color="#ccc" />
          </button>
        </div>

        {/* 나의 활동 */}
        <div style={s.sectionLabel}>나의 활동</div>
        <div style={s.card}>
          <button style={s.row} onClick={() => navigate("/circle")}>
            <PlusCircle size={20} color="#5F8F7B" />
            <span style={s.rowLabel}>가입한 모임</span>
            <span style={s.count}>{circleCount ?? "-"}</span>
            <ChevronRight size={18} color="#ccc" />
          </button>
          <div style={s.divider} />
          <button style={s.row}>
            <Calendar size={20} color="#5F8F7B" />
            <span style={s.rowLabel}>참석한 일정</span>
            <span style={s.count}>-</span>
            <ChevronRight size={18} color="#ccc" />
          </button>
          <div style={s.divider} />
          <button style={s.row}>
            <Heart size={20} color="#5F8F7B" />
            <span style={s.rowLabel}>좋아요한 모임</span>
            <span style={s.count}>-</span>
            <ChevronRight size={18} color="#ccc" />
          </button>
        </div>

        {/* 나의 글 */}
        <div style={s.sectionLabel}>나의 글</div>
        <div style={s.card}>
          <button style={s.row}>
            <PenLine size={20} color="#5F8F7B" />
            <span style={s.rowLabel}>내가 쓴 게시글</span>
            <span style={s.count}>-</span>
            <ChevronRight size={18} color="#ccc" />
          </button>
          <div style={s.divider} />
          <button style={s.row}>
            <MessageSquare size={20} color="#5F8F7B" />
            <span style={s.rowLabel}>내가 쓴 댓글</span>
            <span style={s.count}>-</span>
            <ChevronRight size={18} color="#ccc" />
          </button>
        </div>

        {/* 설정 */}
        <div style={s.sectionLabel}>설정</div>
        <div style={s.card}>
          <button style={s.row}>
            <Settings size={20} color="#5F8F7B" />
            <span style={s.rowLabel}>계정 설정</span>
            <ChevronRight size={18} color="#ccc" />
          </button>
        </div>

        {/* 회원 탈퇴 */}
        <button style={s.withdrawBtn} onClick={() => setShowWithdraw(true)}>
          회원 탈퇴
        </button>
      </div>

      <Footer />

      {/* 회원 탈퇴 확인 모달 */}
      {showWithdraw && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={{ ...s.modalTitle, color: "#ff4d4f" }}>회원 탈퇴</h3>
            <p style={{ fontSize: 14, color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
              탈퇴하면 일부 데이터가 영구 삭제되어
              <br />
              복구할 수 없습니다. 정말 탈퇴하시겠습니까?
            </p>
            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setShowWithdraw(false)}>
                취소
              </button>
              <button style={{ ...s.saveBtn, background: "#ff4d4f" }}>탈퇴</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f7f7f8" },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
    color: "#888",
  },
  container: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "32px 20px 56px",
  },

  profileCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "20px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    marginBottom: 28,
  },
  profileTop: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 22,
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    flexShrink: 0,
    objectFit: "cover",
  },
  nameBlock: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  name: { fontWeight: 700, fontSize: 17, color: "#111" },
  handle: { fontSize: 13, color: "#888" },
  energyTag: {
    fontSize: 11,
    color: "#5F8F7B",
    fontWeight: 600,
    background: "#EAF4F0",
    borderRadius: 20,
    padding: "3px 10px",
    lineHeight: 1.5,
    letterSpacing: 0.2,
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    borderTop: "1px solid #f0f0f0",
    marginTop: 16,
    paddingTop: 16,
  },
  statBox: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  statNum: { fontSize: 20, fontWeight: 700, color: "#111" },
  statLabel: { fontSize: 12, color: "#999" },
  statDivider: { width: 1, height: 32, background: "#f0f0f0" },
  editBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    color: "#888",
    display: "flex",
    alignItems: "center",
    gap: 2,
    padding: 0,
    flexShrink: 0,
  },
  bio: { fontSize: 14, color: "#444", lineHeight: 1.65, margin: 0 },
  bioPlaceholder: { fontSize: 14, color: "#bbb", lineHeight: 1.65, margin: 0 },
  bioBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    padding: "10px 14px",
    border: "1.5px solid #e8e8e8",
    borderRadius: 12,
    background: "#fafafa",
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#999",
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: "15px 16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  energyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#eef4f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  rowBody: { flex: 1, display: "flex", flexDirection: "column", gap: 3 },
  rowTitle: { fontSize: 15, fontWeight: 500, color: "#111" },
  rowSub: { fontSize: 12, color: "#aaa" },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: 500, color: "#111", marginLeft: 12 },
  count: { fontSize: 14, fontWeight: 600, color: "#555", marginRight: 8 },
  divider: { height: 1, background: "#f0f0f0", margin: "0 16px" },

  withdrawBtn: {
    display: "block",
    margin: "8px auto 0",
    background: "none",
    border: "none",
    color: "#ff4d4f",
    fontSize: 14,
    cursor: "pointer",
    padding: "8px 16px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    padding: "0 24px",
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    padding: "28px 24px",
    width: "100%",
    maxWidth: 360,
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  },
  modalTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 20px", color: "#111" },
  fieldLabel: { fontSize: 13, color: "#888", marginBottom: 6 },
  input: {
    width: "100%",
    height: 46,
    padding: "0 12px",
    border: "1.5px solid #e0e0e0",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    color: "#111",
    backgroundColor: "#fafafa",
  },
  inlineFeedback: {
    position: "absolute" as const,
    top: "100%",
    left: 8,
    fontSize: 11,
    color: "#ff4d4f",
    margin: "2px 0 0",
    whiteSpace: "nowrap" as const,
    pointerEvents: "none" as const,
  },
  inlineInput: {
    height: 34,
    padding: "0 10px",
    border: "1.5px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
    color: "#111",
    backgroundColor: "#fafafa",
  },
  inlineSaveBtn: {
    height: 30,
    padding: "0 12px",
    background: "#5F8F7B",
    border: "none",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
  },
  inlineCancelBtn: {
    height: 30,
    padding: "0 12px",
    background: "#f0f0f0",
    border: "none",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "#555",
    cursor: "pointer",
  },
  checkBtn: {
    height: 30,
    padding: "0 10px",
    border: "1.5px solid #5F8F7B",
    borderRadius: 6,
    background: "transparent",
    color: "#5F8F7B",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  errorText: { fontSize: 12, color: "#ff4d4f", margin: "4px 0 0" },
  nickOk: { fontSize: 12, color: "#5F8F7B", margin: "4px 0 0" },
  nickHint: { fontSize: 12, color: "#aaa", margin: "4px 0 0" },
  modalBtns: { display: "flex", gap: 10, marginTop: 22 },
  cancelBtn: {
    flex: 1,
    height: 46,
    background: "#f0f0f0",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    color: "#555",
  },
  saveBtn: {
    flex: 1,
    height: 46,
    background: "#5F8F7B",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
  },
};
