// /static/board/circle/read.js

// Bootstraps the circle read page.
document.addEventListener("DOMContentLoaded", () => {
  initReadPage().catch((e) => {
    console.error(e);
    setText("postTitle", "Failed to load");
    setText("postContent", "Please try again.");
  });
});

// Load post data + wire up actions on the page.
async function initReadPage() {
  // Parse URL (/circle/{circleId}/board/{boardId}/posts/{postId}).
  const ctx = getCircleReadContext();
  if (!ctx) throw new Error("invalid path");

  const { circleId, boardId, postId } = ctx;

  // Fetch post detail.
  const post = await fetchJson(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`);
  // Increment view count (server-side).
  await fetch(`/api/posts/${postId}/view`, { method: "POST", credentials: "same-origin" });

  // Render post fields.
  setText("postTitle", post.title ?? "");
  setText("postContent", post.content ?? "");
  setText("postAuthor", post.authorName ?? "-");
  setText("postCreateDate", formatDate(post.createDate));
  setText("postViewCount", post.viewCount ?? 0);

  // Back to list.
  const listBtn = document.getElementById("listBtn");
  if (listBtn)
    listBtn.addEventListener("click", () => {
      location.href = `/circle/${circleId}`;
    });

  // Go to edit page.
  const editBtn = document.getElementById("editBtn");
  if (editBtn)
    editBtn.addEventListener("click", () => {
      location.href = `/circle/${circleId}/board/${boardId}/posts/${postId}/edit`;
    });

  // Delete post.
  const deleteBtn = document.getElementById("deleteBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;

      try {
        await fetchJson(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`, { method: "DELETE" });
        window.location.assign(`/circle/${circleId}`);
      } catch (e) {
        console.error(e);
        alert("Delete failed.");
      }
    });
  }
}

// Extract circle/board/post IDs from the URL.
function getCircleReadContext() {
  const parts = normalizePath(location.pathname).split("/").filter(Boolean);
  if (parts.length !== 6) return null;
  if (parts[0] !== "circle" || parts[2] !== "board" || parts[4] !== "posts") return null;

  const circleId = parts[1];
  const boardId = parts[3];
  const postId = parts[5];
  if (!circleId || !boardId || !postId) return null;

  return { circleId, boardId, postId };
}

// Remove trailing slash for consistent parsing.
function normalizePath(p) {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

// Fetch helper with JSON/text handling.
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    credentials: "same-origin",
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text}`);
  }
  if (res.status === 204) return null;

  const text = await res.text().catch(() => "");
  if (!text) return null;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

// Set text content by element id.
function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value ?? "";
}

// Format date to YYYY-MM-DD.
function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return String(isoString).slice(0, 10);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
