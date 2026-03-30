import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, KeyRound, ShieldCheck, LogOut } from "lucide-react";
import { accountApi, profileApi, type UserProfile } from "../../api/usersApi";
import { getErrorMessage } from "../../common/utils/errorMessage";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import { useAuthStore } from "../../store/authStore";
import SectionCard from "../components/SectionCard";
import RowDivider from "../components/RowDivider";
import ModalOverlay from "../components/ModalOverlay";
import CenterMessage from "../components/CenterMessage";

const PROVIDER_ICON: Record<string, string> = {
  GOOGLE: "https://www.svgrepo.com/show/475656/google-color.svg",
  KAKAO: "https://developers.kakao.com/static/images/pc/product/icon/kakaoTalk.png",
  NAVER: "https://logoproject.naver.com/img/img_story_about.png",
};

function getProviderLabel(provider: UserProfile["provider"]): string {
  switch (provider) {
    case "GOOGLE":
      return "Google";
    case "KAKAO":
      return "Kakao";
    case "NAVER":
      return "Naver";
    case "LOCAL":
    case null:
    default:
      return "로컬";
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
}

const CSS = `
  .acct-row { transition: background 0.15s, border-color 0.15s; border-radius: 10px; border: 1px solid transparent; }
  .acct-row:hover { background: rgba(95,143,123,0.05) !important; border-color: #BDD5CA !important; }
  .acct-row:hover svg:last-child { color: #777 !important; }
  .acct-danger { transition: background 0.15s; border-radius: 10px; }
  .acct-danger:hover { background: rgba(220,38,38,0.015) !important; }
`;

export default function AccountPage() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    profileApi
      .getMyProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  const provider = profile?.provider ?? "LOCAL";
  const providerLabel = useMemo(() => getProviderLabel(provider), [provider]);
  const isLocalAccount = provider === "LOCAL" || provider == null;
  const privacyAgreed = authUser?.privacyAgreed ?? false;

  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (passwordSaving) return;
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    setPasswordError("");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setPasswordError("모든 비밀번호 항목을 입력해주세요.");
      return;
    }

    setPasswordSaving(true);
    setPasswordError("");
    setPasswordNotice("");

    try {
      await accountApi.changePassword({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });
      closePasswordModal();
      setPasswordNotice("비밀번호가 변경되었습니다.");
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setPasswordSaving(false);
    }
  };

  const openWithdrawModal = () => {
    setWithdrawPassword("");
    setWithdrawError("");
    setShowWithdrawModal(true);
  };

  const closeWithdrawModal = () => {
    if (withdrawing) return;
    setShowWithdrawModal(false);
    setWithdrawPassword("");
    setWithdrawError("");
  };

  const handleWithdraw = async () => {
    if (isLocalAccount && !withdrawPassword.trim()) {
      setWithdrawError("비밀번호를 입력해주세요.");
      return;
    }

    setWithdrawing(true);
    setWithdrawError("");

    try {
      await accountApi.withdraw(isLocalAccount ? withdrawPassword : "");
      clearAuth();
      navigate("/users/account-status?code=ACCOUNT_WITHDRAWN", { replace: true });
    } catch (error) {
      setWithdrawError(getErrorMessage(error));
    } finally {
      setWithdrawing(false);
    }
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
        <CenterMessage>계정 정보를 불러올 수 없습니다.</CenterMessage>
      </>
    );
  }

  return (
    <div style={s.page}>
      <style>{CSS}</style>
      <Navbar />

      <div style={s.container}>
        {/* 페이지 헤더 */}
        <div style={s.pageHeader}>
          <button type="button" style={s.backBtn} onClick={() => navigate("/users/profile")}>
            <ChevronLeft size={22} color="#374151" />
          </button>
          <h1 style={s.pageTitle}>계정</h1>
        </div>

        {/* 계정 정보 */}
        <div style={s.sectionTitle}>계정 정보</div>
        <SectionCard marginBottom={20}>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>로그인 방식</span>
            <span style={s.infoValue}>
              {!isLocalAccount && PROVIDER_ICON[provider] && (
                <img src={PROVIDER_ICON[provider]} alt={providerLabel} style={s.providerIcon} />
              )}
              {isLocalAccount ? "이메일 로그인" : providerLabel}
            </span>
          </div>
          <RowDivider />
          <div style={s.infoRow}>
            <span style={s.infoLabel}>이메일</span>
            <span style={s.infoValue}>{maskEmail(profile.email)}</span>
          </div>
        </SectionCard>

        {/* 보안 */}
        <div style={s.sectionTitle}>보안</div>
        {passwordNotice && <div style={s.notice}>{passwordNotice}</div>}
        <SectionCard marginBottom={20}>
          {isLocalAccount && (
            <>
              <button type="button" className="acct-row" style={s.actionRow} onClick={openPasswordModal}>
                <KeyRound size={18} color="#5F8F7B" />
                <span style={s.actionLabel}>비밀번호 변경</span>
                <ChevronRight size={18} color="#ccc" />
              </button>
              <RowDivider />
            </>
          )}
          <button type="button" className="acct-row" style={s.actionRow} onClick={() => {}}>
            <ShieldCheck size={18} color="#5F8F7B" />
            <span style={s.actionLabel}>개인정보 수집·이용 동의</span>
            <span style={{ ...s.chip, background: privacyAgreed ? "#EAF4F0" : "#FEF3C7", color: privacyAgreed ? "#5F8F7B" : "#B45309" }}>
              {privacyAgreed ? "동의 완료" : "동의 필요"}
            </span>
            <ChevronRight size={18} color="#ccc" />
          </button>
        </SectionCard>

        {/* 계정 관리 — 탈퇴 분리 */}
        <div style={s.sectionTitle}>계정 관리</div>
        <SectionCard marginBottom={20}>
          <button type="button" className="acct-danger" style={s.dangerRow} onClick={openWithdrawModal}>
            <LogOut size={18} color="#DC2626" />
            <span style={s.dangerLabel}>회원 탈퇴</span>
            <ChevronRight size={18} color="#ccc" />
          </button>
        </SectionCard>
      </div>

      <Footer />

      {showPasswordModal && (
        <ModalOverlay onClose={closePasswordModal}>
          <h3 style={s.modalTitle}>비밀번호 변경</h3>

          <div style={s.modalField}>
            <label style={s.fieldLabel}>현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordError("");
              }}
              style={s.input}
              disabled={passwordSaving}
              autoFocus
            />
          </div>

          <div style={s.modalField}>
            <label style={s.fieldLabel}>새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
              }}
              style={s.input}
              disabled={passwordSaving}
              placeholder="8~20자, 영문/숫자/특수문자 포함"
            />
          </div>

          <div style={s.modalField}>
            <label style={s.fieldLabel}>새 비밀번호 확인</label>
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => {
                setNewPasswordConfirm(e.target.value);
                setPasswordError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !passwordSaving) {
                  void handleChangePassword();
                }
              }}
              style={s.input}
              disabled={passwordSaving}
            />
          </div>

          {passwordError && <p style={s.errorText}>{passwordError}</p>}

          <div style={s.modalBtns}>
            <button type="button" style={s.cancelBtn} onClick={closePasswordModal} disabled={passwordSaving}>
              취소
            </button>
            <button type="button" style={s.saveBtn} onClick={handleChangePassword} disabled={passwordSaving}>
              {passwordSaving ? "처리 중..." : "변경"}
            </button>
          </div>
        </ModalOverlay>
      )}

      {showWithdrawModal && (
        <ModalOverlay onClose={closeWithdrawModal}>
          <h3 style={{ ...s.modalTitle, color: "#DC2626" }}>회원 탈퇴</h3>
          <p style={s.withdrawCopy}>
            {isLocalAccount ? (
              <>
                탈퇴하면 일부 데이터가 영구 삭제되어
                <br />
                복구할 수 없습니다. 비밀번호를 입력한 뒤 진행해주세요.
              </>
            ) : (
              <>
                탈퇴하면 일부 데이터가 영구 삭제되어
                <br />
                복구할 수 없습니다. 소셜 로그인 계정은 확인 후 바로 탈퇴됩니다.
              </>
            )}
          </p>

          {isLocalAccount ? (
            <div style={s.modalField}>
              <label style={s.fieldLabel}>비밀번호 확인</label>
              <input
                type="password"
                value={withdrawPassword}
                onChange={(e) => {
                  setWithdrawPassword(e.target.value);
                  setWithdrawError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !withdrawing) {
                    void handleWithdraw();
                  }
                }}
                style={s.input}
                disabled={withdrawing}
                autoFocus
              />
            </div>
          ) : (
            <div style={s.socialWithdrawNotice}>{providerLabel} 계정으로 가입한 회원입니다. 확인을 누르면 계정 탈퇴가 진행됩니다.</div>
          )}

          {withdrawError && <p style={s.errorText}>{withdrawError}</p>}

          <div style={s.modalBtns}>
            <button type="button" style={s.cancelBtn} onClick={closeWithdrawModal} disabled={withdrawing}>
              취소
            </button>
            <button type="button" style={{ ...s.saveBtn, background: "#DC2626" }} onClick={handleWithdraw} disabled={withdrawing}>
              {withdrawing ? "처리 중..." : "탈퇴"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f7f7f8" },

  container: {
    maxWidth: 720,
    margin: "40px auto 80px",
    padding: "0 32px",
  },

  /* ── 페이지 헤더 ── */
  pageHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  pageTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "#1F2937",
  },

  /* ── 섹션 ── */
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1F2937",
    marginBottom: 8,
    paddingLeft: 20,
  },

  /* ── 정보 row ── */
  infoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
  },
  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 500,
    color: "#1F2937",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  providerIcon: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    objectFit: "cover",
  },

  /* ── 액션 row ── */
  actionRow: {
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
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: 500,
    color: "#1F2937",
  },
  chip: {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 6,
  },

  /* ── 위험 row ── */
  dangerRow: {
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
  dangerLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: 500,
    color: "#DC2626",
  },

  /* ── 알림 ── */
  notice: {
    marginBottom: 12,
    marginLeft: 16,
    marginRight: 16,
    padding: "10px 14px",
    borderRadius: 10,
    background: "#EAF4F0",
    color: "#3D5F52",
    fontSize: 13,
    fontWeight: 600,
  },

  /* ── 모달 ── */
  modalTitle: {
    margin: "0 0 18px",
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
  },
  withdrawCopy: {
    margin: "0 0 18px",
    fontSize: 14,
    lineHeight: 1.7,
    color: "#6B7280",
  },
  modalField: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#6B7280",
  },
  input: {
    width: "100%",
    height: 46,
    padding: "0 12px",
    border: "1.5px solid #E5E7EB",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    color: "#111827",
    background: "#FAFAFA",
  },
  errorText: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#DC2626",
  },
  modalBtns: {
    display: "flex",
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    background: "#F3F4F6",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    color: "#4B5563",
    cursor: "pointer",
  },
  saveBtn: {
    flex: 1,
    height: 46,
    background: "#5F8F7B",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
  },
  socialWithdrawNotice: {
    marginBottom: 14,
    padding: "12px 14px",
    borderRadius: 12,
    background: "#F8FAFC",
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.6,
  },
};
