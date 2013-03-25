/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
var margin = {
top: 20,
right: 30,
bottom: 30,
left: 40}, width = 430 - margin.left - margin.right, height = 300 - margin.top - margin.bottom;
var parseDate = d3.time.format("%m/%d/%Y").parse;
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
    return x(d.day);
}).y(function (d) {
    return yVisitsScale(d.visits);
});
var convLine = d3.svg.line().interpolate("basis").x(function (d) {
    return x(d.day);
}).y(function (d) {
    return yConvScale(d.subscribers / d.visits);
});
var subscribersLine = d3.svg.line().interpolate("basis").x(function (d) {
    return x(d.day);
}).y(function (d) {
    return ySubscribersScale(d.subscribers);
});
d3.csv("/linkpin/Iraq_PIN_LinkPIN_Dummy.csv", function (raw) {
    var _this = this;
    raw.forEach(function (d) {
        d.day = parseDate(d.Day);
        d.page = d.Page.split('^')[0];
        d.type = d.Page.split('^')[1];
        d.nonPin = {
            visits: +d.NONPIN_Visits,
            submissions: +d.NONPIN_Submissions,
            subscribers: +d.NONPIN_Subscribers
        };
        d.pin = {
            visits: +d.PIN_Visits,
            submissions: +d.PIN_Submissions,
            subscribers: +d.PIN_Subscribers
        };
        d.subscribers = d.pin.subscribers + d.nonPin.subscribers;
        d.visits = d.pin.visits + d.nonPin.visits;
    });
    raw = _(raw.map(function (r) {
        return [
            {
                subMethod: 'Non-PIN Sub Methods',
                visits: r.nonPin.visits,
                submissions: r.nonPin.submissions,
                subscribers: r.nonPin.subscribers,
                type: r.type,
                day: r.day,
                jDay: JSON.stringify(r.day),
                page: r.page,
                Page: r.Page
            }, 
            {
                subMethod: 'PIN and LinkPIN Sub Methods',
                visits: r.pin.visits,
                submissions: r.pin.submissions,
                subscribers: r.pin.subscribers,
                type: r.type,
                day: r.day,
                jDay: JSON.stringify(r.day),
                page: r.page,
                Page: r.Page
            }
        ];
    })).flatten();
    console.log(raw);
    var data = raw.filter(function (d) {
        return d.Page == raw[0].Page;
    });
    x.domain(d3.extent(data, function (d) {
        return d.day;
    }));
    yVisitsScale.domain([
        0, 
        d3.max(raw, function (d) {
            return d.visits;
        })
    ]);
    ySubscribersScale.domain([
        0, 
        d3.max(raw, function (d) {
            return d.subscribers * 2;
        })
    ]);
    //*2 because LinkPIN + PIN
    yConvScale.domain([
        0, 
        d3.max(raw, function (d) {
            return (d.subscribers / d.visits);
        })
    ]);
    var nested = d3.nest().key(function (d) {
        return d.page;
    }).key(function (d) {
        return d.subMethod;
    }).key(function (d) {
        return d.type;
    }).entries(raw);
    console.log(nested);
    var pages = d3.select("body").append("section").selectAll("div.page").data(nested).enter().append("div").attr("class", "page");
    pages.append("h2").text(function (d) {
        return d.key;
    });
    var subMethods = pages.selectAll('div.subMethod').data(function (d) {
        return d.values;
    }).enter().append("div").attr('class', 'subMethod');
    subMethods.append("h3").text(function (d) {
        return d.key;
    });
    //var types = subMethods.selectAll("div.type").data(d => d.values)
    //    .enter().append("div").attr('class', 'type');
    //types.append("h4").text(d => d.key);
    var g = subMethods.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").datum(function (d) {
        return d.values;
    });
    [
        'PIN', 
        'LinkPIN'
    ].forEach(function (subMethod) {
        var _this = this;
        g.append("path").attr(//.attr('data-a', d=> console.log("arg", arguments))
        "class", "line visits " + subMethod).attr("d", function (d, i) {
            return visitsLine.apply(_this, [
                _(d).filter(function (i) {
                    return i.key == subMethod;
                })[0].values
            ]);
        });
        g.append("path").attr(//.attr('data-a', d=> console.log("arg", arguments))
        "class", "line conversion " + subMethod).attr("d", function (d, i) {
            return convLine.apply(_this, [
                _(d).filter(function (i) {
                    return i.key == subMethod;
                })[0].values
            ]);
        });
    });
    g.append("path").attr("class", "line subscribers").attr("d", function (d, i) {
        return subscribersLine.apply(_this, [
            _(d[0].values.map(function (v) {
                return v.jDay;
            })).union(d[1].values.map(function (v) {
                return v.jDay;
            })).map(function (day) {
                var pins = d[0].values.filter(function (v) {
                    return v.jDay == day;
                })[0];
                var linkpins = d[1].values.filter(function (v) {
                    return v.jDay == day;
                })[0];
                return {
                    subscribers: (!!pins ? pins.subscribers : 0) + (!!linkpins ? linkpins.subscribers : 0),
                    day: (!!pins ? pins.day : linkpins.day)
                };
            })
        ]);
    });
    //types.append("div").selectAll("span.val").data(d => d.values)
    // .enter().append("span").attr("class", 'value').text(d =>JSON.stringify(d));
    g.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
    g.append("g").attr("class", "y axis").call(yVisitsAxis).append("text").attr("transform", "rotate(-40)").attr("y", -15).attr("dy", ".81em").style("text-anchor", "end").text("Visits");
    g.append("g").attr("class", "y axis subscribers").attr('transform', 'translate(' + (0) + ',0)').call(ySubscribersAxis).append("text").attr("transform", "rotate(-40) translate(60,40)").style(//.attr("y", 36)
    //.attr("dy", "1.71em")
    "text-anchor", "end").text("Subscribers");
    g.append("g").attr("class", "y axis conversion").attr('transform', 'translate(' + (width) + ',0)').call(yConvAxis).append("text").attr("transform", "rotate(-90)").attr("y", -10).attr("dy", ".71em").style("text-anchor", "end").text("Conversion");
});
