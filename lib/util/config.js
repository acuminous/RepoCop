var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var environment = require('./environment');

module.exports = config();

function config() {

    var files = [
        path.join('conf', 'default.json'),    
        path.join('conf', environment + '.json'),
        path.join(path.sep, 'etc', 'repocop', 'repocop.json');
    ]

    var nconf = require('nconf').argv();

    _.each(files, function(file) {
        if (fs.existsSync(file)) nconf.file(file);
    });

    return nconf.get();
}
