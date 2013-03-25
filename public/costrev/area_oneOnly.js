/// <reference path="../lib/d3types.ts" />
var margin = {
top: 20,
right: 20,
bottom: 30,
left: 50}, width = 960 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;
var parseDate = d3.time.format("%Y-%b-%d").parse;
var x = d3.time.scale().range([
    0, 
    width
]);
var y = d3.scale.linear().range([
    height, 
    0
]);
var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");
var revLine = d3.svg.area().interpolate("basis").x(function (d) {
    return x(d.date);
}).y(function (d) {
    return y(d.cost);
});
var costLine = d3.svg.area().interpolate("basis").x(function (d) {
    return x(d.date);
}).y(function (d) {
    return y(d.rev);
});
var area = d3.svg.area().interpolate("basis").x(function (d) {
    return x(d.date);
}).y(function (d) {
    return y(d.cost);
});
var svgG = d3.select("body").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.csv("/costrev/costrev.csv", function (rawData) {
    var _this = this;
    var svgs = d3.select("#graphs").selectAll("svg").data(rawData);
    svgs.enter().append("svg");
    svgs.call(function (_svgs) {
        return console.log(_svgs);
    });
    var country = rawData[2];
    var data = [
        'Aug', 
        'Sep', 
        'Oct', 
        'Nov', 
        'Dec'
    ].map(function (date, i) {
        return {
            date: parseDate('2012-' + date + '-' + '1'),
            cost: parseInt(country['Cost ' + date]),
            rev: parseInt(country['Rev ' + date])
        };
    });
    xAxis.ticks(5);
    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    y.domain([
        d3.min(data, function (d) {
            return Math.min(d.cost, d.rev);
        }), 
        d3.max(data, function (d) {
            return Math.max(d.cost, d.rev);
        })
    ]);
    svgG.datum(data);
    svgG.append("clipPath").attr("id", "clip-below").append("path").attr("d", area.y0(height));
    svgG.append("clipPath").attr("id", "clip-above").append("path").attr("d", area.y0(0));
    svgG.append("path").attr("class", "area above").attr("clip-path", "url(#clip-above)").attr("d", area.y0(function (d) {
        return y(d.rev);
    }));
    svgG.append("path").attr("class", "area below").attr("clip-path", "url(#clip-below)").attr("d", area);
    svgG.append("path").attr("class", "line").attr("d", revLine);
    svgG.append("path").attr("class", "line sf").attr("d", costLine);
    svgG.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
    svgG.append("g").attr("class", "y axis").call(function () {
        console.log("call", arguments);
        return yAxis.apply(_this, arguments);
    }).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("USD");
});
