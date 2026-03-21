import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import PostForm from "./PostForm";
import type { PostFormValues } from "../types/postTypes";

interface PostEditorPageShellProps {
  title: string;
  listPath: string;
  mode: "create" | "edit";
  showForm: boolean;
  initialValue?: PostFormValues;
  submitting: boolean;
  onSubmit: (values: PostFormValues) => Promise<void>;
  detailLoading?: boolean;
  detailError?: string;
  submitError?: string;
  preFormSlot?: ReactNode;
}

export default function PostEditorPageShell({
  title,
  listPath,
  mode,
  showForm,
  initialValue,
  submitting,
  onSubmit,
  detailLoading = false,
  detailError = "",
  submitError = "",
  preFormSlot,
}: PostEditorPageShellProps) {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h2>{title}</h2>
      <p>
        <Link to={listPath}>목록으로</Link>
      </p>

      {preFormSlot}
      {mode === "edit" && detailLoading && <p>기존 글을 불러오는 중...</p>}
      {mode === "edit" && detailError && (
        <p style={{ color: "#dc2626" }}>{detailError}</p>
      )}
      {submitError && <p style={{ color: "#dc2626" }}>{submitError}</p>}

      {showForm && (
        <PostForm
          mode={mode}
          initialValue={initialValue}
          submitting={submitting}
          onSubmit={onSubmit}
        />
      )}
    </main>
  );
}
