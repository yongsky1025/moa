import type { ReactNode } from "react";

interface CommunityListStateProps {
  loading: boolean;
  errorMessage?: string;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}

export default function CommunityListState({
  loading,
  errorMessage = "",
  isEmpty,
  emptyText,
  children,
}: CommunityListStateProps) {
  if (loading) {
    return <p style={{ margin: 0, color: "#6b7280" }}>불러오는 중...</p>;
  }
  if (errorMessage) {
    return <p style={{ margin: 0, color: "#dc2626" }}>{errorMessage}</p>;
  }
  if (isEmpty) {
    return <p style={{ margin: 0, color: "#6b7280" }}>{emptyText}</p>;
  }
  return <>{children}</>;
}
