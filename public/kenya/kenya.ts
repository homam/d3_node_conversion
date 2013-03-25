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

            var visitsScale = d3.scale.linear().range([height, 0])
                .domain([d3.min(data, d=> d.Visits),d3.max(data, d=> d.Visits)]);

            var grouped = _.groupBy(data, (item) => item.Ref);

            var self = this;
            
            _(grouped).each(function (group: IData[]) {

                console.log(group);

                var convLine = d3.svg.line().interpolate("basis")
                    .x(d => xScale(d.day))
                    .y(d => yScale(d.Subs / d.Visits));

                var visitsLine = d3.svg.line().interpolate("basis")
                    .x(d => xScale(d.day))
                    .y(d => visitsScale(d.Visits));

                var g = self.g.datum(group);

                g.append("path").attr("class", "conv line")
                    .attr("d", convLine);

                g.append("path").attr("class", "visits line")
                    .attr("d", visitsLine);
            });

            this.drawXAxis().drawYAxis('Conversion');
            
            
                var ratioYAxis = d3.svg.axis().scale(visitsScale).orient("right");
                var axis = this.drawCustomYAxis(this.g, ratioYAxis, false);
                axis.group
                    .attr("transform", "translate(" + this.width + ",0)")
                    .select(".domain").attr("style","stroke:none");
                axis.label.text("Visits").attr("transform", "translate(-4,42) rotate(-90)");

        }
    }
}