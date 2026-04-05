import type { CSSProperties, ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

type DropdownMenuLinkItem = {
  type?: "link";
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
  tone?: "default" | "danger";
  onClick?: () => void;
};

type DropdownMenuButtonItem = {
  type: "button";
  key: string;
  label: string;
  icon?: ReactNode;
  tone?: "default" | "danger";
  onClick: () => void;
};

type DropdownMenuDivider = {
  type: "divider";
  key: string;
};

export type DropdownMenuItem = DropdownMenuLinkItem | DropdownMenuButtonItem | DropdownMenuDivider;

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  align?: "left" | "right";
  top?: string;
  minWidth?: number;
  zIndex?: number;
  style?: CSSProperties;
}

const itemBaseStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  height: 40,
  padding: "0 12px",
  borderRadius: 8,
  fontSize: 13,
  textDecoration: "none",
  whiteSpace: "nowrap",
  width: "100%",
  border: "none",
  background: "none",
  cursor: "pointer",
};

function getHoverBackground(tone: "default" | "danger") {
  return tone === "danger" ? "#fff5f5" : "#f5f5f5";
}

export default function DropdownMenu({ items, align = "left", top = "calc(100% + 8px)", minWidth = 160, zIndex = 100, style }: DropdownMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: align === "left" ? 0 : undefined,
        right: align === "right" ? 0 : undefined,
        backgroundColor: "white",
        border: "1px solid #E6EEEA",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        padding: "6px",
        minWidth,
        zIndex,
        ...style,
      }}
    >
      {items.map((item) => {
        if (item.type === "divider") {
          return (
            <div
              key={item.key}
              style={{
                height: 1,
                backgroundColor: "#f0f0f0",
                margin: "4px 6px",
              }}
            />
          );
        }

        const tone = item.tone ?? "default";
        const textColor = tone === "danger" ? "#e53e3e" : "#444";
        const iconColor = tone === "danger" ? "#e53e3e" : "#888";
        const hoverBackground = getHoverBackground(tone);

        if (item.type === "button") {
          return (
            <button
              key={item.key}
              onClick={item.onClick}
              style={{
                ...itemBaseStyle,
                color: textColor,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBackground)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {item.icon && <span style={{ color: iconColor, display: "flex" }}>{item.icon}</span>}
              {item.label}
            </button>
          );
        }

        return (
          <Link
            key={item.key}
            to={item.href}
            onClick={(e) => {
              if (location.pathname === item.href) {
                e.preventDefault();
                navigate(0);
              }
              item.onClick?.();
            }}
            style={{
              ...itemBaseStyle,
              color: textColor,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBackground)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {item.icon && <span style={{ color: iconColor, display: "flex" }}>{item.icon}</span>}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
