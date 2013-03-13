/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
var margin = {
top: 20,
right: 30,
bottom: 130,
left: 40}, width = 830 - margin.left - margin.right, height = 930 - margin.top - margin.bottom;
var parseDate = d3.time.format("%m/%d/%Y").parse;
var color = (d3.scale).category20();
var xScale = d3.time.scale().range([
    0, 
    width
]);
var yScale = d3.scale.linear().range([
    height, 
    0
]);
var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
var yAxis = d3.svg.axis().scale(yScale).orient("left");
var subsLine = d3.svg.line().interpolate("basis").x(function (d) {
    return xScale(d.day);
}).y(function (d) {
    return yScale(d.Subs);
});
var subsArea = d3.svg.area().interpolate("basis").x(function (d) {
    return xScale(d.day);
}).y0(function (d) {
    return yScale(d.y0);
}).y1(function (d) {
    return yScale(d.y0 + d.y);
});
var stack = d3.layout.stack().values(function (d) {
    return d.values;
});
stack = (stack).x(function (d) {
    return d.day;
}).y(function (d) {
    return d.y;
}).offset("wiggle");
var subMethodNames = [
    'Direct Wap', 
    'WEB Pin', 
    'Direct SMS', 
    'Web SMS', 
    'Wap SMS', 
    'Click Tag', 
    'Link Click', 
    'Java App', 
    'Link Pin', 
    'Wap Pin', 
    'Android', 
    'GooglePlay'
];
d3.csv('/growth/du_bbay.csv', function (raw) {
    raw.forEach(function (d) {
        d.day = parseDate(d.Day);
        d.Subs = parseInt(d.Subs);
        subMethodNames.forEach(function (sm) {
            d[sm] = +d[sm];
        });
        return d;
    });
    subMethodNames = _.chain(subMethodNames).map(function (s) {
        return ({
            name: s,
            total: _(raw.map(function (r) {
                return r[s];
            })).reduce(function (a, b) {
                return a + b;
            }, 0)
        });
    }).filter(function (s) {
        return s.total > 0;
    }).sortBy(function (s) {
        return -s.total;
    }).map(function (s) {
        return s.name;
    }).value();
    var data = raw;
    color.domain(subMethodNames);
    xScale.domain(d3.extent(data, function (d) {
        return d.day;
    }));
    yScale.domain([
        0, 
        d3.max(data, function (d) {
            return d.Subs;
        })
    ]);
    var subscribers = stack(color.domain().map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return {
                    day: d.day,
                    y: d[name]
                };
            })
        };
    }));
    var svg = d3.select("body").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var methods = g.selectAll('.subMethod').data(subscribers).enter().append("g").attr('class', function (d) {
        return 'subMethod ' + d.name;
    });
    methods.append("path").attr("class", "area subs").style('fill', function (d) {
        return color(d.name);
    }).attr("d", function (d) {
        return subsArea(d.values);
    });
    g.append("g").attr("class", "x axis").attr("transform", " translate(0," + height + ")").call(xAxis);
    var legend = g.selectAll(".legend").data(color.domain().slice().reverse()).enter().append("g").attr("class", "legend").attr("transform", function (d, i) {
        return "rotate(90) translate(" + (width + margin.bottom) + "," + (-height + margin.right / 2) + ")";
    });
    legend.append("rect").attr("transform", function (d, i) {
        return "translate(-18," + (i * 25) + ") rotate(-45)";
    }).attr("width", 18).attr("height", 18).style("fill", color);
    legend.append("text").attr("transform", function (d, i) {
        return "translate(-20," + (i * 25 + 10) + ") rotate(-45)";
    }).attr("dy", ".35em").style("text-anchor", "end").style("font-size", "12px").style("font-weight", "bold").style("fill", color).text(function (d) {
        return d;
    });
});
