var loadedData;
var activeChart;
var startDate;
var endDate;

function energy() {
  values = [
    ["Fremdbezug in kwh"], ["BHKW_Erzeugung in kwh"],
    ["BHKW_Einspeisung in kwh"], ["Verbrauch KA in kwh"]
  ]
  return getData(values);
}

function nitrogen(inValue) {
  values = [["Ablauf: Gebundener Stickstoff in mg/l"]];
  if (inValue) {
    values.push(["Zulauf: Gebundener Stickstoff in mg/l"])
  }
  thresholdName = "Grenzwert für Gebundener Stickstoff in mg/l"
  return getData(values, thresholdName)
}

function ammoniacalNitrogen(inValue) {
  values = [["Ablauf: Ammoniumstickstroff in mg/l"]];
  if (inValue) {
    values.push(["Zulauf: Ammoniumstickstroff in mg/l"])
  }
  thresholdName = "Grenzwert für Ammoniumstickstroff in mg/l"
  return getData(values, thresholdName)
}

function phosphor(inValue) {
  values = [["Ablauf: Phosphor in mg/l"]];
  if (inValue) {
    values.push(["Zulauf: Phosphor in mg/l"])
  }
  thresholdName = "Grenzwert für Phosphor in mg/l"
  return getData(values, thresholdName)
}

function oxygenOrganic(inValue) {
  values = [["Ablauf: CSB (Maß für Summe aller organischer Berbindungen) in mg/l"]];
  if (inValue) {
    values.push(["Zulauf: CSB (Maß für Summe aller organischer Berbindungen) in mg/l"])
  }
  thresholdName = "Grenzwert für CSB (Maß für Summe aller organischer Berbindungen) in mg/l"
  return getData(values, thresholdName)
}

function oxygenBiologic(inValue) {
  values = [["Ablauf: BSB (Maß für Sauerstoffbedarf für biologischen Abbau) in mg/l"]];
  if (inValue) {
    values.push(["Zulauf: BSB (Maß für Sauerstoffbedarf für biologischen Abbau) in mg/l"])
  }
  thresholdName = "Grenzwert für BSB (Maß für Sauerstoffbedarf für biologischen Abbau) in mg/l"
  return getData(values, thresholdName)
}

function getData(dataSets, thresholdName) {
  dates = ["x"];
  startDate = $('<select id="startDate" name="startDate"></select>');
  endDate = $('<select id="endDate" name="endDate">');
  checkValue = dataSets[0][0];
  preparedDatasets = [dates].concat(dataSets);
  if (typeof(thresholdName) !== "undefined") {
    threshhold = loadedData[0][thresholdName];
  } else {
    threshhold = undefined;
  }
  for (var i = 0; i < loadedData.length; i++) {
    currentDataSet = loadedData[i];
    if (currentDataSet[checkValue] !== "") {
      preparedDatasets[0].push(currentDataSet["Datum"]);
      opt = '<option value="' + currentDataSet["Datum"] + '">' + currentDataSet["Datum"] +"</option>";
      startDate.append(opt);
      endDate.append(opt);
      for (var j = 1; j < preparedDatasets.length; j++) {
        preparedDatasets[j].push(
          parseFloat(
            currentDataSet[preparedDatasets[j][0]].replace(".", "").replace(",", "."),
            10
          )
        )
      }
    }
  }
  return [preparedDatasets, threshhold]
}

function drawData(input, update) {
  data = input[0];
  threshold = input[1];
  if (update) {
    startIndex = data[0].indexOf($("#startDate").val());
    endIndex = data[0].indexOf($("#endDate").val());
    if (endIndex >= startIndex) {
      $("#dateMessage").addClass("hide");
    } else {
      $("#dateMessage").removeClass("hide");
    }
    newData = [];
    for (var i=0; i < data.length; i++) {
      newData.push([data[i][0]].concat(data[i].slice(startIndex, endIndex)));
    }
    data = newData;
  } else {
    $("#control #startContainer").html("").append(startDate);
    $("#control #endContainer").html("").append(endDate);
    $("#endDate").val(data[0][data[0].length - 1]);
    $("#startDate, #endDate").on("change", function() {window.update()});
  }
  maxY = Math.ceil(d3.max(data.slice(1), function(data) {
    return d3.max(data.slice(1)) * 1.2;
  }));
  if (typeof(threshold) !== "undefined") {
    maxY = d3.max([maxY, parseInt(threshhold, 10) * 1.2]);
  }
  context = {
    bindto: "#chart",
    data: {x: "x", columns: data},
    line: {connectNull: true},
    axis: {
      x: {
        type: "categorized", // this is needed to load string x value
        tick: {rotate: 75, multiline: false, culling: {max: 20}},
      },
      y: {max: maxY,}
    },
    legend: {show: false},
  }
  if (typeof(threshold) !== "undefined") {
    context.grid = {
      y: {
        lines: [
          {text: "Grenzwert", value: threshold}
        ]
      }
    }
    context.data.color = function(color, d) {
      if (data.length === 3) {
        if (!isNaN(data[2][d.index+1]))
          return '#F00'
      }
      return color;
    }
  }
  $("#comparison").html("");
  var chart = c3.generate(context);
}

function loadData(callback) {
  jQuery.ajax({
    url: "data/GeordneteBetriebsdaten_2016_ODD.csv",
    success: function (result) {
      loadedData = $.csv.toObjects(result, {separator: ";"});
      update();
    }
  });
}

function update(e) {
  currentChoosenChart = activeChart
  if (typeof(activeChart) === "undefined") {
    activeChart = "energy";
  }
  if (typeof(e) !== "undefined" && typeof($(e.target).data("target")) !== "undefined") {
    activeChart = $(e.target).data("target");
  }
  showInValue = $("#showInValue").is(":checked");
  drawData(window[activeChart](showInValue), (currentChoosenChart == activeChart));
}

$(".update-chart").click(update);

current_image = 0;

images = [
  'assets/img/KA1.jpg',
  'assets/img/KA2.jpg',
  'assets/img/KA3.jpg',
  'assets/img/KA4.jpg',
]

$(document).ready(function() {
  $("#showInValue").on('change', update);
  loadData();
  $("body").css("min-height", ($("body").height()+200) + "px");
  $('#main-image').height($('#main-image').height());
  $('#main-image').width($('#main-image').width());
  setInterval(
    function() {
      current_image++;
      if (current_image == images.length) {
        current_image = 0;
      }
      $('#main-image img').fadeOut(500, function() {
        $(this).attr('src',images[current_image]).bind('onreadystatechange load', function(){
          if (this.complete) $(this).fadeIn(500);
        });
      })
    },
    3000
  )
})