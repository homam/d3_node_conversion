﻿/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />


var margin = { top: 20, right: 30, bottom: 30, left: 30 },
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var parseDate = d3.time.format("%m/%d/%Y").parse;

var x = d3.time.scale().range([0, width]);

var yVisitsScale = d3.scale.linear().range([height, 0]);
var yConvScale = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")

var yVisitsAxis = d3.svg.axis()
    .scale(yVisitsScale)
    .orient("left");

var yConvAxis = d3.svg.axis()
    .scale(yConvScale)
    .orient("right").tickFormat(a => parseInt((a*1000)+'')/10 + '%');

var visitsLine = d3.svg.line()
    .interpolate("basis")
    .x(d => x(d.day))
    .y(d => yVisitsScale(d.visits));

var convLine = d3.svg.line()
    .interpolate("basis")
    .x(d => x(d.day))
    .y(d => yConvScale(d.subscribers / d.visits));


d3.csv("/linkpin/Iraq_PIN_LinkPIN_Dummy.csv", function (raw) {
    raw.forEach(d => {

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

    raw = _(raw.map(r => [{
        subMethod: 'nonPIN Sub Methods',
        visits: r.nonPin.visits,
        submissions: r.nonPin.submissions,
        subscribers: r.nonPin.subscribers,
        type: r.type,
        day: r.day,
        page: r.page,
        Page: r.Page
        
    }, {
        subMethod: 'PIN Sub Method',
        visits: r.pin.visits,
        submissions: r.pin.submissions,
        subscribers: r.pin.subscribers,
        type: r.type,
        day: r.day,
        page: r.page,
        Page: r.Page
    }])).flatten();

    console.log(raw);
    
     var data = raw.filter(d => d.Page == raw[0].Page);

    x.domain(d3.extent(data, d => d.day));

    yVisitsScale.domain([
      0,
      d3.max(raw, d => d.visits)
    ]);
    yConvScale.domain([
      0,
      d3.max(raw, d => (d.subscribers / d.visits))
    ]);

    var nested =d3.nest().key(d => d.page).key(d => d.subMethod).key(d => d.type).entries(raw);
    console.log(nested);

    var pages = d3.select("body").append("section").selectAll("div.page").data(nested)
        .enter().append("div").attr("class", "page");
    pages.append("h2").text(d => d.key);

    var subMethods = pages.selectAll('div.subMethod').data(d => d.values)
        .enter().append("div").attr('class', 'subMethod');
    subMethods.append("h3").text(d => d.key);

    var types = subMethods.selectAll("div.type").data(d => d.values)
        .enter().append("div").attr('class', 'type');
    types.append("h4").text(d => d.key);
    
    
    var g =types.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .datum(d => d.values);
    g.append("path")//.attr('data-a', d=> console.log("arg", arguments))
        .attr("class", "line").attr("d", (d,i) => visitsLine.apply(this,arguments));
    
    g.append("path")//.attr('data-a', d=> console.log("arg", arguments))
        .attr("class", "line conversion").attr("d", (d,i) => convLine.apply(this,arguments));
        
        
        //types.append("div").selectAll("span.val").data(d => d.values)
        // .enter().append("span").attr("class", 'value').text(d =>JSON.stringify(d));
    

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    g.append("g")
        .attr("class", "y axis")
        .call(yVisitsAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Visits");

    g.append("g")
        .attr("class", "y axis conversion")
        .attr('transform', 'translate(' + (width)+ ',0)')
        .call(yConvAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Conversion");
});
