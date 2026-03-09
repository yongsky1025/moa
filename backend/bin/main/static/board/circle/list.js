// /static/board/circle/list.js
// Circle board list page behavior (boards + posts + edit mode).

// Bootstraps the page.
document.addEventListener("DOMContentLoaded", () => {
  setSelectedBoardName("전체 게시글");
  initBoardEditControls();
  renderBoardList().catch(console.error);
  renderList().catch(console.error);
});

let isBoardEditMode = false;
let editingBoardId = null;
const pendingEdits = new Map();
const pendingDeletes = new Set();
const pendingAdds = [];
let boardNameById = new Map();

// Normalize path for parsing.
function normalizePath(pathname) {
  // trailing slash 제거 (/notice/ -> /notice)
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

// Wire edit-mode controls (완료/되돌리기/추가).
function initBoardEditControls() {
  const toggleBtn = document.getElementById("toggleBoardEditBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", async () => {
      if (isBoardEditMode) {
        const applied = await applyPendingChanges();
        if (!applied) return;
      }

      isBoardEditMode = !isBoardEditMode;
      if (!isBoardEditMode) {
        clearPendingChanges();
      }
      updateBoardEditModeUI();
      renderBoardList().catch(console.error);
    });
  }

  const revertBtn = document.getElementById("revertBoardEditBtn");
  if (revertBtn) {
    revertBtn.addEventListener("click", () => {
      if (!isBoardEditMode) return;
      clearPendingChanges();
      renderBoardList().catch(console.error);
    });
  }

  const addBtn = document.getElementById("boardAddBtn");
  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      const segments = normalizePath(window.location.pathname).split("/").filter(Boolean);
      if (segments[0] !== "circle") return;

      const input = document.getElementById("boardNameInput");
      const name = (input?.value ?? "").trim();
      if (!name) return;

      if (isBoardEditMode) {
        pendingAdds.push({ id: `new:${Date.now()}:${pendingAdds.length}`, name });
        if (input) input.value = "";
        await renderBoardList();
        return;
      }

      const circleId = segments[1];
      if (!circleId) return;

      try {
        await fetchJson(`/api/circle/${circleId}/boards`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ name }),
        });

        if (input) input.value = "";
        await renderBoardList();
      } catch (e) {
        console.error(e);
        alert("보드 추가에 실패했습니다.");
      }
    });
  }

  updateBoardEditModeUI();
}

// Reset staged changes in edit mode.
function clearPendingChanges() {
  editingBoardId = null;
  pendingEdits.clear();
  pendingDeletes.clear();
  pendingAdds.length = 0;
}

// Apply staged edits/deletes/adds when 완료 is clicked.
async function applyPendingChanges() {
  if (pendingEdits.size === 0 && pendingDeletes.size === 0 && pendingAdds.length === 0) return true;

  if (!confirm("변경사항을 적용하시겠습니까?")) {
    return false;
  }

  const segments = normalizePath(window.location.pathname).split("/").filter(Boolean);
  if (segments[0] !== "circle") return false;
  const circleId = segments[1];
  if (!circleId) return false;

  try {
    for (const boardId of pendingDeletes) {
      await fetchJson(`/api/circle/${circleId}/boards/${boardId}`, { method: "DELETE" });
    }

    for (const [boardId, name] of pendingEdits.entries()) {
      await fetchJson(`/api/circle/${circleId}/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name }),
      });
    }

    for (const add of pendingAdds) {
      await fetchJson(`/api/circle/${circleId}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: add.name }),
      });
    }

    return true;
  } catch (e) {
    console.error(e);
    alert("변경 적용에 실패했습니다.");
    return false;
  }
}

// Toggle edit-mode UI classes and labels.
function updateBoardEditModeUI() {
  const panel = document.getElementById("boardPanel");
  if (panel) {
    panel.classList.toggle("is-editing", isBoardEditMode);
  }

  const toggleBtn = document.getElementById("toggleBoardEditBtn");
  if (toggleBtn) {
    toggleBtn.textContent = isBoardEditMode ? "완료" : "수정";
  }
}

// 보드 리스트 출력
// Render board list (normal + edit modes).
async function renderBoardList() {
  const el = document.getElementById("boardList");
  if (!el) return;

  const segments = normalizePath(window.location.pathname).split("/").filter(Boolean);
  if (segments[0] !== "circle") return;

  const circleId = segments[1];
  if (!circleId) return;

  const boards = await fetchJson(`/api/circle/${circleId}/boards`);
  if (!Array.isArray(boards)) return;
  boardNameById = new Map(boards.map((b) => [String(b.boardId ?? ""), b.name ?? ""]));

  const allItem = `
  <li class="board-item" data-board-id="">
    ${isBoardEditMode ? '<span class="board-name-text">전체 게시글</span>' : '<a href="#" class="board-link">전체 게시글</a>'}
  </li>
`;

  const pendingAddItems = pendingAdds
    .map((add) => {
      const nameField = `<span class="board-name-text pending-add">${escapeHtml(add.name)}<span class="edited-badge">(추가)</span></span>`;
      const actions = `
        <div class="board-actions" aria-hidden="false">
          <button class="icon-btn" type="button" data-action="delete-pending" data-temp-id="${add.id}" aria-label="삭제">
            ${getDeleteIcon()}
          </button>
        </div>
      `;

      return `
        <li class="board-item" data-board-id="${add.id}" data-temp="true">
          ${nameField}
          ${actions}
        </li>
      `;
    })
    .join("");

  el.innerHTML =
    `<ul class="board-list">` +
    allItem +
    boards
      .map((b) => {
        const boardId = b.boardId ?? "";
        const name = escapeHtml(b.name ?? "이름없음");
        const isEditing = isBoardEditMode && editingBoardId === String(boardId);
        const isPendingDelete = pendingDeletes.has(String(boardId));

        const pendingName = pendingEdits.get(String(boardId));
        const currentName = pendingName ?? name;
        const editedBadge = pendingName ? `<span class="edited-badge">(수정)</span>` : "";

        const nameField = isBoardEditMode
          ? isEditing
            ? `<input class="board-name-input" type="text" value="${currentName}" />`
            : `<span class="board-name-text ${isPendingDelete ? "pending-delete" : ""}">${currentName}${editedBadge}</span>`
          : `<a href="#" class="board-link">${currentName}</a>`;

        const actions = isBoardEditMode
          ? `
            <div class="board-actions" aria-hidden="false">
              <button class="icon-btn" type="button" data-action="edit" aria-label="수정">
                ${isEditing ? getCheckIcon() : getEditIcon()}
              </button>
              <button class="icon-btn" type="button" data-action="delete" aria-label="삭제">
                ${getDeleteIcon()}
              </button>
            </div>
          `
          : ``;

        return `
        <li class="board-item" data-board-id="${boardId}">
          ${nameField}
          ${actions}
        </li>
      `;
      })
      .join("") +
    pendingAddItems +
    `</ul>`;

  el.querySelectorAll(".board-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      if (isBoardEditMode) return;
      if (e.target.closest("[data-action]")) return;
      e.preventDefault();

      const boardId = item.getAttribute("data-board-id");

      if (!boardId) {
        history.pushState(null, "", `/circle/${circleId}`);
        setSelectedBoardName("전체 게시글");
        renderList().catch(console.error);
        return;
      }

      const labelEl = item.querySelector(".board-link, .board-name-text");
      const boardName = labelEl?.textContent?.trim() || "";
      setSelectedBoardName(boardName || "(보드 선택)");

      history.pushState(null, "", `/circle/${circleId}/board/${boardId}`);
      renderList().catch(console.error);
    });
  });

  el.querySelectorAll(".icon-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const action = btn.getAttribute("data-action");
      const item = btn.closest(".board-item");
      const boardId = item?.getAttribute("data-board-id");
      if (!boardId) return;

      if (action === "delete-pending") {
        const tempId = btn.getAttribute("data-temp-id");
        const idx = pendingAdds.findIndex((a) => a.id === tempId);
        if (idx >= 0) pendingAdds.splice(idx, 1);
        await renderBoardList();
        return;
      }

      if (action === "edit") {
        if (editingBoardId !== String(boardId)) {
          editingBoardId = String(boardId);
          await renderBoardList();
          return;
        }

        const input = item?.querySelector(".board-name-input");
        const nextName = (input?.value ?? "").trim();
        if (!nextName) return;

        pendingEdits.set(String(boardId), nextName);
        editingBoardId = null;
        await renderBoardList();
      }

      if (action === "delete") {
        if (pendingDeletes.has(String(boardId))) {
          pendingDeletes.delete(String(boardId));
        } else {
          pendingDeletes.add(String(boardId));
        }

        if (editingBoardId === String(boardId)) {
          editingBoardId = null;
        }

        await renderBoardList();
      }
    });
  });
}

// Icon: edit (pencil).
function getEditIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 16.5V20h3.5L19 8.5l-3.5-3.5L4 16.5zm15.7-9.2c.4-.4.4-1 0-1.4l-1.6-1.6c-.4-.4-1-.4-1.4 0l-1.2 1.2 3.5 3.5 1.2-1.2z" />
    </svg>
  `;
}

// Icon: delete (trash).
function getDeleteIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2zm1 6v8m4-8v8" />
    </svg>
  `;
}

// Icon: confirm (check).
function getCheckIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.4-1.4z" />
    </svg>
  `;
}

// Render post list for the selected board.
async function renderList() {
  const tbody = document.getElementById("postTableBody");
  if (!tbody) return;

  const apiUrl = resolveListApiUrl();
  if (!apiUrl) {
    renderErrorRow("잘못된 접근입니다.");
    return;
  }

  tbody.innerHTML = `
    <tr>
      <td colspan="7" class="empty">불러오는 중...</td>
    </tr>
  `;

  const posts = await fetchJson(apiUrl);

  if (!Array.isArray(posts) || posts.length === 0) {
    renderErrorRow("게시글이 없습니다.");
    return;
  }

  tbody.innerHTML = posts
    .map((p, idx) => {
      const no = posts.length - idx;
      const postId = p.postId ?? "";
      const boardLabel = getBoardLabel(p);
      const title = escapeHtml(p.title ?? "(제목 없음)");
      const author = escapeHtml(String(p.authorName ?? "-"));
      const date = formatDate(p.createDate);
      const views = Number.isFinite(p.viewCount) ? p.viewCount : (p.viewCount ?? 0);
      const replies = Number.isFinite(p.replyCount) ? p.replyCount : (p.replyCount ?? 0);

      return `
        <tr>
          <td class="col-no">${no}</td>
          <td class="col-board">${boardLabel}</td>
          <td class="col-title">
            <a href="${buildPostLink(postId, p)}">${title}</a>
          </td>
          <td class="col-author">${author}</td>
          <td class="col-date">${date}</td>
          <td class="col-views">${views}</td>
          <td class="col-views">${replies}</td>
        </tr>
      `;
    })
    .join("");
}

// Resolve posts API based on current URL.
function resolveListApiUrl() {
  const segments = normalizePath(window.location.pathname).split("/").filter(Boolean);
  if (segments.length === 0) return null;

  if (segments[0] !== "circle") return null;

  const circleId = segments[1];
  const boardId = segments[3]; // /circle/{circleId}/board/{boardId}
  if (!circleId) return null;

  if (boardId) {
    return `/api/circle/${circleId}/boards/${boardId}/posts`;
  }

  return `/api/circle/${circleId}/posts`;
}

// Build post detail link for circle board.
function buildPostLink(postId, post) {
  if (!postId) return "#";

  const segments = window.location.pathname.split("/").filter(Boolean);
  const circleId = segments[1];
  const boardId = segments[3] ?? post.boardId;
  if (!circleId || !boardId) return "#";

  return `/circle/${circleId}/board/${boardId}/posts/${postId}`;
}

// Fetch helper.
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
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

// Render empty/error row for post table.
function renderErrorRow(message) {
  const tbody = document.getElementById("postTableBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" class="empty">${escapeHtml(message)}</td>
    </tr>
  `;
}

// Update selected board name label.
function setSelectedBoardName(name) {
  const el = document.getElementById("selectedBoardName");
  if (!el) return;
  el.textContent = name;
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

// Escape HTML for safe text rendering.
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getBoardLabel(post) {
  const segments = normalizePath(window.location.pathname).split("/").filter(Boolean);
  const boardId = post?.boardId ?? segments[3];
  if (!boardId) return "전체";
  const name = boardNameById.get(String(boardId));
  return escapeHtml(name || "-");
}
