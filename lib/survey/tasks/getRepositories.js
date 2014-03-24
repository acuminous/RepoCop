var _ = require('lodash');
var async = require('async');

module.exports = getRepositories;

function getRepositories(organisation, next) {    
    organisation.provider.getOrganisationRepositories(organisation.name, function(err, repos) {
        if (err) next(err);
        organisation.repositories = _.map(repos, toBasicRepo);
        next();
    });

    function toBasicRepo(repo) {
        return _.pick(repo, 'id', 'name', 'full_name');
    }    
}