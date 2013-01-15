/// <reference path="iraq-types.ts" />
/// <reference path="loader.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />



class TreeBase{

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
                    node1.addChild(node2);
                }
            });
        });

        // sort the tree
        nodes =  _(nodes).sortBy((n: DeviceNode) => -n.visitsIncludingChildren());
        var root = nodes[0];

        TreeBase.sortChildren(root);

        this.root = root;

    }

    public root: DeviceNode;

    static sortChildren(root: DeviceNode): DeviceNode {
        root.children = _(root.children).sortBy((n: DeviceNode) => -n.visitsIncludingChildren());
        root.children.forEach(c => sortChildren(c));
        return root;
    }
}
