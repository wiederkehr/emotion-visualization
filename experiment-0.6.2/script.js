(function() {

  var variables = ['Arousal', 'Conduciveness', 'Controllability', 'Intensity', 'Valence']

  // Data URLs
  var dummyData = 'data.csv';
  var realData = '../data/Anna-Summer-2016.csv';

  // Data Functions
  var nestGroup = d3.nest().key(function(d) { return d.group; });
  var parseDummyDate = d3.time.format("%b %Y").parse;
  var parseRealDate = d3.time.format("%B %-d, %Y").parse;

  // Nested Data
  var dummyNested;
  var realNested;

  function loadDummyData(){
    d3.csv(dummyData, loadDummyDataCompleted);
  }

  function loadDummyDataCompleted(error, data){
    data.forEach(function(d) {
      d.date = parseDummyDate(d.date);
      d.value = +d.value; });
    data.sort(function(a, b) { return a.date - b.date; });
    dummyNested = nestGroup.entries(data);
    console.log(data);
  }

  function loadRealData(){
    d3.csv(realData, loadRealDataCompleted);
  }

  function loadRealDataCompleted(error, data){
    var newData = [];
    data.forEach(function(d) {
      d.Date = parseRealDate(d.Date);
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
    console.log(newData);
  }

  loadDummyData();
  loadRealData();

})()