import { useState, type FormEvent } from "react";
import type { PostFormValues } from "../types/postTypes";
import { validatePostForm } from "../utils/postValidators";
import PostCkEditor from "./PostCkEditor";

interface PostFormProps {
  initialValue?: PostFormValues;
  mode: "create" | "edit";
  onSubmit: (values: PostFormValues) => Promise<void>;
  submitting: boolean;
}

const EMPTY_FORM: PostFormValues = { title: "", content: "" };

export default function PostForm({ initialValue, mode, onSubmit, submitting }: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(initialValue ?? EMPTY_FORM);
  const [localError, setLocalError] = useState("");

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
      <button
        type="submit"
        disabled={submitting}
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
    </form>
  );
}
