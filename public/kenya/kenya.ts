/// <reference path="../growth/dashboard.ts" />
module Dashboard.Growth {
    export class KenyaGraph extends Dashboard.Growth.Graph {
        constructor (loader: DataLoader, smoother: IDataSmoother) {
            super(loader, smoother, "body", null, null, 300)
        }

        public draw(data: IData[]) {
            var xScale = this.xScale,
                yScale = this.yScale,
                height = this.height;

            yScale.domain([0, .5]);

            var convLine = d3.svg.line().interpolate("basis")
                .x(d => xScale(d.day))
                .y(d => yScale(d.Subs / d.Visits));
          
            var g = this.g.datum(data);

            g.append("path").attr("class", "subs line")
                .attr("d",convLine);

            this.drawXAxis().drawYAxis('Conversion');

        }
    }
}