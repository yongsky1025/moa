import { type InputHTMLAttributes } from "react";
import OutlineButton from "./OutlineButton";
import FormInput, { type ValidationState } from "./FormInput";

interface NicknameCheckFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  validationState?: ValidationState;
  feedback?: {
    tone: "success" | "error";
    text: string;
  } | null;
  fallbackError?: string;
  onCheck: () => void;
  checking: boolean;
  checkLabel?: string;
  checkingLabel?: string;
}

export default function NicknameCheckField({
  validationState = null,
  feedback = null,
  fallbackError,
  onCheck,
  checking,
  checkLabel = "중복 확인",
  checkingLabel = "확인 중...",
  ...inputProps
}: NicknameCheckFieldProps) {
  return (
    <>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <FormInput {...inputProps} type="text" validationState={validationState} />
        </div>
        <OutlineButton type="button" onClick={onCheck} disabled={checking}>
          {checking ? checkingLabel : checkLabel}
        </OutlineButton>
      </div>

      {feedback && (
        <p style={{ fontSize: 12, color: feedback.tone === "success" ? "#22c55e" : "#ff4d4f", marginTop: 6, marginBottom: 0 }}>
          {feedback.text}
        </p>
      )}

      {!feedback && fallbackError && <p style={{ fontSize: 12, color: "#ff4d4f", marginTop: 6, marginBottom: 0 }}>{fallbackError}</p>}
    </>
  );
}
