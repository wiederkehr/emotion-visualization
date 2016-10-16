(function() {

  // Spreadsheet Variables
  var spreadsheet = '1tdhCOlyMDJHNkOdXeUyhLE--BA2MGb4G6D82ZWOnnvQ';
  var worksheet = 'Week 1';
  var variables = ['Arousal', 'Conduciveness', 'Controllability', 'Intensity', 'Valence']

  // Load Google Spreadsheet Data
  function loadDataFromGSheets(){
    console.log("Start Loading Data");
    gsheets.getWorksheet(spreadsheet, worksheet, loadDataCompleted);
  }

  // Load Data Completed
  function loadDataCompleted(error, sheet){
    console.log("Loading Data Completed");

    if (sheet && sheet.data) {
      console.log(sheet);
      drawWeek(sheet)
    }
  }

  function drawWeek(sheet) {
    var week = d3.select(".content")
        .append("div")
        .attr("class", "week");

    var title = week.append("h3")
        .text(sheet.title);

    drawDay(week, sheet.data);
  }

  function drawDay(week, data) {
    var day = week.selectAll(".day")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "day")
        .each(function(d, i) {
          var day = d3.select(this);
          var chartData = [d.Arousal, d.Conduciveness, d.Controllability, d.Intensity, d.Valence]

          day.append("h4")
              .text(function(d) { return d.Date + ": " + d.Emotion; });
          day.append('div')
            .attr("class", "chart")

          drawVerticalBarChart(day, chartData);
        });
  }

  function drawVerticalBarChart(day, data) {
    // Margin Convention
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var width = 500 - margin.left - margin.right;
    var height = 240 - margin.top - margin.bottom;

    var min = 0;
    var max = 5;

    // Adding SVG
    var chart = day.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Bar Chart Dimensions
    var barWidth = width / data.length;
    var barHeight = height;
    var barGap = 2;

    var yscale = d3.scale.linear()
        .domain([min, max])
        .range([0, barHeight]);

    var bar = chart.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d, i) { return "translate(" + i * barWidth + ", 0)"; });

    bar.append("rect")
        .attr("height", barHeight)
        .attr("width", barWidth - barGap)
        .attr("class", "bar-bg");

    bar.append("rect")
        .attr("y", function(d) { return yscale(max - d); })
        .attr("height", function(d) { return yscale(d); })
        .attr("width", barWidth - barGap)
        .attr("class", "bar-fg");

    bar.append("text")
        .attr("x", barWidth / 2)
        .attr("dx", "-.35em")
        .attr("y", function(d) { return yscale(max - d) - 5; })
        .attr("class", "bar-value")
        .text(function(d) { return d; });

    bar.append("text")
        .attr("x", 5)
        .attr("y", barHeight - 5)
        .attr("class", "bar-key")
        .text(function(d, i) { return variables[i]; });
  }

  loadDataFromGSheets();

})()