import { type ButtonHTMLAttributes } from "react";

interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  minWidth?: number;
}

export default function OutlineButton({ minWidth = 88, disabled, style, children, ...props }: OutlineButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        minWidth,
        height: 40,
        border: "1.5px solid #111",
        borderRadius: 10,
        backgroundColor: "#fff",
        fontSize: 13,
        fontWeight: 700,
        color: "#111",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
