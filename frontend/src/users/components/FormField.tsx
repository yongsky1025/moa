import { type ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  last?: boolean;
}

export default function FormField({ label, children, last }: FormFieldProps) {
  return (
    <div style={{ marginBottom: last ? 0 : 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
