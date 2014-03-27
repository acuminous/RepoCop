var express = require('express');
var exphbs = require('express3-handlebars');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var config = require('./lib/util/config');
var survey = require('./lib/survey/survey');
var logger = require('./lib/util/logger');
var handlebarsHelpers = require('./lib/util/handlebarsHelpers');
var app = express();    

var publicDir = path.join(__dirname, 'public', 'dist');
var templatesDir = path.join(publicDir, 'handlebars');    
var layoutsDir = path.join(templatesDir, 'layouts');
var viewsDir = path.join(templatesDir, 'views');

app.disable('x-powered-by');

app.post('/api/survey', survey.trigger);

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir: layoutsDir,
    partialsDir: viewsDir,
    helpers: handlebarsHelpers
}));
app.set('view engine', 'handlebars');
app.set("views", viewsDir);
app.disable('view cache');

app.get('/', survey.display);

app.use(app.router);    
app.use('/', express.static(publicDir));

app.use(function(err, req, res, next){
    res.status(500).sendfile(path.join(publicDir, 'html', '500.html'));
    logger.error('Internal server error: %s', err.message);
});

app.use(function(req, res, next){
    res.status(404).sendfile(path.join(publicDir, 'html', '404.html'));
});

app.listen(config.server.port, config.server.host, function(err) {
    if (err) process.exit(1);
    process.send({ type: 'started' });
});