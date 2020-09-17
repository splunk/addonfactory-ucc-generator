var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');

var mergeConfigs = require('../../util/mergeConfigs');
var sharedConfig = require('./shared.config');
var postcssConfig = require('./postcss.config');
var postcssOptions = {
    loadTheme: 'enterprise'
};
/**
 * Library config - A convenience config for generating a standalone library of
 * Splunk web code. The config is an entry file or files that export the desired
 * Splunk web modules the library should expose. The output will be a single
 * file for each entry with a umd module.
 *
 * @example
 *     // File that configPath points to
 *     module.exports = {
 *         SearchManager: require('splunkjs/mvc/searchmanager')
 *         // Any module in Splunk we can be listed and aliased here
 *     }
 *
 * @param  {String | Object} [configs] Path or dictionary of 'name: path' pairs
 * to an entry module or modules that expose the desired Splunk web modules
 * @param {String} [name] Name of the output file. Defaults to the basename of the
 * configPath.
 * @return {Object}            A webpack config object
 */
module.exports = function(configs, name, options) {
    var entry = {}

    // If the entry is an object, we use it, otherwise we build and object from the path string
    if(_.isObject(configs)){
        entry = configs;
    }   
    else {
        if (!name) {
            name = path.basename(configs, '.js');
        }
        entry[name] = path.resolve(configs);
    }
    return mergeConfigs(sharedConfig, postcssConfig(_.merge({}, options, postcssOptions)), {
        output: {
            path: '.',
            filename: '[name].js',
            sourceMapFilename: '[file].map',
            libraryTarget: 'umd'
        },
        entry: entry,
        plugins: [
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1
            })
        ]
    });
};
