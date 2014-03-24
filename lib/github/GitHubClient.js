var GitHubApi = require('github');
var _ = require('lodash');
var PagedResults = require('./PagedResults');
var json = require('../util/json');

module.exports = GitHubClient;

function GitHubClient(options) {

    var options = _.defaults(options || {}, { version: "3.0.0", timeout: 5000 });
    var github = new GitHubApi(options);

    this.authenticate = function(options, next) {
        github.authenticate(options);
        return next && next();
    }

    this.getOrganisationRepositories = function(organisation, next) {

        new PagedResults(function(page, callback) {
            github.repos.getFromOrg({org: organisation, per_page: 100, page: page}, function(err, res) {
                if (err) return callback(err);
                callback(null, res, github.hasNextPage(res));
            });
        }).combine(next)
    }

    this.getContent = function(user, repo, path, next) {
        github.repos.getContent({ 
            user: user,
            repo: repo,
            path: path
        }, function(err, content) {
            if (err && json.isJson(err)) return next(JSON.parse(err));
            next(err, content);
        })
    }

    this.getBytes = function(user, repo, path, next) {  
        this.getContent(user, repo, path, function(err, content) {
            if (err && err.message == 'Not Found') return next();
            if (err) return next(err);
            next(null, new Buffer(content.content, 'base64'));
        })      
    };    
}