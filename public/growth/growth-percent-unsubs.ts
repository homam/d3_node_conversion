/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />


var margin = { top: 100, right: 30, bottom: 30, left: 40 },
    width = 830 - margin.left - margin.right,
    height = 920 - margin.top - margin.bottom;

var parseDate = d3.time.format("%m/%d/%Y").parse;

var color = (<any>d3.scale).category20();

var xScale = d3.time.scale().range([0, width]);
var yScaleSubs = d3.scale.linear().range([height/2, 0]);

var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
var yAxisSubs = d3.svg.axis().scale(yScaleSubs).orient("left");

var subsArea = d3.svg.area().interpolate("basis")
    .x(d => xScale(d.day))
    .y0(d => yScaleSubs(d.y0))
    .y1(d => yScaleSubs(d.y0 + d.y));


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
    yScaleSubs.domain([0, 1]);

    var subscribers = stack(color.domain().map(name => {
        return {
            name:name,
            values: data.map(d => {
                var allSubs = _(subMethodNames.map(n => d[n])).reduce((a, b) => a + b, 0);
                return {day: d.day, y: d[name]/allSubs};
            })
        };
    }));

    var yAxisSubs = d3.svg.axis().scale(yScaleSubs).orient("left").tickFormat(d=>d*100);

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

   

    g.append("g").attr("class", "x axis")
        .attr("transform", "translate(0," + height/2 + ")")
        .call(xAxis);

    g.append("g").attr("class", "y axis")
        .call(yAxisSubs)
        .append("text").attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", ".81em")
        .style("text-anchor", "end").text("Sub Methods");

  

    var gLegend = svg.append("g").attr("transform", "rotate(-90) translate(-30,590)");
    var legend = gLegend.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g").attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect").
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

