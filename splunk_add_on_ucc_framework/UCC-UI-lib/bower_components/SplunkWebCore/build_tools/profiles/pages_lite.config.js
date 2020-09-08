var pagesBase = require('./common/pages.config');
var _ = require('lodash');
module.exports = function(options) {
    return pagesBase('lite', _.merge({}, {profileName: 'pages-lite'}, options));
}
