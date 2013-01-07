/// <reference path="../lib/underscore.browser.d.ts" />

interface ICSVRawRecord {
    SubMethod:string;
    SubMethod_Displayed:string;
    SubMethod_SubscribedTo:string;
    Submission_OperatorSelection:string;
    Submissions:string;
    Subscribers:string;
    Visits:string;
    Visits_ToLandingPage:string;
    Visits_ToOperatorSelection:string;
    Visits_ToOperatorSelectionOnly:string;
    Wurfl_Id:string;
    brand_name:string;
    device_os:string;
    device_os_version:string;
    marketing_name:string;
    mobile_browser:string;
    model_name:string;
    release_date:string;
    wurfl_device_id:string;
    wurfl_fall_back:string;
}

class CSVRecord {
    constructor(raw:ICSVRawRecord) {
        this.subMethod = raw.SubMethod;
        this.submissions = +raw.Submissions;
        this.subscribers = +raw.Subscribers;
        this.visits = +raw.Visits;
        this.brand_name = raw.brand_name;
        this.mobile_browser = raw.mobile_browser;
        this.model_name = raw.model_name;
        this.id = raw.wurfl_device_id;
        this.fallback = raw.wurfl_fall_back;

        this.subMethodDisplayed = 'NULL' == raw.SubMethod_Displayed ? 0 : +raw.SubMethod_Displayed;
        this.subMethodSubscribedTo = 'NULL' == raw.SubMethod_SubscribedTo ? 0 : +raw.SubMethod_SubscribedTo;
    }

    public subMethod: string;
    public submissions: number;
    public subscribers: number;
    public visits: number;
    public brand_name: string;
    public mobile_browser: string;
    public model_name: string;
    public id: string;
    public fallback: string;

    public subMethodDisplayed: number;
    public subMethodSubscribedTo: number;
}

var sum = (nums: number[]) => _(nums).reduce((a, b) => a + b, 0);

class DeviceNode {
    constructor(public id:string, records: CSVRecord[], fallback:string = null) {
        this.visits = sum(records.map(r => r.visits));
        this.submissions = sum(records.map(r => r.submissions));
        this.subscribers = sum(records.map(r => r.subscribers));

        this.fallback = records.length > 0 ? records[0].fallback : fallback;
        this.subMethods = records.map(r => new SubMethod(r.subMethod, r.visits, r.submissions, r.subscribers));

        this.children = [];
    }

    public visits: number;
    public submissions: number;
    public subscribers: number;

    public fallback: string;

    public subMethods: SubMethod[];

    public children: DeviceNode[];




    private _subscribersIncludingChildrenForAMethod= {};
    public subscribersIncludingChildrenForAMethod(method:string):number {
        if (isNaN(this._subscribersIncludingChildrenForAMethod[method])) {
            this._subscribersIncludingChildrenForAMethod[method] = (!!this.subMethods ? 
                sum( this.subMethods.filter(s=>method == s.name).map(s=>s.subscribers)) : 0) +
                (this.children.length > 0 ? sum(this.children.map(c => c.subscribersIncludingChildrenForAMethod(method))) : 0);
        }
        return this._subscribersIncludingChildrenForAMethod[method];
    }

    private _visitsIncludingChildrenForAMethod= {};
    public visitsIncludingChildrenForAMethod(method:string):number {
        if (isNaN(this._visitsIncludingChildrenForAMethod[method])) {
            this._visitsIncludingChildrenForAMethod[method] = (!!this.subMethods ? 
                sum( this.subMethods.filter(s=>method == s.name).map(s=>s.visits)) : 0) +
                (this.children.length > 0 ? sum(this.children.map(c => c.visitsIncludingChildrenForAMethod(method))) : 0);
        }
        return this._visitsIncludingChildrenForAMethod[method];
    }



    private _visitsIncludingChildren: number;
    public visitsIncludingChildren():number {
        if (isNaN(this._visitsIncludingChildren)) {
            this._visitsIncludingChildren = this.visits +
                (this.children.length > 0 ? sum(this.children.map(c => c.visitsIncludingChildren())) : 0);
        }
        return this._visitsIncludingChildren;
    }

    private _subscribersIncludingChildren: number;
    public subscribersIncludingChildren():number {
        if (isNaN(this._subscribersIncludingChildren)) {
            this._subscribersIncludingChildren = this.subscribers +
            (this.children.length > 0 ? sum(this.children.map(c => c.subscribersIncludingChildren())) : 0);
        }
        return this._subscribersIncludingChildren;
    }

}


class SubMethod {
    constructor(public name: string, public visits: number,
        public submissions: number, public subscribers: number) {

    }

    static plus(subMethods: SubMethod[]): SubMethod {
        if (_(subMethods.map(s => s.name)).uniq().length > 0) throw 'cannot plus';
        var smSub = (p: string) => sum(subMethods.map(sm => sm[p]));

        return new SubMethod(subMethods[0].name, smSub('visits'),
            smSub('submissions'), smSub('subscribers'));
    }
}