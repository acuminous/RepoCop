var moment = require('moment');

module.exports = {
    fromNow: function(date) {
        return date ? moment(date).fromNow() : '';
    }
}