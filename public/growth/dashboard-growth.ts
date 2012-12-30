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
        }
    }
}