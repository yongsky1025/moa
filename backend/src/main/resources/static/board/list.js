// /static/board/list.js
document.addEventListener("DOMContentLoaded", () => {
  renderNoticeList().catch((e) => {
    console.error(e);
    renderErrorRow("데이터를 불러오지 못했습니다.");
  });
});

async function renderNoticeList() {
  const tbody = document.getElementById("postTableBody");
  if (!tbody) return;

  const apiUrl = resolveListApiUrl();
  if (!apiUrl) {
    renderRowMessage("잘못된 접근입니다.");
    return;
  }

  // 로딩 표시
  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="empty">불러오는 중...</td>
    </tr>
  `;

  // 공지사항 목록 호출

  const posts = await fetchJson(apiUrl);

  // 빈 목록 처리
  if (!Array.isArray(posts) || posts.length === 0) {
    renderRowMessage("게시글이 없습니다.");
    return;
  }

  /**
   * 현재 페이지 경로를 보고 어떤 게시판인지 판단해서
   * 호출할 REST endpoint를 반환한다.
   *
   * - /notice  -> /api/notice/posts
   * - /free    -> /api/free/posts
   * - /support -> /api/support/posts
   */
  function resolveListApiUrl() {
    const path = normalizePath(window.location.pathname);

    // 리스트 페이지 전용: /notice, /free, /support
    const map = {
      "/notice": "/api/notice/posts",
      "/free": "/api/free/posts",
      "/support": "/api/support/posts",
    };

    return map[path] ?? null;
  }

  function normalizePath(pathname) {
    // trailing slash 제거 (/notice/ -> /notice)
    return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  }
  // 게시판 타입 구분 전용 : (/notice -> "notice")
  const boardType = normalizePath(window.location.pathname).replace("/", "");
  // 최신글이 앞에 온다고 가정 (서비스에서 desc 정렬)
  tbody.innerHTML = posts
    .map((p, idx) => {
      const no = posts.length - idx; // 화면 표시용 번호
      const postId = p.postId ?? "";
      const title = escapeHtml(p.title ?? "(제목 없음)");
      const author = escapeHtml(String(p.authorName ?? "-")); // 닉네임 내려주면 바꾸기
      const date = formatDate(p.createDate);
      const views = Number.isFinite(p.viewCount) ? p.viewCount : (p.viewCount ?? 0);

      return `
        <tr>
          <td class="col-no">${no}</td>
          <td class="col-title">
            <a href="/${boardType}/${postId}">${title}</a>
          </td>
          <td class="col-author">${author}</td>
          <td class="col-date">${date}</td>
          <td class="col-views">${views}</td>
          <td class="col-views"></td>
        </tr>
      `;
    })
    .join("");
}

async function fetchJson(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "same-origin", // 세션/쿠키 인증 쓰면 필요
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text}`);
  }

  return res.json();
}

// 에러문구 출력
function renderErrorRow(message) {
  const tbody = document.getElementById("postTableBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="empty">${escapeHtml(message)}</td>
    </tr>
  `;
}

// 날짜 포멧
function formatDate(isoString) {
  if (!isoString) return "";

  // ISO 문자열(예: 2026-01-26T12:34:56) 대응
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return String(isoString).slice(0, 10);

  // YYYY-MM-DD
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 출력시 태그로 해석되지 않도록 변환
// XSS 같은 보안 문제를 막는 용도
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
