interface FormErrorListProps {
  errors: string[];
}

export default function FormErrorList({ errors }: FormErrorListProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: "#fff5f5", borderRadius: 10, border: "1px solid #ffccc7" }}>
      {errors.map((msg, index) => (
        <p
          key={`${msg}-${index}`}
          style={{ fontSize: 12, color: "#ff4d4f", margin: index === 0 ? 0 : "4px 0 0", display: "flex", alignItems: "center", gap: 6 }}
        >
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M3 3L9 9M9 3L3 9" stroke="#ff4d4f" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {msg}
        </p>
      ))}
    </div>
  );
}
