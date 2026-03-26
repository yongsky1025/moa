import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { profileApi } from "../../api/usersApi";
import { getErrorMessage } from "../../common/utils/errorMessage";
import BirthDatePicker from "../components/BirthDatePicker";

/* ── 정규식 ── */
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;
const RE_NAME = /^[가-힣]{2,5}$/;
const RE_NICKNAME = /^.{2,10}$/;

export default function EmailSignUpPage() {
  const signup = useAuthStore((s) => s.signup);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    name: "",
    nickname: "",
    password: "",
    birthDate: "",
    userGender: "" as "" | "MALE" | "FEMALE",
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameMsg, setNicknameMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* ── 필드별 유효성 ── */
  const emailValid = RE_EMAIL.test(form.email);
  const passwordValid = RE_PASSWORD.test(form.password);
  const passwordMatch = passwordConfirm.length > 0 && form.password === passwordConfirm;
  const passwordMismatch = passwordConfirm.length > 0 && form.password !== passwordConfirm;
  const nameValid = RE_NAME.test(form.name);
  const nicknameFormatOk = RE_NICKNAME.test(form.nickname);
  const nicknameValid = nicknameFormatOk && nicknameChecked;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors([]);
    setLoading(true);

    // 필드별 에러 수집
    const errs: string[] = [];
    if (!emailValid) errs.push("이메일 형식이 올바르지 않습니다.");
    if (!passwordValid) errs.push("비밀번호는 8~20자, 영문+숫자+특수문자를 포함해야 합니다.");
    if (!passwordMatch) errs.push("비밀번호가 일치하지 않습니다.");
    if (!nameValid) errs.push("이름은 2~5자 한글만 가능합니다.");
    if (!nicknameFormatOk) errs.push("닉네임은 2~10자여야 합니다.");
    else if (!nicknameChecked) errs.push("닉네임 중복 확인을 해주세요.");
    if (!form.birthDate) errs.push("생년월일을 선택해주세요.");
    if (!form.userGender) errs.push("성별을 선택해주세요.");
    if (!privacyAgreed) errs.push("개인정보 수집 및 이용에 동의해주세요.");

    if (errs.length > 0) {
      setFieldErrors(errs);
      setLoading(false);
      return;
    }

    const errorMsg = await signup({ ...form, userGender: form.userGender as "MALE" | "FEMALE", age: 0, privacyAgreed: true });
    setLoading(false);
    if (!errorMsg) {
      alert("회원가입 성공! 로그인 해주세요.");
      navigate("/users/login");
    } else {
      setError(errorMsg);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
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
    } catch (e) {
      setNicknameChecked(false);
      setNicknameMsg({ type: "err", text: getErrorMessage(e) });
    } finally {
      setNicknameChecking(false);
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
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link to="/main" style={{ fontSize: 32, fontWeight: 900, color: "#111", textDecoration: "none", letterSpacing: -1 }}>
            moa
          </Link>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: "36px 32px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSubmit}>
            {/* 이메일 */}
            <FormField label="이메일">
              <ValidatedInput
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={set("email")}
                valid={form.email ? emailValid : null}
                errMsg={form.email && !emailValid ? "올바른 이메일 형식이 아닙니다." : undefined}
              />
            </FormField>

            {/* 비밀번호 */}
            <FormField label="비밀번호">
              <ValidatedInput
                type="password"
                placeholder="8~20자, 영문+숫자+특수문자"
                value={form.password}
                onChange={set("password")}
                valid={form.password ? passwordValid : null}
                errMsg={form.password && !passwordValid ? "8~20자, 영문+숫자+특수문자를 포함해주세요." : undefined}
              />
            </FormField>

            {/* 비밀번호 재확인 */}
            <FormField label="비밀번호 재확인">
              <ValidatedInput
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  setFieldErrors([]);
                  setError("");
                }}
                valid={passwordConfirm ? passwordMatch : null}
                errMsg={passwordMismatch ? "비밀번호가 일치하지 않습니다." : undefined}
              />
            </FormField>

            {/* 이름 */}
            <FormField label="이름">
              <ValidatedInput
                type="text"
                placeholder="2~5자 한글"
                value={form.name}
                onChange={set("name")}
                valid={form.name ? nameValid : null}
                errMsg={form.name && !nameValid ? "2~5자 한글만 입력 가능합니다." : undefined}
              />
            </FormField>

            {/* 닉네임 */}
            <FormField label="닉네임">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input type="text" placeholder="2~10자" value={form.nickname} onChange={set("nickname")} required style={inputStyle} />
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

            <label
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: "#555", cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#111" }}
              />
              개인정보 수집 및 이용에 동의합니다. (필수)
            </label>

            {/* 제출 시 필드별 에러 목록 */}
            {fieldErrors.length > 0 && (
              <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: "#fff5f5", borderRadius: 10, border: "1px solid #ffccc7" }}>
                {fieldErrors.map((msg, i) => (
                  <p
                    key={i}
                    style={{ fontSize: 12, color: "#ff4d4f", margin: i === 0 ? 0 : "4px 0 0", display: "flex", alignItems: "center", gap: 6 }}
                  >
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
              disabled={loading}
              style={{
                width: "100%",
                height: 50,
                marginTop: 20,
                backgroundColor: loading ? "#999" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.15s",
              }}
            >
              {loading ? "처리 중..." : "가입하기"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", display: "flex", justifyContent: "center", gap: 16 }}>
            <Link to="/users/signup" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>
              ← 다른 방법으로 가입
            </Link>
            <Link to="/users/login" style={{ fontSize: 13, color: "#111", fontWeight: 700, textDecoration: "none" }}>
              로그인
            </Link>
          </div>
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

/* ── 유효성 아이콘 포함 입력칸 ── */
function ValidatedInput({ valid, errMsg, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { valid: boolean | null; errMsg?: string }) {
  return (
    <>
      <div style={{ position: "relative" }}>
        <input {...props} required style={inputStyle} />
        {valid === true && <CheckIcon />}
        {valid === false && <XIcon />}
      </div>
      {errMsg && <p style={{ fontSize: 12, color: "#ff4d4f", marginTop: 6, marginBottom: 0 }}>{errMsg}</p>}
    </>
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
