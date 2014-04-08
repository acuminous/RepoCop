var bitbucketapi = require('bitbucket-api'),
    PagedResults = require('../github/PagedResults'),
    json = require('../util/json'),
    logger = require('../util/logger'),
    _ = require('lodash');

module.exports = BitBucketClient;

function BitBucketClient(options) {

    var options = _.defaults(options || {}, {});
    var bitbucket;

    this.authenticate = function(options, next) {
        // TODO write a newer BitBucket library that uses v2 and OAuth!
        bitbucket = bitbucketapi.createClient(options);
        return next && next();
    }

    this.getOrganisationRepositories = function(organisation, next) {
        bitbucket.repositories(function(err, repos) {
            if (err) return next(err);
            next(null, repos);
        })
    }

    this.getContent = function(user, repo, path, next) {
        bitbucket.getRepository({ 
            owner: user,
            slug: repo
        }, function(err, repository) {
            repository.sources('/' + path).raw(function(err, res) {
                next(extractError(err), res.raw);
            })
        })
    }

    this.getBytes = function(user, repo, path, next) {  
        this.getContent(user, repo, path, function(err, content) {
            if (err && err.message == 'Not Found') return next();
            if (err) return next(err);
            if (content == 'Not Found' || content == 'error') return next();
            next(null, new Buffer(content));
        })
    } 

    this.getCommits = function(user, repo, next) {
        next(null, []);
        // TODO not sure this API works?
        // bitbucket.getRepository({ 
        //     owner: user,
        //     slug: repo
        // }, function(err, repository) {
        //     repository.changesets().get(50, '0', function(err, commits) {
        //         logger.debug('BB getCommits', err, commits);
        //         next(extractError(err), commits);
        //     });
        // })
    }

    this.filterClause = function() {
        return {'is_fork': false};
    }

    this.mapper = function(repo) {
        var mapped = _.pick(repo, 'name', 'description', 'resource_uri', 'is_private', 'language');
        // BitBucket doesn't seem to have id or full_name at all. Map other fields to be a bit like GitHubClient
        mapped.id        = mapped.name;
        mapped.full_name = mapped.resource_uri.replace('/1.0/repositories/', '');
        mapped.private   = mapped.is_private;
        mapped.html_url  = mapped.resource_uri.replace('/1.0/repositories', 'https://bitbucket.org');
        return mapped;
    }

    function extractError(err) {
        return err && json.isJson(err.message) ? JSON.parse(err.message) : err;
    }    
}