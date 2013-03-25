/// <reference path="iraq-types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />
//#region Loader
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
//#endregion
