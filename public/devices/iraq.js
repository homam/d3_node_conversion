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
        var root = $("<ul></ul>");
        var header = $("<li class='header'><div></div></li>");
        header.find("div").append("<span class='title'>ID</span>").append("<span class='visits'>Visits</span>").append("<span class='subscribers'>Subscribers</span>").append("<span class='conversion'>Conversion</span>");
        subMethods.forEach(function (sm) {
            header.find("div").append($("<span class='subMethod' />").text(sm));
        });
        root.append(header);
        root.append(Tree.renderTreeBranch(this.root, subMethods, minVisits));
        element.append(root);
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
    Tree.renderTreeBranch = function renderTreeBranch(root, subMethods, minVisits) {
        if(root.visitsIncludingChildren() < minVisits) {
            return '';
        }
        var li = $("<li><div></div></li>");
        var div = li.find("div");
        div.append($("<span class='title'>").text(root.id)).append($("<span class='visits'>").text(root.visitsIncludingChildren())).append($("<span class='subscribers'>").text(root.subscribersIncludingChildren())).append($("<span class='conversion'>").text((Math.round(root.subscribersIncludingChildren() / root.visitsIncludingChildren() * 1000) / 10) + "%"));
        subMethods.forEach(function (sm) {
            var visits = root.visitsIncludingChildrenForAMethod(sm), subs = root.subscribersIncludingChildrenForAMethod(sm);
            div.append($("<span class='subMethod visits'>").addClass("subMethod-" + sm).text(visits));
            div.append($("<span class='subMethod subscribers'>").addClass("subMethod-" + sm).text(subs));
            div.append($("<span class='subMethod conversion'>").addClass("subMethod-" + sm).text(((visits == 0) && (subs == 0)) ? '-' : (Math.round(subs / visits * 1000) / 10) + '%'));
        });
        if(root.children.length > 0) {
            var ul = $("<ul></ul>");
            root.children.forEach(function (c) {
                ul.append(Tree.renderTreeBranch(c, subMethods, minVisits));
            });
            li = li.append(ul);
        }
        return li;
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
    $("ul:first>li>ul>li").each(function () {
        var e = $(this);
        e.find(">ul").toggle();
        e.toggleClass('folded');
    });
    $("li").mousedown(function (ev) {
        var ul = $(this).find(">ul");
        ul.toggle();
        $(this).toggleClass('folded');
        return false;
    });
});
