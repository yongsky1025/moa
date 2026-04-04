import { type CSSProperties, type InputHTMLAttributes } from "react";

export type ValidationState = "valid" | "invalid" | null;

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  validationState?: ValidationState;
  message?: string;
}

const iconStyle: CSSProperties = {
  position: "absolute",
  right: 14,
  top: "50%",
  transform: "translateY(-50%)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 48,
  padding: "0 40px 0 14px",
  border: "1.5px solid #e0e0e0",
  borderRadius: 10,
  fontSize: 14,
  color: "#111",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#fafafa",
};

export default function FormInput({ validationState = null, message, style, ...props }: FormInputProps) {
  return (
    <>
      <div style={{ position: "relative" }}>
        <input {...props} style={{ ...inputStyle, ...style }} />
        {validationState === "valid" && <CheckIcon />}
        {validationState === "invalid" && <XIcon />}
      </div>
      {message && <p style={{ fontSize: 12, color: "#ff4d4f", marginTop: 6, marginBottom: 0 }}>{message}</p>}
    </>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" style={iconStyle}>
      <path d="M3 8.5L6.5 12L13 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" style={iconStyle}>
      <path d="M4 4L12 12M12 4L4 12" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
