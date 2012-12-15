

var express = require("express")
var app = express.createServer();
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
app.get('/wapp155', function (req, res) {
    res.render('wapp155', {
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
