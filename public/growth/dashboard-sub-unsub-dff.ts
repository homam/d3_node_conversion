/// <reference path="dashboard.ts" />
module Dashboard.Growth {
    export class SubUnsubDiff extends Graph {
        constructor(loader:DataLoader, smoother:IDataSmoother) {
            super(loader, smoother, "body",null,null,300)
        }

        public draw(data:IData[]) {
            var xScale = this.xScale,
                yScale = this.yScale,
                height = this.height;

            yScale.domain([d3.min(data, d => Math.min(d.Subs,d.Unsubs)), d3.max(data, d => Math.max(d.Subs,d.Unsubs))]);

            var subsLine = d3.svg.line().interpolate("basis")
                .x(d => xScale(d.day))
                .y(d => yScale(d.Subs));
            var subsArea = d3.svg.area().interpolate("basis")
                .x(d => xScale(d.day))
                .y0(d => yScale(0))
                .y1(d => yScale(d.Subs));

            var g = this.g.datum(data);

            g.append("path").attr("class", "subs line")
                .attr("d",subsLine);


            // areas
            g.append("clipPath").attr("id", "clip-below")
                .append("path")
                .attr("d", subsArea.y0(height));

            g.append("clipPath").attr("id", "clip-above")
                .append("path")
                .attr("d", subsArea.y0(0));

            g.append("path")
                .attr("class", "area above")
                .attr("clip-path", "url(#clip-above)")
                .attr("d", subsArea.y0(d => yScale(d.Unsubs)));

            g.append("path").attr("class", "area below")
                .attr("clip-path", "url(#clip-below)")
                .attr("d", subsArea);


            this.drawXAxis().drawYAxis('Subs / Unsubs');
        }
    }
}