import LikeHeartButton from "./LikeHeartButton";

interface PlaceItem {
  id: number;
  name: string;
  location: string;
  tags?: string[];
  image: string;
}

interface PlaceCardProps {
  place: PlaceItem;
  badge?: string;
  badgeColor?: string;
  isLiked?: boolean;
  isHovered?: boolean;
  onLike?: () => void;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function PlaceCard({
  place,
  badge,
  badgeColor = "#E3886D",
  isLiked = false,
  isHovered = false,
  onLike,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PlaceCardProps) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        minWidth: 220,
        width: 220,
        border: "1px solid #ebebeb",
        borderRadius: 14,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
        backgroundColor: "#FFFFFF",
        boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* 이미지 영역 */}
      <div style={{ position: "relative" }}>
        {place.image ? (
          <img src={place.image} alt={place.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
        ) : (
          <div
            style={{
              width: "100%",
              height: 160,
              backgroundColor: "#EAF4F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: "#A9C8BB", letterSpacing: 2 }}>MOA</span>
          </div>
        )}

        {/* 뱃지 */}
        {badge && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              padding: "3px 8px",
              borderRadius: 999,
              backgroundColor: badgeColor,
              fontSize: 11,
              fontWeight: 700,
              color: "white",
            }}
          >
            {badge}
          </div>
        )}

        {/* 좋아요 버튼 */}
        {onLike && (
          <LikeHeartButton
            liked={isLiked}
            onClick={onLike}
            stopPropagation
            activeColor="#E38B6D"
            inactiveColor="white"
            backgroundColor="rgba(0,0,0,0.05)"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
            }}
            iconSize={18}
            size={34}
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
            marginBottom: 6,
          }}
        >
          {place.name}
        </div>
        {place.tags && place.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {place.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  color: "#5F8F7B",
                  fontWeight: 500,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
