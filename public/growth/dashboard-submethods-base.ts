    /// <reference path="dashboard.ts" />
module Dashboard.Growth {
    export class SubMethodsBaseGraph extends Graph {
        constructor(loader:DataLoader,smoother:IDataSmoother, private drawLegend:bool, 
            private wigglish:bool, private methodNames:string[], private colorRange?:string[],
            width?:number,height:number=600,private yAxisLabel:string = 'Subs') {
            super(loader,smoother,"body", drawLegend? {  bottom: 130 } : null, null, height)
        }

        public draw(data: IData[]) {
            var xScale = this.xScale,
                yScale = this.yScale,
                height = this.height,
                g = this.g;

            this.svg.attr('class', (this.svg.attr('class')||'') + ' subMethods ' + (this.wigglish ? 'wigglish' : ''));


            yScale.domain([0, d3.max(data, d => d.Subs)]);
            var subsArea = d3.svg.area().interpolate("basis")
                .x(d => xScale(d.day))
                .y0(d => yScale(d.y0))
                .y1(d => yScale(d.y0 + d.y));


            var stack = d3.layout.stack().values(d => d.values);
            if(this.wigglish)
                stack = (<any>stack).x(d => d.day).y(d => d.y).offset("wiggle");

            var methodNames = _.chain(this.methodNames).map(s => ({
                name: s, 
                total: _( data.map(r => r[s])).reduce((a,b) =>a+b,0) }))
            .filter(s => s.total>0)
            .sortBy(s => -s.total)
            .map(s => s.name).value();

            var color = (<any>d3.scale).category20()
                .domain(methodNames);

            if(!!this.colorRange)
                color.range(this.colorRange);

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
                .attr("d",d => subsArea(d.values))
                .append("svg:title").text(d => d.name);


            if(this.drawLegend) {
                var width = this.width, margin = this.margin, svg = this.svg;

                var gLegend = svg.append("g")
                    .attr("transform", "rotate(90) translate("+ (height+margin.bottom) + "," +(-width-margin.left) + ")")
                var legend = gLegend.selectAll(".legend")
                    .data(color.domain().slice().reverse())
                    .enter().append("g").attr("class", "legend")
                    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

                legend.append("rect").
                    attr("x", 0)
                    .attr("width", 18).attr("height", 18)
                    .style("fill", color);

                legend.append("text")
                    .attr("transform", "rotate(180) translate(5,-6)")
                    .style("text-anchor", "start")
                    .style("fill", color)
                    .text(d => d);
            }
            this.drawXAxis();
            if(!this.wigglish)
                this.drawYAxis(this.yAxisLabel);
        }
    }
}