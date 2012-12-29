/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
var Dashboard;
(function (Dashboard) {
    (function (Growth) {
        var adjustHeightByMargin = function (height, margin) {
            return height - margin.top - margin.bottom;
        };
        var adjustWidthByMargin = function (width, margin) {
            return width - margin.left - margin.right;
        };
        var _margin = {
top: 20,
right: 30,
bottom: 30,
left: 40        }, _width = adjustWidthByMargin(880, _margin), _height = adjustHeightByMargin(500, _margin);
        var _subMethodNames = [
            'Direct Wap', 
            'WEB Pin', 
            'Direct SMS', 
            'Web SMS', 
            'Wap SMS', 
            'Click Tag', 
            'Link Click', 
            'Java App', 
            'Link Pin', 
            'Wap Pin', 
            'Android', 
            'GooglePlay'
        ];
        Growth.subMethodNames = _subMethodNames;
        var DataLoader = (function () {
            function DataLoader(url) {
                this.url = url;
            }
            DataLoader.prototype.load = function () {
                if(!this.loader) {
                    this.loader = $.Deferred();
                    var self = this;
                    d3.csv(self.url, function (raw) {
                        var parseDate = d3.time.format("%m/%d/%Y").parse;
                        raw.forEach(function (d) {
                            d.day = parseDate(d.Day);
                            d.Subs = parseInt(d.Subs);
                            d.ActiveSubs = +d['Active Subs'];
                            d.Unsubs = +d['Un Subs'];
                            _subMethodNames.forEach(function (sm) {
                                d[sm] = +d[sm];
                            });
                            return d;
                        });
                        var movingAverage = 7;
                        if(movingAverage > 1) {
                            var floor = function (a) {
                                return Math.floor(a / movingAverage);
                            };
                            var movingAvgData = _(raw).reduce(function (a, b, i) {
                                var index = floor(i);
                                var arr = a[index];
                                if(!arr) {
                                    arr = [];
                                    a[index] = [];
                                }
                                arr.push(b);
                                return a;
                            }, []);
                            var sum = function (arr) {
                                return _(arr).reduce(function (a, b) {
                                    return a + b;
                                }, 0);
                            };
                            var avg = function (arr) {
                                return sum(arr) / arr.length;
                            };
                            raw = _(movingAvgData).map(function (a) {
                                var res = {
                                    day: a[floor(avg([
                                        0, 
                                        a.length
                                    ]))].day
                                };
                                for(var p in a[0]) {
                                    if('number' == typeof (a[0][p])) {
                                        res[p] = avg(a.map(function (d) {
                                            return d[p];
                                        }));
                                    }
                                }
                                return res;
                            });
                        }
                        self.loader.resolve(raw);
                    });
                }
                return this.loader;
            };
            return DataLoader;
        })();
        Growth.DataLoader = DataLoader;        
        var Graph = (function () {
            function Graph(loader, selector, margin, width, height) {
                margin = $.extend(_.clone(_margin), margin || {
                });
                width = adjustWidthByMargin(width || _width, margin);
                height = adjustHeightByMargin(height || _height, margin);
                var svg = d3.select(selector).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
                var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                this.width = width;
                this.height = height;
                this.margin = margin;
                this.svg = svg;
                this.g = g;
                this.xScale = d3.time.scale().range([
                    0, 
                    width
                ]);
                this.yScale = d3.scale.linear().range([
                    height, 
                    0
                ]);
                this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom");
                this.yAxis = d3.svg.axis().scale(this.yScale).orient("left");
                var self = this;
                loader.load().done(function (data) {
                    self.xScale.domain(d3.extent(data, function (d) {
                        return d.day;
                    }));
                    self.draw(data);
                });
            }
            Graph.prototype.draw = function (data) {
                console.log("not implemented");
            };
            Graph.prototype.drawXAxis = function () {
                var g = this.g, xAxis = this.xAxis, height = this.height;
                xAxis.tickSize(-this.height, -this.height, -this.height);
                g.append("g").attr("class", "x axis").attr("transform", "translate(0," + (height) + ")").call(xAxis).selectAll('g text').attr("transform", "translate(0,5)");
                return this;
            };
            Graph.prototype.drawYAxis = function (label, lineTicks) {
                if (typeof lineTicks === "undefined") { lineTicks = true; }
                var g = this.g, yAxis = this.yAxis;
                var axis = this.drawCustomYAxis(g, yAxis, lineTicks);
                axis.label.attr("transform", "rotate(-90) translate(-5,12)").style("text-anchor", "end").text(label);
                return this;
            };
            Graph.prototype.drawCustomYAxis = function (g, yAxis, lineTicks) {
                if (typeof lineTicks === "undefined") { lineTicks = false; }
                if(lineTicks) {
                    yAxis.tickSize(-this.width);
                }
                var gAxis = g.append("g").attr("class", "y axis");
                var tickGroups = gAxis.call(yAxis);
                var texts = tickGroups.selectAll('g text').attr("transform", "translate(-2,0)");
                var label = gAxis.append("text");
                return {
                    group: gAxis,
                    tickGroups: tickGroups,
                    texts: texts,
                    label: label
                };
            };
            return Graph;
        })();
        Growth.Graph = Graph;        
    })(Dashboard.Growth || (Dashboard.Growth = {}));
    var Growth = Dashboard.Growth;
})(Dashboard || (Dashboard = {}));
