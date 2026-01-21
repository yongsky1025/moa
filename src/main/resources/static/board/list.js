(function () {
  const tbody = document.getElementById("tbody");
  const alertBox = document.getElementById("alertBox");
  const btnNew = document.getElementById("btnNew");
  if (!tbody) return;

  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.className = "alert alert-" + (type || "danger");
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  }

  function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  }

  function renderRow(item, index, total) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td><span name="bno"></span></td>' +
      '<td><a name="titleLink"><span name="title"></span></a></td>' +
      '<td><span name="viewCount"></span></td>' +
      '<td><span name="createDate"></span></td>';

    const bnoEl = tr.querySelector('[name="bno"]');
    const titleEl = tr.querySelector('[name="title"]');
    const titleLinkEl = tr.querySelector('[name="titleLink"]');
    const viewCountEl = tr.querySelector('[name="viewCount"]');
    const createDateEl = tr.querySelector('[name="createDate"]');

    if (bnoEl) bnoEl.textContent = String(total - index);
    if (titleEl) titleEl.textContent = item.title || "";
    if (titleLinkEl) titleLinkEl.href = "/board/read/" + item.bno;
    if (viewCountEl) viewCountEl.textContent = item.viewCount == null ? 0 : String(item.viewCount);
    if (createDateEl) createDateEl.textContent = formatDate(item.createDate);

    tbody.appendChild(tr);
  }

  function renderEmpty() {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.className = "text-center text-muted py-4";
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
      showAlert(err.message || "Failed to load list");
    });
})();
