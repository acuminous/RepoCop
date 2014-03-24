var _ = require('lodash');
var async = require('async');
var json = require('../../util/json');

module.exports = getRepositoryMetadata;

function getRepositoryMetadata(organisation, next) {

    var q = async.queue(function(task, callback) {
        organisation.provider.getBytes(task.organisation.name, task.repo.name, 'package.json', function(err, buffer) {  
            if (err) return callback(err);
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
}