import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { profileApi } from "../../api/usersApi";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../common/utils/errorMessage";
import AuthCard from "../components/AuthCard";
import AuthPageLayout from "../components/AuthPageLayout";
import BirthDatePicker from "../components/BirthDatePicker";
import FormErrorList from "../components/FormErrorList";
import FormField from "../components/FormField";
import FormInput from "../components/FormInput";
import GenderButton from "../components/GenderButton";
import NicknameCheckField from "../components/NicknameCheckField";
import PrimaryButton from "../components/PrimaryButton";

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;
const RE_NAME = /^[가-힣]{2,5}$/;
const RE_NICKNAME = /^.{2,10}$/;

type UserGender = "" | "MALE" | "FEMALE";
type NicknameMessage = { type: "ok" | "err"; text: string };

export default function EmailSignUpPage() {
  const signup = useAuthStore((state) => state.signup);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    name: "",
    nickname: "",
    password: "",
    birthDate: "",
    userGender: "" as UserGender,
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameMsg, setNicknameMsg] = useState<NicknameMessage | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const emailValid = RE_EMAIL.test(form.email);
  const passwordValid = RE_PASSWORD.test(form.password);
  const passwordMatch = passwordConfirm.length > 0 && form.password === passwordConfirm;
  const passwordMismatch = passwordConfirm.length > 0 && form.password !== passwordConfirm;
  const nameValid = RE_NAME.test(form.name);
  const nicknameFormatOk = RE_NICKNAME.test(form.nickname);
  const nicknameValid = nicknameFormatOk && nicknameChecked;

  const clearSubmitErrors = () => {
    setFieldErrors([]);
    setError("");
  };

  const handleTextFieldChange =
    (key: "email" | "name" | "nickname" | "password") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      setForm((prev) => ({ ...prev, [key]: nextValue }));
      clearSubmitErrors();

      if (key === "nickname") {
        setNicknameChecked(false);
        setNicknameMsg(null);
      }
    };

  const handleBirthDateChange = (birthDate: string) => {
    setForm((prev) => ({ ...prev, birthDate }));
    clearSubmitErrors();
  };

  const handleGenderChange = (userGender: Exclude<UserGender, "">) => {
    setForm((prev) => ({ ...prev, userGender }));
    clearSubmitErrors();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearSubmitErrors();
    setLoading(true);

    const errors: string[] = [];

    if (!emailValid) errors.push("올바른 이메일 형식이 아닙니다.");
    if (!passwordValid) errors.push("비밀번호는 8~20자 영문, 숫자, 특수문자를 포함해야 합니다.");
    if (!passwordMatch) errors.push("비밀번호가 일치하지 않습니다.");
    if (!nameValid) errors.push("이름은 2~5자 한글만 입력 가능합니다.");
    if (!nicknameFormatOk) errors.push("닉네임은 2~10자여야 합니다.");
    else if (!nicknameChecked) errors.push("닉네임 중복 확인을 해주세요.");
    if (!form.birthDate) errors.push("생년월일을 선택해주세요.");
    if (!form.userGender) errors.push("성별을 선택해주세요.");
    if (!privacyAgreed) errors.push("개인정보 수집 및 이용에 동의해주세요.");

    if (errors.length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    const errorMessage = await signup({
      ...form,
      userGender: form.userGender as Exclude<UserGender, "">,
      age: 0,
      privacyAgreed: true,
    });

    setLoading(false);

    if (!errorMessage) {
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/users/login");
      return;
    }

    setError(errorMessage);
  };

  const handleCheckNickname = async () => {
    const nickname = form.nickname.trim();

    if (!nickname) {
      setNicknameMsg({ type: "err", text: "닉네임을 입력해주세요." });
      return;
    }

    if (!RE_NICKNAME.test(nickname)) {
      setNicknameMsg({ type: "err", text: "닉네임은 2~10자여야 합니다." });
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

  return (
    <AuthPageLayout logoHref="/main" maxWidth={460}>
      <AuthCard style={{ borderRadius: 16, padding: "36px 32px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
        <form onSubmit={handleSubmit}>
          <FormField label="이메일">
            <FormInput
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleTextFieldChange("email")}
              validationState={form.email ? (emailValid ? "valid" : "invalid") : null}
              message={form.email && !emailValid ? "올바른 이메일 형식이 아닙니다." : undefined}
            />
          </FormField>

          <FormField label="비밀번호">
            <FormInput
              type="password"
              placeholder="8~20자 영문, 숫자, 특수문자 포함"
              value={form.password}
              onChange={handleTextFieldChange("password")}
              validationState={form.password ? (passwordValid ? "valid" : "invalid") : null}
              message={form.password && !passwordValid ? "8~20자 영문, 숫자, 특수문자를 포함해주세요." : undefined}
            />
          </FormField>

          <FormField label="비밀번호 확인">
            <FormInput
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              value={passwordConfirm}
              onChange={(event) => {
                setPasswordConfirm(event.target.value);
                clearSubmitErrors();
              }}
              validationState={passwordConfirm ? (passwordMatch ? "valid" : "invalid") : null}
              message={passwordMismatch ? "비밀번호가 일치하지 않습니다." : undefined}
            />
          </FormField>

          <FormField label="이름">
            <FormInput
              type="text"
              placeholder="2~5자 한글"
              value={form.name}
              onChange={handleTextFieldChange("name")}
              validationState={form.name ? (nameValid ? "valid" : "invalid") : null}
              message={form.name && !nameValid ? "2~5자 한글만 입력 가능합니다." : undefined}
            />
          </FormField>

          <FormField label="닉네임">
            <NicknameCheckField
              value={form.nickname}
              onChange={handleTextFieldChange("nickname")}
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
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: "#555", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(event) => {
                setPrivacyAgreed(event.target.checked);
                clearSubmitErrors();
              }}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#111" }}
            />
            개인정보 수집 및 이용에 동의합니다. (필수)
          </label>

          <FormErrorList errors={fieldErrors} />

          {error && <p style={{ fontSize: 13, color: "#ff4d4f", marginTop: 14, textAlign: "center" }}>{error}</p>}

          <PrimaryButton type="submit" loading={loading} loadingText="처리 중..." style={{ marginTop: 20 }}>
            가입하기
          </PrimaryButton>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", display: "flex", justifyContent: "center", gap: 16 }}>
          <Link to="/users/signup" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>
            다른 방법으로 가입
          </Link>
          <Link to="/users/login" style={{ fontSize: 13, color: "#111", fontWeight: 700, textDecoration: "none" }}>
            로그인
          </Link>
        </div>
      </AuthCard>
    </AuthPageLayout>
  );
}
