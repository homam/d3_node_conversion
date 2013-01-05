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
        }
    }
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
        var parentedIds = _.uniq(nodes.map(function (n) {
            return n.fallback;
        })).filter(function (fallbackid) {
            return nodes.some(function (n) {
                return n.id == fallbackid;
            });
        });
        console.log(nodes.length, parentLessIds.length, parentedIds.length);
    }
    return TreeMaker;
})();
$(function () {
    $.get("/devices/devices.json").done(function (data) {
        new TreeMaker(data.Records);
    });
});
