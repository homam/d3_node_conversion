/// <reference path="iraq-types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />
var Loader = (function () {
    function Loader() { }
    Loader.prototype.load = function () {
        var def = $.Deferred();
        d3.csv('/devices/iraq.csv', function (csv) {
            var records = csv.map(function (c) {
                return new CSVRecord(c);
            });
            // because of the way homam's query is written (it groups  by subMethodDisplayed and subMethodSubscribedTo)
            // this step is needed to reduce the records of the same subMethod
            var reduces = _(records).reduce(function (a, b) {
                var rec = a.filter(function (r) {
                    return r.id == b.id && r.subMethod == b.subMethod && r.subMethodDisplayed == b.subMethodDisplayed;
                })[0];
                if(!!rec) {
                    rec.visits += b.visits;
                    rec.submissions += b.submissions;
                    rec.subscribers += b.subscribers;
                } else {
                    a.push(b);
                }
                return a;
            }, []);
            var subMethods = _.chain(records.map(function (r) {
                return r.subMethod;
            })).unique().map(function (sm) {
                return ({
                    name: sm,
                    visits: sum(reduces.filter(function (r) {
                        return sm == r.subMethod;
                    }).map(function (r) {
                        return r.visits;
                    }))
                });
            }).sortBy(function (sm) {
                return -sm.visits;
            }).value();
            var groups = _(reduces).groupBy('id');
            var nodes = _.map(groups, function (records, id) {
                return new DeviceNode(id, records);
            });
            def.resolve({
                nodes: nodes,
                subMethods: subMethods
            });
        });
        return def;
    };
    return Loader;
})();
var Tree = (function () {
    function Tree(nodes) {
        var parentLessIds = _.uniq(nodes.map(function (n) {
            return n.fallback;
        })).filter(function (fallbackid) {
            return nodes.every(function (n) {
                return n.id != fallbackid;
            });
        });
        nodes = nodes.concat(parentLessIds.map(function (id) {
            return new DeviceNode(id, [], (id == 'root' ? '' : 'root'));
        }));
        if(nodes.every(function (n) {
            return 'root' != n.id;
        })) {
            nodes.push(new DeviceNode('root', [], ''))// root of the tree has no parent, add the root only if it has not been added yet
            ;
        }
        // make the tree
        nodes.forEach(function (node1) {
            nodes.forEach(function (node2) {
                if(node1.id == node2.fallback) {
                    if(node1.fallback == node2.fallback) {
                        throw JSON.stringify(node1) + "\n\n" + JSON.stringify(node2);
                    }
                    node1.children.push(node2);
                }
            });
        });
        // sort the tree
        nodes = _(nodes).sortBy(function (n) {
            return -n.visitsIncludingChildren();
        });
        var root = nodes[0];
        Tree.sortChildren(root);
        this.root = root;
    }
    Tree.prototype.renderTree = function (element, subMethods, minVisits) {
        if (typeof minVisits === "undefined") { minVisits = 0; }
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
        root.x0 = 0;
        root.y0 = 0;
        update(root);
        function update(source) {
            // Compute the flattened node list. TODO use d3.layout.hierarchy.
            var nodes = tree.nodes(root);
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
                return "translate(" + source.y0 + "," + source.x0 + ")";
            }).style("opacity", 0.000001);
            // Enter any new nodes at the parent's previous position.
            var g = nodeEnter.append("g").attr("transform", "translate(0," + (-barHeight / 2) + ")");
            g.append("rect").attr("height", barHeight).attr("width", function (d) {
                return 200 * (d.visitsIncludingChildren() / 563138);
            }).attr("class", "visits");
            g.append("svg:rect").attr("height", barHeight).attr("width", "200").style("fill", color).on("dblclick", dblclick).on("click", click);
            nodeEnter.append("svg:text").attr("dy", 3.5).attr("dx", 5.5).text(function (d) {
                return d.id + " " + d.visitsIncludingChildren();
            });
            // Transition nodes to their new position.
            nodeEnter.transition().duration(duration).style(// not needed, will be called anyway below: .attr("transform", d=> "translate(" + d.y + "," + d.x + ")")
            "opacity", 1);
            node.transition().duration(duration).attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            }).style("opacity", 1).select("rect");
            //.style("fill", color);
            // Transition exiting nodes to the parent's new position.
            node.exit().transition().duration(duration).attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            }).style("opacity", 0.000001).remove();
            (function () {
                // Update the links…
                var link = vis.selectAll("path.link").data(tree.links(nodes), function (d) {
                    return d.target.id;
                });
                // Enter any new links at the parent's previous position.
                link.enter().insert("svg:path", "g").attr("class", "link").attr("d", function (d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
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
                        // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
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
            return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
        }
        function click(d) {
            var dn = d;
            var self = this;
            var children = self.parentNode.childNodes;
            console.log(d);
        }
        window['flatten'] = function () {
            vis.selectAll("g.node").attr("transform", function (d) {
                return "translate(" + 0 + "," + d.x + ")";
            });
        };
        var currentDepth = 20;
        window['deep'] = function (depth) {
            console.log(depth, currentDepth);
            if(depth < currentDepth) {
                for(var p = 20; p >= depth; p--) {
                    var gs = vis.selectAll("g.node.depth-" + p);
                    gs.each(function (d) {
                        return dblclick(d);
                    });
                }
            } else {
                if(depth > currentDepth) {
                    for(var p = currentDepth; p < depth; p++) {
                        var gs = vis.selectAll("g.node.depth-" + p);
                        gs.each(function (d) {
                            return dblclick(d);
                        });
                    }
                }
            }
            currentDepth = depth;
        };
    };
    Tree.sortChildren = function sortChildren(root) {
        root.children = _(root.children).sortBy(function (n) {
            return -n.visitsIncludingChildren();
        });
        root.children.forEach(function (c) {
            return Tree.sortChildren(c);
        });
        return root;
    }
    return Tree;
})();
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
