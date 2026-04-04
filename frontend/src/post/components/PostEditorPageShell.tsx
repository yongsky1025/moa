import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import PostForm from "./PostForm";
import type { PostFormValues } from "../types/postTypes";
import { CommonEditorSkeleton } from "../../common/components/BoardLoadingSkeletons";
import "../styles/postEditor.css";

interface PostEditorPageShellProps {
  title: string;
  listPath: string;
  listLabel?: string;
  mode: "create" | "edit";
  showForm: boolean;
  initialValue?: PostFormValues;
  submitting: boolean;
  deleting?: boolean;
  onSubmit: (values: PostFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  detailLoading?: boolean;
  detailError?: string;
  submitError?: string;
  preFormSlot?: ReactNode;
}

export default function PostEditorPageShell({
  title,
  listPath,
  listLabel = "목록으로",
  mode,
  showForm,
  initialValue,
  submitting,
  deleting = false,
  onSubmit,
  onDelete,
  detailLoading = false,
  detailError = "",
  submitError = "",
  preFormSlot,
}: PostEditorPageShellProps) {
  return (
    <main className="post-editor-page">
      <section className="post-editor-card">
        <div className="post-editor-card-header">
          <h2 className="post-editor-card-title">{title}</h2>
          <Link className="post-editor-list-link" to={listPath}>
            {listLabel}
          </Link>
        </div>
        <div className="post-editor-divider" />
        {preFormSlot}
        {mode === "edit" && detailLoading && <CommonEditorSkeleton />}
        {mode === "edit" && detailError && (
          <p className="post-editor-message-error">{detailError}</p>
        )}
        {submitError && <p className="post-editor-message-error">{submitError}</p>}

        {showForm && (
          <PostForm
            mode={mode}
            initialValue={initialValue}
            submitting={submitting}
            deleting={deleting}
            onSubmit={onSubmit}
            onDelete={onDelete}
          />
        )}
      </section>
    </main>
  );
}
