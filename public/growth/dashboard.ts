/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />

module Dashboard.Growth {

    export interface IData {
        day: Date;
        Day: string;
        ActiveSubs: number;
        Subs: number;
        Unsubs: number;
    }

    export interface IMargin {
        top?: number; right?: number; left?: number; bottom?: number;
    }

    var adjustHeightByMargin = function (height: number, margin:IMargin) {
        return height - margin.top - margin.bottom;
    };
    var adjustWidthByMargin = function (width: number, margin:IMargin) {
        return width - margin.left - margin.right;
    };
    var _margin = { top: 20, right: 30, bottom: 30, left: 40 },
        _width = adjustWidthByMargin(880,_margin),
        _height = adjustHeightByMargin(500,_margin)


    
    var _subMethodNames = ['Direct Wap', 'WEB Pin', 'Direct SMS', 'Web SMS', 'Wap SMS', 'Click Tag',
    'Link Click', 'Java App', 'Link Pin', 'Wap Pin', 'Android', 'GooglePlay'];

    export var subMethodNames = _subMethodNames;

    var dataDeferred = $.Deferred();

    
    d3.csv('/growth/du_bbay.csv', (raw: any[]) => {
        var parseDate = d3.time.format("%m/%d/%Y").parse;
        raw.forEach(d => {
            d.day = parseDate(d.Day);
            d.Subs = parseInt(d.Subs);
            d.ActiveSubs = +d['Active Subs'];
            d.Unsubs = +d['Un Subs'];
            _subMethodNames.forEach(sm => {
                d[sm] = +d[sm];
            });
            return d;
        });

        dataDeferred.resolve(raw);
    })

    export class Graph {
        constructor(selector, margin?:IMargin, width?:number, height?:number) {
            margin = <IMargin> $.extend(_.clone(_margin), margin || {});
            width = adjustWidthByMargin(width || _width, margin);
            height = adjustHeightByMargin(height || _height, margin);

            var svg = d3.select(selector).append("svg")
               .attr("width", width + margin.left + margin.right)
               .attr("height", height + margin.top + margin.bottom);
            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            this.width = width;
            this.height = height;
            this.margin = margin;

            this.svg = svg;
            this.g = g;

            this.xScale = d3.time.scale().range([0, width]);
            this.yScale = d3.scale.linear().range([height, 0]);

            this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom");
            this.yAxis = d3.svg.axis().scale(this.yScale).orient("left");

            var self = this;
            dataDeferred.done((data: IData[]) => {
                self.xScale.domain(d3.extent(data, d => d.day));
                self.draw(data);
            });
        }

        public height: number;
        public width: number;
        public margin: IMargin;
        public svg: ID3Selection;
        public g: ID3Selection;

        public xScale: ID3TimeScale;
        public yScale: ID3LinearScale;

        public xAxis: ID3SvgAxis;
        public yAxis: ID3SvgAxis;

        public draw(data:IData[]): void {
            console.log("not implemented");
        }

        public drawXAxis() {
            var g = this.g,
                xAxis = this.xAxis,
                height = this.height;
            g.append("g").attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
            return this;
        }

        public drawYAxis(label) {
            var g = this.g,
                yAxis = this.yAxis;
            g.append("g").attr("class", "y axis")
                .call(yAxis)
                .append("text").attr("transform", "rotate(-90) translate(0,10)")
                .style("text-anchor", "end").text(label);
            return this;
        }
    }

}

