import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
import type { CircleBoardResponse } from "../../api/circleBoardApi";
import { circleBoardApi } from "../../api/circleBoardApi";
import UserAvatar from "../../common/components/UserAvatar";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../utils/errorMessage";
import { requestUploadUrl, uploadByContract } from "../../api/uploadUrlApi";
import "../../reply/styles/replySection.css";

interface CircleActivityComposerProps {
  circleId: number;
  boards: CircleBoardResponse[];
  selectedBoard: "all" | number;
  onCreated: () => void;
}

export default function CircleActivityComposer({
  circleId,
  boards,
  selectedBoard,
  onCreated,
}: CircleActivityComposerProps) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activityPublic, setActivityPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activityBoard =
    boards.find((board) => board.circleBoardKind === "ACTIVITY") ?? null;
  const targetBoardId =
    selectedBoard !== "all"
      ? selectedBoard
      : activityBoard?.boardId ?? boards[0]?.boardId ?? null;

  const appendImages = useCallback((incoming: File[]) => {
    const imageFiles = incoming.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      return;
    }

    setFiles((prev) => {
      const merged = [...prev, ...imageFiles].slice(0, 4);
      if (prev.length + imageFiles.length > 4) {
        setError("사진은 최대 4장까지 첨부할 수 있습니다.");
      }
      return merged;
    });
  }, []);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;
    setError("");
    appendImages(selected);
    event.target.value = "";
  };

  const handlePasteImages = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedFiles = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => !!file);

    if (pastedFiles.length === 0) return;

    event.preventDefault();
    setError("");
    appendImages(pastedFiles);
  };

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "40px";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [text]);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      navigate("/users/login");
      return;
    }
    if (!targetBoardId) {
      setError("작성 가능한 모임활동 게시판이 없습니다.");
      return;
    }

    const trimmed = text.trim();
    if (!trimmed && files.length === 0) {
      setError("내용 또는 사진을 추가해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const metadata = await requestUploadUrl({
          domain: "post",
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
        });
        await uploadByContract(metadata, file);
        uploadedUrls.push(metadata.fileUrl);
      }

      const title = buildActivityTitle(trimmed);
      const content = buildActivityHtml(trimmed, uploadedUrls);
      await circleBoardApi.createPost(circleId, targetBoardId, {
        title,
        content,
        activityPublic,
      });

      setText("");
      setFiles([]);
      setPreviewUrls([]);
      setActivityPublic(true);
      onCreated();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={composerCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <UserAvatar
          name={user?.nickname ?? "나"}
          size={40}
          className="reply-avatar"
          ariaHidden
          initialMode="nickname"
        />

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="reply-panel-textarea-shell"
            style={{ borderBottom: "none", minHeight: 40 }}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={handlePasteImages}
              placeholder="모임 활동을 공유해보세요..."
              rows={1}
              className="reply-panel-textarea"
              style={{
                minHeight: 40,
                height: 40,
                fontSize: 16,
                padding: "8px 0",
                overflowY: "auto",
                resize: "none",
              }}
            />
          </div>
        </div>
      </div>

      {previewUrls.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              previewUrls.length === 1
                ? "minmax(0, 1fr)"
                : previewUrls.length === 2
                  ? "repeat(2, minmax(0, 1fr))"
                  : "repeat(2, minmax(0, 1fr))",
            gap: 8,
            marginTop: 6,
          }}
        >
          {previewUrls.map((url, idx) => (
            <div key={`${url}-${idx}`} style={{ position: "relative" }}>
              <img
                src={url}
                alt={`preview-${idx}`}
                style={{
                  width: "100%",
                  height: previewUrls.length === 1 ? 260 : 170,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f3f4f6",
                }}
              />
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, fileIdx) => fileIdx !== idx))}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 22,
                  height: 22,
                  border: "none",
                  borderRadius: "50%",
                  backgroundColor: "rgba(17,24,39,0.78)",
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="사진 제거"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: 10,
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setActivityPublic((prev) => !prev)}
            aria-pressed={activityPublic}
            style={{
              position: "relative",
              width: 40,
              height: 22,
              border: "none",
              borderRadius: 999,
              backgroundColor: activityPublic ? "#5F8F7B" : "#cbd5e1",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: activityPublic ? 20 : 2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                transition: "left 0.15s ease",
              }}
            />
          </button>
          <span style={{ fontSize: 11, color: activityPublic ? "#166534" : "#64748b", fontWeight: 700 }}>
            {activityPublic ? "공개" : "비공개"}
          </span>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #d1d5db",
              borderRadius: 9999,
              width: 34,
              height: 34,
              cursor: "pointer",
              color: "#374151",
            }}
            aria-label="사진 첨부"
            title="사진 첨부"
          >
            <ImageIcon size={16} />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleSelectFiles}
              style={{ display: "none" }}
            />
          </label>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            style={{
              marginLeft: "auto",
              border: "none",
              borderRadius: 999,
              backgroundColor: "#5F8F7B",
              color: "#fff",
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "게시 중..." : "게시"}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "#dc2626" }}>
          {error}
        </p>
      )}
    </section>
  );
}

const composerCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  backgroundColor: "#fff",
  padding: 12,
  marginBottom: 14,
  position: "sticky",
  top: 72,
  zIndex: 30,
};

function buildActivityTitle(text: string) {
  if (!text) return "모임활동";
  const firstLine = text.split("\n").find((line) => line.trim().length > 0) ?? "";
  const normalized = firstLine.trim();
  if (normalized.length < 2) return "모임활동";
  return normalized.slice(0, 80);
}

function buildActivityHtml(text: string, imageUrls: string[]) {
  const safeText = escapeHtml(text).replace(/\n/g, "<br/>");
  const textHtml = safeText ? `<p>${safeText}</p>` : "";
  const imageHtml = imageUrls
    .map(
      (url) =>
        `<p><img src="${url}" alt="activity-image" style="max-width:100%;height:auto;border-radius:8px;" /></p>`,
    )
    .join("");
  return `${textHtml}${imageHtml}`.trim();
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
