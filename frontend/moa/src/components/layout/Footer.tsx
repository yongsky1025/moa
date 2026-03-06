/**
 * MOA Footer Component
 * Design: Golden Afternoon Hygge - Warm footer
 */

import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer
      style={{
        background: "oklch(0.28 0.05 55)",
        color: "oklch(0.72 0.02 65)",
        padding: "4rem 1.5rem 2rem",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "3rem",
            marginBottom: "3rem",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "oklch(0.88 0.09 80)",
                  letterSpacing: "0.05em",
                }}
              >
                MOA
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "0.85rem",
                lineHeight: 1.75,
                color: "oklch(0.62 0.02 65)",
              }}
            >
              내향적인 사람들을 위한
              <br />
              따뜻한 소모임 플랫폼.
              <br />
              나와 에너지가 맞는 사람들과
              <br />
              조용히, 깊게 연결되세요.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              style={{
                fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "oklch(0.88 0.09 80)",
                marginBottom: "1rem",
                letterSpacing: "0.08em",
              }}
            >
              서비스
            </h4>
            {[
              { label: "모임 찾기", path: "/gathering" },
              { label: "커뮤니티", path: "/community" },
              { label: "에너지 테스트", path: "/energy-test" },
              { label: "회원가입", path: "/register" },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  display: "block",
                  background: "none",
                  border: "none",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: "0.85rem",
                  color: "oklch(0.62 0.02 65)",
                  cursor: "pointer",
                  padding: "0.3rem 0",
                  transition: "color 0.2s ease",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.88 0.09 80)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.62 0.02 65)";
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Info */}
          <div>
            <h4
              style={{
                fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "oklch(0.88 0.09 80)",
                marginBottom: "1rem",
                letterSpacing: "0.08em",
              }}
            >
              정보
            </h4>
            {["이용약관", "개인정보처리방침", "공지사항", "고객센터"].map(
              (item) => (
                <button
                  key={item}
                  style={{
                    display: "block",
                    background: "none",
                    border: "none",
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: "0.85rem",
                    color: "oklch(0.62 0.02 65)",
                    cursor: "pointer",
                    padding: "0.3rem 0",
                    transition: "color 0.2s ease",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.88 0.09 80)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.62 0.02 65)";
                  }}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          {/* Newsletter */}
          <div>
            <h4
              style={{
                fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "oklch(0.88 0.09 80)",
                marginBottom: "1rem",
                letterSpacing: "0.08em",
              }}
            >
              뉴스레터
            </h4>
            <p
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "0.82rem",
                color: "oklch(0.62 0.02 65)",
                lineHeight: 1.6,
                marginBottom: "1rem",
              }}
            >
              새로운 모임 소식과 따뜻한 이야기를 이메일로 받아보세요.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="email"
                placeholder="이메일 주소"
                style={{
                  flex: 1,
                  padding: "0.6rem 0.85rem",
                  background: "oklch(0.35 0.04 55)",
                  border: "1px solid oklch(0.45 0.03 55)",
                  borderRadius: "0.5rem",
                  fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                  fontSize: "0.82rem",
                  color: "oklch(0.88 0.02 75)",
                  outline: "none",
                  minWidth: 0,
                }}
              />
              <button
                style={{
                  background: "oklch(0.62 0.14 42)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "0.6rem 0.85rem",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.55 0.13 42)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.62 0.14 42)";
                }}
              >
                구독
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: "1px solid oklch(0.38 0.03 55)",
            paddingTop: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem",
              color: "oklch(0.52 0.02 65)",
            }}
          >
            © 2025 MOA. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Instagram", "Twitter", "Blog"].map((social) => (
              <button
                key={social}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem",
                  color: "oklch(0.52 0.02 65)",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.88 0.09 80)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.52 0.02 65)";
                }}
              >
                {social}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
