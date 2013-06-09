/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />

interface ILine { 
    scale?: ID3LinearScale;
    axis?: ID3SvgAxis;
    line?: ID3Line;
};

var margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 700 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse;
var bisectDate = d3['bisector'](function (d) { return d.date.valueOf(); });


var makeYScale = function () {
    return d3.scale.linear().range([height, 0]);
};

var x = d3.time.scale().range([0, width]),
    yVisitsScale = makeYScale(),
    ySubscribersScale = makeYScale(),
    yConvScale = makeYScale(),
    yConfDisplayRatioScale = makeYScale(),
    yConfDisplayScale = makeYScale();

//#region axes

var ratioFormat = a => parseInt((a * 1000) + '') / 10 + '%';

var xAxis = d3.svg.axis().scale(x)
        .orient("bottom"),
    yVisitsAxis = d3.svg.axis().scale(yVisitsScale)
        .orient("left"),
    ySubscribersAxis = d3.svg.axis().scale(ySubscribersScale)
        .orient("right"),
    yConvAxis = d3.svg.axis().scale(yConvScale)
        .orient("right").tickFormat(ratioFormat),
    yConfDisplayAxis = d3.svg.axis().scale(yConfDisplayScale)
        .orient("right");

//#endregion

//#region lines

var makeLine = function () {
    return d3.svg.line().interpolate("basis").x(d => x(d.date));
};

var visitsLine = makeLine().y(d => yVisitsScale(d.visits)),
    convLine = makeLine().y(d => yConvScale(d.subscribers / d.visits)),
    subscribersLine = makeLine().y(d => ySubscribersScale(d.subscribers)),
    confDisplayRatioLine = makeLine().y(d => yConfDisplayRatioScale(d.confirmation_displayed / (d.launches || 1))),
    confDisplayLine = makeLine().y(d => yConfDisplayScale(d.confirmation_displayed));

//#endregion

d3.csv("/googleplay/gplay-perref.csv", function (raw) {

    //#region parser

    raw = raw.map(d => {

        d.date = parseDate(d.date);
        ['visits', 'installs', 'knownoc', 'launches', 'confirmation_displayed',
            'confirmation_rejected', 'subscribers'].forEach(n => d[n] = +d[n]);
        return d;

    });

    //#endregion

    x.domain(d3.extent(raw, d => d.date));

    _(raw).chain().groupBy(r => r.country).forEach(function (cgroup, country) {
        _(cgroup).chain().groupBy(r => r.service).forEach(function (sgroup, service) {
            _(sgroup).chain().groupBy(r => r.referrer).forEach(function (group, referrer) {

                yConvScale.domain([0,
                    d3.max(group.filter(d => d.visits > 100), d =>(d.subscribers / d.visits))
                ]);
                yVisitsScale.domain([0,
                  d3.max(group, d => d.visits)
                ]);
                yConfDisplayScale.domain([0, d3.max(group, d=>d.confirmation_displayed)]);

                var sum = group.map(v => v.visits).reduce((a, b) => a + b);
                if(sum<500)return;

                group = smooth(group, 7);

                var section = d3.select("body").append("section");
                section.append("h2").text(country + " " + service + " " + referrer);

                //#region svg

                var g = section.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .datum(group);

                //#endregion

                g.append("path").attr("class", "line visits").attr("d", visitsLine);
                g.append("path").attr("class", "line conversion").attr("d", convLine);
                g.append("path").attr("class", "line confDisplayRatio").attr("d", confDisplayRatioLine);
                g.append("path").attr("class", "line confDisplay").attr("d", confDisplayLine);

                //#region axes

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

                g.append("g")
                    .attr("class", "y axis confDisplay")
                    .attr('transform', 'translate(' + (20) + ',0)')
                    .call(yConfDisplayAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -10)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Confirmation Displays");


                g.append("g")
                    .attr("class", "y axis visits")
                    .call(yVisitsAxis)
                    .append("text")
                    .attr("transform", "rotate(-40)")
                    .attr("y", -15)
                    .attr("dy", ".81em")
                    .style("text-anchor", "end")
                    .text("Visits");

                //#endregion

                var focus = g.append("g")
         .attr("class", "focus")
         .style("display", "none");
                focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

                

                var mousemove = function () {
                    //console.log(x.invert(d3['mouse'](this)[0]));
                    var x0 = x.invert(d3['mouse'](this)[0]);
                    //i = bisectDate.right(group, x0.valueOf(), 1);
                    var i = group.filter(d => Math.abs(d.date - x0) < 24 * 60 * 60 * 1000);
                    console.log(i);
                    return;
                      var d0 = group[i - 1],
                      d1 = group[i],
                      d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    //console.log(x0)
                    focus.attr("transform", "translate(" + x(d.date) + "," + yVisitsScale(d.visits) + ")");
                    focus.select("text").text(d => d.visits);
                }


                g.append("rect")
                    .attr("class", "overlay")
                    .attr("width", width)
                    .attr("height", height)
                    .on("mouseover", function () { focus.style("display", null); })
                    .on("mouseout", function () { focus.style("display", "none"); })
                   // .on("mousemove", mousemove);
            });

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