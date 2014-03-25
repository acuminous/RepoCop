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
    var surveyPath = req.app.get('surveyPath');

    duration(function(next) {
        logger.info('Conducting survey');        
        conduct(function(err, survey) {
            if (err) return next(err);
            fs.writeFile(surveyPath, JSON.stringify(survey, null, 2), 'utf8', next);
        });
    }, function(err, millis) {
        err ? logger.error('Error conducting survey: %s', err)
            : logger.info('Survey completed in %s', millis / 1000 + 's');
    });
}

function conduct(next) {
    var context = _.cloneDeep(config.survey);

    async.each(context.organisations, surveyOrganisation, function(err) {
        if (err) return next(err);
        next(null, context.organisations);
    })

    function surveyOrganisation(organisation, next) {
        organisation.repositories = {}; 
        async.series([
            tasks.setProvider.bind(this, organisation),
            tasks.authenticate.bind(this, organisation),
            tasks.getRepositories.bind(this, organisation),
            tasks.getRepositoryMetadata.bind(this, organisation)
        ], next)
    }

    function toSurvey(organisation) {
        return _.pick(organisation, 'name', 'repositories');
    }
}    