var recluster = require('recluster');
var path = require('path');
var fs = require('fs');
var request = require('request');
var url = require('url');
var packageJson = require('./package.json');
var logger = require('./lib/util/logger');
var environment = require('./lib/util/environment');
var config = require('./lib/util/config');
var quote = require('./lib/util/quote');

var surveyUrl = url.format({
    protocol: 'http',
    hostname: config.server.host, 
    port: config.server.port,
    pathname: '/api/survey'
});
var started = 0;

if (environment === 'production' && !fs.existsSync('conf/private.json')) {
    throw new Error('File not found: conf/private.json');
}

var cluster = recluster('app.js', { workers: config.server.workers });
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

cluster.on('message', function(worker, message) {
    if (message.type === 'started') {
        logger.info('%s %s is listening on %s:%s in %s', packageJson.name, worker.workerID, config.server.host, config.server.port, environment);    
        if (++started >= config.server.workers) logger.info(quote()); 
    }
})

fs.writeFile(packageJson.name + '.pid', process.pid + '\n', function(err) {
    if (err) throw err;
});
