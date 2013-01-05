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
            this.visits = record.Visits ?? 0;

            this.subMethods = record.Device.SubMethods;

            this.fallback = record.Device.WURFL_FallBack;
            this.id = record.Device.WURFL_ID;
        }

        if ('string' == typeof args[0] && 'string' == typeof args[1]) {
            this.fallback = args[0];
            this.id = args[1];
        }
    }
}

class TreeMaker{

    constructor(records:IRecord[]){
        var nodes:DeviceNode[] = records.map(r => new DeviceNode(r));
        var parentLessIds = _.uniq(nodes.map(n => n.fallback)).filter(fallbackid => nodes.every(n => n.id != fallbackid));
        var parentedIds = _.uniq(nodes.map(n => n.fallback)).filter(fallbackid => nodes.some(n => n.id == fallbackid));

        console.log(nodes.length, parentLessIds.length, parentedIds.length);
    }

}



$(() => {
    $.get("/devices/devices.json").done(data => {
        new TreeMaker(data.Records);
    });
});