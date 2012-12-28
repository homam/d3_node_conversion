/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />


var margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 830 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%m/%d/%Y").parse;

var xScale = d3.time.scale().range([0, width]);
var yScale = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
var yAxis = d3.svg.axis().scale(yScale).orient("left");

var subsLine = d3.svg.line().interpolate("basis")
    .x(d => xScale(d.day))
    .y(d => yScale(d.Subs));
var subsArea = d3.svg.area().interpolate("basis")
    .x(d => xScale(d.day))
    .y0(height)
    .y1(d => yScale(d.Subs));
var directArea = d3.svg.area().interpolate("basis")
    .x(d => xScale(d.day))
    .y0(height)
    .y1(d => yScale(d.Direct));


d3.csv('/growth/du_bbay.csv', (raw:any[]) => {
    raw.forEach(d => {
        d.day = parseDate(d.Day);
        d.Subs = parseInt(d.Subs);
        d.Direct = parseInt(d['Direct Wap']);
        return d;
    });

    var data = raw;
    console.log(data.map(d => d.Direct))
    ///console.log(data);

  
    xScale.domain(d3.extent(data, d => d.day));
    yScale.domain([0, d3.max(data, d => d.Subs)]);


    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .datum(data);

    svg.append("path").attr("class", "line subs").attr("d",subsLine);
    svg.append("path").attr("class", "area subs").attr("d",subsArea);
    svg.append("path").attr("class", "area subs direct").attr("d",directArea);

    svg.append("g").attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g").attr("class", "y axis")
        .call(yAxis)
        .append("text").attr("transform", "rotate(-40)")
        .attr("y", 15)
        .attr("dy", ".81em")
        .style("text-anchor", "end").text("Visits");
});

