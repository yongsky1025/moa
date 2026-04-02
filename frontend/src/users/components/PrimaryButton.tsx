import { type ButtonHTMLAttributes } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export default function PrimaryButton({ loading, loadingText = "처리 중...", disabled, style, children, ...props }: PrimaryButtonProps) {
  const isDisabled = loading || disabled;
  return (
    <button
      {...props}
      disabled={isDisabled}
      style={{
        width: "100%",
        height: 50,
        backgroundColor: loading ? "#5F8F7B" : isDisabled ? "#9CA3AF" : "#4E7C69",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 700,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "background-color 0.15s",
        ...style,
      }}
    >
      {loading ? loadingText : children}
    </button>
  );
}
