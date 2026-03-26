import { SyntheticEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import SignUpStepper from "../components/SignUpStepper";
import { getErrorMessage } from "../../common/utils/errorMessage";
import { profileApi } from "../../api/usersApi";
import BirthDatePicker from "../components/BirthDatePicker";

export default function SocialSignUpPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nickname: "",
    birthDate: "",
    userGender: "MALE" as "MALE" | "FEMALE",
  });

  const [originalNickname, setOriginalNickname] = useState("");
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameChecking, setNicknameChecking] = useState(false);

  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [privacyLocked, setPrivacyLocked] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [error, setError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // accessToken만으로 유저 정보 조회 (refresh 쿠키 불필요)
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

    if (key === "nickname") {
      setNicknameChecked(false);
      setNicknameError("");
      setError("");
    }
  };

  const handleCheckNickname = async () => {
    const nickname = form.nickname.trim();

    if (!nickname) {
      setNicknameError("닉네임을 입력해 주세요.");
      setNicknameChecked(false);
      return;
    }

    setNicknameChecking(true);
    setNicknameError("");

    try {
      await profileApi.checkNickname(nickname);
      setNicknameChecked(true);
    } catch (e) {
      setNicknameChecked(false);
      setNicknameError(getErrorMessage(e));
    } finally {
      setNicknameChecking(false);
    }
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!privacyAgreed) {
      setError("개인정보 수집 및 이용 동의가 필요합니다.");
      return;
    }

    if (!form.nickname.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }

    if (!nicknameChecked) {
      setError("닉네임 중복 확인을 해주세요.");
      return;
    }

    setLoading(true);
    try {
      await authApi.socialSignUpComplete({
        nickname: form.nickname.trim(),
        birthDate: form.birthDate,
        userGender: form.userGender,
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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f7f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Link
            to="/main"
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#111",
              textDecoration: "none",
              letterSpacing: -1,
            }}
          >
            moa
          </Link>
          <p style={{ marginTop: 6, fontSize: 14, color: "#888" }}>추가 정보를 입력해주세요</p>
        </div>

        <SignUpStepper currentStep={2} />

        <div
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: "32px 28px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#111",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            소셜 회원가입을 완료해주세요
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "#555", fontWeight: 600, display: "block", marginBottom: 6 }}>닉네임 (필수)</label>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={form.nickname}
                    onChange={set("nickname")}
                    placeholder="닉네임을 입력해 주세요"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleCheckNickname}
                    disabled={nicknameChecking}
                    style={{
                      minWidth: 96,
                      height: 48,
                      border: "1px solid #111",
                      borderRadius: 12,
                      backgroundColor: "#fff",
                      cursor: nicknameChecking ? "not-allowed" : "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {nicknameChecking ? "확인 중" : "중복 확인"}
                  </button>
                </div>

                {nicknameError && <p style={{ fontSize: 12, color: "#ff4d4f", marginTop: 6 }}>{nicknameError}</p>}

                {!nicknameError && nicknameChecked && <p style={{ fontSize: 12, color: "#1677ff", marginTop: 6 }}>사용 가능한 닉네임입니다.</p>}
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#555", fontWeight: 600, display: "block", marginBottom: 6 }}>생년월일 (필수)</label>
                <BirthDatePicker value={form.birthDate} onChange={(date) => setForm((prev) => ({ ...prev, birthDate: date }))} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#555", fontWeight: 600, display: "block", marginBottom: 6 }}>성별 (필수)</label>
                <select value={form.userGender} onChange={set("userGender")} style={inputStyle}>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#555",
                  cursor: privacyLocked ? "default" : "pointer",
                  marginTop: 4,
                }}
              >
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  disabled={privacySaving || privacyLocked}
                  onChange={(e) => void handlePrivacyChange(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: privacyLocked ? "default" : "pointer" }}
                />
                개인정보 수집 및 이용에 동의합니다. (필수)
              </label>

              {privacyLocked && (
                <p style={{ fontSize: 12, color: "#666", margin: 0 }}>동의 내역은 저장되었습니다. 추가 정보는 이어서 입력해도 됩니다.</p>
              )}
            </div>

            {error && (
              <p
                style={{
                  fontSize: 13,
                  color: "#ff4d4f",
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || privacySaving}
              style={{
                width: "100%",
                height: 48,
                marginTop: 20,
                backgroundColor: loading || privacySaving ? "#555" : "#111",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading || privacySaving ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "처리 중.." : "완료"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  padding: "0 14px",
  border: "1.5px solid #e0e0e0",
  borderRadius: 12,
  fontSize: 14,
  color: "#111",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#fafafa",
};
