    /// <reference path="dashboard.ts" />
module Dashboard.Growth {
    export class SubMethodsGraph extends Graph {
        constructor() {
            super("body", null, null, 300)
        }

        public draw(data: IData[]) {
            var xScale = this.xScale,
                yScale = this.yScale,
                height = this.height,
                subMethodNames = Dashboard.Growth.subMethodNames,
                g = this.g;

            yScale.domain([0, d3.max(data, d => d.Subs)]);
            var subsArea = d3.svg.area().interpolate("basis")
                .x(d => xScale(d.day))
                .y0(d => yScale(d.y0))
                .y1(d => yScale(d.y0 + d.y));

            var stack = d3.layout.stack().values(d => d.values);

            var subMethodNames = _.chain(Growth.subMethodNames).map(s => ({
                name: s, 
                total: _( data.map(r => r[s])).reduce((a,b) =>a+b,0) }))
            .filter(s => s.total>0)
            .sortBy(s => -s.total)
            .map(s => s.name).value();

            var color = (<any>d3.scale).category20()
                .domain(subMethodNames);

            var subscribers = stack(color.domain().map(name => (
                {   name:name,
                    values: data.map(d => {
                        return {day: d.day, y: d[name]};
                    })
                })));

            var methods = g.selectAll('.subMethod').data(subscribers)
                .enter().append("g").attr('class',d => 'subMethod '  + d.name);

            methods.append("path").attr("class", "area subs")
                .style('fill', d => color(d.name))
                .attr("d",d => subsArea(d.values));

            this.drawXAxis().drawYAxis('Subs');

        }
    }
}