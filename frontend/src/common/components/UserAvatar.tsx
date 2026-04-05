import { toAssetUrl } from "../utils/assetUrl";

interface UserAvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  className?: string;
  ariaHidden?: boolean;
  initialMode?: "nickname" | "ascii";
}

export default function UserAvatar({
  name,
  imageUrl,
  size = 40,
  className,
  ariaHidden = false,
  initialMode = "ascii",
}: UserAvatarProps) {
  const normalizedName = name?.trim();
  const initial = (() => {
    const firstChar = normalizedName?.[0];
    if (!firstChar) {
      return "U";
    }
    if (initialMode === "nickname") {
      return firstChar.toUpperCase();
    }
    return /^[A-Za-z]$/.test(firstChar) ? firstChar.toUpperCase() : "U";
  })();
  const fontSize = Math.max(11, Math.round(size * 0.36));

  if (imageUrl) {
    return (
      <img
        src={toAssetUrl(imageUrl)}
        alt={ariaHidden ? "" : "프로필"}
        aria-hidden={ariaHidden}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          overflow: "hidden",
        }}
      />
    );
  }

  return (
    <div
      aria-hidden={ariaHidden}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#6C8197",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize,
        userSelect: "none",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
