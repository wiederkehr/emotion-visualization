(function() {

  // Spreadsheet Variables
  var localData = '../data/Anna-Summer-2016.csv';

  // Design Variables
  var margin = {top: 50, right: 50, bottom: 50, left: 100};
  var width = 1008 - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;
  var padding = 10;
  var lineHeight = 0;

  // Data Functions
  var nestGroup = d3.nest().key(function(d) { return d.group; });
  var parseDate = d3.time.format("%B %-d, %Y").parse;

  // Scales
  var yScale = d3.scale.linear().range([height, 0]);
  var xScale = d3.time.scale().rangeRound([0, width]);
  var pScale = d3.scale.linear().domain([0, width]).rangeRound([0, 100]);
  var colorScale = d3.scale.linear()
    .domain([1, 2, 3, 4, 5])
    .range(["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"]);

  // Adding SVG
  var chart = d3.select(".content").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "#fff")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Adding Gradient
  var gradient = chart.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  // Adding Zoom
  chart.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", xScale(0))
    .attr("y", yScale(1))
    .attr("width", xScale(1) - xScale(0))
    .attr("height", yScale(0) - yScale(1));

  var zoom = d3.behavior.zoom()
    .on("zoom", redrawAreas);

  chart.append("rect")
    .attr("class", "pane")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#fff")

  chart.call(zoom);

  // Data
  var nested;
  var streamLayers;

  // Axis
  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom");

  // Layouts
  var stream = d3.layout.stack()
      .offset("silhouette")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });

  // Areas
  var areaStack = d3.svg.area()
      .interpolate("basis")
      .x(function(d) { return xScale(d.date); })
      .y0(function(d) { return yScale(d.y0); })
      .y1(function(d) { return yScale(d.y0 + d.y); });

  // Load Local Spreadsheet Data
  function loadDataFromLocal(){
    console.log("Start Loading Data");
    d3.csv(localData, loadDataCompleted);
  }

  // Load Data Completed
  function loadDataCompleted(error, data){
    console.log("Loading Data Completed");

    var newData = [];
    var valenceData = [];
    data.forEach(function(d) {
      d.Date = parseDate(d.Date);
      var arousal = new Object();
      arousal.date = d.Date;
      arousal.group = 'Arousal';
      arousal.value = +d.Arousal;
      var conduciveness = new Object();
      conduciveness.date = d.Date;
      conduciveness.group = 'Conduciveness';
      conduciveness.value = +d.Conduciveness;
      var controllability = new Object();
      controllability.date = d.Date;
      controllability.group = 'Controllability';
      controllability.value = +d.Controllability;
      var intensity = new Object();
      intensity.date = d.Date;
      intensity.group = 'Intensity';
      intensity.value = +d.Intensity;
      var valence = new Object();
      valence.date = d.Date;
      valence.group = 'Valence';
      valence.value = +d.Valence;

      newData.push(arousal, conduciveness, controllability, intensity);
      valenceData.push(valence);
    });

    newData.sort(function(a, b) {
      return a.date - b.date;
    });
    valenceData.sort(function(a, b) {
      return a.date - b.date;
    });

    // Data Specification
    nested = nestGroup.entries(newData);
    streamLayers = stream(nested);
    lineHeight = height / nested.length;

    // Scales Specification
    xScale.domain(d3.extent(newData, function(d) { return d.date; }));
    yScale.domain([0, d3.max(newData, function(d) { return d.y0 + d.y; })]);

    // Gradient Specification
    valenceData.forEach(function(d) {
      gradient.append("stop")
        .attr("offset", pScale(xScale(d.date)) + "%")
        .attr("stop-color", colorScale(+d.value))
    });

    // Draw Chart
    zoom.x(xScale);
    drawAreas(newData);
    drawAxis();
  }

  function drawAreas(data) {

    console.log("drawAreas");
    var group = chart.selectAll(".group")
        .data(streamLayers)
        .enter().append("g")
        .attr("class", "group")
        .attr("id", function(d){ return d.key})
        .attr('transform', function(){ return "translate(0,0)"; });

    group.append("text")
        .attr("class", "group-label")
        .attr("x", -10)
        .attr("y", function(d) { return yScale(d.values[0].y0); })
        .text(function(d) { return d.key; });

    group.append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return areaStack(d.values); })
        .attr("clip-path", "url(#clip)")
        .style("fill", "url(#gradient)")
        .style("stroke", "#fff")
        .style("stroke-width", "1px");
  }

  function drawAxis() {
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + 10) + ")")
        .call(xAxis);
  }

  function redrawAreas() {
    chart.select("g.x.axis").call(xAxis);
    chart.selectAll("path.layer").attr("d", function(d) { return areaStack(d.values); });
  }

  loadDataFromLocal();

})()