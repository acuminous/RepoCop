var express = require('express');
var exphbs = require('express3-handlebars');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var environment = require('./lib/util/environment');
var config = require('./lib/util/config');
var survey = require('./lib/survey/survey');
var logger = require('./lib/util/logger');
var app = express();    

var publicDir = path.join(__dirname, 'public');
var templatesDir = path.join(publicDir, 'handlebars');    
var layoutsDir = path.join(templatesDir, 'layouts');
var viewsDir = path.join(templatesDir, 'views');
var surveyPath = path.join(publicDir, 'survey.json');

app.disable('x-powered-by');

app.post('/api/survey', survey.trigger);

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir: layoutsDir,
    partialsDir: viewsDir    
}));
app.set('view engine', 'handlebars');
app.set("views", viewsDir);

app.get('/', function (req, res) {
    res.render('repositories', { 
        environment: environment, 
        repositories: fs.existsSync(config.survey.output) ? require(config.survey.output) : []
    })
});

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