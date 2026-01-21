const pathParts = window.location.pathname.split("/").filter(Boolean);
const bno = pathParts[pathParts.length - 1]; // "23"

const titleInput = document.getElementById("title");
const contextarea = document.getElementById("context");

fetch(`/api/board/read/${bno}`)
  .then((res) => {
    if (!res.ok) throw new Error("API 요청 실패: " + res.status);
    return res.json();
  })
  .then((data) => {
    titleInput.value = data.title;
    contextarea.value = data.content;
    const date = new Date(data.createDate);
    document.getElementById("createDate").innerText = date.toLocaleString(); // 2026. 1. 19. 오후 8:50:57
    document.getElementById("writer").innerText = data.writer ?? "";
    document.getElementById("viewCount").innerText = data.viewCount ?? 0;
  })
  .catch((err) => {
    console.error(err);
  });

document.getElementById("btnSave").addEventListener("click", () => {
  const payload = {
    title: titleInput.value,
    content: contextarea.value,
  };

  fetch(`/api/board/modify/${bno}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("수정 실패");
      // 수정 성공 → 다시 read 페이지로
      location.href = `/board/read/${bno}`;
    })
    .catch((err) => {
      console.error(err);
    });
});

document.getElementById("btnDelete").addEventListener("click", () => {
  fetch(`/api/board/delete/${bno}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("삭제 실패");
      location.href = `/board/list`;
    })
    .catch((err) => {
      console.error(err);
    });
});
