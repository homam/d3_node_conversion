var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Dashboard;
(function (Dashboard) {
    (function (Growth) {
        var KenyaGraph = (function (_super) {
            __extends(KenyaGraph, _super);
            function KenyaGraph(loader, smoother) {
                        _super.call(this, loader, smoother, "body", null, null, 300);
            }
            KenyaGraph.prototype.draw = function (data) {
                var xScale = this.xScale;
                var yScale = this.yScale;
                var height = this.height;

                yScale.domain([
                    0, 
                    0.5
                ]);
                var convLine = d3.svg.line().interpolate("basis").x(function (d) {
                    return xScale(d.day);
                }).y(function (d) {
                    return yScale(d.Subs / d.Visits);
                });
                var g = this.g.datum(data);
                g.append("path").attr("class", "subs line").attr("d", convLine);
                this.drawXAxis().drawYAxis('Conversion');
            };
            return KenyaGraph;
        })(Dashboard.Growth.Graph);
        Growth.KenyaGraph = KenyaGraph;        
    })(Dashboard.Growth || (Dashboard.Growth = {}));
    var Growth = Dashboard.Growth;

})(Dashboard || (Dashboard = {}));

