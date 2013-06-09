/// <reference path="../lib/d3types.ts" />


var margin = { top: 20, right: 50, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse;

var x = d3.time.scale().range([0, width]);

var yVisitsScale = d3.scale.linear().range([height, 0]);
var yConvScale = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yVisitsAxis = d3.svg.axis()
    .scale(yVisitsScale)
    .orient("left");

var yConvAxis = d3.svg.axis()
    .scale(yConvScale)
    .orient("right").tickFormat(a => parseInt(a*1000)/10 + '%');

var visitsLine = d3.svg.line()
    .interpolate("basis")
    .x(d => x(d.day))
    .y(d => yVisitsScale(d.visits));

var convLine = d3.svg.line()
    .interpolate("basis")
    .x(d => x(d.day))
    .y(d => yConvScale(d.subscribers / d.visits));


var svgG = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("/wapp155/wapp155.csv", function (data) {
    console.log(data);
    data.forEach(d => {
        d.day = parseDate(d.day);
        d.visits = +d.visits;
        d.subscribers = +d.subscribers;
    });
    console.log(data);

    x.domain(d3.extent(data, d => d.day));

    yVisitsScale.domain([
      0,
      d3.max(data, d => d.visits)
    ]);

    yConvScale.domain([
      0,
      d3.max(data, d => (d.subscribers / d.visits))
    ]);

    svgG.datum(data);

    svgG.append("path")
        .attr("class", "line")
        .attr("d", visitsLine);

    svgG.append("path")
        .attr("class", "line conversion")
        .attr("d", convLine);

    svgG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svgG.append("g")
        .attr("class", "y axis")
        .call(yVisitsAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Visits");

    svgG.append("g")
        .attr("class", "y axis conversion")
        .attr('transform', 'translate(' + (width)+ ',0)')
        .call(yConvAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Conversion");
});
