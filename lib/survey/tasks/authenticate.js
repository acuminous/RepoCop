module.exports = authenticate;

function authenticate(organisation, next) {
    organisation.provider.authenticate(organisation.authentication, next);
}