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

    public renderTree(element:JQuery, subMethods:string[]) {
        var root = $("<ul></ul>");
        var header = $("<li class='header'></li>")
                .append("<span class='title'>ID</span>")
                .append("<span class='visits'>Visits</span>")
                .append("<span class='subscribers'>Subscribers</span>")
                .append("<span class='conversion'>Conversion</span>");
        subMethods.forEach(sm => {
            header.append($("<span class='subMethod' />").text(sm))
        });
            root.append(header); 
            root.append( Tree.renderTreeBranch(this.root,subMethods));
        element.append(root);
    }

    static sortChildren(root: DeviceNode): DeviceNode {
        root.children = _(root.children).sortBy((n: DeviceNode) => -n.visitsIncludingChildren());
        root.children.forEach(c => sortChildren(c));
        return root;
    }

    static renderTreeBranch(root: DeviceNode, subMethods:string[]):any {
        var li = $("<li></li>")
            .append($("<span class='title'>").text( root.id))
            .append($("<span class='visits'>").text( root.visitsIncludingChildren()))
            .append($("<span class='subscribers'>").text( root.subscribersIncludingChildren()))
            .append($("<span class='conversion'>").text( (Math.round( root.subscribersIncludingChildren() / root.visitsIncludingChildren()*1000)/10) + "%"));
        subMethods.forEach(sm => {
            li.append($("<span class='subMethod visits'>").addClass("subMethod-" + sm).text(
                root.visitsIncludingChildrenForAMethod(sm)
            ));
            li.append($("<span class='subMethod subscribers'>").addClass("subMethod-" + sm).text(
                root.subscribersIncludingChildrenForAMethod(sm)
            ));
        });

        if (root.children.length > 0) {
            var ul = $("<ul></ul>");
            root.children.forEach(c => {
                ul.append(Tree.renderTreeBranch(c,subMethods));
            });
            li = li.append(ul);
        }
        return li;
    }

}



new Loader().load().done((obj) => {
    var nodes: DeviceNode[] = obj.nodes;
    var subMethods: string[] = obj.subMethods.filter(sm=>sm.visits>500).map(sm=>sm.name);
    new Tree(nodes).renderTree($("body"),subMethods);

    $("ul:first>li>ul>li").each(function () {
        var e = $(this);
        e.find("ul").toggle();
        e.toggleClass('folded');
    });

    $("li").mousedown(function (ev) {
        var ul = $(this).find("ul");
        ul.toggle();
        $(this).toggleClass('folded');
        return false;
    });
});