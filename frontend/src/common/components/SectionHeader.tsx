import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  moreHref?: string;
}

export default function SectionHeader({ title, subtitle, moreHref = "#" }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 18,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#1F2937",
            letterSpacing: -0.4,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>{subtitle}</div>
      </div>
      <a
        href={moreHref}
        style={{
          fontSize: 13,
          color: "#5F8F7B",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        더보기 <ChevronRight style={{ width: 14, height: 14 }} />
      </a>
    </div>
  );
}
