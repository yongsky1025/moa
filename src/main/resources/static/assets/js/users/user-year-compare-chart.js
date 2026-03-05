// Line chart: monthly new vs withdrawn users (last 12 months)
(function () {
  var canvas = document.getElementById("userYearCompareChart");
  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  Chart.defaults.global.defaultFontFamily =
    "Nunito,-apple-system,system-ui,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif";
  Chart.defaults.global.defaultFontColor = "#858796";

  function numberFormat(value) {
    var num = Number(value);
    if (Number.isNaN(num)) {
      return "0";
    }
    return num.toLocaleString("en-US");
  }

  fetch("/users/stats/monthly?months=12", {
    headers: {
      Accept: "application/json"
    }
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Failed to load monthly stats");
      }
      return response.json();
    })
    .then(function (data) {
      var labels = Array.isArray(data.labels) ? data.labels : [];
      var newUsers = Array.isArray(data.newUsers) ? data.newUsers : [];
      var withdrawnUsers = Array.isArray(data.withdrawnUsers) ? data.withdrawnUsers : [];

      new Chart(canvas, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "신규 가입자",
              lineTension: 0.3,
              backgroundColor: "rgba(28, 200, 138, 0.08)",
              borderColor: "rgba(28, 200, 138, 1)",
              pointRadius: 3,
              pointBackgroundColor: "rgba(28, 200, 138, 1)",
              pointBorderColor: "rgba(28, 200, 138, 1)",
              pointHoverRadius: 4,
              pointHoverBackgroundColor: "rgba(28, 200, 138, 1)",
              pointHoverBorderColor: "rgba(28, 200, 138, 1)",
              pointHitRadius: 10,
              pointBorderWidth: 2,
              data: newUsers
            },
            {
              label: "탈퇴 회원",
              lineTension: 0.3,
              backgroundColor: "rgba(231, 74, 59, 0.08)",
              borderColor: "rgba(231, 74, 59, 1)",
              pointRadius: 3,
              pointBackgroundColor: "rgba(231, 74, 59, 1)",
              pointBorderColor: "rgba(231, 74, 59, 1)",
              pointHoverRadius: 4,
              pointHoverBackgroundColor: "rgba(231, 74, 59, 1)",
              pointHoverBorderColor: "rgba(231, 74, 59, 1)",
              pointHitRadius: 10,
              pointBorderWidth: 2,
              data: withdrawnUsers
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 10,
              right: 25,
              top: 25,
              bottom: 0
            }
          },
          scales: {
            xAxes: [
              {
                gridLines: {
                  display: false,
                  drawBorder: false
                },
                ticks: {
                  maxTicksLimit: 12
                }
              }
            ],
            yAxes: [
              {
                ticks: {
                  maxTicksLimit: 5,
                  padding: 10,
                  callback: function (value) {
                    return numberFormat(value);
                  }
                },
                gridLines: {
                  color: "rgb(234, 236, 244)",
                  zeroLineColor: "rgb(234, 236, 244)",
                  drawBorder: false,
                  borderDash: [2],
                  zeroLineBorderDash: [2]
                }
              }
            ]
          },
          legend: {
            display: true
          },
          tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            titleMarginBottom: 10,
            titleFontColor: "#6e707e",
            titleFontSize: 14,
            borderColor: "#dddfeb",
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: true,
            intersect: false,
            mode: "index",
            caretPadding: 10,
            callbacks: {
              label: function (tooltipItem, chart) {
                var datasetLabel =
                  chart.datasets[tooltipItem.datasetIndex].label || "";
                return datasetLabel + ": " + numberFormat(tooltipItem.yLabel);
              }
            }
          }
        }
      });
    })
    .catch(function (error) {
      console.warn(error);
    });
})();
