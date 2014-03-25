var _ = require('lodash');
var async = require('async');

module.exports = getRepositories;

function getRepositories(organisation, next) {    
    organisation.provider.getOrganisationRepositories(organisation.name, function(err, repos) {
        if (err) next(err);
        organisation.repositories = _.where_(repos, {'fork': false});
        next();
    });
}