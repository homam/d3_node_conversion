var margin = {
    top: 20,
    right: 30,
    bottom: 30,
    left: 40
};
var width = 600 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse;
var x = d3.time.scale().range([
    0, 
    width
]);
var yVisitsScale = d3.scale.linear().range([
    height, 
    0
]);
var ySubscribersScale = d3.scale.linear().range([
    height, 
    0
]);
var yConvScale = d3.scale.linear().range([
    height, 
    0
]);
var yConfDisplayRatio = d3.scale.linear().range([
    height, 
    0
]);
var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yVisitsAxis = d3.svg.axis().scale(yVisitsScale).orient("left");
var ySubscribersAxis = d3.svg.axis().scale(ySubscribersScale).orient("right");
var yConvAxis = d3.svg.axis().scale(yConvScale).orient("right").tickFormat(function (a) {
    return parseInt((a * 1000) + '') / 10 + '%';
});
var visitsLine = d3.svg.line().interpolate("basis").x(function (d) {
    return x(d.date);
}).y(function (d) {
    return yVisitsScale(d.visits);
});
var convLine = d3.svg.line().interpolate("basis").x(function (d) {
    return x(d.date);
}).y(function (d) {
    return yConvScale(d.subscribers / d.visits);
});
var subscribersLine = d3.svg.line().interpolate("basis").x(function (d) {
    return x(d.date);
}).y(function (d) {
    return ySubscribersScale(d.subscribers);
});
var confDisplayRatioLine = d3.svg.line().interpolate("basis").x(function (d) {
    return x(d.date);
}).y(function (d) {
    return yConfDisplayRatio(d.confirmation_displayed / (d.launches || 1));
});
d3.csv("/googleplay/gplay.csv", function (raw) {
    raw = raw.map(function (d) {
        d.date = parseDate(d.date);
        [
            'visits', 
            'installs', 
            'knownoc', 
            'launches', 
            'confirmation_displayed', 
            'confirmation_rejected', 
            'subscribers'
        ].forEach(function (n) {
            return d[n] = +d[n];
        });
        return d;
    });
    x.domain(d3.extent(raw, function (d) {
        return d.date;
    }));
    _(raw).chain().groupBy(function (r) {
        return r.country;
    }).forEach(function (cgroup, country) {
        _(cgroup).chain().groupBy(function (r) {
            return r.service;
        }).forEach(function (group, service) {
            var _this = this;
            yConvScale.domain([
                0, 
                d3.max(group.filter(function (d) {
                    return d.visits > 100;
                }), function (d) {
                    return (d.subscribers / d.visits);
                })
            ]);
            yVisitsScale.domain([
                0, 
                d3.max(group, function (d) {
                    return d.visits;
                })
            ]);
            var section = d3.select("body").append("section");
            section.append("h2").text(country + " " + service);
            var g = section.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").datum(group);
            g.append("path").attr("class", "line conversion").attr("d", function (d, i) {
                return convLine.apply(_this, [
                    d
                ]);
            });
            g.append("path").attr("class", "line visits").attr("d", function (d, i) {
                return visitsLine.apply(_this, [
                    d
                ]);
            });
            g.append("path").attr("class", "line confDisplay").attr("d", function (d, i) {
                return confDisplayRatioLine.apply(_this, [
                    d
                ]);
            });
            g.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
            g.append("g").attr("class", "y axis conversion").attr('transform', 'translate(' + (width) + ',0)').call(yConvAxis).append("text").attr("transform", "rotate(-90)").attr("y", -10).attr("dy", ".71em").style("text-anchor", "end").text("Conversion");
            var yVisitsAxis = d3.svg.axis().scale(yVisitsScale).orient("left");
            g.append("g").attr("class", "y axis visits").call(yVisitsAxis).append("text").attr("transform", "rotate(-40)").attr("y", -15).attr("dy", ".81em").style("text-anchor", "end").text("Visits");
        });
    });
});
