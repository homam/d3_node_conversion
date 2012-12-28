/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />


var margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 830 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var parseDate = d3.time.format("%m/%d/%Y").parse;

var color = (<any>d3.scale).category20();

var xScale = d3.time.scale().range([0, width]);
var yScale = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
var yAxis = d3.svg.axis().scale(yScale).orient("left");

var subsLine = d3.svg.line().interpolate("basis")
    .x(d => xScale(d.day))
    .y(d => yScale(d.Subs));
var subsArea = d3.svg.area().interpolate("basis")
    .x(d => xScale(d.day))
    .y0(d => yScale(d.y0))
    .y1(d => yScale(d.y0 + d.y));

var stack = d3.layout.stack().values(d => d.values);

var subMethodNames = ['Direct Wap', 'WEB Pin', 'Direct SMS', 'Web SMS', 'Wap SMS', 'Click Tag',
    'Link Click', 'Java App', 'Link Pin', 'Wap Pin', 'Android', 'GooglePlay'];

d3.csv('/growth/du_bbay.csv', (raw:any[]) => {
    raw.forEach(d => {
        d.day = parseDate(d.Day);
        d.Subs = parseInt(d.Subs);
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
    yScale.domain([0, d3.max(data, d => d.Subs)]);

    var subscribers = stack(color.domain().map(name => {
        return {
            name:name,
            values: data.map(d => {
                return {day: d.day, y: d[name]};
            })
        };
    }));

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var methods = g.selectAll('.subMethod').data(subscribers)
        .enter().append("g").attr('class',d => 'subMethod '  + d.name);

    methods.append("path").attr("class", "area subs")
        .attr("d",d => subsArea(d.values))
        .style('fill', d => color(d.name));

    g.append("g").attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    g.append("g").attr("class", "y axis")
        .call(yAxis)
        .append("text").attr("transform", "rotate(-40)")
        .attr("y", 15)
        .attr("dy", ".81em")
        .style("text-anchor", "end").text("Visits");



    
var legend = g.selectAll(".legend")
    .data(color.domain().slice().reverse())
    .enter().append("g").attr("class", "legend")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18).attr("height", 18)
    .style("fill", color);

legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => d);
});

