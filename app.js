

var express = require("express")
var app = express();
// Configuration
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
});
app.configure('development', function () {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});
// Routes
[
    'costrev', 
    'wapp155', 
    'linkpin', 
    'growth', 
    'growth-wiggle', 
    'growth-unsubs', 
    'growth-percent-unsubs', 
    'dashboard', 
    'transition', 
    'pagestats', 
    'devices', 
    'devices-iraq', 
    'devices-d3', 
    'devices-d3-partition', 
    'histogram', 
    'histogramg'
].forEach(function (v) {
    app.get('/' + v, function (req, res) {
        return res.render(v, {
        });
    });
});
app.get('/', function (req, res) {
    res.render('index', {
    });
});
//app.get('/hello', routes.index);
app.listen(3000, function () {
    console.log("Demo Express server listening on port %d in %s mode", 3000, app.settings.env);
});
//export var App = app;
