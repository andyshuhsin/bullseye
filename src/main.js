localStorage.history = localStorage.history || "[]";

const uiState = {
    scene: 'bar'
};
let records = JSON.parse(localStorage.history);
let score = +localStorage.sd;

function sd(records) {
    return records
            .map(record => Math.pow(record.truth - record.guess, 2))
            .reduce((a, b) => a + b, 0)
            / records.length;
}

// Map [0, +infinity) to [0, 100) inversely
function getScore(records) {
    const DEFAULT_SCORE = 0;
    const MAGIC_PARAMETER = 10;
    if (!records.length) {
        return DEFAULT_SCORE;
    }
    const x = sd(records);
    return (1 - (x / (x + MAGIC_PARAMETER))) * 100;
}

function renderBarScene() {
    const maxMultiple = 5;
    const minMultiple = 0.5;

    const nextTest = minMultiple + Math.random() * (maxMultiple - minMultiple);
    // Users shouldn't be expected to guess to an ultra-high accuracy
    const nextTestRouded = +nextTest.toFixed(2);

    const data = [
        {
            value: 1,
            tag: "1",
        },
        {
            value: nextTestRouded,
            tag: "?"
        },
    ];

    const barSpacing = 20;
    const barNumber = data.length;

    const graphDom = document.querySelector(".graph");
    const graphDomWidth = graphDom.scrollWidth;
    const graphDomHeight = graphDom.scrollHeight;
    const barWidth = graphDomWidth / barNumber - barSpacing;

    const graphHeight = graphDomHeight;

    const barChart = d3.select(".graph")
            .append("svg:svg")
            .attr("width", graphDomWidth)
            .attr("height", graphHeight);

    const heightScale = d3.scaleLinear()
            .domain([0, maxMultiple])
            .range([0, graphHeight]);

    barChart.selectAll("rect")
            .data(data).enter()
            .append("svg:rect")
            .attr("x", (_, index) =>
                    barSpacing / 2 + index * (barWidth + barSpacing)
            )
            .attr("y", datum => graphHeight - heightScale(datum.value))
            .attr("height", datum => heightScale(datum.value))
            .attr("width", barWidth)
            .attr("fill", "#888");

    barChart.selectAll("text")
            .data(data).enter()
            .append("svg:text")
            .attr("x", (_, index) =>
                    barSpacing / 2 + index * (barWidth + barSpacing)
            )
            .attr("y", datum => graphHeight - heightScale(datum.value))
            .text(datum => datum.tag)
            .attr("dx", barWidth/2)
            .attr("dy", "2em")
            .attr("text-anchor", "middle")
            .attr("fill", "white");

    document.querySelector(".guess").oninput = event => {
        data[1].tag = (+event.target.value).toFixed(2);
        const text = barChart.selectAll("text").data(data);
        text.merge(text).text(d => d.tag);
    };

    document.querySelector(".confirm").onclick = () => {
        document.querySelector(".confirm").disabled = true;
        document.querySelector(".guess").disabled = true;
        const infoDom = document.querySelector(".info");
        const guess = Number(document.querySelector(".guess").value);
        const truth = data[1].value;
        infoDom.innerHTML = `
            Your guess: ${guess} <br />
            True value: ${truth.toFixed(2)} <br />
            You're off by ${((guess - truth) / truth * 100).toFixed(2)}%
        `;
        document.querySelector('.play-again').style.display = 'inline-block';
        document.querySelector('.view-history').style.display = 'inline-block';
        refreshScore();

        records.push({
            scene: uiState.scene,
            truth,
            guess,
            time: Date.now(),
        });
        localStorage.history = JSON.stringify(records)
    };
}

function renderHistoryScene() {
    const maxMultiple = 5; // See renderBarScene()

    const graphDom = document.querySelector(".graph");
    graphDom.innerHTML = '';
    const graphDomWidth = graphDom.scrollWidth;
    const graphDomHeight = graphDom.scrollHeight;

    const xScale = d3.scaleLinear()
            .domain([0, maxMultiple])
            .range([0, graphDomWidth]);

    const yScale = d3.scaleLinear()
            .domain([0, maxMultiple])
            .range([0, graphDomHeight]);

    const historyChart = d3.select(".graph")
            .append("svg:svg")
            .attr("width", graphDomWidth)
            .attr("height", graphDomHeight);

    historyChart.selectAll('circle')
            .data(records).enter()
            .append('circle')
            .attr("r", 3.5)
            .attr("cx", datum => xScale(datum.guess))
            .attr("cy", datum => graphDomHeight - yScale(datum.truth))

    historyChart.append("line")
            .style("stroke", "black")
            .attr("x1", 0)
            .attr("y1", graphDomHeight)
            .attr("x2", xScale(maxMultiple))
            .attr("y2", 0);

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

document.querySelector('.play-again').onclick = () => {
    resetUI();
    if (uiState.scene === 'bar') {
        renderBarScene();
    }
};

document.querySelector('.view-history').onclick = () => {
    resetUI();
    renderHistoryScene();
    switchToHistoryControl();
};

document.querySelector(".history-control-ok").onclick = () => {
    resetUI();
    renderBarScene();
    switchToNormalControl();
};

document.querySelector(".clear-history").onclick = () => {
    records = [];
    localStorage.history = "[]";
    renderHistoryScene();
};

resetUI();
renderBarScene();
//renderHistoryScene();

