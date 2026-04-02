import { type ReactNode } from "react";

interface CenterMessageProps {
  children: ReactNode;
}

export default function CenterMessage({ children }: CenterMessageProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
        color: "#6B7280",
      }}
    >
      {children}
    </div>
  );
}
