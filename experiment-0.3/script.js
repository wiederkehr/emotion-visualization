(function() {

  // Spreadsheet Variables
  var localData = '../data/Anna-Summer-2016.csv';
  var variables = ['Arousal', 'Conduciveness', 'Controllability', 'Intensity', 'Valence']

  // Design Variables
  var min = 1;
  var max = 5;

  // Scales
  var colorScale = d3.scale.linear()
    .domain([1, 5])
    .range(["#ca0020", "#0571b0"]);

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

          drawSquareChart(day, chartData);
        });
  }

  function drawSquareChart(day, data) {
    // Margin Convention
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var width = 180 - margin.left - margin.right;
    var height = 180 - margin.top - margin.bottom;

    var valence = data[data.length - 1];
    data.pop();

    // Adding SVG
    var chart = day.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var squareSize = Math.sqrt(Math.pow(width / 2, 2) / 2);

    var squareScale = d3.scale.linear()
        .domain([min, max])
        .range([20, squareSize]);

    chart.append("line")
        .attr("x1", width / 2)
        .attr("y1", 0)
        .attr("x2", width / 2)
        .attr("y2", height)
        .attr("class", "axis" );

    chart.append("line")
        .attr("x1", 0)
        .attr("y1", height / 2)
        .attr("x2", width)
        .attr("y2", height / 2)
        .attr("class", "axis" );

    var square = chart.selectAll("g")
        .data(data)
        .enter()
        .append("g");

    square.append("rect")
        .attr("height", function(d) { return squareScale(d); })
        .attr("width", function(d) { return squareScale(d); })
        .attr("class", function(d, i) { return "square-bg square-bg-" + i; })
        .attr("fill", colorScale(valence))
        .attr("transform", function(d, i) {
          var x = height/2;
          var y = height/2;
          var rotation = 0;
          switch(i) {
            case 0:
              rotation = -135;
              break;
            case 1:
              rotation = -45;
              break;
            case 2:
              rotation = 45;
              break;
            case 3:
              rotation = 135;
              break;
          }
          return "translate(" + x + " " + y + ") rotate(" + rotation + " 0 0)";
        })

    chart.append("text")
        .attr("x", width / 2 + 5)
        .attr("y", 10)
        .attr("class", "axis-text")
        .text(variables[0]);

    chart.append("text")
        .attr("x", width)
        .attr("y", height / 2 )
        .attr("class", "axis-text")
        .attr("transform", "rotate(-90 " + width + " " + height / 2 + ")")
        .text(variables[1]);

    chart.append("text")
        .attr("x", width / 2 + 5)
        .attr("y", height - 5)
        .attr("class", "axis-text")
        .text(variables[2]);

    chart.append("text")
        .attr("x", 0)
        .attr("y", height / 2 )
        .attr("class", "axis-text")
        .attr("transform", "rotate(90 0 " + height / 2 + ")")
        .text(variables[3]);
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