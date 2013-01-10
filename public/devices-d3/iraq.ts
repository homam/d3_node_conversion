/// <reference path="iraq-types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />

class Loader {
    load():JQueryPromise {
        var def = $.Deferred();
        d3.csv('/devices/iraq.csv', csv => {
            
            var records: CSVRecord[] = csv.map(c => new CSVRecord(c));

            // because of the way homam's query is written (it groups  by subMethodDisplayed and subMethodSubscribedTo)
            // this step is needed to reduce the records of the same subMethod
            var reduces:CSVRecord[] = _(records).reduce((a: CSVRecord[], b: CSVRecord) => {
                var rec = a.filter(r => r.id == b.id && r.subMethod == b.subMethod
                     && r.subMethodDisplayed==b.subMethodDisplayed)[0];
                if (!!rec) {
                    rec.visits += b.visits;
                    rec.submissions += b.submissions;
                    rec.subscribers += b.subscribers;
                } else
                    a.push(b);
                return a;
            },[]);

            var subMethods = _.chain(records.map(r => r.subMethod)).unique()
                .map(sm => ({ name: sm, visits: sum(reduces.filter(r => sm == r.subMethod).map(r => r.visits)) }))
                .sortBy(sm=> -sm.visits).value();

            var groups = _(reduces).groupBy('id');
            var nodes:DeviceNode[] = _.map(groups, (records:CSVRecord[],id:string) => new DeviceNode(id,records));
            def.resolve({nodes:nodes,subMethods:subMethods});

        });
        return def;
    }
}



class Tree{

    constructor(nodes:DeviceNode[]){
        var parentLessIds = _.uniq(nodes.map(n => n.fallback)).filter(fallbackid => nodes.every(n => n.id != fallbackid));
        nodes = nodes.concat(parentLessIds.map((id:string) => new DeviceNode(id,[], (id == 'root' ? '' :'root'))));
        if (nodes.every(n => 'root' != n.id)) {
            nodes.push(new DeviceNode('root',[],'')); // root of the tree has no parent, add the root only if it has not been added yet
        }

        // make the tree
        nodes.forEach(node1 => {
            nodes.forEach(node2 => {
                if (node1.id == node2.fallback) {
                    if(node1.fallback == node2.fallback)
                        throw JSON.stringify(node1) + "\n\n" + JSON.stringify(node2);
                    node1.children.push(node2);
                }
            });
        });

        // sort the tree
        nodes =  _(nodes).sortBy((n: DeviceNode) => -n.visitsIncludingChildren());
        var root = nodes[0];

        Tree.sortChildren(root);

        this.root = root;

    }

    public root: DeviceNode;

    public renderTree(element: JQuery, subMethods: string[], minVisits: number = 0) {
        var minimize = function (nodes: DeviceNode) {
            if (nodes.visitsIncludingChildren() > minVisits) {
                if (nodes.children.length > 0) {
                    nodes.children = nodes.children.map(c => minimize(c)).filter(c => c != null);
                }
                return nodes;
            }
            return null;
        }

        var root = minimize(this.root);

        var w = 960,
            h = 3800,
            i = 0,
            barHeight = 20,
            barWidth = w * .8,
            duration = 400,
            root;

        var tree = (<any> d3.layout).tree()
            .size([h, 100]);

        var diagonal = (<any> d3.svg).diagonal()
            .projection(function (d) { return [d.y, d.x]; });

        var vis = d3.select("body").append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .append("svg:g")
            .attr("transform", "translate(20,30)");

        var root: any = this.root;
        

        var nodes:any[] = null;
        window['root'] = root;

        var flatten:bool = false

        update(root);

        function update(source) {

            // Compute the flattened node list. TODO use d3.layout.hierarchy.
            nodes = tree.nodes(root);

            // Compute the "layout".
            nodes.forEach((n, i) => n.x = i * barHeight);

            // Update the nodes…
            var node = vis.selectAll("g.node")
                .data(nodes, d => d.id);

            var nodeEnter = node.enter().append("svg:g")
                .attr("class", d=> "node depth-"+ d.depth)
                .attr("transform", d =>  "translate(" + source.y + "," + source.x + ")")
                .style("opacity", 1e-6);

            // Enter any new nodes at the parent's previous position.
            var g = nodeEnter.append("g")
                .attr("transform", "translate(0," + (-barHeight / 2) + ")");
            g.append("rect").attr("height",barHeight)
                .attr("width", (d:DeviceNode) => 200*(d.visitsIncludingChildren()/563138))
                .attr("class", "visits");
            g.append("svg:rect")
                .attr('class','name')
                .attr("height", barHeight)
                .attr("width", "200")
                //below anywa: .style("fill", color)
                .on("dblclick", dblclick)
                .on("click", click);

            nodeEnter.append("svg:text")
                .attr('class','name')
                .attr("dy", 3.5)
                .attr("dx", 5.5)
                .text((d:DeviceNode)=>d.id + " " + d.visitsIncludingChildren());

            // Transition nodes to their new position.
            nodeEnter.transition()
                .duration(duration)
                .attr("transform", d=> "translate(" + (flatten?0: d.y) + "," + d.x + ")")
                .style("opacity", 1);

            node.transition()
                .duration(duration)
                .attr("transform", d=>"translate(" + (flatten?0:d.y) + "," + d.x + ")")
                .style("opacity", 1);

            node.selectAll("rect.name").style("stroke", color);

            // Transition exiting nodes to the parent's new position.
            node.exit().transition()
                .duration(duration)
                .attr("transform", d=> "translate(" + source.y + "," + source.x + ")")
                .style("opacity", 1e-6)
                .remove();
            //#region Links
            (function () {
                // Update the links…
                var link = vis.selectAll("path.link")
                    .data(tree.links(nodes), function (d) { return d.target.id; });

                // Enter any new links at the parent's previous position.
                link.enter().insert("svg:path", "g")
                    .attr("class", "link")
                    .attr("d", function (d) {
                        var o = { x: source.x, y: source.y };
                        return diagonal({ source: o, target: o });
                    })
                    .transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function (d) {
                        var o = { x: source.x, y: source.y };
                        return diagonal({ source: o, target: o });
                    })
                    .remove();

            })//();
            //#endregion
        }

        // Toggle children on click.
        function dblclick(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }

        function color(d) {
            if (d._children != null) {
                if (d._children.length > 0) return "red";
            } else {
                if(d.children.length>0) return "#550a3a";
            }
            return "#c6dbef";
        }

        function click(d: any) {
            var dn = <DeviceNode>d;
            var self = <Node>this;
            var children = self.parentNode.childNodes;
         //   console.log(d);
        }

        window['flatten'] = function (flat:bool) {
            flatten = flat;
            if (flat) {
                vis.selectAll("g.node")
                    .attr("transform", d => "translate(" + 0 + "," + d.x + ")");
            } else
                update(root);
            
        }

        
        window['deep'] = function (depth) {
            nodes.filter(n => n.depth < depth).forEach(d => {
                if (d._children) {
                    d.children = d._children;
                    d._children = null;
                }
            });
            nodes.filter(n => n.depth >= depth).forEach(d => {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                }
            });
            update(root);
        };
  

    }

    static sortChildren(root: DeviceNode): DeviceNode {
        root.children = _(root.children).sortBy((n: DeviceNode) => -n.visitsIncludingChildren());
        root.children.forEach(c => sortChildren(c));
        return root;
    }

   

}



new Loader().load().done((obj) => {
    var nodes: DeviceNode[] = obj.nodes;
    var subMethods: string[] = obj.subMethods.filter(sm=>sm.visits>500).map(sm=>sm.name); // only sub methods with more than 500 visits
    new Tree(nodes).renderTree($("body"),subMethods,200); // only nodes with more than 200 visitis

});