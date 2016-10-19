'use strict';

var uiState = {
    scene: 'bar'
};
var history = JSON.parse(localStorage.get('history') || "[]");

function renderBarScene() {
    var data = [{
        value: 1,
        tag: "1"
    }, {
        value: 1 + Math.random() * 2,
        tag: "?"
    }];

    var barSpacing = 20;
    var barNumber = data.length;

    var graphDom = document.querySelector(".graph");
    var graphDomWidth = graphDom.scrollWidth;
    var barWidth = graphDomWidth / barNumber - barSpacing;

    var graphHeight = 300;

    var barChart = d3.select(".graph").append("svg:svg").attr("width", graphDomWidth).attr("height", graphHeight);

    barChart.selectAll("rect").data(data).enter().append("svg:rect").attr("x", function (_, index) {
        return index * (barWidth + barSpacing);
    }).attr("y", function (datum) {
        return graphHeight - datum.value * 100;
    }).attr("height", function (datum) {
        return datum.value * 100;
    }).attr("width", barWidth).attr("fill", "#888");

    barChart.selectAll("text").data(data).enter().append("svg:text").attr("x", function (_, index) {
        return index * (barWidth + barSpacing);
    }).attr("y", function (datum) {
        return graphHeight - datum.value * 100;
    }).text(function (datum) {
        return datum.tag;
    }).attr("dx", barWidth / 2).attr("dy", "2em").attr("fill", "white");

    document.querySelector(".guess").onchange = function (event) {
        data[1].tag = +event.target.value;
        var text = barChart.selectAll("text").data(data);
        text.merge(text).text(function (d) {
            return d.tag;
        });
    };

    document.querySelector(".confirm").onclick = function () {
        document.querySelector(".confirm").style.display = "none";
        var infoDom = document.querySelector(".info");
        var guess = Number(document.querySelector(".guess").value);
        var truth = data[1].value;
        infoDom.innerHTML = '\n            Your guess: ' + guess + ' <br />\n            True value: ' + truth.toFixed(2) + ' <br />\n            You\'re off by ' + ((guess - truth) / truth * 100).toFixed(2) + '%\n        ';
        document.querySelector('.play-again').style.display = 'block';

        history.push({
            scene: uiState.scene,
            truth: truth,
            guess: guess,
            time: Date.now()
        });
        localStorage.setItem('history', JSON.stringify(history));
    };
}

function resetUI() {
    document.querySelector('.graph').innerHTML = '';
    document.querySelector(".info").innerHTML = '';
    document.querySelector('.guess').value = 0;
    document.querySelector('.play-again').style.display = 'none';
    document.querySelector('.confirm').style.display = 'block';
}

document.querySelector('.play-again').onclick = function () {
    resetUI();
    if (uiState.scene === 'bar') {
        renderBarScene();
    }
};

renderBarScene();