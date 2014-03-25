var _ = require('lodash');
var async = require('async');
var logger = require('../../util/logger');

module.exports = getRepositories;

function getRepositories(organisation, next) { 
    logger.info("Fetching %s repositories", organisation.name);
    organisation.provider.getOrganisationRepositories(organisation.name, function(err, repos) {
        if (err) next(err);
        organisation.repositories = _.where(repos, {'fork': true});
        next();
    });
}