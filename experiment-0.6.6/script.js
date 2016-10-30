(function() {

  // Spreadsheet Variables
  var localData = '../data/Anna-Summer-2016.csv';

  // Design Variables
  var margin = {top: 50, right: 50, bottom: 50, left: 100};
  var width = 1008 - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;
  var padding = 10;
  var lineHeight = 0;

  var mode = "";

  // Data Functions
  var nestGroup = d3.nest().key(function(d) { return d.group; });
  var parseDate = d3.time.format("%B %-d, %Y").parse;

  // Scales
  var yScaleSplit = d3.scale.linear().range([height, 0]);
  var yScaleStack = d3.scale.linear().range([height, 0]);
  var yScaleExpand = d3.scale.linear().range([height, 0]);
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
    .attr("y", yScaleSplit(1))
    .attr("width", xScale(1) - xScale(0))
    .attr("height", yScaleSplit(0) - yScaleSplit(1));

  var zoom = d3.behavior.zoom()
    .on("zoom", redrawAreas);

  // Data
  var nested;
  var stackLayers;
  var streamLayers;
  var expandLayers;

  // Axis
  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom");

  // Layouts
  var stack = d3.layout.stack()
      .offset("zero")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });

  var stream = d3.layout.stack()
      .offset("silhouette")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });

  var expand = d3.layout.stack()
      .offset("expand")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });

  // Areas
  var areaStack = d3.svg.area()
      .interpolate("basis")
      .x(function(d) { return xScale(d.date); })
      .y0(function(d) { return yScaleStack(d.y0); })
      .y1(function(d) { return yScaleStack(d.y0 + d.y); });

  var areaExpand = d3.svg.area()
      .interpolate("basis")
      .x(function(d) { return xScale(d.date); })
      .y0(function(d) { return yScaleExpand(d.y0); })
      .y1(function(d) { return yScaleExpand(d.y0 + d.y); });

  var areaSplit = d3.svg.area()
      .interpolate("basis")
      .x(function(d) { return xScale(d.date); })
      .y0(function(d) { return lineHeight; })
      .y1(function(d) { return yScaleSplit(d.value); });

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
    stackLayers = stack(nested);
    lineHeight = height / nested.length;

    // Scales Specification
    xScale.domain(d3.extent(newData, function(d) { return d.date; }));
    yScaleStack.domain([0, d3.max(newData, function(d) { return d.y0 + d.y; })]);
    yScaleSplit.domain([0, d3.max(newData, function(d) { return d.value; })]);
    yScaleSplit.range([lineHeight, padding]);
    yScaleExpand.domain([0, 1]);

    // Gradient Specification
    valenceData.forEach(function(d) {
      gradient.append("stop")
        .attr("offset", pScale(xScale(d.date)) + "%")
        .attr("stop-color", colorScale(+d.value))
    });

    // Draw Chart
    drawBackground();
    initiateZoom();
    drawAreas(newData);
    drawAxis();
    mountSelect();
  }

  function drawBackground() {
    chart.append("rect")
    .attr("class", "pane")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#fff")
  }

  function initiateZoom() {
    zoom.x(xScale);
    chart.call(zoom);
  }

  function drawAreas(data) {

    console.log("drawAreas");
    var group = chart.selectAll(".group")
        .data(stackLayers)
        .enter().append("g")
        .attr("class", "group")
        .attr("id", function(d){ return d.key})
        .attr('transform', function(d, i){ return "translate(0," + (height - (i+1) * lineHeight) +")"; });

    group.append("text")
        .attr("class", "group-label")
        .attr("x", -10)
        .attr("y", function(d) { return lineHeight; })
        .text(function(d) { return d.key; });

    group.append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return areaSplit(d.values); })
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
    chart.selectAll("path.layer").attr("d", function(d) {
      switch(mode) {
        case "split":
          return areaSplit(d.values);
        break;
        case "stack":
          return areaStack(d.values);
        break;
        case "stream":
          return areaStack(d.values);
        break;
        case "expand":
          return areaExpand(d.values);
        break;
      }
    });
  }

  function mountSelect() {
    mode = "split";
    d3.selectAll("input").on("change", change);
    function change() {
      switch(this.value) {
        case "split":
          mode = "split";
          transitionToSplit();
        break;
        case "stack":
          mode = "stack";
          transitionToStack();
        break;
        case "stream":
          mode = "stream";
          transitionToStream();
        break;
        case "expand":
          mode = "expand";
          transitionToExpand();
        break;
      }
    }
  }

  function transitionToSplit() {
    console.log("transitionToSplit");
    var t = chart.transition();
    var g = t.selectAll(".group").attr('transform', function(d, i){ return "translate(0," + (height - (i+1) * lineHeight) +")"; });
    g.selectAll(".layer").attr("d", function(d) { return areaSplit(d.values); });
    g.select(".group-label").attr("y", function(d) { return lineHeight; });
  }

  function transitionToStack() {
    console.log("transitionToStack");
    stackLayers = stack(nested);
    d3.selectAll("path.layer").data(stackLayers);
    var t = chart.transition();
    var g = t.selectAll(".group").attr('transform', function(){ return "translate(0,0)"; });
    g.selectAll(".layer").attr("d", function(d) { return areaStack(d.values); });
    g.select(".group-label").attr("y", function(d) { return yScaleStack(d.values[0].y0); });
  }

  function transitionToStream() {
    console.log("transitionToStream");
    streamLayers = stream(nested);
    d3.selectAll("path.layer").data(streamLayers);
    var t = chart.transition();
    var g = t.selectAll(".group").attr('transform', function(){ return "translate(0,0)"; });
    g.selectAll(".layer").attr("d", function(d) { return areaStack(d.values); });
    g.select(".group-label").attr("y", function(d) { return yScaleStack(d.values[0].y0); });
  }

  function transitionToExpand() {
    console.log("transitionToExpand");
    expandLayers = expand(nested);
    d3.selectAll("path.layer").data(expandLayers);
    var t = chart.transition();
    var g = t.selectAll(".group").attr('transform', function(){ return "translate(0,0)"; });
    g.selectAll(".layer").attr("d", function(d) { return areaExpand(d.values); });
    g.select(".group-label").attr("y", function(d) { return yScaleExpand(d.values[0].y0); });
  }

  loadDataFromLocal();

})()