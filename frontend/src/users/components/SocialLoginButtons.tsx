import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";

interface SocialLoginButtonsProps {
  onLogin: (provider: "google" | "kakao" | "naver") => void;
  showDivider?: boolean;
  dividerText?: string;
}

export default function SocialLoginButtons({ onLogin, showDivider = true, dividerText = "또는 간편하게 시작하기" }: SocialLoginButtonsProps) {
  return (
    <>
      {showDivider && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#E3EbE7" }} />
          <span style={{ fontSize: 12, color: "#A9C8BB", fontWeight: 500, whiteSpace: "nowrap" }}>
            {dividerText}
          </span>
          <div style={{ flex: 1, height: 1, background: "#E3EbE7" }} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          type="button"
          onClick={() => onLogin("kakao")}
          style={{ ...socialBtnBase, background: "#FEE500", color: "#191919" }}
        >
          <RiKakaoTalkFill style={{ width: 20, height: 20, color: "#191919" }} />
          카카오로 계속하기
        </button>

        <button
          type="button"
          onClick={() => onLogin("naver")}
          style={{ ...socialBtnBase, background: "#03C75A", color: "#fff" }}
        >
          <SiNaver style={{ width: 15, height: 15, color: "#fff" }} />
          네이버로 계속하기
        </button>

        <button
          type="button"
          onClick={() => onLogin("google")}
          style={{ ...socialBtnBase, background: "#fff", color: "#3c4043", border: "1.5px solid #E5E7EB" }}
        >
          <FcGoogle style={{ width: 20, height: 20 }} />
          구글로 계속하기
        </button>
      </div>
    </>
  );
}

const socialBtnBase: React.CSSProperties = {
  width: "100%",
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  border: "none",
  borderRadius: 14,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.15s",
  boxSizing: "border-box",
};
