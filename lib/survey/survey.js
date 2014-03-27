var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var duration = require('../util/duration');
var config = require('../util/config');
var logger = require('../util/logger');
var json = require('../util/json');
var environment = require('../util/environment');
var tasks = require('./tasks/index');

module.exports = {
    display: display,
    trigger: trigger,
    conduct: conduct
};

function display(req, res) {
    load(function(err, repositories) {
        if (err) logger.error('Error loading survey: %s', err.message);
        res.render('repositories', { 
            environment: environment, 
            repositories: repositories || []
        });
    });    
}

function trigger(req, res) {
    res.send(202, 'Accepted\n');

    duration(conduct, function(err, millis) {
        err ? logger.error('Error conducting survey: %s', err.message)
            : logger.info('Survey completed in %s', millis / 1000 + 's');
    });
}

function conduct(next) {
    
    logger.info('Conducting survey');        
    var context = _.cloneDeep(config.survey);

    async.each(context.organisations || [], survey, function(err) {
        if (err) return next(err);
        var repositories = _.chain(context.organisations)
                            .pluck('repositories')
                            .flatten()
                            .sort(function(a, b) {
                                return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                            })
                            .value();
        save(repositories, next);
    })

    function survey(organisation, next) {
        logger.info("Surveying %s", organisation.name);
        organisation.repositories = {}; 
        async.series([
            tasks.setProvider.bind(this, organisation),
            tasks.authenticate.bind(this, organisation),
            tasks.getRepositories.bind(this, organisation),
            tasks.getRepoCopJson.bind(this, organisation),
            tasks.getMostRecentActivity.bind(this, organisation)
        ], next)
    }    
}    

function save(survey, next) {
    fs.writeFile(config.survey.output, JSON.stringify(survey, null, 2), 'utf8', next);
}

function load(next) {
    fs.readFile(config.survey.output, 'utf8', function(err, text) {
        if (err) return next(err);
        json.parse(text, next);
    });
}