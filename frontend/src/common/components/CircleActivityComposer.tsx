import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Image as ImageIcon, Lock } from "lucide-react";
import type { CircleBoardResponse } from "../../api/circleBoardApi";
import { circleBoardApi } from "../../api/circleBoardApi";
import UserAvatar from "../../common/components/UserAvatar";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../utils/errorMessage";
import { requestUploadUrl, uploadByContract } from "../../api/uploadUrlApi";
import "../../reply/styles/replySection.css";
import "../../board/pages/boardCommunity.css";

interface CircleActivityComposerProps {
  circleId: number;
  circleName?: string;
  boards: CircleBoardResponse[];
  selectedBoard: "all" | number;
  onCreated: () => void;
  mode?: "create" | "edit";
  editConfig?: {
    boardId: number;
    postId: number;
    title: string;
    content: string;
    activityPublic?: boolean;
  };
}

export default function CircleActivityComposer({
  circleId,
  circleName,
  boards,
  selectedBoard,
  onCreated,
  mode = "create",
  editConfig,
}: CircleActivityComposerProps) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activityPublic, setActivityPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const combinedImageUrls = [...existingImageUrls, ...previewUrls];

  const activityBoard =
    boards.find((board) => board.circleBoardKind === "ACTIVITY") ?? null;
  const targetBoardId = mode === "edit"
    ? (editConfig?.boardId ?? null)
    : selectedBoard !== "all"
      ? selectedBoard
      : activityBoard?.boardId ?? boards[0]?.boardId ?? null;

  useEffect(() => {
    if (mode !== "edit" || !editConfig) {
      return;
    }
    setText(extractActivityText(editConfig.content));
    setExistingImageUrls(extractActivityImageUrls(editConfig.content));
    setActivityPublic(editConfig.activityPublic ?? true);
    setFiles([]);
    setError("");
  }, [editConfig, mode]);

  const appendImages = useCallback((incoming: File[]) => {
    const imageFiles = incoming.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      return;
    }

    setFiles((prev) => {
      const maxCount = 4 - existingImageUrls.length;
      const merged = [...prev, ...imageFiles].slice(0, Math.max(maxCount, 0));
      if (prev.length + imageFiles.length > maxCount) {
        setError("사진은 최대 4장까지 첨부할 수 있습니다.");
      }
      return merged;
    });
  }, [existingImageUrls.length]);

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
      setError("작성 가능한 모임 활동 게시판이 없습니다.");
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
          domain: "POST",
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
        });
        await uploadByContract(metadata, file);
        uploadedUrls.push(metadata.fileUrl);
      }

      if (mode === "edit" && editConfig) {
        const content = buildActivityHtml(trimmed, [...existingImageUrls, ...uploadedUrls]);
        await circleBoardApi.updatePost(circleId, editConfig.boardId, editConfig.postId, {
          title: editConfig.title,
          content,
          activityPublic,
        });
      } else {
        const title = buildActivityTitle(circleName);
        const content = buildActivityHtml(trimmed, uploadedUrls);
        await circleBoardApi.createPost(circleId, targetBoardId, {
          title,
          content,
          activityPublic,
        });
      }

      setText("");
      setFiles([]);
      setPreviewUrls([]);
      setExistingImageUrls([]);
      setActivityPublic(mode === "edit" ? (editConfig?.activityPublic ?? true) : true);
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

      {combinedImageUrls.length > 0 && (
        <div style={{ marginTop: 8, borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>
          <div className="community-twitter-content-split has-image">
            {combinedImageUrls.length === 1 && (
              <div className="community-twitter-media">
                <img src={combinedImageUrls[0]} alt="본문 미리보기 이미지 1" loading="lazy" />
              </div>
            )}
            {combinedImageUrls.length === 2 && (
              <div className="community-twitter-album community-twitter-album-2">
                {combinedImageUrls.slice(0, 2).map((url, idx) => (
                  <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                    <img src={url} alt={`본문 미리보기 이미지 ${idx + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            )}
            {combinedImageUrls.length === 3 && (
              <div className="community-twitter-album community-twitter-album-side">
                <div className="community-twitter-album-main">
                  <img src={combinedImageUrls[0]} alt="본문 미리보기 이미지 1" loading="lazy" />
                </div>
                <div className="community-twitter-album-stack">
                  {combinedImageUrls.slice(1, 3).map((url, idx) => (
                    <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                      <img src={url} alt={`본문 미리보기 이미지 ${idx + 2}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {combinedImageUrls.length >= 4 && (
              <div className="community-twitter-album community-twitter-album-side">
                <div className="community-twitter-album-main">
                  <img src={combinedImageUrls[0]} alt="본문 미리보기 이미지 1" loading="lazy" />
                </div>
                <div className="community-twitter-album-stack three">
                  {combinedImageUrls.slice(1, 4).map((url, idx) => (
                    <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                      <img src={url} alt={`본문 미리보기 이미지 ${idx + 2}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {combinedImageUrls.length > 0 && (
        <div
          style={{
            marginTop: 10,
            display: "grid",
            gap: 6,
            paddingTop: 10,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {combinedImageUrls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                style={{ position: "relative", width: 72, height: 72, flex: "0 0 auto" }}
              >
                <img
                  src={url}
                  alt={`첨부 썸네일 ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    display: "block",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (idx < existingImageUrls.length) {
                      setExistingImageUrls((prev) => prev.filter((_, i) => i !== idx));
                      return;
                    }
                    const newIdx = idx - existingImageUrls.length;
                    setFiles((prev) => prev.filter((_, i) => i !== newIdx));
                  }}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    border: "none",
                    borderRadius: "50%",
                    backgroundColor: "rgba(17,24,39,0.82)",
                    color: "#fff",
                    fontSize: 11,
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
          <span
            style={{
              fontSize: 13,
              color: activityPublic ? "#166534" : "#64748b",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {activityPublic ? "전체" : "모임"}
            {activityPublic ? <Globe size={12} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
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
            {submitting ? (mode === "edit" ? "수정 중..." : "게시 중...") : (mode === "edit" ? "수정" : "게시")}
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

function buildActivityTitle(circleName?: string) {
  const normalizedCircleName = (circleName ?? "모임")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}_-]/gu, "")
    .slice(0, 30);

  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const suffix = createShortId();
  return `${normalizedCircleName || "모임"}-${yy}${mm}${dd}-${suffix}`;
}

function createShortId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 4).toLowerCase();
  }
  return Math.random().toString(36).slice(2, 6).padEnd(4, "0");
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

function extractActivityImageUrls(html: string | undefined): string[] {
  if (!html) return [];
  const urls: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match = regex.exec(html);
  while (match) {
    urls.push(match[1]);
    match = regex.exec(html);
  }
  return Array.from(new Set(urls.filter(Boolean)));
}

function extractActivityText(html: string | undefined): string {
  return (html ?? "")
    .replace(
      /<figure\b[^>]*>\s*(?:<img\b[^>]*>\s*)+(<figcaption\b[^>]*>[\s\S]*?<\/figcaption>)?\s*<\/figure>/gi,
      "$1",
    )
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
