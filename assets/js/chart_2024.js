Chart.plugins.register({
    afterDatasetsDraw: function(chart) {
        var ctx = chart.ctx;

        chart.data.datasets.forEach(function(dataset, i) {
            var meta = chart.getDatasetMeta(i);

            if (!meta.hidden) {
                meta.data.forEach(function(element, index) {
                    ctx.fillStyle = "rgb(0, 0, 0)";

                    var fontSize = 16;
                    var fontStyle = "normal";
                    var fontFamily = "Helvetica Neue";
                    ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

                    var dataString = dataset.data[index].toString();

                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    var padding = 5;
                    var position = element.tooltipPosition();
                    ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
                });
            }
        });
    }
});

var ctx = document.getElementById("myChart").getContext("2d");
ctx.height = "200px";

var myChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["7-Jun", "10-Jun", "12-Jun", "14-Jun", "17-Jun", "19-Jun", "21-June 'IDY'"],
        datasets: [{
            label: "# of Suryanamaskars",
            data: [12, 24, 48, 60, 72, 84, 108],
            backgroundColor: [
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(153, 102, 255, 0.6)",
                "rgba(255, 159, 64, 0.6)",
                "rgba(255, 99, 132, 0.6)",
                "rgba(75, 192, 192, 0.8)"
            ],
            borderColor: [
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(75, 192, 192, 1)"
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        legend: {
            display: true
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
