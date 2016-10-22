(function() {

  // Spreadsheet Variables
  var localData = '../data/Anna-Summer-2016.csv';
  var variables = ['Arousal', 'Conduciveness', 'Controllability', 'Intensity', 'Valence']

  // Design Variables
  var min = 1;
  var max = 5;
  var square = 200;
  var radiusMax = 50;

  // Scales
  var colorScale = d3.scale.linear()
    .domain([1, 2, 3, 4, 5])
    .range(["#ca0020", "#f4a582", "#e0e0e0", "#92c5de", "#0571b0"]);

  var radiusScale = d3.scale.sqrt()
    .domain([0, max])
    .range([0,radiusMax]);

  var xScale = d3.scale.linear()
    .domain([0, 3])
    .range([radiusMax,square - radiusMax]);

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
    drawLegend ();
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

          drawCloudChart(day, chartData);
        });
  }

  function drawCloudChart(day, data) {
    // Margin Convention
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var width = square - margin.left - margin.right;
    var height = square - margin.top - margin.bottom;

    var valence = data[data.length - 1];
    data.pop();

    console.log(xScale(4), xScale(0))

    // Adding SVG
    var chart = day.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var cloud = chart.selectAll(".circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", radiusMax)
        .attr("cx", function(d, i) { return xScale(i) })
        .attr("cy", height / 2)
        .attr("fill", colorScale(valence))
        .attr("opacity", 0.7)
        .attr("r", function(d) { return radiusScale(d)});
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