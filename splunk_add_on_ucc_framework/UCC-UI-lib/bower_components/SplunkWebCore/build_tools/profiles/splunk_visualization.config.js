var path = require('path');
var _ = require('lodash');
var libraryConfig = require('./common/library.config');
var mergeConfigs = require('../util/mergeConfigs');

var entry = {
    'SplunkVisualizationBase': path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js', 'api', 'SplunkVisualizationBase.js'),
    'SplunkVisualizationUtils': path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js', 'api', 'SplunkVisualizationUtils.js')
}
    
module.exports = function(options) {
    return mergeConfigs(libraryConfig(entry, null, _.merge({}, {profileName: 'splunk_visualization'}, options)), {
        output: {
            path: path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'build', 'api'),
            libraryTarget: 'amd'
        }
    });
}
