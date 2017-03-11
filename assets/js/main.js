var loadedData;
var activeChart;
var startDate;
var endDate;

function energy() {
  energy_oursourcing = ['Fremdbezug in kwh'];
  energy_production = ['BHKW_Erzeugung in kwh'];
  energy_feeding = ['BHKW_Einspeisung in kwh'];
  energy_consumption = ['Verbrauch KA in kwh'];
  data = getData([energy_oursourcing, energy_production, energy_feeding, energy_consumption]);
  return data;
}

function nitrogen() {
  nitrogenOutput = ["Ablauf: Gebundener Stickstoff in mg/l"];
  thresholdName = "Grenzwert für Gebundener Stickstoff in mg/l"
  data = getData([nitrogenOutput], thresholdName)
  return data;
}

function ammoniacalNitrogen() {
  ammoniacalNitrogenOutput = ["Ablauf: Ammoniumstickstroff in mg/l"];
  thresholdName = "Grenzwert für Ammoniumstickstroff in mg/l"
  data = getData([ammoniacalNitrogenOutput], thresholdName)
  return data;
}

function phosphor() {
  phosphorOutput = ["Ablauf: Phosphor in mg/l"];
  thresholdName = "Grenzwert für Phosphor in mg/l"
  data = getData([phosphorOutput], thresholdName)
  return data;
}

function oxygenOrganic() {
  phosphorOutput = ["Ablauf: CSB (Maß für Summe aller organischer Berbindungen) in mg/l"];
  thresholdName = "Grenzwert für CSB (Maß für Summe aller organischer Berbindungen) in mg/l"
  data = getData([phosphorOutput], thresholdName)
  return data;
}

function oxygenBiologic() {
  phosphorOutput = ["Ablauf: BSB (Maß für Sauerstoffbedarf für biologischen Abbau) in mg/l"];
  thresholdName = "Grenzwert für BSB (Maß für Sauerstoffbedarf für biologischen Abbau) in mg/l"
  data = getData([phosphorOutput], thresholdName)
  return data;
}

function getData(dataSets, thresholdName) {
  dates = ['x'];
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
      opt = "<option value='" + currentDataSet['Datum'] + "'>" + currentDataSet['Datum'] +'</option>';
      startDate.append(opt);
      endDate.append(opt);
      for (var j = 1; j < preparedDatasets.length; j++) {
        preparedDatasets[j].push(
          parseFloat(
            currentDataSet[preparedDatasets[j][0]].replace('.', '').replace(',', '.'),
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
    startIndex = data[0].indexOf($('#startDate').val());
    endIndex = data[0].indexOf($('#endDate').val());
    if (endIndex >= startIndex) {
      $('#dateMessage').addClass("hide");
    } else {
      $('#dateMessage').removeClass("hide");
    }
    newData = [];
    for (var i=0; i < data.length; i++) {
      newData.push([data[i][0]].concat(data[i].slice(startIndex, endIndex)));
    }
    data = newData;
  } else {
    $('#control #startContainer').html('').append(startDate);
    $('#control #endContainer').html('').append(endDate);
    $('#endDate').val(data[0][data[0].length - 1]);
    $('#startDate, #endDate').on('change', function () {window.update()});
  }
  maxY = Math.ceil(d3.max(data.slice(1), function(data) {
    return d3.max(data.slice(1)) * 1.2;
  }));
  if (typeof(threshold) !== "undefined") {
    maxY = d3.max([maxY, parseInt(threshhold, 10) * 1.2]);
  }
  context = {
    bindto: "#output",
    data: {x: 'x', columns: data,},
    axis: {
      x: {
        type: 'categorized', // this is needed to load string x value
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
  }
  var chart = c3.generate(context);
}

function loadData(callback) {
  jQuery.ajax({
    url: 'data/GeordneteBetriebsdaten_2016_ODD.csv',
    success: function (result) {
      loadedData = $.csv.toObjects(result, {separator: ';'});
      update();
    }
  });
}

function update(e) {
  currentChoosenChart = activeChart
  if (typeof(activeChart) === "undefined") {
    activeChart = "energy";
  }
  if (typeof(e) !== "undefined") {
    activeChart = $(e.target).data('target');
  }
  drawData(window[activeChart](), (currentChoosenChart == activeChart));
}

$('.update-chart').click(update);

$(document).ready(function() {
  loadData();
  $('body').css('min-height', $('body').height() + 450);
})