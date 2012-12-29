var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../growth/dashboard.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
var Dashboard;
(function (Dashboard) {
    (function (WebPageStats) {
        var DataLoader = (function () {
            function DataLoader(url) {
                this.url = url;
            }
            DataLoader.prototype.load = function () {
                if(!this.loader) {
                    this.loader = $.Deferred();
                    var self = this;
                    d3.csv(self.url, function (raw) {
                        var parseDate = d3.time.format("%d/%m/%Y").parse;
                        raw.forEach(function (d) {
                            d.day = parseDate(d.Day);
                            d.Visits = +d['Visits'];
                            d.Submissions = +d['Submissions'];
                            d.Active_12 = +d['Active_12'];
                            d.Subs = parseInt(d.Subscribers);
                            d.ActiveSubs = +d['Active Subs'];
                            d.Conv = d.Subs / d.Visits;
                            return d;
                        });
                        self.loader.resolve(raw);
                    });
                }
                return this.loader;
            };
            return DataLoader;
        })();
        WebPageStats.DataLoader = DataLoader;        
        var PageStatsGraph = (function (_super) {
            __extends(PageStatsGraph, _super);
            function PageStatsGraph(loader) {
                        _super.call(this, loader, 'body', null, null, null);
            }
            PageStatsGraph.prototype.draw = function (data) {
                var movingAverage = 7;
                if(movingAverage > 1) {
                    var floor = function (a) {
                        return Math.floor(a / movingAverage);
                    };
                    var movingAvgData = _(data).reduce(function (a, b, i) {
                        var index = floor(i);
                        var arr = a[index];
                        if(!arr) {
                            arr = [];
                            a[index] = [];
                        }
                        arr.push(b);
                        return a;
                    }, []);
                    //console.log(movingAvgData)
                    var sum = function (arr) {
                        return _(arr).reduce(function (a, b) {
                            return a + b;
                        }, 0);
                    };
                    var avg = function (arr) {
                        return sum(arr) / arr.length;
                    };
                    data = _(movingAvgData).map(function (a) {
                        return {
                            Visits: avg(a.map(function (d) {
                                return d.Visits;
                            })),
                            Conv: avg(a.map(function (d) {
                                return d.Conv;
                            })),
                            day: a[floor(avg([
                                0, 
                                a.length
                            ]))].day
                        };
                    });
                }
                var xScale = this.xScale, yScale = this.yScale, height = this.height, g = this.g.datum(data);
                yScale.domain([
                    d3.min(data, function (d) {
                        return d.Visits;
                    }), 
                    d3.max(data, function (d) {
                        return d.Visits;
                    })
                ]);
                var visitsLine = d3.svg.line().interpolate("basis").x(function (d) {
                    return xScale(d.day);
                }).y(function (d) {
                    return yScale(d.Visits);
                });
                g.append("path").attr("class", "visits line").attr("d", visitsLine);
                this.drawXAxis().drawYAxis('Visits');
                var convScale = yScale.domain([
                    0, 
                    d3.max(data, function (d) {
                        return d.Conv;
                    })
                ]);
                var convLine = d3.svg.line().interpolate("basis").x(function (d) {
                    return xScale(d.day);
                }).y(function (d) {
                    return convScale(d.Conv);
                });
                g.append("path").attr("class", "conversion line").attr("d", convLine);
                var gAxis = this.drawCustomYAxis(this.g, d3.svg.axis().scale(convScale).orient("right"), false);
                gAxis.group.attr('transform', 'translate(' + this.width + ',0)').attr('class', gAxis.group.attr('class') + ' conversion');
                gAxis.texts.text(function (d) {
                    return (d * 1000) / 10 + '%';
                });
                gAxis.label.attr("transform", "rotate(-90) translate(-5,-8)").style("text-anchor", "end").text('Conversion');
            };
            return PageStatsGraph;
        })(Dashboard.Growth.Graph);
        WebPageStats.PageStatsGraph = PageStatsGraph;        
    })(Dashboard.WebPageStats || (Dashboard.WebPageStats = {}));
    var WebPageStats = Dashboard.WebPageStats;
})(Dashboard || (Dashboard = {}));