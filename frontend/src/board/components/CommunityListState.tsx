import type { ReactNode } from "react";
import { BoardListSkeleton } from "../../common/components/BoardLoadingSkeletons";
import { useDelayedLoading } from "../../common/hooks/useDelayedLoading";

interface CommunityListStateProps {
  loading: boolean;
  loadingSkeletonCount?: number;
  loadingContent?: ReactNode;
  errorMessage?: string;
  isEmpty: boolean;
  emptyText: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  emptyActionDisabled?: boolean;
  children: ReactNode;
}

export default function CommunityListState({
  loading,
  loadingSkeletonCount = 4,
  loadingContent,
  errorMessage = "",
  isEmpty,
  emptyText,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  emptyActionDisabled = false,
  children,
}: CommunityListStateProps) {
  const showLoading = useDelayedLoading(loading, 150, 300);

  if (showLoading) {
    if (loadingContent) {
      return <>{loadingContent}</>;
    }
    return <BoardListSkeleton count={loadingSkeletonCount} />;
  }
  if (loading) {
    return null;
  }
  if (errorMessage) {
    return <p style={{ margin: 0, color: "#dc2626" }}>{errorMessage}</p>;
  }
  if (isEmpty) {
    return (
      <div
        style={{
          margin: 0,
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          backgroundColor: "#fff",
          padding: "24px 20px",
          display: "grid",
          gap: 6,
          justifyItems: "center",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, color: "#374151", fontWeight: 700 }}>{emptyText}</p>
        {emptyDescription ? (
          <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>{emptyDescription}</p>
        ) : null}
        {emptyActionLabel && onEmptyAction ? (
          <button
            type="button"
            onClick={onEmptyAction}
            disabled={emptyActionDisabled}
            style={{
              marginTop: 6,
              height: 34,
              borderRadius: 8,
              border: "1px solid #5F8F7B",
              backgroundColor: emptyActionDisabled ? "#A9C8BB" : "#5F8F7B",
              color: "#fff",
              padding: "0 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: emptyActionDisabled ? "default" : "pointer",
            }}
          >
            {emptyActionLabel}
          </button>
        ) : null}
      </div>
    );
  }
  return <>{children}</>;
}
