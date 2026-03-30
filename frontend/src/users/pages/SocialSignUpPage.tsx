import { SyntheticEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import SignUpStepper from "../components/SignUpStepper";
import { getErrorMessage } from "../../common/utils/errorMessage";
import { profileApi } from "../../api/usersApi";
import BirthDatePicker from "../components/BirthDatePicker";

const RE_NICKNAME = /^.{2,10}$/;

export default function SocialSignUpPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nickname: "",
    birthDate: "",
    userGender: "" as "" | "MALE" | "FEMALE",
  });

  const [originalNickname, setOriginalNickname] = useState("");
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameMsg, setNicknameMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [privacyLocked, setPrivacyLocked] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const nicknameFormatOk = RE_NICKNAME.test(form.nickname);
  const nicknameValid = nicknameFormatOk && nicknameChecked;

  useEffect(() => {
    authApi
      .getMe()
      .then(async (res) => {
        const token = localStorage.getItem("accessToken") ?? "";
        setAuth(token, res.data);

        if (res.data.privacyAgreed) {
          setPrivacyAgreed(true);
          setPrivacyLocked(true);
        }

        const profile = await profileApi.getMyProfile();
        const defaultNickname = profile.name ?? "";

        setForm((prev) => ({
          ...prev,
          nickname: defaultNickname,
        }));
        setOriginalNickname(defaultNickname);
        setNicknameChecked(true);
      })
      .catch(() => {});
  }, [setAuth]);

  const set = (key: "birthDate" | "nickname" | "userGender") => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors([]);
    setError("");

    if (key === "nickname") {
      setNicknameChecked(false);
      setNicknameMsg(null);
    }
  };

  const handleCheckNickname = async () => {
    const nickname = form.nickname.trim();

    if (!nickname) {
      setNicknameMsg({ type: "err", text: "닉네임을 입력해주세요." });
      setNicknameChecked(false);
      return;
    }

    if (!RE_NICKNAME.test(nickname)) {
      setNicknameMsg({ type: "err", text: "닉네임은 2~10자여야 합니다." });
      setNicknameChecked(false);
      return;
    }

    setNicknameChecking(true);
    setNicknameMsg(null);

    try {
      await profileApi.checkNickname(nickname);
      setNicknameChecked(true);
      setNicknameMsg({ type: "ok", text: "사용 가능한 닉네임입니다." });
    } catch (e) {
      setNicknameChecked(false);
      setNicknameMsg({ type: "err", text: getErrorMessage(e) });
    } finally {
      setNicknameChecking(false);
    }
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFieldErrors([]);

    const errs: string[] = [];
    if (!nicknameFormatOk) errs.push("닉네임은 2~10자여야 합니다.");
    else if (!nicknameChecked) errs.push("닉네임 중복 확인을 해주세요.");
    if (!form.birthDate) errs.push("생년월일을 선택해주세요.");
    if (!form.userGender) errs.push("성별을 선택해주세요.");
    if (!privacyAgreed) errs.push("개인정보 수집 및 이용에 동의해주세요.");

    if (errs.length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await authApi.socialSignUpComplete({
        nickname: form.nickname.trim(),
        birthDate: form.birthDate,
        userGender: form.userGender as "MALE" | "FEMALE",
        privacyAgreed: true,
      });

      const res = await authApi.refresh();
      setAuth(res.data.accessToken, res.data.user);
      navigate(res.data.user.onboardingCompleted ? "/main" : "/users/onboarding");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyChange = async (checked: boolean) => {
    if (!checked) {
      if (!privacyLocked) {
        setPrivacyAgreed(false);
      }
      return;
    }

    setError("");
    setPrivacyAgreed(true);
    setPrivacySaving(true);

    try {
      await authApi.agreePrivacyConsent();
      setPrivacyLocked(true);
    } catch (e) {
      setPrivacyAgreed(false);
      setError(getErrorMessage(e));
    } finally {
      setPrivacySaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: "#111", letterSpacing: -1 }}>
            moa
          </span>
          <p style={{ marginTop: 6, fontSize: 14, color: "#888" }}>추가 정보를 입력해주세요</p>
        </div>

        <SignUpStepper currentStep={2} />

        <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: "36px 32px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSubmit}>
            {/* 닉네임 */}
            <FormField label="닉네임">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    value={form.nickname}
                    onChange={set("nickname")}
                    placeholder="2~10자"
                    required
                    style={inputStyle}
                  />
                  {form.nickname && nicknameValid && <CheckIcon />}
                  {form.nickname && nicknameMsg?.type === "err" && <XIcon />}
                </div>
                <button
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={nicknameChecking}
                  style={{
                    minWidth: 88,
                    height: 40,
                    border: "1.5px solid #111",
                    borderRadius: 10,
                    backgroundColor: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#111",
                    cursor: nicknameChecking ? "not-allowed" : "pointer",
                  }}
                >
                  {nicknameChecking ? "확인 중" : "중복 확인"}
                </button>
              </div>
              {nicknameMsg && (
                <p style={{ fontSize: 12, color: nicknameMsg.type === "ok" ? "#22c55e" : "#ff4d4f", marginTop: 6, marginBottom: 0 }}>
                  {nicknameMsg.text}
                </p>
              )}
              {form.nickname && !nicknameFormatOk && (
                <p style={{ fontSize: 12, color: "#ff4d4f", marginTop: 6, marginBottom: 0 }}>2~10자여야 합니다.</p>
              )}
            </FormField>

            {/* 생년월일 */}
            <FormField label="생년월일">
              <BirthDatePicker value={form.birthDate} onChange={(date) => setForm((prev) => ({ ...prev, birthDate: date }))} />
            </FormField>

            {/* 성별 */}
            <FormField label="성별" last>
              <div style={{ display: "flex", gap: 10 }}>
                <GenderButton selected={form.userGender === "MALE"} onClick={() => setForm((p) => ({ ...p, userGender: "MALE" }))}>
                  남성
                </GenderButton>
                <GenderButton selected={form.userGender === "FEMALE"} onClick={() => setForm((p) => ({ ...p, userGender: "FEMALE" }))}>
                  여성
                </GenderButton>
              </div>
            </FormField>

            <div style={{ height: 1, backgroundColor: "#eee", margin: "20px 0 16px" }} />

            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: "#555", cursor: privacyLocked ? "default" : "pointer" }}>
              <input
                type="checkbox"
                checked={privacyAgreed}
                disabled={privacySaving || privacyLocked}
                onChange={(e) => void handlePrivacyChange(e.target.checked)}
                style={{ width: 16, height: 16, cursor: privacyLocked ? "default" : "pointer", accentColor: "#111" }}
              />
              개인정보 수집 및 이용에 동의합니다. (필수)
            </label>

            {privacyLocked && (
              <p style={{ fontSize: 12, color: "#666", margin: "8px 0 0", textAlign: "center" }}>동의 내역은 저장되었습니다. 추가 정보는 이어서 입력해도 됩니다.</p>
            )}

            {/* 필드별 에러 목록 */}
            {fieldErrors.length > 0 && (
              <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: "#fff5f5", borderRadius: 10, border: "1px solid #ffccc7" }}>
                {fieldErrors.map((msg, i) => (
                  <p key={i} style={{ fontSize: 12, color: "#ff4d4f", margin: i === 0 ? 0 : "4px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M3 3L9 9M9 3L3 9" stroke="#ff4d4f" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {msg}
                  </p>
                ))}
              </div>
            )}

            {error && <p style={{ fontSize: 13, color: "#ff4d4f", marginTop: 14, textAlign: "center" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading || privacySaving}
              style={{
                width: "100%",
                height: 50,
                marginTop: 20,
                backgroundColor: loading || privacySaving ? "#999" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading || privacySaving ? "not-allowed" : "pointer",
                transition: "background-color 0.15s",
              }}
            >
              {loading ? "처리 중..." : "완료"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── 아이콘 ── */
const iconPos: React.CSSProperties = { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" };

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" style={iconPos}>
      <path d="M3 8.5L6.5 12L13 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" style={iconPos}>
      <path d="M4 4L12 12M12 4L4 12" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── 필드 래퍼 ── */
function FormField({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

/* ── 성별 버튼 ── */
function GenderButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        height: 44,
        border: selected ? "1.5px solid #111" : "1.5px solid #e0e0e0",
        borderRadius: 10,
        backgroundColor: selected ? "#111" : "#fafafa",
        color: selected ? "#fff" : "#888",
        fontSize: 14,
        fontWeight: selected ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  padding: "0 40px 0 14px",
  border: "1.5px solid #e0e0e0",
  borderRadius: 10,
  fontSize: 14,
  color: "#111",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#fafafa",
};
