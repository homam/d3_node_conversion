/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />


var margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse;

var x = d3.time.scale().range([0, width]);

var yVisitsScale = d3.scale.linear().range([height, 0]);
var ySubscribersScale = d3.scale.linear().range([height, 0]);
var yConvScale = d3.scale.linear().range([height, 0]);
var yConfDisplayRatio = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")

var yVisitsAxis = d3.svg.axis()
    .scale(yVisitsScale)
    .orient("left");

var ySubscribersAxis = d3.svg.axis()
    .scale(ySubscribersScale)
    .orient("right");

var yConvAxis = d3.svg.axis()
    .scale(yConvScale)
    .orient("right").tickFormat(a => parseInt((a*1000)+'')/10 + '%');

var visitsLine = d3.svg.line()
    .interpolate("basis")
    .x(d => x(d.date))
    .y(d => yVisitsScale(d.visits));

var convLine = d3.svg.line()
    .interpolate("basis")
    .x(d => x(d.date))
    .y(d => yConvScale(d.subscribers / d.visits));

var subscribersLine = d3.svg.line()
    .interpolate("basis")
    .x(d => x(d.date))
    .y(d => ySubscribersScale(d.subscribers));

var confDisplayRatioLine = d3.svg.line().interpolate("basis")
    .x(d => x(d.date))
    .y(d => yConfDisplayRatio(d.confirmation_displayed / (d.launches || 1)));

d3.csv("/googleplay/gplay.csv", function (raw) {

    raw = raw.map(d => {

        d.date = parseDate(d.date);
        ['visits', 'installs', 'knownoc', 'launches', 'confirmation_displayed',
            'confirmation_rejected', 'subscribers'].forEach(n => d[n] = +d[n]);
        return d;

    });

    x.domain(d3.extent(raw, d => d.date));

    _(raw).chain().groupBy(r => r.country).forEach(function (cgroup, country) {
        _(cgroup).chain().groupBy(r => r.service).forEach(function (group, service) {

            yConvScale.domain([0,
            d3.max(group.filter(d => d.visits > 100), d =>(d.subscribers / d.visits))
            ]);
            yVisitsScale.domain([0,
              d3.max(group, d => d.visits)
            ]);

            group = smooth(group, 7);

            var section = d3.select("body").append("section");
            section.append("h2").text(country + " " + service);

            var g = section.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .datum(group);

            g.append("path")
                .attr("class", "line conversion").attr("d", (d, i) => convLine.apply(this, [d]));
            g.append("path")
                .attr("class", "line visits").attr("d", (d, i) => visitsLine.apply(this, [d]));

            g.append("path")
                .attr("class", "line confDisplay").attr("d", confDisplayRatioLine);

            g.append("g")
           .attr("class", "x axis")
           .attr("transform", "translate(0," + height + ")")
           .call(xAxis);

            g.append("g")
                .attr("class", "y axis conversion")
                .attr('transform', 'translate(' + (width) + ',0)')
                .call(yConvAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -10)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Conversion");


            var yVisitsAxis = d3.svg.axis()
                .scale(yVisitsScale)
             .orient("left");



            g.append("g")
                .attr("class", "y axis visits")
                .call(yVisitsAxis)
                .append("text")
                .attr("transform", "rotate(-40)")
                .attr("y", -15)
                .attr("dy", ".81em")
                .style("text-anchor", "end")
                .text("Visits");

        });

    });

   
 
});



var smooth = function (raw: any[],setSize:number) {
    var data = raw.map(r => _.clone(r));
    var sum = (arr: number[]) => _(arr).reduce((a, b) => a + b, 0);
    var avg = (arr: number[]) => sum(arr) / arr.length;
    var smoothed = data.map((d, i) => {
        var nextSet = data.slice(i, i + setSize);
        for (var p in d) {
            if ('number' == typeof (d[p])) {
                d[p] = avg(nextSet.map(i => i[p]));
            }
        }
        return d;
    });
    return smoothed;
};