// /static/board/edit.js
document.addEventListener("DOMContentLoaded", () => {
  initEditPage().catch((e) => {
    console.error(e);
    setMessage("불러오지 못했습니다.");
  });
});

async function initEditPage() {
  const board = getBoardKey();
  const postId = getPostIdFromEditUrl(); // /{board}/{postId}/edit
  if (!board || !postId) throw new Error("invalid path");

  // 1) 기존 데이터 로드
  const post = await fetchJson(`/api/${board}/posts/${postId}`);
  const titleEl = document.getElementById("titleInput");
  const contentEl = document.getElementById("contentInput");
  if (titleEl) titleEl.value = post.title ?? "";
  if (contentEl) contentEl.value = post.content ?? "";

  // 2) 취소
  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn)
    cancelBtn.addEventListener("click", () => {
      location.href = `/${board}/${postId}`;
    });

  // 3) 저장
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

      setMessage("저장 중...");

      try {
        await fetchJson(`/api/${board}/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ title, content }),
        });

        location.href = `/${board}/${postId}`;
      } catch (e) {
        console.error(e);
        setMessage("저장 실패. 권한/로그인을 확인하세요.");
      }
    });
}

/* ===== helpers ===== */

function getBoardKey() {
  const parts = normalizePath(location.pathname).split("/");
  const board = parts[1];
  return board === "notice" || board === "free" || board === "support" ? board : null;
}

function getPostIdFromEditUrl() {
  const parts = normalizePath(location.pathname).split("/");
  // ["", board, postId, "edit"]
  if (parts.length !== 4 || parts[3] !== "edit") return null;
  const id = parts[2];
  return /^\d+$/.test(id) ? id : null;
}

function normalizePath(p) {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

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

function showError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "block";
}

function clearErrors() {
  ["titleError", "contentError"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  setMessage("");
}

function setMessage(msg) {
  const el = document.getElementById("formMessage");
  if (el) el.textContent = msg ?? "";
}
