var _ = require('lodash');
var async = require('async');
var json = require('../../util/json');
var logger = require('../../util/logger');

module.exports = getMostRecentActivity;

function getMostRecentActivity(organisation, next) {

    var names = {};

    var q = async.queue(function(task, callback) {
        logger.info("Fetching %s %s commits", task.repo.providerKey, task.repo.full_name);

        organisation.provider.getCommits(task.organisation.name, task.repo.name, function(err, commits) {
            if (err) return handleError(task.repo, err, callback);
            task.repo.activity = getActivity(commits);
            callback();
        });
    }, 2);

    q.drain = next;

    _.each(organisation.repositories, function(repo) {
        q.push({organisation: organisation, repo: repo})
    }) 

    function getActivity(commits) {
        return _.chain(commits).map(organisation.provider.toActivity).unique(byAuthor).sort(byCommitDate).reverse().slice(0, 5).value();
    }

    function byAuthor(author) {
        return author.id || author.name;
    }

    function byCommitDate(author) {
        return author.date;
    }

    function handleError(repo, err, next) {
        repo.error = err;
        logger.error('Error fetching commits for %s : %s', repo.name, err.message);
        next();
    }
}