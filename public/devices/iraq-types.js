var CSVRecord = (function () {
    function CSVRecord(raw) {
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
    return CSVRecord;
})();
var sum = function (nums) {
    return _(nums).reduce(function (a, b) {
        return a + b;
    }, 0);
};
var DeviceNode = (function () {
    function DeviceNode(id, records, fallback) {
        if (typeof fallback === "undefined") { fallback = null; }
        this.id = id;
        this._subscribersIncludingChildrenForAMethod = {
        };
        this._visitsIncludingChildrenForAMethod = {
        };
        this.visits = sum(records.map(function (r) {
            return r.visits;
        }));
        this.submissions = sum(records.map(function (r) {
            return r.submissions;
        }));
        this.subscribers = sum(records.map(function (r) {
            return r.subscribers;
        }));
        this.fallback = records.length > 0 ? records[0].fallback : fallback;
        this.subMethods = records.map(function (r) {
            return new SubMethod(r.subMethod, r.visits, r.submissions, r.subscribers);
        });
        this.children = [];
    }
    DeviceNode.prototype.subscribersIncludingChildrenForAMethod = function (method) {
        if(isNaN(this._subscribersIncludingChildrenForAMethod[method])) {
            this._subscribersIncludingChildrenForAMethod[method] = (!!this.subMethods ? sum(this.subMethods.filter(function (s) {
                return method == s.name;
            }).map(function (s) {
                return s.subscribers;
            })) : 0) + (this.children.length > 0 ? sum(this.children.map(function (c) {
                return c.subscribersIncludingChildrenForAMethod(method);
            })) : 0);
        }
        return this._subscribersIncludingChildrenForAMethod[method];
    };
    DeviceNode.prototype.visitsIncludingChildrenForAMethod = function (method) {
        if(isNaN(this._visitsIncludingChildrenForAMethod[method])) {
            this._visitsIncludingChildrenForAMethod[method] = (!!this.subMethods ? sum(this.subMethods.filter(function (s) {
                return method == s.name;
            }).map(function (s) {
                return s.visits;
            })) : 0) + (this.children.length > 0 ? sum(this.children.map(function (c) {
                return c.visitsIncludingChildrenForAMethod(method);
            })) : 0);
        }
        return this._visitsIncludingChildrenForAMethod[method];
    };
    DeviceNode.prototype.visitsIncludingChildren = function () {
        if(isNaN(this._visitsIncludingChildren)) {
            this._visitsIncludingChildren = this.visits + (this.children.length > 0 ? sum(this.children.map(function (c) {
                return c.visitsIncludingChildren();
            })) : 0);
        }
        return this._visitsIncludingChildren;
    };
    DeviceNode.prototype.subscribersIncludingChildren = function () {
        if(isNaN(this._subscribersIncludingChildren)) {
            this._subscribersIncludingChildren = this.subscribers + (this.children.length > 0 ? sum(this.children.map(function (c) {
                return c.subscribersIncludingChildren();
            })) : 0);
        }
        return this._subscribersIncludingChildren;
    };
    return DeviceNode;
})();
var SubMethod = (function () {
    function SubMethod(name, visits, submissions, subscribers) {
        this.name = name;
        this.visits = visits;
        this.submissions = submissions;
        this.subscribers = subscribers;
    }
    SubMethod.plus = function plus(subMethods) {
        if(_(subMethods.map(function (s) {
            return s.name;
        })).uniq().length > 0) {
            throw 'cannot plus';
        }
        var smSub = function (p) {
            return sum(subMethods.map(function (sm) {
                return sm[p];
            }));
        };
        return new SubMethod(subMethods[0].name, smSub('visits'), smSub('submissions'), smSub('subscribers'));
    }
    return SubMethod;
})();
