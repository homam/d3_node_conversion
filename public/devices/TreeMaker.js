/// <reference path="types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />
var DeviceNode = (function () {
    function DeviceNode() {
        var args = arguments;
        if(!!args[0].Device && !!args[0].Device.WURFL_ID) {
            var record = args[0];
            this.fallback = record.Device.WURFL_FallBack;
            this.id = record.Device.WURFL_ID;
            this.os = record.Device.OS;
            this.visits = record.Visits;
            this.subMethods = record.Device.SubMethods;
            this.fallback = record.Device.WURFL_FallBack;
            this.id = record.Device.WURFL_ID;
        }
        if('string' == typeof args[0] && 'string' == typeof args[1]) {
            this.fallback = args[0];
            this.id = args[1];
            this.visits = 0;
        }
        this.children = [];
    }
    DeviceNode.prototype.visitsIncludingChildren = function () {
        if(isNaN(this._visitsIncludingChildren)) {
            this._visitsIncludingChildren = this.visits + (this.children.length > 0 ? _(this.children.map(function (c) {
                return c.visitsIncludingChildren();
            })).reduce(function (a, b) {
                return a + b;
            }, 0) : 0);
        }
        return this._visitsIncludingChildren;
    };
    DeviceNode.prototype.subscribersIncludingChildren = function () {
        if(isNaN(this._subscribersIncludingChildren)) {
            this._subscribersIncludingChildren = (!!this.subMethods ? _(this.subMethods.map(function (s) {
                return s.Subscribers;
            })).reduce(function (a, b) {
                return a + b;
            }, 0) : 0) + (this.children.length > 0 ? _(this.children.map(function (c) {
                return c.subscribersIncludingChildren();
            })).reduce(function (a, b) {
                return a + b;
            }, 0) : 0);
        }
        return this._subscribersIncludingChildren;
    };
    return DeviceNode;
})();
var TreeMaker = (function () {
    function TreeMaker(records) {
        var nodes = records.map(function (r) {
            return new DeviceNode(r);
        });
        var parentLessIds = _.uniq(nodes.map(function (n) {
            return n.fallback;
        })).filter(function (fallbackid) {
            return nodes.every(function (n) {
                return n.id != fallbackid;
            });
        });
        nodes = nodes.concat(parentLessIds.map(function (id) {
            return new DeviceNode(id == 'root' ? '' : 'root', id);
        }));
        if(nodes.every(function (n) {
            return 'root' != n.id;
        })) {
            nodes.push(new DeviceNode('', 'root'))// root of the tree has no parent, add the root only if it has not been added yet
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
        console.log(root, TreeMaker.sortChildren(root));
        $(document.body).append($("<ul></ul>").append(TreeMaker.renderTree(root)));
    }
    TreeMaker.sortChildren = function sortChildren(root) {
        root.children = _(root.children).sortBy(function (n) {
            return -n.visitsIncludingChildren();
        });
        root.children.forEach(function (c) {
            return TreeMaker.sortChildren(c);
        });
        return root;
    }
    TreeMaker.renderTree = function renderTree(root) {
        var li = $("<li></li>").append($("<span class='title'>").text(root.id)).append($("<span class='visits'>").text(root.visitsIncludingChildren())).append($("<span class='subscribers'>").text(root.subscribersIncludingChildren())).append($("<span class='conversion'>").text((Math.round(root.subscribersIncludingChildren() / root.visitsIncludingChildren() * 1000) / 10) + "%"));
        if(root.children.length > 0) {
            var ul = $("<ul></ul>");
            root.children.forEach(function (c) {
                ul.append(TreeMaker.renderTree(c));
            });
            li = li.append(ul);
        }
        return li;
    }
    return TreeMaker;
})();
$(function () {
    $.get("/devices/devices.json").done(function (data) {
        new TreeMaker(data.Records);
    });
});
