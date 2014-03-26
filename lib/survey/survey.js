var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var duration = require('../util/duration');
var config = require('../util/config');
var logger = require('../util/logger');
var tasks = require('./tasks/index');

module.exports = {
    trigger: trigger,
    conduct: conduct
};

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

    async.each(context.organisations, survey, function(err) {
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
            tasks.getRepositoryMetadata.bind(this, organisation),
            tasks.getRecentActivity.bind(this, organisation)
        ], next)
    }

    function save(survey, next) {
        logger.info("Saving survey");
        fs.writeFile(config.survey.output, JSON.stringify(survey, null, 2), 'utf8', next);
    }    
}    