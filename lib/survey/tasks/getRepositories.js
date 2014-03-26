var _ = require('lodash');
var async = require('async');
var logger = require('../../util/logger');

module.exports = getRepositories;

function getRepositories(organisation, next) { 
    logger.info("Fetching %s repositories", organisation.name);
    organisation.provider.getOrganisationRepositories(organisation.name, function(err, repos) {
        if (err) next(err);
        organisation.repositories = _.chain(repos)
                                     .where({'fork': false})
                                     .map(toMinimalDetails)
                                     .value();
        next();
    });

    function toMinimalDetails(repo) {
        return _.pick(repo, 'id', 'name', 'full_name', 'private', 'language');
    }
}