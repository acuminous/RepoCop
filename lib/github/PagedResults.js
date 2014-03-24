var _ = require('lodash');
var async = require('async');

module.exports = PagedResults;

function PagedResults(iterator) {    

    var index = 1;
    var results = [];
    var self = this;
    var hasFinished = false;

    this.combine = function(next) {
        async.doUntil(function(callback) {
            iterator(index++, function(err, page, hasNextPage) {
                if (err) return callback(err);
                results = results.concat(page);
                hasFinished = !hasNextPage;
                callback();
            });
        }, function() {
            return self.hasFinished();
        }, function(err) {
            next(err, results);
        })
    }

    this.hasFinished = function() {
        return hasFinished;
    }
};