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
  var yScaleSplit = d3.scale.linear().range([height, 0]);
  var yScaleStack = d3.scale.linear().range([height, 0]);
  var yScaleExpand = d3.scale.linear().range([height, 0]);

  var xScale = d3.time.scale().rangeRound([0, width]);
  var colorScale = d3.scale.ordinal().range(['#3BB3B6','#6B9EC1','#9B84B0','#B56B8A','#B35E5E']);
  colorScale = d3.scale.ordinal().range(['#f1c40f','#e67e22','#e74c3c','#9b59b6','#3498db']);

  // Adding SVG
  var chart = d3.select(".content").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "#fff")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Data
  var nested;
  var stackLayers;
  var streamLayers;
  var expandLayers;

  // Axis
  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .ticks(d3.time.weeks);

  // Layouts
  var stack = d3.layout.stack()
      .offset("zero")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });

  var stream = d3.layout.stack()
      .offset("wiggle")
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
      newData.push(arousal, conduciveness, controllability, intensity, valence)
    });

    newData.sort(function(a, b) {
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

    // Draw Chart
    drawAreas(newData);
    drawAxis();
    mountSelect();
  }

  function drawAreas(data) {
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
        .style("fill", function(d, i) { return colorScale(i); });
  }

  function drawAxis() {
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + 10) + ")")
        .call(xAxis);
  }

  function mountSelect() {
    d3.selectAll("input").on("change", change);
    function change() {
      switch(this.value) {
        case "split":
          transitionToSplit();
        break;
        case "stack":
          transitionToStack();
        break;
        case "stream":
          transitionToStream();
        break;
        case "expand":
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