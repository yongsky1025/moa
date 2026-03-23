interface PlaceItem {
  id: number;
  name: string;
  location: string;
  tag: string;
  image: string;
}

interface PlaceCardProps {
  place: PlaceItem;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  return (
    <div
      style={{
        minWidth: 220,
        width: 220,
        border: "1px solid #ebebeb",
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      }}
    >
      {/* 이미지 영역 */}
      <div style={{ position: "relative" }}>
        <img src={place.image} alt={place.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />

        {/* 태그 뱃지 */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "3px 8px",
            borderRadius: 999,
            backgroundColor: "#111",
            fontSize: 11,
            fontWeight: 700,
            color: "white",
          }}
        >
          {place.tag}
        </div>
      </div>

      {/* 정보 영역 */}
      <div style={{ padding: "10px 12px 12px" }}>
        <div
          style={{
            fontSize: 11,
            color: "#555",
            marginBottom: 3,
            fontWeight: 500,
            letterSpacing: 0.1,
          }}
        >
          {place.location}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#111",
            lineHeight: 1.4,
          }}
        >
          {place.name}
        </div>
      </div>
    </div>
  );
}
