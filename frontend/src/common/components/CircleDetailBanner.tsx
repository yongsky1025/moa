import { Users } from "lucide-react";
import type { CircleResponse } from "../../circle/types/circle";

const STATUS_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  OPEN: { text: "모집중", color: "#16a34a", bg: "#dcfce7" },
  FULL: { text: "정원마감", color: "#dc2626", bg: "#fee2e2" },
  PENDING: { text: "승인대기", color: "#d97706", bg: "#fef3c7" },
  REJECTED: { text: "거절됨", color: "#6b7280", bg: "#f3f4f6" },
};

interface CircleDetailBannerProps {
  circle: CircleResponse;
  marginBottom?: number;
}

export default function CircleDetailBanner({
  circle,
  marginBottom = 20,
}: CircleDetailBannerProps) {
  const statusInfo = STATUS_LABEL[circle.status] ?? {
    text: circle.status,
    color: "#888",
    bg: "#f3f4f6",
  };

  return (
    <section
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        marginBottom,
      }}
    >
      {circle.coverImageUrl && (
        <img
          src={circle.coverImageUrl}
          alt={circle.name}
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
      <div style={{ padding: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 999,
                  backgroundColor: "#f3f4f6",
                  color: "#555",
                }}
              >
                {circle.categoryName}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 999,
                  backgroundColor: statusInfo.bg,
                  color: statusInfo.color,
                }}
              >
                {statusInfo.text}
              </span>
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#111",
                marginBottom: 8,
              }}
            >
              {circle.name}
            </h1>
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
              {circle.description || "소개글이 없습니다."}
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 15,
                color: "#333",
                justifyContent: "flex-end",
              }}
            >
              <Users size={16} />
              <strong>{circle.currentMember}</strong>
              <span style={{ color: "#aaa" }}>/ {circle.maxMember}명</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
