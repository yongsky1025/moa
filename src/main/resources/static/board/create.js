const titleInput = document.getElementById("title");
const contextarea = document.getElementById("context");
document.getElementById("btnSave").addEventListener("click", (e) => {
  e.preventDefault();
  const payload = {
    title: titleInput.value,
    content: contextarea.value,
  };

  fetch(`/api/board/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("작성 실패");
      // 작성 성공 → 다시 list 페이지로
      location.href = `/board/list`;
    })
    .catch((err) => {
      console.error(err);
    });
});
