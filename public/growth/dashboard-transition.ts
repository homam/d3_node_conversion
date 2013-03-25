/// <reference path="dashboard.ts" />

class TransitionGraph extends Dashboard.Growth.Graph {
    constructor(loader: Dashboard.Growth.DataLoader) {
        super(loader,"body", null, null, 300)
    }

    public draw(data: Dashboard.Growth.IData[]) {
        var xScale = this.xScale,
            yScale = this.yScale,
            height = this.height,
            g = this.g;

        var raw = _.clone(data);
        var xDomain = [new Date(2012, 10, 0), new Date(2012, 11, 0)];
        data = raw.filter(d => d.day >= xDomain[0] && d.day < xDomain[1]);

        xScale.domain(d3.extent(data, d => d.day));
        
        yScale.domain([d3.min(data, d => d.ActiveSubs), d3.max(data, d => d.ActiveSubs)]);

        var activeSubsLine = d3.svg.line().interpolate("basis")
            .x(d => xScale(d.day))
            .y(d => yScale(d.ActiveSubs));

        var g = this.g;//.datum(data);

        var path = g.append("path")
            .data([data])
            .attr("class", "subs line")
            .attr("d", activeSubsLine);

        
        this.drawXAxis().drawYAxis('Active Subscribers');

        var self = this;

        var yday = function (date) {
            return new Date(date - (24 * 3600*1000));
        }
        var tick = function () {
            xDomain = [yday(xDomain[0]), yday(xDomain[1])];
            console.log(yday(xDomain[0]))
            data = raw.filter(d => d.day >= yday(yday( xDomain[0])) && d.day < xDomain[1]);
            xScale.domain(d3.extent(data, d => d.day));
            yScale.domain([d3.min(data, d => d.ActiveSubs), d3.max(data, d => d.ActiveSubs)]);
            path.data([data])
            g.selectAll("path.subs.line").attr("d", (d, i) => {
                console.log(d[0].day);
                return activeSubsLine.apply(this, arguments);
            })
                .attr("transform", null)
                .transition()
                .duration(2000)
                .ease("linear")
                .attr("transform", "translate(" + 5 + ")")
                .each("end", tick);
        }

       // tick();
    }
}