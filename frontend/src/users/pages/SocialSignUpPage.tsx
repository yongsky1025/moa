import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { profileApi } from "../../api/usersApi";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../common/utils/errorMessage";
import AuthCard from "../components/AuthCard";
import BirthDatePicker from "../components/BirthDatePicker";
import FormErrorList from "../components/FormErrorList";
import FormField from "../components/FormField";
import GenderButton from "../components/GenderButton";
import NicknameCheckField from "../components/NicknameCheckField";
import SignUpStepper from "../components/SignUpStepper";

const RE_NICKNAME = /^.{2,10}$/;

type UserGender = "" | "MALE" | "FEMALE";
type NicknameMessage = { type: "ok" | "err"; text: string };

export default function SocialSignUpPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nickname: "",
    birthDate: "",
    userGender: "" as UserGender,
  });
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameMsg, setNicknameMsg] = useState<NicknameMessage | null>(null);

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
      .then(async (response) => {
        const token = localStorage.getItem("accessToken") ?? "";
        setAuth(token, response.data);

        if (response.data.privacyAgreed) {
          setPrivacyAgreed(true);
          setPrivacyLocked(true);
        }

        const profile = await profileApi.getMyProfile();
        const defaultNickname = profile.name ?? "";

        setForm((prev) => ({
          ...prev,
          nickname: defaultNickname,
        }));
        setNicknameChecked(true);
      })
      .catch(() => {});
  }, [setAuth]);

  const clearSubmitErrors = () => {
    setFieldErrors([]);
    setError("");
  };

  const handleNicknameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, nickname: event.target.value }));
    setNicknameChecked(false);
    setNicknameMsg(null);
    clearSubmitErrors();
  };

  const handleBirthDateChange = (birthDate: string) => {
    setForm((prev) => ({ ...prev, birthDate }));
    clearSubmitErrors();
  };

  const handleGenderChange = (userGender: Exclude<UserGender, "">) => {
    setForm((prev) => ({ ...prev, userGender }));
    clearSubmitErrors();
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
    } catch (signupError) {
      setNicknameChecked(false);
      setNicknameMsg({ type: "err", text: getErrorMessage(signupError) });
    } finally {
      setNicknameChecking(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearSubmitErrors();

    const errors: string[] = [];

    if (!nicknameFormatOk) errors.push("닉네임은 2~10자여야 합니다.");
    else if (!nicknameChecked) errors.push("닉네임 중복 확인을 해주세요.");
    if (!form.birthDate) errors.push("생년월일을 선택해주세요.");
    if (!form.userGender) errors.push("성별을 선택해주세요.");
    if (!privacyAgreed) errors.push("개인정보 수집 및 이용에 동의해주세요.");

    if (errors.length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await authApi.socialSignUpComplete({
        nickname: form.nickname.trim(),
        birthDate: form.birthDate,
        userGender: form.userGender as Exclude<UserGender, "">,
        privacyAgreed: true,
      });

      const response = await authApi.refresh();
      setAuth(response.data.accessToken, response.data.user);
      navigate(response.data.user.onboardingCompleted ? "/main" : "/users/onboarding");
    } catch (signupError) {
      setError(getErrorMessage(signupError));
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
    } catch (signupError) {
      setPrivacyAgreed(false);
      setError(getErrorMessage(signupError));
    } finally {
      setPrivacySaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: "#111", letterSpacing: -1 }}>moa</span>
          <p style={{ marginTop: 6, fontSize: 14, color: "#888" }}>추가 정보를 입력해주세요</p>
        </div>

        <SignUpStepper currentStep={2} />

        <AuthCard style={{ borderRadius: 16, padding: "36px 32px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSubmit}>
            <FormField label="닉네임">
              <NicknameCheckField
                value={form.nickname}
                onChange={handleNicknameChange}
                placeholder="2~10자"
                required
                onCheck={handleCheckNickname}
                checking={nicknameChecking}
                validationState={form.nickname ? (nicknameValid ? "valid" : nicknameMsg?.type === "err" || !nicknameFormatOk ? "invalid" : null) : null}
                feedback={nicknameMsg ? { tone: nicknameMsg.type === "ok" ? "success" : "error", text: nicknameMsg.text } : null}
                fallbackError={form.nickname && !nicknameFormatOk ? "닉네임은 2~10자여야 합니다." : undefined}
              />
            </FormField>

            <FormField label="생년월일">
              <BirthDatePicker value={form.birthDate} onChange={handleBirthDateChange} />
            </FormField>

            <FormField label="성별" last>
              <div style={{ display: "flex", gap: 10 }}>
                <GenderButton selected={form.userGender === "MALE"} onClick={() => handleGenderChange("MALE")}>
                  남성
                </GenderButton>
                <GenderButton selected={form.userGender === "FEMALE"} onClick={() => handleGenderChange("FEMALE")}>
                  여성
                </GenderButton>
              </div>
            </FormField>

            <div style={{ height: 1, backgroundColor: "#eee", margin: "20px 0 16px" }} />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 13,
                color: "#555",
                cursor: privacyLocked ? "default" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={privacyAgreed}
                disabled={privacySaving || privacyLocked}
                onChange={(event) => void handlePrivacyChange(event.target.checked)}
                style={{ width: 16, height: 16, cursor: privacyLocked ? "default" : "pointer", accentColor: "#111" }}
              />
              개인정보 수집 및 이용에 동의합니다. (필수)
            </label>

            {privacyLocked && (
              <p style={{ fontSize: 12, color: "#666", margin: "8px 0 0", textAlign: "center" }}>
                동의 내역이 저장되었습니다. 추가 정보를 이어서 입력해도 됩니다.
              </p>
            )}

            <FormErrorList errors={fieldErrors} />

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
        </AuthCard>
      </div>
    </div>
  );
}
