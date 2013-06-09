/// <reference path="dashboard.ts" />
module Dashboard.Growth {
    export class GrowthGraph extends Graph {
        constructor(loader:DataLoader, smoother:IDataSmoother) {
            super(loader, smoother ,"body",null,null,300)
        }

        public draw(data:IData[]) {
            var xScale = this.xScale,
                yScale = this.yScale,
                height = this.height;

            var domainMin = d3.min(data, d => d.ActiveSubs);
            yScale.domain([domainMin, d3.max(data, d => d.ActiveSubs)]);

            var activeSubsLine = d3.svg.line().interpolate("basis")
                .x(d => xScale(d.day))
                .y(d => yScale(d.ActiveSubs));
            var activeSubsArea = d3.svg.area().interpolate("basis")
                .x(d => xScale(d.day))
                .y0(d => yScale(domainMin))
                .y1(d => yScale(d.ActiveSubs));

            var g = this.g.datum(data);

            g.append("path").attr("class", "subs line")
                .attr("d",activeSubsLine);

            g.append("path").attr("class", "subs area")
                .attr("d",activeSubsArea);

            this.drawXAxis().drawYAxis('Active Subscribers');


            var self = this;
             (function () {
                var ratio = (d => d.ActiveSubs / data[0].ActiveSubs);

                var yScaleRatio = d3.scale.linear().range([height, 0])
                    .domain([d3.min(data, d => ratio(d)), d3.max(data, d => ratio(d))]);

                var ratioLine = d3.svg.line().interpolate("basis")
                    .x(d => xScale(d.day))
                    .y(d => yScaleRatio(ratio(d)));


                g.append("path").attr("class", "subs line")
                    .attr("d", ratioLine);


                var ratioYAxis = d3.svg.axis().scale(yScaleRatio).orient("right");
                var axis = self.drawCustomYAxis(g, ratioYAxis, false);
                axis.group
                    .attr("transform", "translate(" + self.width + ",0)")
                    .select(".domain").attr("style","stroke:none");
                axis.label.text("Change").attr("transform", "translate(-4,42) rotate(-90)");
            })();
        }
    }
}