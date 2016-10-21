localStorage.history = localStorage.history || "[]";

const uiState = {
    scene: 'bar'
};
const records = JSON.parse(localStorage.history);

function renderBarScene() {
    const maxMultiple = 5;
    const minMultiple = 0.5;

    const data = [
        {
            value: 1,
            tag: "1",
        },
        {
            value: minMultiple + Math.random() * (maxMultiple - minMultiple),
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

        records.push({
            scene: uiState.scene,
            truth,
            guess,
            time: Date.now(),
        });
        localStorage.history = JSON.stringify(records)
    };
}

function resetUI() {
    document.querySelector('.graph').innerHTML = '';
    document.querySelector(".info").innerHTML = '';
    document.querySelector('.guess').value = 0;
    document.querySelector('.guess').disabled = false;
    document.querySelector('.play-again').style.display = 'none';
    document.querySelector('.confirm').disabled = false;
}

document.querySelector('.play-again').onclick = () => {
    resetUI();
    if (uiState.scene === 'bar') {
        renderBarScene();
    }
};

renderBarScene();

