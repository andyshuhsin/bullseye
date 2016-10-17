const data = [
    {
        value: 1,
        tag: "1",
    },
    {
        value: 1 + Math.random() * 2,
        tag: "?"
    },
];

const barSpacing = 20;
const barNumber = data.length;

const graphDom = document.querySelector(".graph");
const graphDomWidth = graphDom.scrollWidth;
const barWidth = graphDomWidth / barNumber - barSpacing;

const graphHeight = 300;

const barChart = d3.select(".graph")
        .append("svg:svg")
        .attr("width", graphDomWidth)
        .attr("height", graphHeight);

barChart.selectAll("rect")
        .data(data).enter()
        .append("svg:rect")
        .attr("x", (_, index) => index * (barWidth + barSpacing))
        .attr("y", datum => graphHeight - datum.value * 100)
        .attr("height", datum => datum.value * 100)
        .attr("width", barWidth)
        .attr("fill", "#888");

barChart.selectAll("text")
        .data(data).enter()
        .append("svg:text")
        .attr("x", (_, index) => index * (barWidth + barSpacing))
        .attr("y", datum => graphHeight - datum.value * 100)
        .text(datum => datum.tag)
        .attr("dx", barWidth/2)
        .attr("dy", "2em")
        .attr("fill", "white");

document.querySelector(".guess").onchange = event => {
    data[1].tag = +event.target.value;
    const text = barChart.selectAll("text").data(data);
    text.merge(text).text(d => d.tag);
};

document.querySelector(".confirm").onclick = () => {
    document.querySelector(".confirm").style.display = "none";
    const infoDom = document.querySelector(".info");
    const guess = document.querySelector(".guess").value;
    const truth = data[1].value;
    infoDom.innerHTML = `
        Your guess: ${guess} <br />
        True value: ${truth.toFixed(2)} <br />
        You're off by ${((guess - truth) / truth * 100).toFixed(2)}%
    `;
    document.querySelector('.play-again').style.display = 'block';
};

document.querySelector('.play-again').onclick =
        () => window.location.reload();
