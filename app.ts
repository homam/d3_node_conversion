/// <reference path="lib/node.d.ts" />
/// <reference path="lib/express.d.ts" />

import http = module("http")
import url = module("url")
//import routes = module("./routes/index")
import express = module("express");

var app = express.createServer();



// Configuration
app.configure(() => {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', () => {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Routes
['costrev','wapp155','linkpin', 'growth', 'growth-wiggle',
     'growth-unsubs','growth-percent-unsubs', 'dashboard',
     'transition', 'pagestats',
         'devices'].forEach(v => {
    app.get('/' + v, (req, res) => res.render(v, {}));
});

app.get('/', (req, res) => {
    res.render('index', {});
});

//app.get('/hello', routes.index);

app.listen(3000, function(){
    console.log("Demo Express server listening on port %d in %s mode", 3000, app.settings.env);
});

//export var App = app;
