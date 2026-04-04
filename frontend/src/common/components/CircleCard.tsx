import LikeHeartButton from "./LikeHeartButton";

export interface CircleItem {
  id: number;
  title: string;
  location: string;
  tag: string;
  data: string;
  image: string;
}

interface CircleCardProps {
  item: CircleItem;
  badge: string;
  badgeColor: string;
  isLiked?: boolean;
  isHovered: boolean;
  onLike?: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void;
}

export default function CircleCard({ item, badge, badgeColor, isLiked, isHovered, onLike, onMouseEnter, onMouseLeave, onClick }: CircleCardProps) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        minWidth: 220,
        width: 220,
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        backgroundColor: "#FFFFFF",
        boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* 이미지 영역 */}
      <div style={{ position: "relative" }}>
        {item.image ? (
          <img src={item.image} alt={item.title} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
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

        {/* 좋아요 버튼 */}
        {onLike && (
          <LikeHeartButton
            liked={!!isLiked}
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
      <div style={{ padding: "12px 14px 16px" }}>
        {/* 위치 | 태그 */}
        <div
          style={{
            fontSize: 11,
            color: "#6B7280",
            marginBottom: 3,
            fontWeight: 500,
            letterSpacing: 0.1,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>{item.location}</span>
          <span
            style={{
              width: 1,
              height: 10,
              backgroundColor: "#E5E7EB",
              flexShrink: 0,
              alignSelf: "center",
            }}
          />
          <span>{item.tag}</span>
        </div>

        {/* 제목 */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#1F2937",
            lineHeight: 1.4,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            marginBottom: 3,
          }}
        >
          {item.title}
        </div>

        {/* 날짜 */}
        <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 400 }}>{item.data}</div>
      </div>
    </div>
  );
}
