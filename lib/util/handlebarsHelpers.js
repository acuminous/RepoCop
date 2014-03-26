var moment = require('moment');

module.exports = {
    fromNow: function(date) {
        return date ? moment(date).fromNow() : '';
    },
    importanceValue: function(importance) {
        return { low: 1, medium: 2, high: 3, critical: 4 }[importance] || 0;
    }
}