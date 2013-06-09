/// <reference path="../growth/dashboard.ts" />
module Dashboard.Growth {
    export function DrawByRef(loader:DataLoader) {
        loader.load().done((data: IData[]) => {
            var visitsScale = d3.scale.linear()
                    .domain([d3.min(data, d=> d.Visits), d3.max(data, d=> d.Visits)]);

            var xScale = d3.time.scale().domain(d3.extent(data, d => d.day));

            var grouped = _.groupBy(data, (item) => item.Ref);
            _.chain(grouped).map((gdata, gkey) => { gdata.key = gkey; return gdata; })
                .filter((gdata: IData[]) => _(gdata).map(d => d.Visits).reduce((a, b) =>a + b, 0) > 200)
                .each(function (gdata:IData[]) {
                    
                var dloader = new DummyLoader(gdata);
                new KenyaGraph(dloader,new Dashboard.Growth.MovingAverageDataSmoother(7),
                    visitsScale, gdata['key'],xScale);
            });
                //self.xScale.domain(d3.extent(data, d => d.day));
                //self.draw(data);
            });
    }

    class DummyLoader extends DataLoader {
        constructor (private data: IData[]) {
            super(null);
        }

        loadRawData(): JQueryDeferred {
            var def = $.Deferred();
            def.resolve(this.data);
            return def;
        }

        public load(): JQueryDeferred {
            return this.loadRawData();
        }
    }

    export class KenyaGraph extends Dashboard.Growth.Graph {
        constructor (loader: DataLoader, smoother: IDataSmoother,
             visitsScale : ID3LinearScale, referrer: string, xScale : ID3TimeScale) {
            this.visitsScale = visitsScale;
            this.referrer = referrer;
            this.xScale = xScale;
            super(loader, smoother, "body", null, null, 300)
        }

        private visitsScale: ID3LinearScale;
        private referrer: string;

        public loadAndRaw() {
            var self = this;
            this.loader.load().done((data: IData[]) => {
                if (!!self.smoother)
                     data = self.smoother.smooth(data);
                self.draw(data);
            });
        }

        public draw(data: IData[]) {
            var xScale = this.xScale,
                yScale = this.yScale,
                height = this.height;

            yScale.domain([0, .5]);

            var visitsScale = this.visitsScale.range([height, 0]);


            var self = this;

                var convLine = d3.svg.line().interpolate("basis")
                    .x(d => xScale(d.day))
                    .y(d => yScale(d.Subs / d.Visits));

                var visitsLine = d3.svg.line().interpolate("basis")
                    .x(d => xScale(d.day))
                    .y(d => visitsScale(d.Visits));

                var g = self.g.datum(data);

                g.append("path").attr("class", "conv line")
                    .attr("d", convLine);

                g.append("path").attr("class", "visits line")
                    .attr("d", visitsLine);
            

            this.drawXAxis().drawYAxis(this.referrer, true, 'conv');
            
            
                var ratioYAxis = d3.svg.axis().scale(visitsScale).orient("right");
                var axis = this.drawCustomYAxis(this.g, ratioYAxis, false,'visits');
                axis.group
                    .attr("transform", "translate(" + this.width + ",0)")
                    .select(".domain").attr("style","stroke:none");
                axis.label.text("Visits").attr("transform", "translate(-4,42) rotate(-90)");

        }
    }
}