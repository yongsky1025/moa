// /static/board/read.js
document.addEventListener("DOMContentLoaded", () => {
  initReadPage().catch((e) => {
    console.error(e);
    setText("postTitle", "불러오지 못했습니다.");
    setText("postContent", "잠시 후 다시 시도해주세요.");
  });
});

async function initReadPage() {
  const board = getBoardKey(); // notice|free|support
  const postId = getPostIdFromReadUrl(); // /{board}/{postId}
  if (!board || !postId) throw new Error("invalid path");

  const post = await fetchJson(`/api/${board}/posts/${postId}`);
  // 호출 성공하면 view count 증가
  await fetch(`/api/posts/${postId}/view`, { method: "POST", credentials: "same-origin" });

  setText("postTitle", post.title ?? "");
  setText("postContent", post.content ?? "");

  // 서버 DTO에 authorName/nickname 내려주면 여기서 사용
  setText("postAuthor", post.authorName ?? "작성자 - ");
  setText("postCreateDate", formatDate(post.createDate));
  setText("postViewCount", post.viewCount ?? 0);

  const editBtn = document.getElementById("editBtn");
  if (editBtn)
    editBtn.addEventListener("click", () => {
      location.href = `/${board}/${postId}/edit`;
    });

  const deleteBtn = document.getElementById("deleteBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("삭제할까요?")) return;

      try {
        await fetchJson(`/api/${board}/posts/${postId}`, { method: "DELETE" });

        // ✅ 삭제 성공 → 목록으로
        window.location.assign(`/${board}`);
      } catch (e) {
        console.error(e);
        alert("삭제 실패. 권한/로그인을 확인하세요.");
      }
    });
  }
}
/* ===== helpers ===== */

function getBoardKey() {
  const first = normalizePath(location.pathname).split("/")[1];
  return first === "notice" || first === "free" || first === "support" ? first : null;
}

function getPostIdFromReadUrl() {
  const parts = normalizePath(location.pathname).split("/");
  // ["", board, postId]
  if (parts.length !== 3) return null;
  const id = parts[2];
  return /^\d+$/.test(id) ? id : null;
}

function normalizePath(p) {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

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

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value ?? "";
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return String(isoString).slice(0, 10);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
