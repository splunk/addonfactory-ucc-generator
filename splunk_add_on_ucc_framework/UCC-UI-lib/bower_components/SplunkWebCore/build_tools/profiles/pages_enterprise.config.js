var pagesBase = require('./common/pages.config');
var _ = require('lodash');
module.exports = function(options) {
    return pagesBase('enterprise', _.merge({}, {profileName: 'pages-enterprise'}, options));
}
