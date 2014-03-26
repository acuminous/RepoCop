var _ = require('lodash');
var async = require('async');
var json = require('../../util/json');
var logger = require('../../util/logger');

module.exports = getRepositoryMetadata;

function getRepositoryMetadata(organisation, next) {

    var q = async.queue(function(task, callback) {
        logger.info("Fetching %s metadata", task.repo.full_name);

        organisation.provider.getBytes(task.organisation.name, task.repo.name, 'package.json', function(err, buffer) {  
            if (err) return recordError(task.repo, err, callback);
            if (!buffer) return callback();
            json.parse(buffer.toString('utf8'), function(err, packageJson) {
                if (err) return callback(err);
                task.repo.metadata = packageJson;
                callback();                
            });
        });
    }, 5);

    q.drain = next;

    _.each(organisation.repositories, function(repo) {
        q.push({organisation: organisation, repo: repo})
    })

    function recordError(repo, err, next) {
        logger.error('Error fetching commits for %s: %s', repo.name, err.message);
        repo.error = json.isJson(err.message) ? JSON.parse(err.message) : err;
        next();
    }
}