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
  const plainContent = stripHtmlToText(values.content);
  const hasBadWordInTitle = hasProfanity(values.title);
  const hasBadWordInContent = hasProfanity(plainContent);
  const hasBadWord = hasBadWordInTitle || hasBadWordInContent;
  const disableSubmit = submitting || deleting || hasBadWord || !values.title.trim() || !plainContent;

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
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      {localError && <p style={{ color: "#dc2626", margin: 0 }}>{localError}</p>}
      {hasBadWord && <p style={{ color: "#dc2626", margin: 0 }}>⚠️ 부적절한 표현이 포함되어 있습니다.</p>}
      <input
        value={values.title}
        onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
        placeholder="제목"
        style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
      />
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8 }}>
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
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="submit"
          disabled={disableSubmit}
          style={{
            width: 120,
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#111",
            color: "white",
            cursor: "pointer",
          }}
        >
          {submitting ? "저장 중..." : mode === "create" ? "등록" : "수정"}
        </button>
        {mode === "edit" && onDelete && (
          <button
            type="button"
            disabled={submitting || deleting}
            onClick={() => void onDelete()}
            style={{
              width: 120,
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#dc2626",
              color: "white",
              cursor: "pointer",
            }}
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        )}
      </div>
    </form>
  );
}
