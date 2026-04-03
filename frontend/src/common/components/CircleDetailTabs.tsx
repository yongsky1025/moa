import { useNavigate } from "react-router-dom";

export type CircleDetailTabKey = "home" | "board" | "activity";

interface CircleDetailTabsProps {
  circleId: number;
  activeTab: CircleDetailTabKey;
}

const TAB_ITEMS: Array<{ key: CircleDetailTabKey; label: string }> = [
  { key: "home", label: "홈" },
  { key: "board", label: "게시판" },
  { key: "activity", label: "모임 활동" },
];

const tabPath = (circleId: number, tab: CircleDetailTabKey) => {
  if (tab === "home") return `/circle/${circleId}`;
  return `/circle/${circleId}/${tab}`;
};

export default function CircleDetailTabs({ circleId, activeTab }: CircleDetailTabsProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 4px",
        borderBottom: "1px solid #e5e7eb",
        marginBottom: 20,
      }}
    >
      {TAB_ITEMS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(tabPath(circleId, tab.key))}
            aria-current={active ? "page" : undefined}
            style={{
              border: "none",
              borderBottom: active ? "2px solid #5f8f7b" : "2px solid transparent",
              background: "transparent",
              color: active ? "#2f4f42" : "#6b7280",
              fontSize: 15,
              fontWeight: active ? 800 : 600,
              cursor: "pointer",
              padding: "12px 14px 11px",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
