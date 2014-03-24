var express = require('express');
var exphbs = require('express3-handlebars');
var path = require('path');
var packageJson = require('./package.json');
var quote = require('./lib/util/quote');
var environment = require('./lib/util/environment');
var config = require('./lib/util/config');
var survey = require('./lib/survey/survey');
var logger = require('./lib/util/logger');
var app = express();    

var viewsDir = path.join(__dirname, 'public', 'templates');    
var layoutsDir = path.join(viewsDir, 'layouts');
var staticDir = path.join(process.cwd(), 'public');

app.disable('x-powered-by');
app.set('surveyPath', path.join(staticDir, 'survey.json'));

app.post('/api/survey', survey.trigger);

app.use(app.router);    
app.use('/', express.static(staticDir));

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir: layoutsDir,
    partialsDir: viewsDir,
    helpers: {
        resource: function() {
            var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            var key = path.join.apply(path, ['static'].concat(args));
            var buster = busters[key];
            var url = path.join.apply(path, ['/', 'static', buster].concat(args));
            return url;
        }
    }    
}));

app.use(function(req, res, err, next){
    res.status(500).sendfile(path.join(staticDir, 'html', '500.html'));
});

app.use(function(req, res, next){
    res.status(404).sendfile(path.join(staticDir, 'html', '404.html'));
});

app.listen(config.server.port, config.server.host, function() {
    logger.info('%s is listening on %s:%s in %s', packageJson.name, config.server.host, config.server.port, environment);
    logger.info('%s', quote());
});