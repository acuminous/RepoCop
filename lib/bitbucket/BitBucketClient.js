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

    this.getContent = function(username, reponame, path, next) {
        bitbucket.getRepository({ 
            owner: username,
            slug: reponame
        }, function(err, repository) {
            repository.sources('/' + path).raw(function(err, res) {
                next(extractError(err), res.raw);
            })
        })
    }

    this.getBytes = function(username, reponame, path, next) {
        this.getContent(username, reponame, path, function(err, content) {
            if (err && err.message == 'Not Found') return next();
            if (err) return next(err);
            if (content == 'Not Found' || content == 'error') return next();
            next(null, new Buffer(content));
        })
    } 

    this.getCommits = function(username, reponame, next) {
        var repo = { 
            owner: username,
            slug: reponame
        };
        bitbucket.getRepository(repo, function(err, repository) {
            repository.changesets().get(5, null, function(err, commits) {
                next(extractError(err), _.chain(commits.changesets).extend(repo).value() );
            });
        })
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

    this.toActivity = function(commit) {
        var activity = {};
        activity.name = commit.author;
        activity.email = commit.raw_author;
        activity.date = commit.timestamp;
        activity.id = commit.node;
        activity.message = commit.message;
        activity.html_url = 'https://bitbucket.org/' + commit.owner + '/' + commit.slug + '/commits/' + commit.node;
        return activity;
    }

    function extractError(err) {
        return err && json.isJson(err.message) ? JSON.parse(err.message) : err;
    }    
}