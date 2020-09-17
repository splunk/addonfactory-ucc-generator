var path = require('path');
var _ = require('lodash');
var webpack = require('webpack');
var mergeConfigs = require('../util/mergeConfigs');
var sharedConfig = require('./common/shared.config');
var postCssConfig = require('./common/postcss.config');

var entryPath = path.join(process.env.SPLUNK_SOURCE, 'web', 'build_tools', 'profiles', 'simplexml', 'index.js');

module.exports = function(options) {
    var outputPath = path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'build', 'simplexml');
    return mergeConfigs(sharedConfig, _.merge({}, options, postCssConfig({
        loadTheme: 'enterprise',
        profileName: 'simplexml'
    })), {
        output: {
            path: outputPath,
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },
        entry: {
            index: 'splunk-public-path-injection-loader?static/build/simplexml!' + entryPath
        }
    });
}
