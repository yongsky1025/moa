// /static/board/circle/create.js
// Circle post create page behavior (load, validate, submit).

// Bootstraps the page.
document.addEventListener("DOMContentLoaded", () => {
  initCreatePage().catch(console.error);
});

// Initialize page state and events.
async function initCreatePage() {
  const ctx = getCircleCreateContext();
  if (!ctx) throw new Error("invalid path");

  const { circleId, boardId } = ctx;

  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn)
    cancelBtn.addEventListener("click", () => {
      location.href = `/circle/${circleId}/board/${boardId}`;
    });

  const saveBtn = document.getElementById("saveBtn");
  if (!saveBtn) return;

  saveBtn.addEventListener("click", async () => {
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
      const createdId = await fetchJson(`/api/circle/${circleId}/boards/${boardId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const postId = typeof createdId === "number" || typeof createdId === "string" ? createdId : null;
      location.href = postId
        ? `/circle/${circleId}/board/${boardId}/posts/${postId}`
        : `/circle/${circleId}/board/${boardId}`;
    } catch (e) {
      console.error(e);
      setMessage("Save failed.");
    }
  });
}

// Extract circle/board IDs from URL.
function getCircleCreateContext() {
  const parts = normalizePath(location.pathname).split("/").filter(Boolean);
  // /circle/{circleId}/board/{boardId}/posts/new
  if (parts.length !== 6) return null;
  if (parts[0] !== "circle" || parts[2] !== "board" || parts[4] !== "posts" || parts[5] !== "new") return null;

  const circleId = parts[1];
  const boardId = parts[3];
  if (!circleId || !boardId) return null;

  return { circleId, boardId };
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
