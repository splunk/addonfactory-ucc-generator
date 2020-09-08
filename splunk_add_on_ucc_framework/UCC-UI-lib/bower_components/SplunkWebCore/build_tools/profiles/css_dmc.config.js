var path = require('path');
var mergeConfigs = require('../util/mergeConfigs');
var cssConfig = require('./common/css.config.js');

module.exports = function() {
    return mergeConfigs( cssConfig('enterprise', '[name].css'),
    {
        output: {
            path: path.join(process.env.SPLUNK_HOME, 'etc', 'apps', 'splunk_monitoring_console', 'appserver', 'static')
        },
        entry: {
            'bucket-bar': path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js', 'views', 'shared', 'pcss', 'bucket-bar.pcss')
        }
    });
};
