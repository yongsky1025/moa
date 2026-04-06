import { Users } from "lucide-react";
import LikeHeartButton from "./LikeHeartButton";

export interface CircleItem {
  id: number;
  title: string;
  location: string;
  tag: string;
  description: string;
  data: string;
  image: string;
  starRating?: number;
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
        {/* 제목 + 카테고리 */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            marginBottom: 4,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#1F2937",
              lineHeight: 1.4,
            }}
          >
            {item.title}
          </span>
          {item.location && (
            <>
              <span
                style={{
                  width: 1,
                  height: 12,
                  backgroundColor: "#E5E7EB",
                  flexShrink: 0,
                  alignSelf: "center",
                  position: "relative",
                  top: 1,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#5F8F7B",
                  flexShrink: 0,
                }}
              >
                {item.location}
              </span>
            </>
          )}
        </div>

        {/* 설명 */}
        {item.description && (
          <div
            style={{
              fontSize: 12,
              color: "#6B7280",
              lineHeight: 1.4,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              marginBottom: 4,
            }}
          >
            {item.description}
          </div>
        )}

        {/* 인원 수 */}
        {item.tag && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6B7280" }}>
            <Users style={{ width: 12, height: 12 }} />
            {item.tag}
          </div>
        )}

        {/* 적합도 별 */}
        {item.starRating != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, color: "#6B7280" }}>
            <span style={{ fontWeight: 600 }}>적합도</span>
            <span style={{ color: "#d97706", letterSpacing: 1 }}>
              {"★".repeat(item.starRating)}
              {"☆".repeat(3 - item.starRating)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
