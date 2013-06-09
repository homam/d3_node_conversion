var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="iraq-types.ts" />
/// <reference path="loader.ts" />
/// <reference path="TreeBase.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />
var Tree = (function (_super) {
    __extends(Tree, _super);
    function Tree(nodes) {
        _super.call(this, nodes);
    }
    Tree.prototype.renderTree = function (element, subMethods, minVisits) {
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
                var w = 960, h = 3800, i = 0, barHeight = 20, barWidth = w * 0.8, duration = 400, root;
        var tree = (d3.layout).tree().size([
            h, 
            100
        ]);
        var diagonal = (d3.svg).diagonal().projection(function (d) {
            return [
                d.y, 
                d.x
            ];
        });
        var vis = d3.select("body").append("svg:svg").attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(20,30)");
        var root = this.root;
        var nodes = null;
        window['root'] = root;
        var flatten = false;
        update(root);
        function update(source) {
            // Compute the flattened node list. TODO use d3.layout.hierarchy.
            nodes = tree.nodes(root);
            // Compute the "layout".
            nodes.forEach(function (n, i) {
                return n.x = i * barHeight;
            });
            // Update the nodes…
            var node = vis.selectAll("g.node").data(nodes, function (d) {
                return d.id;
            });
            var nodeEnter = node.enter().append("svg:g").attr("class", function (d) {
                return "node depth-" + d.depth;
            }).attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            }).style("opacity", 0.000001);
            // Enter any new nodes at the parent's previous position.
            var g = nodeEnter.append("g").attr("transform", "translate(0," + (-barHeight / 2) + ")");
            g.append("rect").attr("height", barHeight).attr("width", function (d) {
                return 200 * (d.visitsIncludingChildren() / 563138);
            }).attr("class", "visits");
            g.append("svg:rect").attr('class', 'name').attr("height", barHeight).attr("width", "200").on(//below anywa: .style("fill", color)
            "dblclick", dblclick).on("click", click);
            nodeEnter.append("svg:text").attr('class', 'name').attr("dy", 3.5).attr("dx", 5.5).text(function (d) {
                return d.id + " " + d.visitsIncludingChildren();
            });
            // Transition nodes to their new position.
            nodeEnter.transition().duration(duration).attr("transform", function (d) {
                return "translate(" + (flatten ? 0 : d.y) + "," + d.x + ")";
            }).style("opacity", 1);
            node.transition().duration(duration).attr("transform", function (d) {
                return "translate(" + (flatten ? 0 : d.y) + "," + d.x + ")";
            }).style("opacity", 1);
            node.selectAll("rect.name").style("stroke", color);
            // Transition exiting nodes to the parent's new position.
            node.exit().transition().duration(duration).attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            }).style("opacity", 0.000001).remove();
            //#region Links
            (function () {
                // Update the links…
                var link = vis.selectAll("path.link").data(tree.links(nodes), function (d) {
                    return d.target.id;
                });
                // Enter any new links at the parent's previous position.
                link.enter().insert("svg:path", "g").attr("class", "link").attr("d", function (d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                }).transition().duration(duration).attr("d", diagonal);
                // Transition links to their new position.
                link.transition().duration(duration).attr("d", diagonal);
                // Transition exiting nodes to the parent's new position.
                link.exit().transition().duration(duration).attr("d", function (d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                }).remove();
            })//();
            //#endregion
                    }
        // Toggle children on click.
        function dblclick(d) {
            if(d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
        function color(d) {
            if(d._children != null) {
                if(d._children.length > 0) {
                    return "red";
                }
            } else {
                if(d.children.length > 0) {
                    return "#550a3a";
                }
            }
            return "#c6dbef";
        }
        function click(d) {
            var dn = d;
            var self = this;
            var children = self.parentNode.childNodes;
            //   console.log(d);
                    }
        window['flatten'] = function (flat) {
            flatten = flat;
            if(flat) {
                vis.selectAll("g.node").attr("transform", function (d) {
                    return "translate(" + 0 + "," + d.x + ")";
                });
            } else {
                update(root);
            }
        };
        window['deep'] = function (depth) {
            nodes.filter(function (n) {
                return n.depth < depth;
            }).forEach(function (d) {
                if(d._children) {
                    d.children = d._children;
                    d._children = null;
                }
            });
            nodes.filter(function (n) {
                return n.depth >= depth;
            }).forEach(function (d) {
                if(d.children) {
                    d._children = d.children;
                    d.children = null;
                }
            });
            update(root);
        };
    };
    return Tree;
})(TreeBase);
new Loader().load().done(function (obj) {
    var nodes = obj.nodes;
    var subMethods = obj.subMethods.filter(function (sm) {
        return sm.visits > 500;
    }).map(function (sm) {
        return sm.name;
    });// only sub methods with more than 500 visits
    
    new Tree(nodes).renderTree($("body"), subMethods, 200)// only nodes with more than 200 visitis
    ;
});
