// /static/board/list.js

document.addEventListener("DOMContentLoaded", () => {
  renderList().catch(console.error);
});

function normalizePath(pathname) {
  // trailing slash 제거 (/notice/ -> /notice)
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

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
      <td colspan="6" class="empty">불러오는 중...</td>
    </tr>
  `;

  const posts = await fetchJson(apiUrl);

  if (!Array.isArray(posts) || posts.length === 0) {
    renderErrorRow("게시글이 없습니다.");
    return;
  }

  const boardType = normalizePath(window.location.pathname).replace("/", "");
  tbody.innerHTML = posts
    .map((p, idx) => {
      const no = posts.length - idx;
      const postId = p.postId ?? "";
      const title = escapeHtml(p.title ?? "(제목 없음)");
      const author = escapeHtml(String(p.authorName ?? "-"));
      const date = formatDate(p.createDate);
      const views = Number.isFinite(p.viewCount) ? p.viewCount : (p.viewCount ?? 0);
      const replies = Number.isFinite(p.replyCount) ? p.replyCount : (p.replyCount ?? 0);

      return `
        <tr>
          <td class="col-no">${no}</td>
          <td class="col-title">
            <a href="/${boardType}/${postId}">${title}</a>
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

function resolveListApiUrl() {
  const segments = normalizePath(window.location.pathname).split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const boardType = segments[0];
  return `/api/${boardType}`;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text}`);
  }

  return res.json();
}

function renderErrorRow(message) {
  const tbody = document.getElementById("postTableBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="empty">${escapeHtml(message)}</td>
    </tr>
  `;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
