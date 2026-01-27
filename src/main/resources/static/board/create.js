// /static/board/create.js
document.addEventListener("DOMContentLoaded", () => {
  initCreatePage().catch(console.error);
});

async function initCreatePage() {
  const board = getBoardKey(); // notice|free|support
  if (!board) throw new Error("invalid path");

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

    setMessage("등록 중...");

    try {
      const createdId = await fetchJson(`/api/${board}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ title, content }),
      });

      // 서버가 Long(postId)을 반환한다고 가정
      const postId = typeof createdId === "number" || typeof createdId === "string" ? createdId : null;
      location.href = postId ? `/${board}/${postId}` : `/${board}`;
    } catch (e) {
      console.error(e);
      setMessage("등록 실패. 권한/로그인을 확인하세요.");
    }
  });
}

/* ===== helpers ===== */

function getBoardKey() {
  const parts = normalizePath(location.pathname).split("/");
  // /{board}/new
  const board = parts[1];
  return board === "notice" || board === "free" || board === "support" ? board : null;
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

  // createdId(Long)도 json으로 내려온다고 가정
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
