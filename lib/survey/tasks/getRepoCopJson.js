var _ = require('lodash');
var async = require('async');
var json = require('../../util/json');
var logger = require('../../util/logger');

module.exports = getRepoCopMetadata;

function getRepoCopMetadata(organisation, next) {

    var q = async.queue(function(task, callback) {
        logger.info("Fetching %s metadata", task.repo.full_name);

        organisation.provider.getBytes(task.organisation.name, task.repo.name, 'repocop.json', function(err, buffer) {  
            if (err) return captureError(task.repo, err, callback);
            if (!buffer) return callback();
            parseRepocopJson(repo, buffer);
        });
    }, 5);

    q.drain = next;

    _.each(organisation.repositories, function(repo) {
        q.push({organisation: organisation, repo: repo})
    })

    function parseRepocopJson(repo, buffer, next) {
        json.parse(buffer.toString('utf8'), function(err, repocopJson) {
            if (err) return captureError(repo, err);
            repo.metadata = repocopJson;
            next();                
        });
    }

    function captureError(repo, err, next) {
        repo.error = err;
        logger.error('Error fetching metadata for %s : %s', repo.name, err.message);
        next();
    }
}