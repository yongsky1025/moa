import { type CSSProperties, type ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  style?: CSSProperties;
}

export default function AuthCard({ children, style }: AuthCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 20,
        padding: "26px 24px",
        boxShadow: "0 8px 24px rgba(31, 45, 61, 0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
