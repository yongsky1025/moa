import { useState, type FormEvent } from "react";
import type { PostFormValues } from "../types/postTypes";
import { validatePostForm } from "../utils/postValidators";
import { hasProfanity, stripHtmlToText } from "../../common/utils/profanityFilter";
import PostCkEditor from "./PostCkEditor";

interface PostFormProps {
  initialValue?: PostFormValues;
  mode: "create" | "edit";
  onSubmit: (values: PostFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitting: boolean;
  deleting?: boolean;
}

const EMPTY_FORM: PostFormValues = { title: "", content: "" };

export default function PostForm({
  initialValue,
  mode,
  onSubmit,
  onDelete,
  submitting,
  deleting = false,
}: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(initialValue ?? EMPTY_FORM);
  const [localError, setLocalError] = useState("");
  const normalizedTitle = values.title.trim();
  const plainContent = stripHtmlToText(values.content);
  const hasBadWordInTitle = hasProfanity(values.title);
  const hasBadWordInContent = hasProfanity(plainContent);
  const hasBadWord = hasBadWordInTitle || hasBadWordInContent;
  const disableSubmit =
    submitting ||
    deleting ||
    hasBadWord ||
    normalizedTitle.length < 2 ||
    normalizedTitle.length > 80 ||
    !plainContent;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const message = validatePostForm(values);
    if (message) {
      setLocalError(message);
      return;
    }
    setLocalError("");
    await onSubmit(values);
  };

  return (
    <form onSubmit={submit} className="post-editor-form">
      {localError && <p className="post-editor-message-error">{localError}</p>}
      {hasBadWord && (
        <p className="post-editor-message-error">부적절한 표현이 포함되어 있습니다.</p>
      )}

      <div className="post-editor-title-group">
        <label className="post-editor-label" htmlFor="post-title">
          제목
        </label>
        <input
          id="post-title"
          value={values.title}
          onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="제목을 입력하세요"
          maxLength={80}
          className="post-editor-title-input"
        />
      </div>

      <div className="post-editor-content-group">
        <p className="post-editor-label">본문</p>
        <PostCkEditor
          value={values.content}
          onChange={(content) => {
            setValues((prev) => ({ ...prev, content }));
          }}
          onError={(message) => {
            setLocalError(message);
          }}
        />
      </div>

      <div className="post-editor-actions">
        <button
          type="submit"
          disabled={disableSubmit}
          className={`post-editor-btn ${mode === "edit" ? "post-editor-btn-outline" : "post-editor-btn-primary"}`}
        >
          {submitting ? "저장 중..." : mode === "create" ? "등록" : "수정"}
        </button>
        {mode === "edit" && onDelete && (
          <button
            type="button"
            disabled={submitting || deleting}
            onClick={() => void onDelete()}
            className="post-editor-btn post-editor-btn-danger"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        )}
      </div>
    </form>
  );
}
