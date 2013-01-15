var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="iraq-types.ts" />
/// <reference path="loader.ts" />
/// <reference path="treebase.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />
var Partition = (function (_super) {
    __extends(Partition, _super);
    function Partition(nodes) {
        _super.call(this, nodes);
    }
    Partition.prototype.renderTree = function (element, subMethods, minVisits) {
        if (typeof minVisits === "undefined") { minVisits = 0; }
        //#region minimize
        var minimize = function (nodes) {
            if(nodes.visitsIncludingChildren() > minVisits) {
                if(nodes.children.length > 0) {
                    nodes.children = nodes.children.map(function (c) {
                        return minimize(c);
                    }).filter(function (c) {
                        return c != null;
                    });
                }
                return nodes;
            }
            return null;
        };
        var root = minimize(this.root);
        //#endregion
                var w = 1120, h = 1200, x = d3.scale.linear().range([
0, 
w        ]), y = d3.scale.linear().range([
0, 
h        ]);
        var vis = d3.select("body").append("div").attr("class", "chart").style("width", w + "px").style("height", h + "px").append("svg:svg").attr("width", w).attr("height", h);
        var partition = (d3.layout).partition().value(function (d) {
            return d.visitsIncludingChildren();
        });
        var g = vis.selectAll("g").data(partition.nodes(root)).enter().append("svg:g").attr("transform", function (d) {
            return "translate(" + x(d.y) + "," + y(d.x) + ")";
        }).on("click", click);
        var kx = w / root.dx, ky = h / 1;
        g.append("svg:rect").attr("width", root.dy * kx).attr("height", function (d) {
            return d.dx * ky;
        }).attr("class", function (d) {
            return (!!d.children && d.children.length > 0) ? "parent" : "child";
        });
        g.append("svg:text").attr("transform", transformText).attr("dy", ".35em").style("opacity", function (d) {
            return d.dx * ky > 12 ? 1 : 0;
        }).text(function (d) {
            return d.id;
        });
        d3.select(window).on("click", click(root));
        function click(d) {
            console.log("click", d);
            if(!d.children) {
                return;
            }
            kx = (d.y ? w - 40 : w) / (1 - d.y);
            ky = h / d.dx;
            x.domain([
                d.y, 
                1
            ]).range([
                d.y ? 40 : 0, 
                w
            ]);
            y.domain([
                d.x, 
                d.x + d.dx
            ]);
            var t = g.transition().duration(750).attr("transform", function (d) {
                return "translate(" + x(d.y) + "," + y(d.x) + ")";
            });
            t.select("rect").attr("width", d.dy * kx).attr("height", function (d) {
                return d.dx * ky;
            });
            t.select("text").attr("transform", transformText).style("opacity", function (d) {
                return d.dx * ky > 12 ? 1 : 0;
            });
            if(!!(d3).event) {
                (d3).event.stopPropagation();
            }
        }
        function transformText(d) {
            return "translate(8," + d.dx * ky / 2 + ")";
        }
    };
    return Partition;
})(TreeBase);
new Loader().load().done(function (obj) {
    var nodes = obj.nodes;
    var subMethods = obj.subMethods.filter(function (sm) {
        return sm.visits > 500;
    }).map(function (sm) {
        return sm.name;
    });// only sub methods with more than 500 visits
    
    new Partition(nodes).renderTree($("body"), subMethods, 0)// only nodes with more than 200 visitis
    ;
});
