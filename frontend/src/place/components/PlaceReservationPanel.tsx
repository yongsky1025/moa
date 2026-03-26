import { CalendarClock } from "lucide-react";
import type { PlaceDetailDTO } from "../types/placeTypes";

interface Props {
  place: PlaceDetailDTO;
}

function formatTime(t?: string) {
  if (!t) return "-";
  return t.slice(0, 5); // "HH:mm:ss" → "HH:mm"
}

function formatMinutes(m: number) {
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min === 0 ? `${h}시간` : `${h}시간 ${min}분`;
}

export default function PlaceReservationPanel({ place }: Props) {
  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1.5px solid #e5e5e5",
        borderRadius: 16,
        padding: "24px 22px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      {/* 가격 */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: "#111" }}>
          {place.pricePerHour.toLocaleString()}원
        </span>
        <span style={{ fontSize: 14, color: "#888", marginLeft: 4 }}>/ 시간</span>
      </div>

      {/* 운영 정보 */}
      <div
        style={{
          backgroundColor: "#f8faf9",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#888" }}>운영 시간</span>
          <span style={{ fontWeight: 600, color: "#111" }}>
            {formatTime(place.openTime)} ~ {formatTime(place.closeTime)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#888" }}>최소 예약</span>
          <span style={{ fontWeight: 600, color: "#111" }}>
            {formatMinutes(place.minReservationMinutes)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#888" }}>최대 예약</span>
          <span style={{ fontWeight: 600, color: "#111" }}>
            {formatMinutes(place.maxReservationMinutes)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#888" }}>수용 인원</span>
          <span style={{ fontWeight: 600, color: "#111" }}>최대 {place.capacity}명</span>
        </div>
      </div>

      {/* 예약 서비스 준비 중 안내 */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <CalendarClock style={{ width: 18, height: 18, color: "#5F8F7B", marginTop: 1, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#15803d", marginBottom: 3 }}>
            예약/결제 서비스 준비 중
          </p>
          <p style={{ fontSize: 12, color: "#4ade80", lineHeight: 1.6, color: "#166534" }}>
            현재 예약·결제 시스템을 준비하고 있습니다.
            오픈 시 알림을 받으시려면 좋아요를 눌러주세요.
          </p>
        </div>
      </div>

      {/* 예약 버튼 (비활성) */}
      <button
        disabled
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 10,
          border: "none",
          backgroundColor: "#d1d5db",
          color: "#9ca3af",
          fontSize: 15,
          fontWeight: 700,
          cursor: "not-allowed",
        }}
      >
        예약하기 (준비 중)
      </button>

      <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 10 }}>
        예약 전 이용 규정을 확인해 주세요
      </p>
    </div>
  );
}
