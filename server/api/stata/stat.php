<?php
require_once'simple_html_dom.php';
require_once'../api.php';
error_reporting(E_ALL);
?><canvas id="myChart"></canvas>

<script>
    function drawChart(data) {
        var parsedData = JSON.parse(data)
        var dates = []
        var levels = []

        for (var i = 0; i < parsedData.length; i++) {
            dates.push(parsedData[i].date)
            levels.push(parsedData[i].levels)
        }

        var canvas = document.getElementById("myChart")
        var ctx = canvas.getContext("2d")

        var chartWidth = canvas.width - 40
        var chartHeight = canvas.height - 80

        var maxValue = Math.max.apply(null, levels)
        var barWidth = chartWidth / levels.length
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        for (var i = 0; i < levels.length; i++) {
            var dated = new Date(dates[i] * 1000)

            var date = dated.getFullYear() + ':' + dated.getMonth() + ':' + dated.getDate()

            var barHeight = (levels[i] / maxValue) * chartHeight
            var x = i * barWidth + 20
            var y = chartHeight - barHeight + 20
            ctx.fillStyle = "#007bff"
            ctx.fillRect(x, y, barWidth - 10, barHeight)
            ctx.fillStyle = "#000"
            ctx.fillText(levels[i], x, y - 10)

            ctx.save()
            ctx.translate(x, canvas.height - 10)
            ctx.rotate(-45 * Math.PI / 180)
            ctx.fillStyle = "#000"
            ctx.fillText(date, 0, 0)
            ctx.restore()
        }
    }
    drawChart('<?php echo content::lastStats($_GET['id'])?>')
</script>