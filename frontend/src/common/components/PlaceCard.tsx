import LikeHeartButton from "./LikeHeartButton";

interface PlaceItem {
  id: number;
  name: string;
  location: string;
  tag: string;
  image: string;
}

interface PlaceCardProps {
  place: PlaceItem;
  isLiked?: boolean;
  onLike?: () => void;
  onClick?: () => void;
}

export default function PlaceCard({ place, isLiked = false, onLike, onClick }: PlaceCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        minWidth: 220,
        width: 220,
        border: "1px solid #ebebeb",
        borderRadius: 14,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
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

        {onLike && (
          <LikeHeartButton
            liked={isLiked}
            onClick={onLike}
            stopPropagation
            activeColor="#EF4444"
            inactiveColor="#111111"
            backgroundColor="rgba(255,255,255,0.92)"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}
          />
        )}
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
