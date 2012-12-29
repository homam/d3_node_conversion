var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="dashboard.ts" />
var Dashboard;
(function (Dashboard) {
    (function (Growth) {
        var SubUnsubDiff = (function (_super) {
            __extends(SubUnsubDiff, _super);
            function SubUnsubDiff() {
                        _super.call(this, "body", null, null, 300);
            }
            SubUnsubDiff.prototype.draw = function (data) {
                var xScale = this.xScale, yScale = this.yScale, height = this.height;
                yScale.domain([
                    d3.min(data, function (d) {
                        return Math.min(d.Subs, d.Unsubs);
                    }), 
                    d3.max(data, function (d) {
                        return Math.max(d.Subs, d.Unsubs);
                    })
                ]);
                var subsLine = d3.svg.line().interpolate("basis").x(function (d) {
                    return xScale(d.day);
                }).y(function (d) {
                    return yScale(d.Subs);
                });
                var subsArea = d3.svg.area().interpolate("basis").x(function (d) {
                    return xScale(d.day);
                }).y0(function (d) {
                    return yScale(0);
                }).y1(function (d) {
                    return yScale(d.Subs);
                });
                var g = this.g.datum(data);
                g.append("path").attr("class", "subs line").attr("d", subsLine);
                // areas
                g.append("clipPath").attr("id", "clip-below").append("path").attr("d", subsArea.y0(height));
                g.append("clipPath").attr("id", "clip-above").append("path").attr("d", subsArea.y0(0));
                g.append("path").attr("class", "area above").attr("clip-path", "url(#clip-above)").attr("d", subsArea.y0(function (d) {
                    return yScale(d.Unsubs);
                }));
                g.append("path").attr("class", "area below").attr("clip-path", "url(#clip-below)").attr("d", subsArea);
                this.drawXAxis().drawYAxis('Subs / Unsubs');
            };
            return SubUnsubDiff;
        })(Growth.Graph);
        Growth.SubUnsubDiff = SubUnsubDiff;        
    })(Dashboard.Growth || (Dashboard.Growth = {}));
    var Growth = Dashboard.Growth;
})(Dashboard || (Dashboard = {}));
