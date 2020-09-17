var path = require('path');

var _ = require('lodash');
var webpack = require('webpack');
var ProgressPlugin = require('webpack/lib/ProgressPlugin');

var collectFilesSync = require('../util/collectFilesSync');
var mergeConfigs = require('../util/mergeConfigs');
var postCssConfig = require('./common/postcss.config');
var sharedConfig = require('./common/shared.config');

var SPLUNK_SOURCE = path.resolve(__dirname, '../../..');
var ROOT_DIR = path.resolve(__dirname, '../../search_mrsparkle/exposed/js');

// Create a webpack config object
module.exports = function(options) {
    var filter = options.filter ?
            new RegExp(options.filter) :
            /\.pcss$|\.pcssm$/;

    // Create a map of entry files
    var entries = collectFilesSync(ROOT_DIR, filter, true)
        .reduce(function(accum, file) {
            var name = path.relative(ROOT_DIR, file);
            accum[name] = name;
            return accum
        }, {});

    return mergeConfigs(sharedConfig, postCssConfig({
        loadTheme: 'enterprise'
    }), {
        output: {
            path: path.join(SPLUNK_SOURCE, 'web/search_mrsparkle/exposed/js'),
            filename: '[name].js',
            libraryTarget: 'amd'
        },
        plugins: [
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1
            })
        ],
        entry: entries
    });
}
