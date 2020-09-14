var path = require('path');
var webpack = require('webpack');
var mergeConfigs = require('../util/mergeConfigs');
var cssConfig = require('./common/css.config');

module.exports = mergeConfigs(cssConfig('enterprise', 'splunkjs-dashboard.css'), {
    output: {
        path: path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'build', 'css')
    },
    entry: {
        dashboard: path.join(process.env.SPLUNK_SOURCE, 'web/search_mrsparkle/exposed/js/views/dashboard/DashboardPage.pcss')
    }
});
