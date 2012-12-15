/// <reference path="../lib/d3types.ts" />


var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


var nyLine = d3.svg.area()
    .interpolate("basis")
    .x(d => x(d.date))
    .y(d => y(d["New York"]));

var sfLine = d3.svg.area()
    .interpolate("basis")
    .x(d => x(d.date))
    .y(d => y(d["San Francisco"]));

var area = d3.svg.area()
    .interpolate("basis")
    .x(d => x(d.date))
    .y(d => y(d["New York"]));

var svgG = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("difference_chart/ny_sf.tsv", function (data) {
    data.forEach(d => {
        d.date = parseDate(d.date);
        d["New York"] = +d["New York"];
        d["San Francisco"] = +d["San Francisco"];
    });

    x.domain(d3.extent(data, d => d.date));

    y.domain([
      d3.min(data, d => Math.min(d["New York"], d["San Francisco"])),
      d3.max(data, d => Math.max(d["New York"], d["San Francisco"]))
    ]);

    svgG.datum(data);


 svgG.append("clipPath")
      .attr("id", "clip-below")
      .append("path")
      .attr("d", area.y0(height));

 svgG.append("clipPath")
  .attr("id", "clip-above")
  .append("path")
  .attr("d", area.y0(0));

 svgG.append("path")
  .attr("class", "area above")
  .attr("clip-path", "url(#clip-above)")
  .attr("d", area.y0(d => y(d["San Francisco"])));


    svgG.append("path")
        .attr("class", "area below")
        .attr("clip-path", "url(#clip-below)")
        .attr("d", area);










    svgG.append("path")
        .attr("class", "line")
        .attr("d", nyLine);

    svgG.append("path")
        .attr("class", "line sf")
        .attr("d", sfLine);

    svgG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svgG.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature (ºF)");
});
