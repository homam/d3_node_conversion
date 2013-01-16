var margin = {
top: 10,
right: 30,
bottom: 30,
left: 30}, width = 960 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;
var parseDate = d3.time.format('%d/%m/%Y %H:%M:%S').parse;
var xAxisDateFormat = d3.time.format("%H:%M");
var epoch = parseDate('1/12/2013 00:00:00');
var epochPlus1 = parseDate('1/13/2013 00:00:00');
d3.csv("/histogram/Iraq_369.csv?", function (rawData) {
	rawData = rawData.reverse()
	epoch = parseDate(rawData[0].Visit);
	epochPlus1 = parseDate(rawData[rawData.length-1].Visit);
    var values = rawData.map(function (d) {
		var date = parseDate(d.Visit);
		var ep = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        return date.valueOf() - ep.valueOf();
    });
	window.values= values;
    var x = d3.scale.linear().domain(d3.extent(values)).range([
        0, 
        width
    ]);
    window['x'] = x;
    var bins = (d3).range(0, 25, 1).map(function (h) {
        return (h * 1000 * 60 * 60);
    });
    var datav = (d3.layout).histogram().bins(bins)(values);
    window['datav'] = datav;
    var values = rawData.filter(function (d) {
        return d.Sub != ' ';
    }).map(function (d) {
        return parseDate(d.Sub);
    }).filter(function (d) {
        return d >= epoch && d <= epochPlus1;
    }).map(function (d) {
		var date = d;
		var ep = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        return d.valueOf() - ep.valueOf();
    });
    var datas = (d3.layout).histogram().bins(bins)(values);
    window['datas'] = data;
    var data = datas.map(function (d, i) {
        var nd = {
            y: d.y / datav[i].y,
            x: d.x,
            dx: d.dx
        };
        return nd;
    });
    render(datav, x, (d3).format(",.0f"));
    render(datas, x, (d3).format(",.0f"));
    render(data, x, function (x) {
        return (Math.floor(x * 1000) / 10) + "%";
    });
});
var render = function (data, x, formatCount) {
    var y = d3.scale.linear().domain([
        0, 
        d3.max(data, function (d) {
            return d.y;
        })
    ]).range([
        height, 
        0
    ]);
    var xAxis = d3.svg.axis().scale(x).ticks(25).orient("bottom").tickFormat(function (d) {
        return xAxisDateFormat(new Date(epoch.valueOf() + d));
    });
    var osvg = d3.select("body").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
    var svg = osvg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var bar = svg.selectAll(".bar").data(data).enter().append("g").attr("class", "bar").attr("transform", function (d) {
        return "translate(" + x(d.x) + "," + y(d.y) + ")";
    });
    bar.append("rect").attr("x", 1).attr("width", x(data[0].dx) - 1).attr("height", function (d) {
        return height - y(d.y);
    });
    bar.append("text").attr("dy", ".75em").attr("y", 6).attr("x", x(data[0].dx) / 2).attr("text-anchor", "middle").text(function (d) {
        return formatCount(d.y);
    });
    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
};
