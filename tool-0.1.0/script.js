(function() {

  // Spreadsheet Variables
  var variables = {
    'Arousal': 1,
    'Conduciveness': 3,
    'Controllability': 3,
    'Intensity': 3,
    'Valence': 3
  }


  // Design Variables
  var margin = {top: 50, right: 50, bottom: 50, left: 50};
  var width = 500 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
  var min = 1;
  var max = 5;
  var maxBlur = 10;
  var maxPulse = 10;

  // Scales
  var colorScale = d3.scaleLinear()
    .domain([min, max])
    .range(["#ca0020", "#0571b0"]);

  var radiusScale = d3.scaleSqrt()
    .domain([0, max])
    .range([0, (width / 2) - (maxBlur * 2)]);

  var pulseSizeScale = d3.scaleSqrt()
    .domain([min, max])
    .range([0, 10]);

  var pulseFrequencyScale = d3.scaleLinear()
    .domain([min, max])
    .range([2000, 500]);

  var opacityScale = d3.scaleLinear()
    .domain([0, max])
    .range([0, 1]);

  var blurScale = d3.scaleLinear()
    .domain([min, max])
    .range([maxBlur, 0]);

  function addPanel() {
    addChart();
  }

  function addChart() {

    var chart = d3.select(".panel").append("svg")
        .attr("width", width)
        .attr("height", height);

    var filter = chart.append("filter")
        .attr("id", "blur")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%")
        .append("feGaussianBlur");

    var circle = chart.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .attr("class", "circle-group")
        .append("circle")
        .attr("class", "circle")
        .attr("cx", 0)
        .attr("cy", 0)
  }

  function drawChart() {
    d3.select("filter").remove();

    d3.select("svg").append("filter")
        .attr("id", "blur")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%")
        .append("feGaussianBlur")
        .attr("stdDeviation", blurScale(variables.Controllability));

    d3.select(".circle")
      .attr("r", function(d) { return radiusScale(variables.Intensity)})
      .style("opacity", function(d) { return opacityScale(variables.Conduciveness)})
      .attr("fill", colorScale(variables.Valence))
      .attr("filter", "url(#blur)")
      .transition()
      .duration( function(d) { return pulseFrequencyScale(variables.Arousal)})
      .on("start", function repeat() {
        d3.active(this)
        .attr('r', function(d) { return radiusScale(variables.Intensity) + maxPulse})
        .transition()
        .attr('r', function(d) { return radiusScale(variables.Intensity)})
        .transition()
        .on("start", repeat);
      });
  }

  function addForm() {
    var form = d3.select(".form");
    var slider = form.selectAll(".slider")
        .data(d3.keys(variables))
        .enter()
        .append("div")
        .attr("class", "slider")
        .each(function(d, i) {
          var slider = d3.select(this);

          slider.append("label")
          .attr("for", function(d) { return d})
          .text(function(d) { return d});

          slider.append("input")
          .attr("type", "range")
          .attr("min", 1)
          .attr("max", 5)
          .attr("value", function(d) { return variables[d]})
          .attr("name", function(d) { return d});
        });
  }

  function mountForm() {
    d3.selectAll("input").on("input", onInput);
  }

  function onInput() {
    input = d3.select(this);
    d = input._groups[0][0];
    variables[d.name] = +d.value
    drawChart();
  }

  addPanel();
  drawChart();
  addForm();
  mountForm();

})()