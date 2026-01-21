// 1. URL에서 bno 파라미터 추출
// pathname: /board/read/23
const pathParts = window.location.pathname.split("/").filter(Boolean);
const bno = pathParts[pathParts.length - 1]; // "23"

// 2. REST API 호출
fetch(`/api/board/read/${bno}`)
  .then((res) => {
    if (!res.ok) throw new Error("API 요청 실패: " + res.status);
    return res.json();
  })
  .then((data) => {
    // 3. JSON → 화면 바인딩
    document.getElementById("title").innerText = data.title ?? "";

    // 날짜 포맷 정리
    const date = new Date(data.createDate);
    document.getElementById("createDate").innerText = date.toLocaleString(); // 2026. 1. 19. 오후 8:50:57

    document.getElementById("writer").innerText = data.writer ?? "";
    document.getElementById("viewCount").innerText = data.viewCount ?? 0;
    document.getElementById("context").innerText = data.content ?? "";
  })
  .catch((err) => {
    console.error(err);
  });

const btnModify = document.getElementById("btnModify");
if (btnModify) {
  btnModify.href = `/board/modify/${bno}`;
}
