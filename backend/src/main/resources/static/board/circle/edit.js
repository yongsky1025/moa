// /static/board/circle/edit.js
// Circle post edit page behavior (load, validate, update).

// Bootstraps the page.
document.addEventListener("DOMContentLoaded", () => {
  initEditPage().catch((e) => {
    console.error(e);
    setMessage("Failed to load");
  });
});

// Initialize page with post data and handlers.
async function initEditPage() {
  const ctx = getCircleEditContext();
  if (!ctx) throw new Error("invalid path");

  const { circleId, boardId, postId } = ctx;

  const post = await fetchJson(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`);
  const titleEl = document.getElementById("titleInput");
  const contentEl = document.getElementById("contentInput");
  if (titleEl) titleEl.value = post.title ?? "";
  if (contentEl) contentEl.value = post.content ?? "";

  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn)
    cancelBtn.addEventListener("click", () => {
      location.href = `/circle/${circleId}/board/${boardId}/posts/${postId}`;
    });

  const updateBtn = document.getElementById("updateBtn");
  if (updateBtn)
    updateBtn.addEventListener("click", async () => {
      clearErrors();

      const title = (document.getElementById("titleInput")?.value ?? "").trim();
      const content = (document.getElementById("contentInput")?.value ?? "").trim();

      let ok = true;
      if (!title) {
        showError("titleError");
        ok = false;
      }
      if (!content) {
        showError("contentError");
        ok = false;
      }
      if (!ok) return;

      setMessage("Saving...");

      try {
        await fetchJson(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ title, content }),
        });

        location.href = `/circle/${circleId}/board/${boardId}/posts/${postId}`;
      } catch (e) {
        console.error(e);
        setMessage("Save failed.");
      }
    });
}

// Extract circle/board/post IDs from URL.
function getCircleEditContext() {
  const parts = normalizePath(location.pathname).split("/").filter(Boolean);
  // /circle/{circleId}/board/{boardId}/posts/{postId}/edit
  if (parts.length !== 7) return null;
  if (parts[0] !== "circle" || parts[2] !== "board" || parts[4] !== "posts" || parts[6] !== "edit") return null;

  const circleId = parts[1];
  const boardId = parts[3];
  const postId = parts[5];
  if (!circleId || !boardId || !postId) return null;

  return { circleId, boardId, postId };
}

// Normalize path for parsing.
function normalizePath(p) {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

// Fetch helper.
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    credentials: "same-origin",
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text}`);
  }
  if (res.status === 204) return null;

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// Show a field error.
function showError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "block";
}

// Clear field errors and status.
function clearErrors() {
  ["titleError", "contentError"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  setMessage("");
}

// Set inline status message.
function setMessage(msg) {
  const el = document.getElementById("formMessage");
  if (el) el.textContent = msg ?? "";
}
