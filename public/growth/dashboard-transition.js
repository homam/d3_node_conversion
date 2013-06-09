var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="dashboard.ts" />
var TransitionGraph = (function (_super) {
    __extends(TransitionGraph, _super);
    function TransitionGraph() {
        _super.call(this, "body", null, null, 300);
    }
    TransitionGraph.prototype.draw = function (data) {
        var xScale = this.xScale, yScale = this.yScale, height = this.height, g = this.g;
        var raw = _.clone(data);
        var xDomain = [
            new Date(2012, 10, 0), 
            new Date(2012, 11, 0)
        ];
        data = raw.filter(function (d) {
            return d.day >= xDomain[0] && d.day < xDomain[1];
        });
        g.datum(raw);
        xScale.domain(d3.extent(data, function (d) {
            return d.day;
        }));
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
        var g = this.g.datum(data);
        var path = g.append("path").attr("class", "subs line").attr("d", activeSubsLine);
        this.drawXAxis().drawYAxis('Active Subscribers');
        var yday = function (date) {
            return new Date(date - (24 * 3600 * 1000));
        };
        var tick = function () {
            xDomain = [
                yday(xDomain[0]), 
                yday(xDomain[1])
            ];
            console.log(yday(xDomain[0]));
            data = raw.filter(function (d) {
                return d.day >= xDomain[0] && d.day < xDomain[1];
            });
            xScale.domain(d3.extent(data, function (d) {
                return d.day;
            }));
            path.attr("d", activeSubsLine).attr("transform", null).transition().duration(500).ease("linear").attr("transform", "translate(" + 20 + ")").each("end", tick);
        };
        tick();
    };
    return TransitionGraph;
})(Dashboard.Growth.Graph);
