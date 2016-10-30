(function() {

  // Spreadsheet Variables
  var localData = '../data/Anna-Summer-2016.csv';
  var variables = ['Arousal', 'Conduciveness', 'Controllability', 'Intensity', 'Valence']

  // Design Variables
  var min = 1;
  var max = 5;
  var square = 200;
  var maxBlur = 10;
  var maxPulse = 10;

  // Scales
  var colorScale = d3.scaleLinear()
    .domain([1, 5])
    .range(["#ca0020", "#0571b0"]);

  var radiusScale = d3.scaleSqrt()
    .domain([0, max])
    .range([0,90]);

  var pulseFrequencyScale = d3.scaleLinear()
    .domain([min, max])
    .range([2000, 500]);

  var opacityScale = d3.scaleLinear()
    .domain([0, max])
    .range([0,1]);

  var blurScale = d3.scaleLinear()
    .domain([min, max])
    .range([maxBlur, 0]);

  // Load Local Spreadsheet Data
  function loadDataFromLocal(){
    console.log("Start Loading Data");
    d3.csv(localData, loadDataCompleted);
  }

  // Load Data Completed
  function loadDataCompleted(error, data){
    console.log("Loading Data Completed");
    if (data) {
      console.log(data);
      drawWeek(data)
    }
  }

  function drawWeek(data) {
    var week = d3.select(".content")
        .append("div")
        .attr("class", "week");

    var title = week.append("h3")
        .text("Summer 2016");

    drawDay(week, data);
    drawLegend();
  }

  function drawDay(week, data) {
    var day = week.selectAll(".day")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "day")
        .each(function(d, i) {
          var day = d3.select(this);
          var chartData = d;
          day.append("h4").text(function(d) { return d.Date + ": " + d.Emotion; });
          day.append('div').attr("class", "chart")
          drawCircleChart(day, chartData, i);
        });
  }

  function drawCircleChart(day, data, i) {
    // Margin Convention
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var width = square - margin.left - margin.right;
    var height = square - margin.top - margin.bottom;

    // Adding SVG
    var chart = day.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var filter = chart.append("filter")
        .attr("id", "blur-" + i)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%")
        .append("feGaussianBlur")
        .attr("stdDeviation", blurScale(data.Controllability));

    var circle = chart.append("g")
        .attr("transform", "translate(" + square / 2 + "," + square / 2 + ")")
        .attr("class", "circle-group")
        .append("circle")
        .attr("class", "circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", function(d) { return radiusScale(data.Intensity)})
        .style("opacity", function(d) { return opacityScale(data.Conduciveness)})
        .attr("fill", colorScale(data.Valence))
        .attr("filter", "url(#" + "blur-" + i + ")")
        .transition()
        .duration( function(d) { return pulseFrequencyScale(data.Arousal)})
        .on("start", function repeat() {
          d3.active(this)
          .attr('r', function(d) { return radiusScale(data.Intensity) - maxPulse})
          .transition()
          .attr('r', function(d) { return radiusScale(data.Intensity)})
          .transition()
          .on("start", repeat);
        });

  }

  function drawLegend() {
    var legend = d3.select(".week").append("svg")
        .attr("width", 100)
        .attr("height", 20)
        .attr("class", "legend")
        .append("g")
        .attr("transform", "translate(0,0)");

    var legendItem = legend.selectAll("rect")
        .data([1, 2, 3, 4, 5])
        .enter()
        .append("rect")
        .attr("fill", function (d) { return colorScale(d)})
        .attr("width", 18)
        .attr("height", 18)
        .attr("x", function(d, i) { return 20 * i});
  }

  loadDataFromLocal();

})()