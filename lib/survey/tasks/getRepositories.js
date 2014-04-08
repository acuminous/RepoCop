var _ = require('lodash');
var async = require('async');
var logger = require('../../util/logger');

module.exports = getRepositories;

function getRepositories(organisation, next) { 
    logger.info('Fetching %s %s repositories', organisation.providerKey, organisation.name);
    organisation.provider.getOrganisationRepositories(organisation.name, function(err, repos) {
        if (err) return next(err);
        organisation.repositories = _.chain(repos)
                                     .where(organisation.provider.filterClause())
                                     .map(organisation.provider.mapper)
                                     .map(addField(organisation.providerKey))
                                     .value();
        next();
    });

    function addField(providerKey) {
        return function(repo) {
            repo.providerKey = providerKey;
            return repo;
        }
    };
}