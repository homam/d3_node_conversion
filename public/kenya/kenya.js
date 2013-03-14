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
                var visitsScale = d3.scale.linear().range([
                    height, 
                    0
                ]).domain([
                    d3.min(data, function (d) {
                        return d.Visits;
                    }), 
                    d3.max(data, function (d) {
                        return d.Visits;
                    })
                ]);
                var grouped = _.groupBy(data, function (item) {
                    return item.Ref;
                });
                var self = this;
                _(grouped).each(function (group) {
                    console.log(group);
                    var convLine = d3.svg.line().interpolate("basis").x(function (d) {
                        return xScale(d.day);
                    }).y(function (d) {
                        return yScale(d.Subs / d.Visits);
                    });
                    var visitsLine = d3.svg.line().interpolate("basis").x(function (d) {
                        return xScale(d.day);
                    }).y(function (d) {
                        return visitsScale(d.Visits);
                    });
                    var g = self.g.datum(group);
                    g.append("path").attr("class", "conv line").attr("d", convLine);
                    g.append("path").attr("class", "visits line").attr("d", visitsLine);
                });
                this.drawXAxis().drawYAxis('Conversion');
                var ratioYAxis = d3.svg.axis().scale(visitsScale).orient("right");
                var axis = this.drawCustomYAxis(this.g, ratioYAxis, false);
                axis.group.attr("transform", "translate(" + this.width + ",0)").select(".domain").attr("style", "stroke:none");
                axis.label.text("Visits").attr("transform", "translate(-4,42) rotate(-90)");
            };
            return KenyaGraph;
        })(Dashboard.Growth.Graph);
        Growth.KenyaGraph = KenyaGraph;        
    })(Dashboard.Growth || (Dashboard.Growth = {}));
    var Growth = Dashboard.Growth;

})(Dashboard || (Dashboard = {}));

