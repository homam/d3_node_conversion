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
    return x(d.day);
}).y(function (d) {
    return ySubscribersScale(d.subscribers);
});
var makeVisitsLine = (function () {
    var cache = {
    };
    return function (items) {
        var key = items[0].country + '__' + items[0].service;
        var line = cache[key];
        if(!!line) {
            return line;
        }
        var scale = makeVisitsScale(items);
        line = d3.svg.line().interpolate("basis").x(function (d) {
            return x(d.date);
        }).y(function (d) {
            return scale(d.visits);
        });
        cache[key] = line;
        return line;
    }
})();
var makeVisitsScale = (function () {
    var cache = {
    };
    return function (items) {
        var key = items[0].country + '__' + items[0].service;
        var scale = cache[key];
        if(!!scale) {
            return scale;
        }
        scale = d3.scale.linear().range([
            height, 
            0
        ]).domain([
            0, 
            d3.max(items, function (r) {
                return r.visits;
            })
        ]);
        cache[scale] = scale;
        return scale;
    }
})();
d3.csv("/googleplay/gplay.csv", function (raw) {
    var _this = this;
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
    yConvScale.domain([
        0, 
        d3.max(raw.filter(function (d) {
            return d.visits > 100;
        }), function (d) {
            return (d.subscribers / d.visits);
        })
    ]);
    yVisitsScale.domain([
        0, 
        d3.max(raw, function (d) {
            return d.visits;
        })
    ]);
    var nested = d3.nest().key(function (d) {
        return d.country;
    }).key(function (d) {
        return d.service;
    }).entries(raw);
    var countries = d3.select("body").append("section").selectAll("div.country").data(nested).enter().append("div").attr("class", "country");
    countries.append("h2").text(function (d) {
        return d.key;
    });
    var services = countries.selectAll('div.service').data(function (d) {
        return d.values;
    }).enter().append("div").attr('class', 'service');
    services.append("h3").text(function (d) {
        return d.key;
    });
    var g = services.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").datum(function (d) {
        return d.values;
    });
    g.append("path").attr("class", "line conversion").attr("d", function (d, i) {
        return convLine.apply(_this, [
            d
        ]);
    });
    g.append("path").attr("class", "line visits").attr("d", function (d, i) {
        return makeVisitsLine(d).apply(_this, [
            d
        ]);
    });
    g.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
    g.append("g").attr("class", "y axis conversion").attr('transform', 'translate(' + (width) + ',0)').call(yConvAxis).append("text").attr("transform", "rotate(-90)").attr("y", -10).attr("dy", ".71em").style("text-anchor", "end").text("Conversion");
    var yVisitsAxis = d3.svg.axis().scale(yVisitsScale).orient("left");
    g.append("g").attr("class", "y axis").call(yVisitsAxis).append("text").attr("transform", "rotate(-40)").attr("y", -15).attr("dy", ".81em").style("text-anchor", "end").text("Visits");
});
