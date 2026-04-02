import { type ReactNode } from "react";

interface GenderButtonProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

export default function GenderButton({ selected, onClick, children }: GenderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        height: 44,
        border: selected ? "1.5px solid #111" : "1.5px solid #e0e0e0",
        borderRadius: 10,
        backgroundColor: selected ? "#111" : "#fafafa",
        color: selected ? "#fff" : "#888",
        fontSize: 14,
        fontWeight: selected ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
