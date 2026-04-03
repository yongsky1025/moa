import { Heart } from "lucide-react";
import type { CSSProperties } from "react";

interface LikeHeartButtonProps {
  liked: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  stopPropagation?: boolean;
  variant?: "circle" | "pill";
  size?: number;
  iconSize?: number;
  label?: string;
  count?: number;
  showCountWhenZero?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  activeBorderColor?: string;
  inactiveBorderColor?: string;
  backgroundColor?: string;
  style?: CSSProperties;
}

export default function LikeHeartButton({
  liked,
  onClick,
  ariaLabel = "찜하기",
  title,
  disabled = false,
  stopPropagation = false,
  variant = "circle",
  size = 30,
  iconSize = 14,
  label,
  count,
  showCountWhenZero = false,
  activeColor = "#E38B6D",
  inactiveColor = "#6B7280",
  activeBackgroundColor = "#FDF1EC",
  inactiveBackgroundColor = "#FFFFFF",
  activeBorderColor = "#E38B6D",
  inactiveBorderColor = "#E5E7EB",
  backgroundColor,
  style,
}: LikeHeartButtonProps) {
  const isPill = variant === "pill";
  const iconColor = liked ? activeColor : inactiveColor;
  const shouldShowCount = typeof count === "number" && (showCountWhenZero || count > 0);

  const baseStyle: CSSProperties = isPill
    ? {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 13px",
        borderRadius: 999,
        border: `1.5px solid ${liked ? activeBorderColor : inactiveBorderColor}`,
        backgroundColor: liked ? activeBackgroundColor : inactiveBackgroundColor,
        color: iconColor,
        cursor: disabled ? "default" : "pointer",
        fontSize: 13,
        fontWeight: 600,
        transition: "all 0.15s",
      }
    : {
        width: size,
        height: size,
        borderRadius: "50%",
        border: "none",
        backgroundColor: backgroundColor ?? inactiveBackgroundColor,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
      };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={(event) => {
        if (stopPropagation) event.stopPropagation();
        onClick?.();
      }}
      style={{ ...baseStyle, ...style }}
    >
      <Heart
        style={{
          width: iconSize,
          height: iconSize,
          fill: liked ? iconColor : "none",
          color: iconColor,
          flexShrink: 0,
        }}
      />
      {isPill && label && <span>{label}</span>}
      {isPill && shouldShowCount && <span>{count}</span>}
    </button>
  );
}
