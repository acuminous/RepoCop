var recluster = require('recluster');
var path = require('path');
var fs = require('fs');
var request = require('request');
var url = require('url');
var logger = require('./lib/util/logger');
var environment = require('./lib/util/environment');
var config = require('./lib/util/config');
var quotes = require('./lib/util/quotes');

var surveyUrl = url.format({
    protocol: 'http',
    hostname: config.server.host, 
    port: config.server.port,
    pathname: '/api/survey'
});

var cluster = recluster('app.js', { workers: config.server.workers });
cluster.run();

if (config.survey.frequency) {
    setTimeout(function() {
        (function scheduleSurvey() {
            requestSurvey();
            setTimeout(scheduleSurvey, config.survey.frequency);
        })();
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

cluster.on('exit', function(worker) {
    logger.warn('RepoCop %s exited.', worker.workerID);
    logger.warn(quotes.shutdown());
})

var started = 0;
cluster.on('message', function(worker, message) {
    if (message.type === 'started') {
        logger.info('RepoCop %s is listening on %s:%s in %s', worker.workerID, config.server.host, config.server.port, environment);    
        if (++started >= config.server.workers) logger.info(quotes.startup()); 
    }
})