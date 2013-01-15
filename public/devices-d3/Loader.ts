/// <reference path="iraq-types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
/// <reference path="../lib/jquery-1.8.d.ts" />
/// <reference path="../lib/d3types.ts" />

//#region Loader

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

//#endregion