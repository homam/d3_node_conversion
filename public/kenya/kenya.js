var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Dashboard;
(function (Dashboard) {
    (function (Growth) {
        function DrawByRef(loader) {
            loader.load().done(function (data) {
                var visitsScale = d3.scale.linear().domain([
                    d3.min(data, function (d) {
                        return d.Visits;
                    }), 
                    d3.max(data, function (d) {
                        return d.Visits;
                    })
                ]);
                var xScale = d3.time.scale().domain(d3.extent(data, function (d) {
                    return d.day;
                }));
                var grouped = _.groupBy(data, function (item) {
                    return item.Ref;
                });
                _.chain(grouped).map(function (gdata, gkey) {
                    gdata.key = gkey;
                    return gdata;
                }).filter(function (gdata) {
                    return _(gdata).map(function (d) {
                        return d.Visits;
                    }).reduce(function (a, b) {
                        return a + b;
                    }, 0) > 200;
                }).each(function (gdata) {
                    var dloader = new DummyLoader(gdata);
                    new KenyaGraph(dloader, new Dashboard.Growth.MovingAverageDataSmoother(7), visitsScale, gdata['key'], xScale);
                });
            });
        }
        Growth.DrawByRef = DrawByRef;
        var DummyLoader = (function (_super) {
            __extends(DummyLoader, _super);
            function DummyLoader(data) {
                        _super.call(this, null);
                this.data = data;
            }
            DummyLoader.prototype.loadRawData = function () {
                var def = $.Deferred();
                def.resolve(this.data);
                return def;
            };
            DummyLoader.prototype.load = function () {
                return this.loadRawData();
            };
            return DummyLoader;
        })(Growth.DataLoader);        
        var KenyaGraph = (function (_super) {
            __extends(KenyaGraph, _super);
            function KenyaGraph(loader, smoother, visitsScale, referrer, xScale) {
                this.visitsScale = visitsScale;
                this.referrer = referrer;
                this.xScale = xScale;
                        _super.call(this, loader, smoother, "body", null, null, 300);
            }
            KenyaGraph.prototype.loadAndRaw = function () {
                var self = this;
                this.loader.load().done(function (data) {
                    if(!!self.smoother) {
                        data = self.smoother.smooth(data);
                    }
                    self.draw(data);
                });
            };
            KenyaGraph.prototype.draw = function (data) {
                var xScale = this.xScale;
                var yScale = this.yScale;
                var height = this.height;

                yScale.domain([
                    0, 
                    0.5
                ]);
                var visitsScale = this.visitsScale.range([
                    height, 
                    0
                ]);
                var self = this;
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
                var g = self.g.datum(data);
                g.append("path").attr("class", "conv line").attr("d", convLine);
                g.append("path").attr("class", "visits line").attr("d", visitsLine);
                this.drawXAxis().drawYAxis(this.referrer, true, 'conv');
                var ratioYAxis = d3.svg.axis().scale(visitsScale).orient("right");
                var axis = this.drawCustomYAxis(this.g, ratioYAxis, false, 'visits');
                axis.group.attr("transform", "translate(" + this.width + ",0)").select(".domain").attr("style", "stroke:none");
                axis.label.text("Visits").attr("transform", "translate(-4,42) rotate(-90)");
            };
            return KenyaGraph;
        })(Dashboard.Growth.Graph);
        Growth.KenyaGraph = KenyaGraph;        
    })(Dashboard.Growth || (Dashboard.Growth = {}));
    var Growth = Dashboard.Growth;

})(Dashboard || (Dashboard = {}));

