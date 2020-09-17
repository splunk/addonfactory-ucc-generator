var path = require('path');
var webpack = require('webpack');
var mergeConfigs = require('../util/mergeConfigs');
var sharedConfig = require('./common/shared.config');

var entryPath = path.join(process.env.SPLUNK_SOURCE, 'web', 'build_tools', 'profiles', 'jscharting', 'index.js');

module.exports = mergeConfigs(sharedConfig, {
    output: {
        path: path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'build', 'jscharting'),
        filename: '[name].js',
        sourceMapFilename: '[file].map'
    },
    entry: {
        index: entryPath
    }
});
