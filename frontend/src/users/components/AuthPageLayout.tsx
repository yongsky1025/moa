import { type ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthPageLayoutProps {
  children: ReactNode;
  tagline?: string;
  logoHref?: string;
  maxWidth?: number;
}

export default function AuthPageLayout({ children, tagline, logoHref = "/", maxWidth = 440 }: AuthPageLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAF9",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "16px 16px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <Link
            to={logoHref}
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: "#1F2937",
              textDecoration: "none",
              letterSpacing: -1,
            }}
          >
            moa
          </Link>
          {tagline && (
            <p style={{ marginTop: 10, fontSize: 14, color: "#6B7280", lineHeight: 1.4 }}>
              {tagline}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
