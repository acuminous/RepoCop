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
            github.repos.getFromOrg({
                org: organisation, 
                per_page: 100, 
                page: page
            }, function(err, repos) {
                if (err) return callback(extractError(err));
                callback(null, repos, github.hasNextPage(repos));
            });
        }).combine(next)
    }

    this.getContent = function(user, repo, path, next) {
        github.repos.getContent({ 
            user: user,
            repo: repo,
            path: path
        }, function(err, content) {
            next(extractError(err), content);
        })
    }

    this.getBytes = function(user, repo, path, next) {  
        this.getContent(user, repo, path, function(err, content) {
            if (err && err.message == 'Not Found') return next();
            if (err) return next(err);
            next(null, new Buffer(content.content, 'base64'));
        })      
    } 

    this.getCommits = function(user, repo, next) {
        github.repos.getCommits({
            user: user, 
            repo: repo, 
            per_page: 100, 
            page: 1
        }, function(err, commits) {
            next(extractError(err), commits);
        });
    }

    this.filterClause = function() {
        return {'fork': false};
    }

    this.mapper = function(repo) {
        return _.pick(repo, 'id', 'name', 'description', 'full_name', 'html_url', 'private', 'language');
    }

    this.toActivity = function(entry) {
        return _.chain(entry.commit.author)
                .extend(entry.author)
                .extend({ date: new Date(entry.commit.author.date) })
                .extend({ message: entry.commit.message })
                .pick('name', 'email', 'date', 'login', 'id', 'message', 'avatar_url', 'html_url')
                .value();
    }


    function extractError(err) {
        return err && json.isJson(err.message) ? JSON.parse(err.message) : err;
    }    
}