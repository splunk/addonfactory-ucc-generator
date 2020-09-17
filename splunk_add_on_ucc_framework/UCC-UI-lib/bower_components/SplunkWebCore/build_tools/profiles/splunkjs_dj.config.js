var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var mergeConfigs = require('../util/mergeConfigs');
var sharedConfig = require('./common/shared.config');
var postCssConfig = require('./common/postcss.config');

var entryPath = path.join(process.env.SPLUNK_SOURCE, 'web', 'build_tools', 'profiles', 'splunkjs_dj', 'index.js');

module.exports = function(options) {
    return mergeConfigs(sharedConfig, _.merge({}. options, postCssConfig({
        loadTheme: 'enterprise',
        profileName: 'splunkjs_dj'
        })), {
        output: {
            path: path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'build', 'splunkjs_dj'),
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },
        entry: {
            index: 'splunk-public-path-injection-loader?static/build/splunkjs_dj!' + entryPath
        },
        resolve: {
            alias: {
                'framework.i18n': path.join(process.env.SPLUNK_SOURCE, 'cfg', 'bundles', 'framework', 'server', 'static', 'i18n')
            }
        },
        externals: {
            'splunkjs/generated/urlresolver': 'urlresolver'
        }
    });
}
