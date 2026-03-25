import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface BoardSectionHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  maxWidth?: number;
  action?: ReactNode;
}

export default function BoardSectionHeader({
  title,
  subtitle,
  backTo,
  backLabel = "이전으로 이동",
  maxWidth = 1200,
  action,
}: BoardSectionHeaderProps) {
  const hasBackButton = typeof backTo === "string" && backTo.length > 0;

  return (
    <section style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0" }}>
      <div
        style={{
          maxWidth,
          margin: "0 auto",
          padding: "32px 20px 24px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {hasBackButton && (
            <Link
              to={backTo}
              aria-label={backLabel}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                color: "#111827",
                marginTop: 3,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="m15 6-6 6 6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#111", letterSpacing: -0.5 }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#888" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div style={{ marginTop: 4 }}>{action}</div>}
      </div>
    </section>
  );
}
