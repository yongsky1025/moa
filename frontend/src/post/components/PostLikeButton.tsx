interface PostLikeButtonProps {
  liked: boolean;
  likeCount: number;
  disabled: boolean;
  onClick: () => void;
  error?: string;
  marginTop?: number;
}

export default function PostLikeButton({
  liked,
  likeCount,
  disabled,
  onClick,
  error,
  marginTop = 12,
}: PostLikeButtonProps) {
  return (
    <section style={{ marginTop }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          border: "1px solid #d1d5db",
          backgroundColor: liked ? "#ecfdf3" : "#fff",
          borderRadius: 8,
          padding: "8px 14px",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
          color: liked ? "#047857" : "#111827",
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span aria-hidden="true">👍</span>
        <span>좋아요 {likeCount}</span>
      </button>
      {error && <p style={{ margin: "10px 0 0", color: "#dc2626" }}>{error}</p>}
    </section>
  );
}
