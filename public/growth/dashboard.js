/// <reference path="../lib/d3types.ts" />
/// <reference path="../lib/underscore.browser.d.ts" />
var Dashboard;
(function (Dashboard) {
    (function (Growth) {
        var margin = {
top: 20,
right: 30,
bottom: 30,
left: 40        }, width = 830 - margin.left - margin.right, height = 920 - margin.top - margin.bottom;
        var data = null;
        function GetData() {
        }
        Growth.GetData = GetData;
    })(Dashboard.Growth || (Dashboard.Growth = {}));
    var Growth = Dashboard.Growth;
})(Dashboard || (Dashboard = {}));
