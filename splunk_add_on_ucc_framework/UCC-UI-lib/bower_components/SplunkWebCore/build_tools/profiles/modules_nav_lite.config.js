var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var mergeConfigs = require('../util/mergeConfigs');
var sharedConfig = require('./common/shared.config');
var postCssConfig = require('./common/postcss.config');

var entryPath = path.join(process.env.SPLUNK_SOURCE, 'web', 'build_tools', 'profiles', 'modules_nav', 'index.js');

module.exports = function(options) {
    return mergeConfigs(sharedConfig, postCssConfig(_.merge({}, options, {
        loadTheme: 'lite',
        profileName: 'modules-nav-lite'
        })), {
        output: {
            path: path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'build', 'modules_nav', 'lite'),
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },
        entry: {
            'index': 'splunk-public-path-injection-loader?static/build/js!' + entryPath
        }
    });
}
