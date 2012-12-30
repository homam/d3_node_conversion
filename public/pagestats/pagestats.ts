/// <reference path="../growth/dashboard.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />

module Dashboard.WebPageStats {

    export interface IData {
        day: Date;
        Day: string;
        Visits: number;
        Submissions: number;
        Subs: number;
        ActiveSubs: number;
        Active_12: number;
        Conv: number;
    }

    export class DataLoader implements Dashboard.Growth.IDataLoader {
        constructor(private url: string) {
        }

        private loader: JQueryDeferred;

        public load(): JQueryDeferred {
            if (!this.loader) {
                this.loader = $.Deferred();
                var self = this;
                d3.csv(self.url, (raw: any[]) => {
                    var parseDate = d3.time.format("%d/%m/%Y").parse;
                    raw.forEach(d => {
                        d.day = parseDate(d.Day)
                        d.Visits = +d['Visits'];
                        d.Submissions = +d['Submissions'];
                        d.Active_12 = +d['Active_12'];
                        d.Subs = parseInt(d.Subscribers);
                        d.ActiveSubs = +d['Active Subs'];
                        d.Conv = d.Subs / d.Visits;
                        return d;
                    });

                    self.loader.resolve(raw);
                });
            }

            return this.loader;
        }

    }

    export class PageStatsGraph extends Dashboard.Growth.Graph {
        constructor(loader:DataLoader, smoother: Dashboard.Growth.IDataSmoother) {
            super(loader, smoother, 'body', null, null, null);
        }

        public draw(data: IData[]) {

            var xScale = this.xScale,
                yScale = this.yScale,
                height = this.height,
                g = this.g.datum(data);

            yScale.domain([d3.min(data, d => d.Visits), d3.max(data, d => d.Visits)]);

            var visitsLine = d3.svg.line().interpolate("basis")
                .x(d => xScale(d.day))
                .y(d => yScale(d.Visits));
            g.append("path").attr("class", "visits line")
                .attr("d",visitsLine);

            this.drawXAxis().drawYAxis('Visits');


            var convScale = yScale
                .domain([0, d3.max(data, d => d.Conv)]);

            
            var convLine = d3.svg.line().interpolate("basis")
                .x(d => xScale(d.day))
                .y(d => convScale(d.Conv));
            g.append("path").attr("class", "conversion line")
                .attr("d",convLine);

            var gAxis = this.drawCustomYAxis(this.g,
                d3.svg.axis().scale(convScale).orient("right"), false);
            gAxis.group.attr('transform', 'translate(' + this.width + ',0)')
                .attr('class', gAxis.group.attr('class') + ' conversion');
            gAxis.texts.text(d => (d*1000)/10 + '%' );
            gAxis.label.attr("transform", "rotate(-90) translate(-5,-8)")
                .style("text-anchor", "end").text('Conversion');
        }
    }
}