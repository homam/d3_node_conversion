var xAxisDateFormat = d3.time.format("%H:%M");
var margin = {
top: 10,
right: 30,
bottom: 30,
left: 30}, width = 960 - margin.left - margin.right, height = 220 - margin.top - margin.bottom;
d3.csv("/histogram/" + location.search.substr(1) + ".csv?", function (rawData) {
    var data = rawData.map(function (d) {
        return ({
            hour: +d.Hour,
            visit: +d.Visit,
            sub: +d.Sub
        });
    });
    var x = d3.scale.linear().domain([
        0, 
        24
    ]).range([
        0, 
        width
    ]);
    render(data.map(function (d) {
        return ({
            y: d.visit,
            x: d.hour,
            dx: 1
        });
    }), x, (d3).format(",.0f"));
    render(data.map(function (d) {
        return ({
            y: d.sub,
            x: d.hour,
            dx: 1
        });
    }), x, (d3).format(",.0f"));
    render(data.map(function (d) {
        return ({
            y: (d.sub / d.visit),
            x: d.hour,
            dx: 1
        });
    }), x, (d3).format("0.1%"));
});
var render = function (data, x, formatCount) {
    var y = d3.scale.linear().domain([
        0, 
        d3.max(data, function (d) {
            return d.y;
        })
    ]).range([
        height, 
        0
    ]);
    var xAxis = d3.svg.axis().scale(x).ticks(25).orient("bottom").tickFormat(function (d) {
        return d;
    });
    var svg = d3.select("body").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var bar = svg.selectAll(".bar").data(data).enter().append("g").attr("class", "bar").attr("transform", function (d) {
        return "translate(" + x(d.x) + "," + y(d.y) + ")";
    });
    bar.append("rect").attr("x", 1).attr("width", x(data[0].dx) - 1).attr("height", function (d) {
        return height - y(d.y);
    });
    bar.append("text").attr("dy", ".75em").attr("y", 6).attr("x", x(data[0].dx) / 2).attr("text-anchor", "middle").text(function (d) {
        return formatCount(d.y);
    });
    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
};
