/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />


var margin = { top: 100, right: 30, bottom: 30, left: 40 },
    width = 830 - margin.left - margin.right,
    height = 920 - margin.top - margin.bottom;

var parseDate = d3.time.format("%m/%d/%Y").parse;

var color = (<any>d3.scale).category20();

var xScale = d3.time.scale().range([0, width]);
var yScaleSubs = d3.scale.linear().range([height/2, 0]);
var yScaleUnsubs = d3.scale.linear().range([height/2, height]);

var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
var yAxisSubs = d3.svg.axis().scale(yScaleSubs).orient("left");
var yAxisUnsubs = d3.svg.axis().scale(yScaleUnsubs).orient("left");

var subsLine = d3.svg.line().interpolate("basis")
    .x(d => xScale(d.day))
    .y(d => yScaleSubs(d.Subs));
var unsubsLine = d3.svg.line().interpolate("basis")
    .x(d => xScale(d.day))
    .y(d => yScaleUnsubs(d.Unsubs));
var subsLineInUnsubsArea =d3.svg.line().interpolate("basis")
    .x(d => xScale(d.day))
    .y(d => yScaleUnsubs(d.Subs));
var subsArea = d3.svg.area().interpolate("basis")
    .x(d => xScale(d.day))
    .y0(d => yScaleSubs(d.y0))
    .y1(d => yScaleSubs(d.y0 + d.y));
var unsubsArea = d3.svg.area().interpolate("basis")
    .x(d => xScale(d.day))
    .y0(d => height/2)
    .y1(d => yScaleUnsubs(d.Unsubs));
var subsAreaInUnsubsArea = d3.svg.area().interpolate("basis")
    .x(d => xScale(d.day))
    .y0(d => height/2)
    .y1(d => yScaleUnsubs(d.Subs));

var stack = d3.layout.stack().values(d => d.values);

var subMethodNames = ['Direct Wap', 'WEB Pin', 'Direct SMS', 'Web SMS', 'Wap SMS', 'Click Tag',
    'Link Click', 'Java App', 'Link Pin', 'Wap Pin', 'Android', 'GooglePlay'];

d3.csv('/growth/du_bbay.csv', (raw:any[]) => {
    raw.forEach(d => {
        d.day = parseDate(d.Day);
        d.Subs = parseInt(d.Subs);
        d.Unsubs = +d['Un Subs'];
        subMethodNames.forEach(sm => {
            d[sm] = +d[sm];
        });
        return d;
    });

    subMethodNames = _.chain(subMethodNames).map(s => ({
            name: s, 
            total: _( raw.map(r => r[s])).reduce((a,b) =>a+b,0) }))
        .filter(s => s.total>0)
        .sortBy(s => -s.total)
        .map(s => s.name).value();

    var data = raw;
 
    color.domain(subMethodNames);
  
    xScale.domain(d3.extent(data, d => d.day));
    var maxOfYScales = d3.max([d3.max(data, d => d.Subs),d3.max(data, d => d.Unsubs)]);
    yScaleSubs.domain([0, maxOfYScales]);
    yScaleUnsubs.domain([0, maxOfYScales]);

    var subscribers = stack(color.domain().map(name => {
        return {
            name:name,
            values: data.map(d => {
                return {day: d.day, y: d[name]};
            })
        };var yAxisSubs = d3.svg.axis().scale(yScaleSubs).orient("left");
    }));

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    g.selectAll('.subMethod').data(subscribers)
        .enter().append("g").attr('class',d => 'subMethod '  + d.name)
        .append("path").attr("class", "area subs")
        .attr("d",d => subsArea(d.values))
        .style('fill', d => color(d.name));

    g.append("path").datum(data)
        .attr('class', 'line unsubs').attr('d', unsubsLine);
    g.append("path").datum(data)
        .attr('class', 'area unsubs').attr('d', unsubsArea);
    g.append("path").datum(data)
        .attr('class', 'line subs').attr('d', subsLineInUnsubsArea);
    g.append("path").datum(data)
        .attr('class', 'area subs inUnsubsArea').attr('d', subsAreaInUnsubsArea);

    g.append("g").attr("class", "x axis")
        .attr("transform", "translate(0," + height/2 + ")")
        .call(xAxis);

    g.append("g").attr("class", "y axis")
        .call(yAxisSubs)
        .append("text").attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", ".81em")
        .style("text-anchor", "end").text("Sub Methods");

     g.append("g").attr("class", "y axis")
        .call(yAxisUnsubs)
        .append("text").attr("transform", "rotate(-90) translate( " + -(height-80) + " , 0 )")
        .attr("y", 5)
        .attr("dy", ".81em")
        .style("text-anchor", "end").text("Subs vs Unsubs");



    var gLegend = svg.append("g").attr("transform", "rotate(-90) translate(-30,590)");
    var legend = gLegend.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g").attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect").
        //.attr("transform", (d,i) => "translate(" + (i*20) + "," + 0 + ") rotate(-45)")
        attr("x", 0)
        .attr("width", 18).attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", -10)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("fill", color)
        .text(d => d);
});

