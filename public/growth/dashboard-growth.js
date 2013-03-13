var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="dashboard.ts" />
var Dashboard;
(function (Dashboard) {
    (function (Growth) {
        var GrowthGraph = (function (_super) {
            __extends(GrowthGraph, _super);
            function GrowthGraph(loader, smoother) {
                        _super.call(this, loader, smoother, "body", null, null, 300);
            }
            GrowthGraph.prototype.draw = function (data) {
                var xScale = this.xScale, yScale = this.yScale, height = this.height;
                var domainMin = d3.min(data, function (d) {
                    return d.ActiveSubs;
                });
                yScale.domain([
                    domainMin, 
                    d3.max(data, function (d) {
                        return d.ActiveSubs;
                    })
                ]);
                var activeSubsLine = d3.svg.line().interpolate("basis").x(function (d) {
                    return xScale(d.day);
                }).y(function (d) {
                    return yScale(d.ActiveSubs);
                });
                var activeSubsArea = d3.svg.area().interpolate("basis").x(function (d) {
                    return xScale(d.day);
                }).y0(function (d) {
                    return yScale(domainMin);
                }).y1(function (d) {
                    return yScale(d.ActiveSubs);
                });
                var g = this.g.datum(data);
                g.append("path").attr("class", "subs line").attr("d", activeSubsLine);
                g.append("path").attr("class", "subs area").attr("d", activeSubsArea);
                this.drawXAxis().drawYAxis('Active Subscribers');
                var self = this;
                (function () {
                    var ratio = (function (d) {
                        return d.ActiveSubs / data[0].ActiveSubs;
                    });
                    var yScaleRatio = d3.scale.linear().range([
                        height, 
                        0
                    ]).domain([
                        d3.min(data, function (d) {
                            return ratio(d);
                        }), 
                        d3.max(data, function (d) {
                            return ratio(d);
                        })
                    ]);
                    var ratioLine = d3.svg.line().interpolate("basis").x(function (d) {
                        return xScale(d.day);
                    }).y(function (d) {
                        return yScaleRatio(ratio(d));
                    });
                    g.append("path").attr("class", "subs line").attr("d", ratioLine);
                    var ratioYAxis = d3.svg.axis().scale(yScaleRatio).orient("right");
                    var axis = self.drawCustomYAxis(g, ratioYAxis, false);
                    axis.group.attr("transform", "translate(" + self.width + ",0)").select(".domain").attr("style", "stroke:none");
                    axis.label.text("Change").attr("transform", "translate(-4,42) rotate(-90)");
                })();
            };
            return GrowthGraph;
        })(Growth.Graph);
        Growth.GrowthGraph = GrowthGraph;        
    })(Dashboard.Growth || (Dashboard.Growth = {}));
    var Growth = Dashboard.Growth;
})(Dashboard || (Dashboard = {}));
