; ;
var margin = {
    top: 20,
    right: 30,
    bottom: 30,
    left: 40
};
var width = 700 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse;
var makeYScale = function () {
    return d3.scale.linear().range([
        height, 
        0
    ]);
};
var x = d3.time.scale().range([
    0, 
    width
]);
var yVisitsScale = makeYScale();
var ySubscribersScale = makeYScale();
var yConvScale = makeYScale();
var yConfDisplayRatioScale = makeYScale();
var yConfDisplayScale = makeYScale();

var ratioFormat = function (a) {
    return parseInt((a * 1000) + '') / 10 + '%';
};
var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yVisitsAxis = d3.svg.axis().scale(yVisitsScale).orient("left");
var ySubscribersAxis = d3.svg.axis().scale(ySubscribersScale).orient("right");
var yConvAxis = d3.svg.axis().scale(yConvScale).orient("right").tickFormat(ratioFormat);
var yConfDisplayAxis = d3.svg.axis().scale(yConfDisplayScale).orient("right");

var makeLine = function () {
    return d3.svg.line().interpolate("basis").x(function (d) {
        return x(d.date);
    });
};
var visitsLine = makeLine().y(function (d) {
    return yVisitsScale(d.visits);
});
var convLine = makeLine().y(function (d) {
    return yConvScale(d.subscribers / d.visits);
});
var subscribersLine = makeLine().y(function (d) {
    return ySubscribersScale(d.subscribers);
});
var confDisplayRatioLine = makeLine().y(function (d) {
    return yConfDisplayRatioScale(d.confirmation_displayed / (d.launches || 1));
});
var confDisplayLine = makeLine().y(function (d) {
    return yConfDisplayScale(d.confirmation_displayed);
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
            yConfDisplayScale.domain([
                0, 
                d3.max(group, function (d) {
                    return d.confirmation_displayed;
                })
            ]);
            group = smooth(group, 7);
            var section = d3.select("body").append("section");
            section.append("h2").text(country + " " + service);
            var g = section.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").datum(group);
            g.append("path").attr("class", "line visits").attr("d", visitsLine);
            g.append("path").attr("class", "line conversion").attr("d", convLine);
            g.append("path").attr("class", "line confDisplayRatio").attr("d", confDisplayRatioLine);
            g.append("path").attr("class", "line confDisplay").attr("d", confDisplayLine);
            g.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
            g.append("g").attr("class", "y axis conversion").attr('transform', 'translate(' + (width) + ',0)').call(yConvAxis).append("text").attr("transform", "rotate(-90)").attr("y", -10).attr("dy", ".71em").style("text-anchor", "end").text("Conversion");
            g.append("g").attr("class", "y axis confDisplay").attr('transform', 'translate(' + (20) + ',0)').call(yConfDisplayAxis).append("text").attr("transform", "rotate(-90)").attr("y", -10).attr("dy", ".71em").style("text-anchor", "end").text("Confirmation Displays");
            g.append("g").attr("class", "y axis visits").call(yVisitsAxis).append("text").attr("transform", "rotate(-40)").attr("y", -15).attr("dy", ".81em").style("text-anchor", "end").text("Visits");
        });
    });
});
var smooth = function (raw, setSize) {
    var data = raw.map(function (r) {
        return _.clone(r);
    });
    var sum = function (arr) {
        return _(arr).reduce(function (a, b) {
            return a + b;
        }, 0);
    };
    var avg = function (arr) {
        return sum(arr) / arr.length;
    };
    var smoothed = data.map(function (d, i) {
        var nextSet = data.slice(i, i + setSize);
        for(var p in d) {
            if('number' == typeof (d[p])) {
                d[p] = avg(nextSet.map(function (i) {
                    return i[p];
                }));
            }
        }
        return d;
    });
    return smoothed;
};
