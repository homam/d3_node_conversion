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
            left: 40
        };
        var _width = adjustWidthByMargin(880, _margin);
        var _height = adjustHeightByMargin(500, _margin);

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
        var _unsubMethodNames = [
            'Wap,Pin', 
            'SMS', 
            'Billing Rule', 
            'Cust. Care', 
            'Op. Admin', 
            'IVR'
        ];
        Growth.subMethodNames = _subMethodNames;
        Growth.unsubMethodNames = _unsubMethodNames;
        var DataLoader = (function () {
            function DataLoader(url, dateFormat) {
                if (typeof dateFormat === "undefined") { dateFormat = "%d/%m/%Y"; }
                this.url = url;
                this.dateFormat = dateFormat;
            }
            DataLoader.prototype.loadRawData = function () {
                var def = $.Deferred();
                d3.csv(this.url, function (raw) {
                    return def.resolve(raw);
                });
                return def;
            };
            DataLoader.prototype.load = function () {
                if(!this.loader) {
                    this.loader = $.Deferred();
                    var self = this;
                    self.loadRawData().done(function (raw) {
                        var parseDate = d3.time.format(self.dateFormat).parse;
                        raw.forEach(function (d) {
                            d.day = parseDate(d.Day);
                            d.Subs = parseInt(d.Subs);
                            d.Visits = +d.Visits;
                            d.ActiveSubs = +d['Active Subs'];
                            d.Unsubs = +d['Un Subs'];
                            d.Growth = +d.Growth;
                            _subMethodNames.forEach(function (sm) {
                                d[sm] = +d[sm];
                            });
                            _unsubMethodNames.forEach(function (sm) {
                                d[sm] = +d[sm];
                            });
                            return d;
                        });
                        self.loader.resolve(raw);
                    });
                }
                return this.loader;
            };
            return DataLoader;
        })();
        Growth.DataLoader = DataLoader;        
        var MovingAverageDataSmoother = (function () {
            function MovingAverageDataSmoother(setSize) {
                if (typeof setSize === "undefined") { setSize = 7; }
                this.setSize = setSize;
            }
            MovingAverageDataSmoother.prototype.smooth = function (raw) {
                var data = raw.map(function (r) {
                    return _.clone(r);
                });
                var setSize = this.setSize;
                var sum = function (arr) {
                    return _(arr).reduce(function (a, b) {
                        return a + b;
                    }, 0);
                };
                var avg = function (arr) {
                    return sum(arr) / arr.length;
                };
                var smoothed = data.map(function (d, i) {
                    var nextSet = data.slice(i, i + setSize);
                    for(var p in d) {
                        if('number' == typeof (d[p])) {
                            d[p] = avg(nextSet.map(function (i) {
                                return i[p];
                            }));
                        }
                    }
                    return d;
                });
                return smoothed;
            };
            return MovingAverageDataSmoother;
        })();
        Growth.MovingAverageDataSmoother = MovingAverageDataSmoother;        
        var Graph = (function () {
            function Graph(loader, smoother, selector, margin, width, height) {
                this.loader = loader;
                this.smoother = smoother;
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
                this.xScale = (this.xScale || d3.time.scale()).range([
                    0, 
                    width
                ]);
                this.yScale = (this.yScale || d3.scale.linear()).range([
                    height, 
                    0
                ]);
                this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom");
                this.yAxis = d3.svg.axis().scale(this.yScale).orient("left");
                this.loadAndRaw();
            }
            Graph.prototype.loadAndRaw = function () {
                var self = this;
                this.loader.load().done(function (data) {
                    if(!!self.smoother) {
                        data = self.smoother.smooth(data);
                    }
                    self.xScale.domain(d3.extent(data, function (d) {
                        return d.day;
                    }));
                    self.draw(data);
                });
            };
            Graph.prototype.draw = function (data) {
                console.log("not implemented");
            };
            Graph.prototype.drawXAxis = function () {
                var g = this.g;
                var xAxis = this.xAxis;
                var height = this.height;

                xAxis.tickSize(-this.height, -this.height, -this.height);
                g.append("g").attr("class", "x axis").attr("transform", "translate(0," + (height) + ")").call(xAxis).selectAll('g text').attr("transform", "translate(0,5)");
                return this;
            };
            Graph.prototype.drawYAxis = function (label, lineTicks, className) {
                if (typeof lineTicks === "undefined") { lineTicks = true; }
                if (typeof className === "undefined") { className = ''; }
                var g = this.g;
                var yAxis = this.yAxis;

                var axis = this.drawCustomYAxis(g, yAxis, lineTicks, className);
                axis.label.attr("transform", "rotate(-90) translate(-5,12)").style("text-anchor", "end").text(label);
                return this;
            };
            Graph.prototype.drawCustomYAxis = function (g, yAxis, lineTicks, className) {
                if (typeof lineTicks === "undefined") { lineTicks = false; }
                if (typeof className === "undefined") { className = ''; }
                if(lineTicks) {
                    yAxis.tickSize(-this.width);
                }
                var gAxis = g.append("g").attr("class", "y axis " + className);
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

