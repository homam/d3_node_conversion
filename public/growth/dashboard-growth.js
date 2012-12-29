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
            function GrowthGraph() {
                        _super.call(this, "body", null, null, 300);
            }
            GrowthGraph.prototype.draw = function (data) {
                var xScale = this.xScale, yScale = this.yScale, height = this.height;
                yScale.domain([
                    d3.min(data, function (d) {
                        return d.ActiveSubs;
                    }), 
                    d3.max(data, function (d) {
                        return d.ActiveSubs;
                    })
                ]);
                var activeSubsLine = d3.svg.line().interpolate("basis").x(function (d) {
                    return xScale(d.day);
                }).y(function (d) {
                    return yScale(d.ActiveSubs);
                });
                var subsArea = d3.svg.area().interpolate("basis").x(function (d) {
                    return xScale(d.day);
                }).y0(function (d) {
                    return yScale(0);
                }).y1(function (d) {
                    return yScale(d.ActiveSubs);
                });
                var g = this.g.datum(data);
                g.append("path").attr("class", "subs line").attr("d", activeSubsLine);
                g.append("path").attr("class", "subs area").attr("d", subsArea);
                this.drawXAxis().drawYAxis('Active Subscribers');
            };
            return GrowthGraph;
        })(Growth.Graph);
        Growth.GrowthGraph = GrowthGraph;        
    })(Dashboard.Growth || (Dashboard.Growth = {}));
    var Growth = Dashboard.Growth;
})(Dashboard || (Dashboard = {}));
