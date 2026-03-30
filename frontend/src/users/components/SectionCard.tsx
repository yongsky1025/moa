import { type ReactNode } from "react";

interface SectionCardProps {
  children: ReactNode;
  marginBottom?: number;
}

export default function SectionCard({ children, marginBottom = 16 }: SectionCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 18,
        margin: `0 16px ${marginBottom}px`,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
