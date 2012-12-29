var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="dashboard.ts" />
var Dashboard;
(function (Dashboard) {
    (function (Growth) {
        var SubMethodsGraph = (function (_super) {
            __extends(SubMethodsGraph, _super);
            function SubMethodsGraph() {
                        _super.call(this, "body", null, null, 300);
            }
            SubMethodsGraph.prototype.draw = function (data) {
                var xScale = this.xScale, yScale = this.yScale, height = this.height, subMethodNames = Dashboard.Growth.subMethodNames, g = this.g;
                yScale.domain([
                    0, 
                    d3.max(data, function (d) {
                        return d.Subs;
                    })
                ]);
                var subsArea = d3.svg.area().interpolate("basis").x(function (d) {
                    return xScale(d.day);
                }).y0(function (d) {
                    return yScale(d.y0);
                }).y1(function (d) {
                    return yScale(d.y0 + d.y);
                });
                var stack = d3.layout.stack().values(function (d) {
                    return d.values;
                });
                var subMethodNames = _.chain(Dashboard.Growth.subMethodNames).map(function (s) {
                    return ({
                        name: s,
                        total: _(data.map(function (r) {
                            return r[s];
                        })).reduce(function (a, b) {
                            return a + b;
                        }, 0)
                    });
                }).filter(function (s) {
                    return s.total > 0;
                }).sortBy(function (s) {
                    return -s.total;
                }).map(function (s) {
                    return s.name;
                }).value();
                var color = (d3.scale).category20().domain(subMethodNames);
                var subscribers = stack(color.domain().map(function (name) {
                    return ({
                        name: name,
                        values: data.map(function (d) {
                            return {
                                day: d.day,
                                y: d[name]
                            };
                        })
                    });
                }));
                var methods = g.selectAll('.subMethod').data(subscribers).enter().append("g").attr('class', function (d) {
                    return 'subMethod ' + d.name;
                });
                methods.append("path").attr("class", "area subs").style('fill', function (d) {
                    return color(d.name);
                }).attr("d", function (d) {
                    return subsArea(d.values);
                });
                this.drawXAxis().drawYAxis('Subs');
            };
            return SubMethodsGraph;
        })(Growth.Graph);
        Growth.SubMethodsGraph = SubMethodsGraph;        
    })(Dashboard.Growth || (Dashboard.Growth = {}));
    var Growth = Dashboard.Growth;
})(Dashboard || (Dashboard = {}));
