/// <reference path="types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />

class DeviceNode {
    public children: DeviceNode[];

    public os: string;
    public fallback: string;
    public id: string;
    public subMethods: ISubMethod[];

    public visits: number;

    private _visitsIncludingChildren: number;
    public visitsIncludingChildren():number {
        if (isNaN(this._visitsIncludingChildren)) {
            this._visitsIncludingChildren = this.visits +
                (this.children.length > 0 ? _(this.children.map(c => c.visitsIncludingChildren())).reduce((a, b) => a + b, 0) : 0);
        }
        return this._visitsIncludingChildren;
    }

    private _subscribersIncludingChildren: number;
    public subscribersIncludingChildren():number {
        if (isNaN(this._subscribersIncludingChildren)) {
            this._subscribersIncludingChildren = (!!this.subMethods ? _( this.subMethods.map(s=>s.Subscribers)).reduce((a,b)=>a+b,0) : 0) +
                (this.children.length > 0 ? _(this.children.map(c => c.subscribersIncludingChildren())).reduce((a, b) => a + b, 0) : 0);
        }
        return this._subscribersIncludingChildren;
    }

    constructor(record: IRecord);
    constructor(fallback: string, id: string);
    constructor();
    constructor()
    {
        var args = arguments;
        if (!!args[0].Device && !!args[0].Device.WURFL_ID) {
            var record = <IRecord>args[0];

            this.fallback = record.Device.WURFL_FallBack;
            this.id = record.Device.WURFL_ID;
            this.os = record.Device.OS;
            this.visits = record.Visits;

            this.subMethods = record.Device.SubMethods;

            this.fallback = record.Device.WURFL_FallBack;
            this.id = record.Device.WURFL_ID;
        }

        if ('string' == typeof args[0] && 'string' == typeof args[1]) {
            this.fallback = args[0];
            this.id = args[1];
            this.visits = 0;
        }

        this.children = [];
    }
}

class TreeMaker{

    constructor(records:IRecord[]){
        var nodes:DeviceNode[] = records.map(r => new DeviceNode(r));
        var parentLessIds = _.uniq(nodes.map(n => n.fallback)).filter(fallbackid => nodes.every(n => n.id != fallbackid));
        nodes = nodes.concat(parentLessIds.map(id => new DeviceNode(id == 'root' ? '' :'root', id)));
        if (nodes.every(n => 'root' != n.id)) {
            nodes.push(new DeviceNode('', 'root')); // root of the tree has no parent, add the root only if it has not been added yet
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

        console.log(root, TreeMaker.sortChildren(root));

        $(document.body).append($("<ul></ul>").append( TreeMaker.renderTree(root)));

    }

    static sortChildren(root: DeviceNode): DeviceNode {
        root.children = _(root.children).sortBy((n: DeviceNode) => -n.visitsIncludingChildren());
        root.children.forEach(c => sortChildren(c));
        return root;
    }

    static renderTree(root: DeviceNode):any {
        var li = $("<li></li>")
            .append($("<span class='title'>").text( root.id))
            .append($("<span class='visits'>").text( root.visitsIncludingChildren()))
            .append($("<span class='subscribers'>").text( root.subscribersIncludingChildren()))
            .append($("<span class='conversion'>").text( (Math.round( root.subscribersIncludingChildren() / root.visitsIncludingChildren()*1000)/10) + "%"));

        if (root.children.length > 0) {
            var ul = $("<ul></ul>");
            root.children.forEach(c => {
                ul.append(TreeMaker.renderTree(c));
            });
            li = li.append(ul);
        }
        return li;
    }

}



$(() => {
    $.get("/devices/devices.json").done(data => {
        new TreeMaker(data.Records);
    });
});