import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi, energyProfileApi, type UserProfile, type EnergyProfileResponse } from "../../api/usersApi";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { useAuthStore } from "../../store/authStore";
import { circleApi } from "../../api/circleApi";
import { scheduleApi } from "../../api/scheduleApi";
import { getErrorMessage } from "../../common/utils/errorMessage";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import SectionCard from "../components/SectionCard";
import RowDivider from "../components/RowDivider";
import ModalOverlay from "../components/ModalOverlay";
import CenterMessage from "../components/CenterMessage";
import {
  Zap,
  PlusCircle,
  Calendar,
  Heart,
  PenLine,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Star,
  Bookmark,
  LogOut,
  CalendarDays,
  UserRound,
} from "lucide-react";
import { toAssetUrl } from "../../common/utils/assetUrl";

const CSS = `
  .mp-row { transition: background 0.15s, border-color 0.15s; border-radius: 10px; border: 1px solid transparent; }
  .mp-row-hero:hover { background: rgba(95,143,123,0.09) !important; border-color: #A9C8BB !important; }
  .mp-row-hero:hover svg:last-child { color: #777 !important; }
  .mp-row-list:hover { background: rgba(95,143,123,0.05) !important; border-color: #BDD5CA !important; }
  .mp-row-list:hover svg:last-child { color: #777 !important; }
  .mp-ghost:hover { background: #EAF4F0 !important; }
  .mp-edit-btn:hover { background: #4E7C69 !important; border-color: #4E7C69 !important; }
`;

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [energy, setEnergy] = useState<EnergyProfileResponse | null>(null);
  const [circleCount, setCircleCount] = useState<number | null>(null);
  const [likedCount, setLikedCount] = useState<number | null>(null);
  const [upcomingCount, setUpcomingCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNick, setModalNick] = useState("");
  const [modalStatus, setModalStatus] = useState("");
  const [nickError, setNickError] = useState("");
  const [nickAvailable, setNickAvailable] = useState<boolean | null>(null);
  const [nickChecking, setNickChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  const logout = useAuthStore((s) => s.logout);
  const [reviewOpen, setReviewOpen] = useState(false);
  const reviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const toISO = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

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
      circleApi
        .getLikedCircles()
        .then((r) => r.data.length)
        .catch(() => null),
      scheduleApi
        .getMySchedules({ from: toISO(now), to: toISO(oneYearLater) })
        .then((r) => r.data.filter((s) => s.status === "UPCOMING" || s.status === "IN_PROGRESS").length)
        .catch(() => 0),
      scheduleApi
        .getMySchedules({ from: toISO(oneYearAgo), to: toISO(now) })
        .then((r) => r.data.filter((s) => s.status === "COMPLETED").length)
        .catch(() => 0),
    ])
      .then(([p, e, cc, lc, uc, dc]) => {
        setProfile(p);
        setEnergy(e);
        setCircleCount(cc);
        setLikedCount(lc);
        setUpcomingCount(uc);
        setCompletedCount(dc);
      })
      .finally(() => setLoading(false));
  }, []);

  const openModal = () => {
    setModalNick(profile?.nickname ?? "");
    setModalStatus(profile?.statusMessage ?? "");
    setNickError("");
    setNickAvailable(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNickError("");
    setNickAvailable(null);
  };

  const handleCheckNickname = async () => {
    const nick = modalNick.trim();
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
    } catch (error) {
      setNickAvailable(false);
      setNickError(getErrorMessage(error));
    } finally {
      setNickChecking(false);
    }
  };

  const handleModalSave = async () => {
    const nick = modalNick.trim();
    const status = modalStatus.trim();
    const nickChanged = nick !== profile?.nickname;
    const statusChanged = status !== (profile?.statusMessage ?? "");

    if (nickChanged && nick !== "") {
      if (nickAvailable !== true) {
        setNickError("닉네임 중복 확인을 해주세요.");
        return;
      }
    }

    setSaving(true);
    try {
      if (nickChanged && nick !== "") {
        await profileApi.updateNickname(nick);
      }
      if (statusChanged) {
        await profileApi.updateStatusMessage(status);
      }
      setProfile((p) =>
        p
          ? {
              ...p,
              ...(nickChanged && nick !== "" ? { nickname: nick } : {}),
              ...(statusChanged ? { statusMessage: status || null } : {}),
            }
          : p,
      );
      closeModal();
    } catch (error) {
      setNickError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <CenterMessage>불러오는 중...</CenterMessage>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <CenterMessage>프로필을 불러올 수 없습니다.</CenterMessage>
      </>
    );
  }


  return (
    <div style={s.page}>
      <style>{CSS}</style>
      <Navbar />

      {/* 프로필 수정 모달 */}
      {modalOpen && (
        <ModalOverlay onClose={closeModal}>
          <p style={s.modalTitle}>프로필 수정</p>

          {/* 닉네임 */}
          <label style={s.modalLabel}>닉네임</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                style={s.modalInput}
                value={modalNick}
                onChange={(e) => {
                  setModalNick(e.target.value);
                  setNickAvailable(null);
                  setNickError("");
                }}
                maxLength={10}
                placeholder="닉네임 입력"
                autoFocus
              />
            </div>
            <button style={s.modalCheckBtn} onClick={handleCheckNickname} disabled={nickChecking}>
              {nickChecking ? "확인 중" : "중복 확인"}
            </button>
          </div>
          {nickError && <p style={s.modalFeedback}>{nickError}</p>}
          {!nickError && nickAvailable === true && <p style={{ ...s.modalFeedback, color: "#5F8F7B" }}>사용 가능합니다.</p>}
          {!nickError && nickAvailable === false && <p style={s.modalFeedback}>이미 사용 중입니다.</p>}
          {!nickError && nickAvailable === null && <div style={{ height: 18 }} />}

          {/* 상태 메시지 */}
          <label style={{ ...s.modalLabel, marginTop: 14 }}>상태 메시지</label>
          <input
            style={{ ...s.modalInput, marginBottom: 24 }}
            value={modalStatus}
            onChange={(e) => setModalStatus(e.target.value)}
            placeholder="상태 메시지를 입력하세요"
            maxLength={100}
          />

          {/* 버튼 */}
          <div style={s.modalActions}>
            <button style={s.modalCancelBtn} onClick={closeModal}>
              취소
            </button>
            <button style={s.modalSaveBtn} onClick={handleModalSave} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* 프로필 + 통계 히어로 영역 (풀 width) */}
      <div style={s.profileStatsWrapper}>
        <div style={s.profileStatsInner}>
          {/* 프로필 카드 */}
          <div style={s.profileCard}>
            <button className="mp-edit-btn" style={s.profileEditBtn} onClick={openModal}>
              <PenLine size={13} color="#fff" />
              수정
            </button>
            <div style={s.profileTop}>
              {profile.profileImageUrl ? (
                <img src={toAssetUrl(profile.profileImageUrl)} alt="프로필" style={s.avatarImg} />
              ) : (
                <div style={{ ...s.avatar, background: '#5F8F7B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserRound size={36} color="#fff" /></div>
              )}
              <div style={s.nameBlock}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={s.name}>{profile.nickname}</span>
                  {energy && <span style={s.energyTag}>{energy.energyTypeName}</span>}
                </div>
                <div style={s.statusBlock}>
                  <p style={profile.statusMessage ? s.statusText : s.statusPlaceholder}>
                    {profile.statusMessage || "아직 설정된 상태 메시지가 없어요"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 통계 */}
          <div style={s.statsCard}>
            <div style={s.statBox}>
              <span style={s.statNum}>{circleCount ?? 0}</span>
              <span style={s.statLabel}>가입 모임</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.statBox}>
              <span style={s.statNum}>{upcomingCount}</span>
              <span style={s.statLabel}>예정 일정</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.statBox}>
              <span style={s.statNum}>{likedCount ?? 0}</span>
              <span style={s.statLabel}>찜한 모임</span>
            </div>
          </div>
        </div>
      </div>

      <div style={s.container}>
        {/* 에너지 프로필 */}
        <div style={s.energySectionTitle}>에너지 프로필</div>
        <SectionCard>
          <button
            className="mp-row mp-row-hero"
            style={{ ...s.row, alignItems: "center", gap: 16 }}
            onClick={() => navigate("/users/energy-test/result")}
          >
            {energy ? (
              <>
                <div style={{ width: 80, height: 80, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={[
                        { label: "사교", value: energy.socialLoad },
                        { label: "움직임", value: energy.interactionMode },
                        { label: "구조감", value: energy.structureLevel },
                        { label: "몰입도", value: energy.activityIntensity },
                        { label: "빈도", value: energy.commitmentLevel },
                      ]}
                      margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
                    >
                      <PolarGrid stroke="#D1D5DB" />
                      <PolarAngleAxis dataKey="label" tick={false} />
                      <Radar dataKey="value" stroke="#5F8F7B" fill="#5F8F7B" fillOpacity={0.25} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#1F2937" }}>{energy.energyTypeName}</span>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>에너지 프로필 결과 보기</span>
                </div>
              </>
            ) : (
              <>
                <Zap size={18} color="#5F8F7B" />
                <span style={s.rowLabel}>에너지 프로필 없음</span>
              </>
            )}
            <ChevronRight size={18} color="#c0c0c0" />
          </button>
        </SectionCard>

        {/* 나의 활동 */}
        <div style={s.sectionTitle}>나의 활동</div>
        <SectionCard>
          <button className="mp-row mp-row-list" style={s.row} onClick={() => navigate("/circle/my")}>
            <PlusCircle size={18} color="#5F8F7B" />
            <span style={s.rowLabel}>가입한 모임</span>
            <span style={s.rowCount}>{circleCount ?? 0}</span>
            <ChevronRight size={18} color="#c0c0c0" />
          </button>
          <RowDivider />
          <button className="mp-row mp-row-list" style={s.row} onClick={() => navigate("/users/my-schedules")}>
            <Calendar size={18} color="#5F8F7B" />
            <span style={s.rowLabel}>참석한 일정</span>
            <span style={s.rowCount}>{completedCount}</span>
            <ChevronRight size={18} color="#c0c0c0" />
          </button>
          <RowDivider />
          <button className="mp-row mp-row-list" style={s.row} onClick={() => navigate("/circle/liked")}>
            <Heart size={18} color="#5F8F7B" />
            <span style={s.rowLabel}>찜한 모임</span>
            <span style={s.rowCount}>{likedCount ?? 0}</span>
            <ChevronRight size={18} color="#c0c0c0" />
          </button>
        </SectionCard>

        {/* 나의 장소 */}
        <div style={s.sectionTitle}>나의 장소</div>
        <SectionCard>
          <button className="mp-row mp-row-list" style={s.row} onClick={() => navigate("/place/my")}>
            <MapPin size={18} color="#5F8F7B" />
            <span style={s.rowLabel}>이용한 장소</span>
            <span style={s.rowCount}>0</span>
            <ChevronRight size={18} color="#c0c0c0" />
          </button>
          <RowDivider />
          <button className="mp-row mp-row-list" style={s.row} onClick={() => setReviewOpen((prev) => !prev)}>
            <Star size={18} color="#5F8F7B" />
            <span style={s.rowLabel}>장소 후기</span>
            <span style={s.rowCount}>0</span>
            {reviewOpen ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#c0c0c0" />}
          </button>
          <div
            ref={reviewRef}
            style={{
              overflow: "hidden",
              transition: "max-height 0.3s ease, opacity 0.3s ease",
              maxHeight: reviewOpen ? (reviewRef.current?.scrollHeight ?? 200) : 0,
              opacity: reviewOpen ? 1 : 0,
            }}
          >
            <button className="mp-row mp-row-list" style={s.subRow} onClick={() => navigate("/place/my-reviews?tab=pending")}>
              <PenLine size={16} color="#A9C8BB" />
              <span style={s.subRowLabel}>작성 가능한 후기</span>
              <span style={{ ...s.rowCount, color: "#5F8F7B", fontWeight: 700 }}>0</span>
              <ChevronRight size={16} color="#c0c0c0" />
            </button>
            <button className="mp-row mp-row-list" style={s.subRow} onClick={() => navigate("/place/my-reviews?tab=written")}>
              <MessageSquare size={16} color="#A9C8BB" />
              <span style={s.subRowLabel}>내가 쓴 후기</span>
              <span style={s.rowCount}>0</span>
              <ChevronRight size={16} color="#c0c0c0" />
            </button>
          </div>
          <RowDivider />
          <button className="mp-row mp-row-list" style={s.row} onClick={() => navigate("/place/liked")}>
            <Bookmark size={18} color="#5F8F7B" />
            <span style={s.rowLabel}>찜한 장소</span>
            <span style={s.rowCount}>0</span>
            <ChevronRight size={18} color="#c0c0c0" />
          </button>
          <RowDivider />
          <button className="mp-row mp-row-list" style={s.row} onClick={() => navigate("/place/my-reservations")}>
            <CalendarDays size={18} color="#5F8F7B" />
            <span style={s.rowLabel}>예약 내역</span>
            <span style={s.rowCount}>0</span>
            <ChevronRight size={18} color="#c0c0c0" />
          </button>
        </SectionCard>

        {/* 나의 글 */}
        <div style={s.sectionTitle}>나의 글</div>
        <SectionCard>
          <button className="mp-row mp-row-list" style={s.row}>
            <PenLine size={18} color="#5F8F7B" />
            <span style={s.rowLabel}>내가 쓴 게시글</span>
            <span style={s.rowCount}>0</span>
            <ChevronRight size={18} color="#c0c0c0" />
          </button>
          <RowDivider />
          <button className="mp-row mp-row-list" style={s.row}>
            <MessageSquare size={18} color="#5F8F7B" />
            <span style={s.rowLabel}>내가 쓴 댓글</span>
            <span style={s.rowCount}>0</span>
            <ChevronRight size={18} color="#c0c0c0" />
          </button>
        </SectionCard>

        {/* 설정 */}
        <div style={s.sectionTitle}>설정</div>
        <SectionCard>
          <button className="mp-row mp-row-list" style={s.row} onClick={() => navigate("/users/account")}>
            <Settings size={18} color="#5F8F7B" />
            <span style={s.rowLabel}>계정 설정</span>
            <ChevronRight size={18} color="#c0c0c0" />
          </button>
          <RowDivider />
          <button className="mp-row mp-row-list" style={s.row} onClick={handleLogout}>
            <LogOut size={18} color="#DC2626" />
            <span style={{ ...s.rowLabel, color: "#DC2626" }}>로그아웃</span>
          </button>
        </SectionCard>
      </div>

      <Footer />
    </div>
  );
}

{
  /* /* ── moa 토큰 기반 스타일 ── */
}
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#F8FAF9" },

  container: {
    maxWidth: 720,
    margin: "40px auto 80px",
    padding: "0 32px",
  },

  /* ── 모달 ── */
  modalTitle: {
    margin: "0 0 20px",
    fontSize: 18,
    fontWeight: 700,
    color: "#1F2937",
  },
  modalLabel: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  },
  modalInput: {
    width: "100%",
    height: 40,
    padding: "0 12px",
    border: "1.5px solid #E5E7EB",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
    color: "#1F2937",
    backgroundColor: "#fafafa",
  },
  modalFeedback: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#ff4d4f",
    minHeight: 18,
  },
  modalCheckBtn: {
    flexShrink: 0,
    height: 40,
    padding: "0 14px",
    border: "1.5px solid #5F8F7B",
    borderRadius: 10,
    background: "transparent",
    color: "#5F8F7B",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  modalActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
  modalCancelBtn: {
    height: 40,
    padding: "0 20px",
    background: "#F3F4F6",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    color: "#4B5563",
    cursor: "pointer",
  },
  modalSaveBtn: {
    height: 40,
    padding: "0 24px",
    background: "#5F8F7B",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
  },

  /* ── 프로필 + 통계 wrapper (풀 width 히어로) ── */
  profileStatsWrapper: {
    background: "rgba(95,143,123,0.12)",
    borderRadius: 0,
    border: "none",
    minHeight: 190,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 0 28px",
  },
  profileStatsInner: {
    width: "100%",
    maxWidth: 720,
    padding: "0 32px",
  },

  /* ── 프로필 카드 ── */
  profileCard: {
    position: "relative",
    padding: "0 0 16px",
  },
  profileEditBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 12px",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 8,
    background: "#5F8F7B",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
  },
  profileTop: { display: "flex", alignItems: "flex-start", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    border: "2px solid rgba(255,255,255,0.3)",
    fontSize: 24,
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    flexShrink: 0,
    objectFit: "cover",
  },
  nameBlock: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  name: { fontWeight: 700, fontSize: 22, color: "#333" },
  energyTag: {
    fontSize: 12,
    color: "#5F8F7B",
    fontWeight: 600,
    background: "#ffffff",
    borderRadius: 20,
    padding: "4px 12px",
    lineHeight: 1.4,
  },
  statusBlock: { marginTop: 4 },
  statusText: { margin: 0, fontSize: 15, color: "#666", lineHeight: 1.6 },
  statusPlaceholder: { margin: 0, fontSize: 15, color: "#5F8F7B", lineHeight: 1.6 },

  /* ── 통계 카드 ── */
  statsCard: {
    display: "flex",
    alignItems: "center",
    padding: "14px 12px 0",
  },
  statBox: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  statNum: { fontSize: 36, fontWeight: 800, color: "#5F8F7B" },
  statLabel: { fontSize: 12, color: "#888", marginTop: "4px" },
  statDivider: { width: 1, height: 32, background: "#999" },

  /* ── 섹션 ── */
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#333",
    marginBottom: 8,
    paddingLeft: 12,
    borderLeft: "3px solid #E38B60",
  },

  energySectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#333",
    marginBottom: 8,
    paddingLeft: 12,
    backgroundColor: "rgba(95,143,123,0.12)",
    borderLeft: "4px solid #5F8F7B",
  },

  /* ── row ── */
  row: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "13px 20px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: 500, color: "#1F2937" },
  rowCount: { fontSize: 15, fontWeight: 600, color: "#6B7280", marginRight: 4 },

  subRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px 14px 52px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left" as const,
  },
  subRowLabel: { flex: 1, fontSize: 15, fontWeight: 500, color: "#374151" },
};
