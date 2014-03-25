var recluster = require('recluster');
var path = require('path');
var fs = require('fs');
var packageJson = require('./package.json');
var logger = require('./lib/util/logger');
var request = require('request');
var url = require('url');
var config = require('./lib/util/config');
var surveyUrl = url.format({
    protocol: 'http',
    hostname: config.server.host, 
    port: config.server.port,
    pathname: '/api/survey'
});

var cluster = recluster('app.js', { workers: 1 });
cluster.run();

if (config.survey.frequency) {
    setTimeout(function() {
        requestSurvey();
        setTimeout(requestSurvey, config.survey.frequency);
    }, 10000);
};

function requestSurvey() {
    request.post(surveyUrl, function(err, response) {
        if (err) return logger.error('Error triggering survey: %s', err.message);
        if (response.statusCode != 202) return logger.error('Error triggering survey: %s', response.statusCode);
    });    
}

process.on('SIGUSR2', function() {
    logger.warn('Reloading cluster');
    cluster.reload();
});

fs.writeFile(packageJson.name + '.pid', process.pid + '\n', function(err) {
    if (err) throw err;
});
