var GitHubClient = require('../../github/GitHubClient'),
    BitBucketClient = require('../../bitbucket/BitBucketClient');

module.exports = setProvider;

function setProvider(organisation, next) {

    var providerFactories = {
        github: function() {
            return new GitHubClient();
        },
        bitbucket: function() {
            return new BitBucketClient();
        }
    }

    var factory = providerFactories[organisation.providerKey];
    if (!factory) return next(new Error('Unknown provider: ', organisation.provider));
    organisation.provider = factory();
    next();
}