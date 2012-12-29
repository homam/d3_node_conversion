/// <reference path="dashboard.ts" />
module Dashboard.Growth {
    export class GrowthGraph extends Graph {
        constructor() {
            super("body",null,null,300)
        }

        public draw(data:IData[]) {
            var xScale = this.xScale,
                yScale = this.yScale,
                height = this.height;

            yScale.domain([0, d3.max(data, d => d.ActiveSubs)]);

            var activeSubsLine = d3.svg.line().interpolate("basis")
                .x(d => xScale(d.day))
                .y(d => yScale(d.ActiveSubs));
            var subsArea = d3.svg.area().interpolate("basis")
                .x(d => xScale(d.day))
                .y0(d => yScale(0))
                .y1(d => yScale(d.ActiveSubs));

            var g = this.g.datum(data);

            g.append("path").attr("class", "subs line")
                .attr("d",activeSubsLine);

            g.append("path").attr("class", "subs area")
                .attr("d",subsArea);

            this.drawXAxis().drawYAxis('Active Subscribers');
        }
    }
}