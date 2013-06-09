/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/d3types.ts" />



var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%b-%d").parse;

var x = d3.time.scale()
    .range([0, width]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");


d3.csv("/costrev/costrev.csv", function (rawData:any[]) {
    var rawData = rawData.map(r => {
        var country = r;
        return {
            country: r.Country,
            data: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((date, i) => {
                return {
                    date: parseDate('2012-' + date + '-' + '1'),
                    cost: parseInt(country['Cost ' + date]),
                    rev: parseInt(country['Rev ' + date])
                };
            })
        };
    });
    xAxis.ticks(5);

    var svgs = d3.select("#graphs").selectAll("svg").data(rawData);
    svgs.enter().append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    svgs.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", (_data, index) => "main index-" + index);
        

    var svgG = svgs;
    var data = rawData.map(d => d.data);

    x.domain(d3.extent(data[0], d => d.date))

    var ys = rawData.map(r => {
        var _y = d3.scale.linear().range([height, 0]);
        _y.domain([
          d3.min(r.data, d => Math.min(d.cost, d.rev)),
          d3.max(r.data, d => Math.max(d.cost, d.rev))
        ]);
        return _y;
    });

    var y = d3.scale.linear().range([height, 0]);
    y.domain([
      d3.min(data[0], d => Math.min(d.cost, d.rev)),
      d3.max(data[0], d => Math.max(d.cost, d.rev))
    ]);

    var yAxes = function (index) {
        return d3.svg.axis()
            .scale(ys[index])
            .orient("right");
    };

    var revLines = function (index) {
        return d3.svg.area()
            .interpolate("basis")
            .x(d => x(d.date))
            .y(d => ys[index](d.rev));
    };

    var costLines = function (index) {
        return  d3.svg.area()
            .interpolate("basis")
            .x(d => x(d.date))
            .y(d => ys[index](d.cost));
    };

    var areas = _.range(0,data.length).map(index => d3.svg.area()
        .interpolate("basis")
        .x(d => x(d.date))
        .y(d => ys[index](d.cost)));


    svgG.data(data);


    svgG.append("clipPath")
        .attr("id", "clip-below")
        .append("path")
        .attr("d", (_data,index) => areas[index].y0(height).apply(this,arguments) )
        //.attr("d", area.y0(height) )

    svgG.append("clipPath")
        .attr("id", "clip-above")
        .append("path")
        .attr("d", (_data,index) => areas[index].y0(0).apply(this,arguments));
        //.attr("d", area.y0(0));

    svgG.append("path")
        .attr("class", "area above")
        .attr("clip-path", "url(#clip-above)")
        .attr("d", (_data,index) => areas[index].y0(d => ys[index](d.rev)).apply(this,arguments));
        //.attr("d", area.y0(d => y(d.rev)));




    svgG.append("path")
        .attr("class", "area below")
        .attr("clip-path", "url(#clip-below)")
        .attr("d", (_data, index) => areas[index].y0(d => ys[index](d.rev)).apply(this, arguments))
        //.attr("d", area);


    svgG.append("path")
        .attr("class", "line rev")
        .attr("d", (_data,index)=>revLines(index).apply(this,arguments));

    svgG.append("path")
        .attr("class", "line cost")
        .attr("d", (_data,index)=>costLines(index).apply(this,arguments));

    svgG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis)
        .append("text").text((d,i) => rawData[i].country)
        .attr('class', 'country');

    svgG.append("g")
        .attr("class", (_data,index) => "y axis index-"+index)
        .attr('transform', 'translate(0,2)')
        .attr("data-index", (_data, index) => index)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("USD");
    for (var i = 0; i < data.length;i++)
        yAxes(i)(svgG.selectAll("g.y.axis.index-" + i));
});
