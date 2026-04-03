export type PostListViewMode = "card" | "line";

interface CommunityPostViewToggleProps {
  value: PostListViewMode;
  onChange: (next: PostListViewMode) => void;
}

export default function CommunityPostViewToggle({
  value,
  onChange,
}: CommunityPostViewToggleProps) {
  return (
    <div className="community-view-toggle" role="group" aria-label="목록 보기 형식">
      <button
        type="button"
        onClick={() => onChange("card")}
        className={value === "card" ? "active" : undefined}
      >
        카드형
      </button>
      <button
        type="button"
        onClick={() => onChange("line")}
        className={value === "line" ? "active" : undefined}
      >
        한줄형
      </button>
    </div>
  );
}

