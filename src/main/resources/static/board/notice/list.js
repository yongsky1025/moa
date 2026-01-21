(function () {
  const tbody = document.getElementById("tbody");
  const btnNew = document.getElementById("btnNew");
  if (!tbody) return;

  function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  }

  function renderRow(item, index, total) {
    const tr = document.createElement("tr");
    const tdNo = document.createElement("td");
    const tdTitle = document.createElement("td");
    const tdView = document.createElement("td");
    const tdDate = document.createElement("td");

    const titleLink = document.createElement("a");
    titleLink.href = "/board/read/" + item.bno;
    titleLink.textContent = item.title || "";

    tdNo.textContent = String(total - index);
    tdTitle.appendChild(titleLink);
    tdView.textContent = item.viewCount == null ? "0" : String(item.viewCount);
    tdDate.textContent = formatDate(item.createDate);

    tr.append(tdNo, tdTitle, tdView, tdDate);
    tbody.appendChild(tr);
  }

  function renderEmpty() {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "No posts.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  if (btnNew) {
    btnNew.addEventListener("click", function () {
      window.location.href = "/board/create";
    });
  }

  fetch("/api/board/list")
    .then(function (res) {
      if (!res.ok) throw new Error("Failed to load list");
      return res.json();
    })
    .then(function (data) {
      tbody.innerHTML = "";
      if (!Array.isArray(data) || data.length === 0) {
        renderEmpty();
        return;
      }
      data.forEach(function (item, index) {
        renderRow(item, index, data.length);
      });
    })
    .catch(function (err) {
      console.error(err);
    });
})();
