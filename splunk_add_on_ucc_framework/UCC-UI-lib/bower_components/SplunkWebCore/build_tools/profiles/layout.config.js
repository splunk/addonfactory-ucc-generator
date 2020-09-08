var path = require('path');
var _ = require('lodash');
var libraryConfig = require('./common/library.config');
var mergeConfigs = require('../util/mergeConfigs');
var SplunkLayoutUMDTemplateReplacementPlugin = require('../plugins/SplunkLayoutUMDTemplateReplacementPlugin');

var entry = path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js', 'api', 'layout.js');
module.exports = function(options) {
    return mergeConfigs(libraryConfig(entry, null, _.merge({}, {profileName: 'layout'}, options)), {
        output: {
            path: path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'build', 'api')
        },
        plugins: [
            new SplunkLayoutUMDTemplateReplacementPlugin()
        ]
    });
}
