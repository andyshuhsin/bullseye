"use strict";

localStorage.history = localStorage.history || "[]";

var uiState = {
    scene: 'bar'
};
var records = JSON.parse(localStorage.history);
var score = +localStorage.sd;

function sd(records) {
    return records.map(function (record) {
        return Math.pow(record.truth - record.guess, 2);
    }).reduce(function (a, b) {
        return a + b;
    }, 0) / records.length;
}

// Map [0, +infinity) to [0, 100) inversely
function getScore(records) {
    var DEFAULT_SCORE = 0;
    var MAGIC_PARAMETER = 10;
    if (!records.length) {
        return DEFAULT_SCORE;
    }
    var x = sd(records);
    return (1 - x / (x + MAGIC_PARAMETER)) * 100;
}

function renderBarScene() {
    var maxMultiple = 5;
    var minMultiple = 0.5;

    var nextTest = minMultiple + Math.random() * (maxMultiple - minMultiple);
    // Users shouldn't be expected to guess to an ultra-high accuracy
    var nextTestRouded = +nextTest.toFixed(2);

    var data = [{
        value: 1,
        tag: "1"
    }, {
        value: nextTestRouded,
        tag: "?"
    }];

    var barSpacing = 20;
    var barNumber = data.length;

    var graphDom = document.querySelector(".graph");
    var graphDomWidth = graphDom.scrollWidth;
    var graphDomHeight = graphDom.scrollHeight;
    var barWidth = graphDomWidth / barNumber - barSpacing;

    var graphHeight = graphDomHeight;

    var barChart = d3.select(".graph").append("svg:svg").attr("width", graphDomWidth).attr("height", graphHeight);

    var heightScale = d3.scaleLinear().domain([0, maxMultiple]).range([0, graphHeight]);

    barChart.selectAll("rect").data(data).enter().append("svg:rect").attr("x", function (_, index) {
        return barSpacing / 2 + index * (barWidth + barSpacing);
    }).attr("y", function (datum) {
        return graphHeight - heightScale(datum.value);
    }).attr("height", function (datum) {
        return heightScale(datum.value);
    }).attr("width", barWidth).attr("fill", "#888");

    barChart.selectAll("text").data(data).enter().append("svg:text").attr("x", function (_, index) {
        return barSpacing / 2 + index * (barWidth + barSpacing);
    }).attr("y", function (datum) {
        return graphHeight - heightScale(datum.value);
    }).text(function (datum) {
        return datum.tag;
    }).attr("dx", barWidth / 2).attr("dy", "2em").attr("text-anchor", "middle").attr("fill", "white");

    document.querySelector(".guess").oninput = function (event) {
        data[1].tag = (+event.target.value).toFixed(2);
        var text = barChart.selectAll("text").data(data);
        text.merge(text).text(function (d) {
            return d.tag;
        });
    };

    document.querySelector(".confirm").onclick = function () {
        document.querySelector(".confirm").disabled = true;
        document.querySelector(".guess").disabled = true;
        var infoDom = document.querySelector(".info");
        var guess = Number(document.querySelector(".guess").value);
        var truth = data[1].value;
        infoDom.innerHTML = "\n            Your guess: " + guess + " <br />\n            True value: " + truth.toFixed(2) + " <br />\n            You're off by " + ((guess - truth) / truth * 100).toFixed(2) + "%\n        ";
        document.querySelector('.play-again').style.display = 'inline-block';
        document.querySelector('.view-history').style.display = 'inline-block';

        records.push({
            scene: uiState.scene,
            truth: truth,
            guess: guess,
            time: Date.now()
        });
        localStorage.history = JSON.stringify(records);
        refreshScore();
    };
}

function renderHistoryScene() {
    var maxMultiple = 5; // See renderBarScene()

    var graphDom = document.querySelector(".graph");
    graphDom.innerHTML = '';
    var graphDomWidth = graphDom.scrollWidth;
    var graphDomHeight = graphDom.scrollHeight;

    var xScale = d3.scaleLinear().domain([0, maxMultiple]).range([0, graphDomWidth]);

    var yScale = d3.scaleLinear().domain([0, maxMultiple]).range([0, graphDomHeight]);

    var historyChart = d3.select(".graph").append("svg:svg").attr("width", graphDomWidth).attr("height", graphDomHeight);

    historyChart.selectAll('circle').data(records).enter().append('circle').attr("r", 3.5).attr("cx", function (datum) {
        return xScale(datum.guess);
    }).attr("cy", function (datum) {
        return graphDomHeight - yScale(datum.truth);
    });

    historyChart.append("line").style("stroke", "black").attr("x1", 0).attr("y1", graphDomHeight).attr("x2", xScale(maxMultiple)).attr("y2", 0);
}

function refreshScore() {
    score = getScore(records).toFixed(2);
    document.querySelector('.score').innerText = String(score);
}

function resetUI() {
    document.querySelector('.graph').innerHTML = '';
    document.querySelector(".info").innerHTML = '';
    document.querySelector('.guess').value = 1;
    document.querySelector('.guess').disabled = false;
    document.querySelector('.play-again').style.display = 'none';
    document.querySelector('.view-history').style.display = 'none';
    document.querySelector('.confirm').disabled = false;
    refreshScore();
}

function switchToHistoryControl() {
    document.querySelector(".normal-control").style.display = "none";
    document.querySelector(".history-control").style.display = "block";
}

function switchToNormalControl() {
    document.querySelector(".normal-control").style.display = "block";
    document.querySelector(".history-control").style.display = "none";
}

document.querySelector('.play-again').onclick = function () {
    resetUI();
    if (uiState.scene === 'bar') {
        renderBarScene();
    }
};

document.querySelector('.view-history').onclick = function () {
    resetUI();
    renderHistoryScene();
    switchToHistoryControl();
};

document.querySelector(".history-control-ok").onclick = function () {
    resetUI();
    renderBarScene();
    switchToNormalControl();
};

document.querySelector(".clear-history").onclick = function () {
    records = [];
    localStorage.history = "[]";
    renderHistoryScene();
};

resetUI();
renderBarScene();
//renderHistoryScene();