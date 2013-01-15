/// <reference path="iraq-types.ts" />
/// <reference path="loader.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />
var TreeBase = (function () {
    function TreeBase(nodes) {
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
                    node1.addChild(node2);
                }
            });
        });
        // sort the tree
        nodes = _(nodes).sortBy(function (n) {
            return -n.visitsIncludingChildren();
        });
        var root = nodes[0];
        TreeBase.sortChildren(root);
        this.root = root;
    }
    TreeBase.sortChildren = function sortChildren(root) {
        root.children = _(root.children).sortBy(function (n) {
            return -n.visitsIncludingChildren();
        });
        root.children.forEach(function (c) {
            return TreeBase.sortChildren(c);
        });
        return root;
    }
    return TreeBase;
})();
