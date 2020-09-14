var path = require('path');
var fs = require('fs');
var assert = require('assert');
var _ = require('lodash');
var webpack = require('webpack');
var mergeConfigs = require('../../util/mergeConfigs');
var sharedConfig = require('./shared.config');
var postCssConfig = require('./postcss.config');

/**
 * Returns a webpack config to build the Splunk core pages.
 *
 * @param {String} theme - Either 'enterprise' or 'lite'.
 * @param {Object} options - Build configuration options.
 * @param {String} [options.filter] - A filter to determine a subset of pages to build.
 * @param {String} [options.version] - Version number of build for css-module hasing.
 * @returns {Object} - Webpack configuration object.
 */
module.exports = function(theme, options) {
    if (!_.isObject(options)) {
        console.warn('Unknown configuration option provided:', options);
        process.exit(1);
    }
    var filter = new RegExp(options.filter);

    var pages_dir = path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js', 'pages');
    var publicPathInjectionLoader = 'splunk-public-path-injection-loader?/static/build/pages/' + theme + '!';
    var outputPath = path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'build', 'pages', theme);
    var plugins = [];
    var entries = fs.readdirSync(pages_dir)
        .reduce(function(accum, pageFile) {
            if (/\.(js|jsx|es)$/.test(pageFile)) {
                var page = pageFile.replace(/\.(js|jsx|es)$/, '');

                if (filter.test(page)) {
                    accum[page] = publicPathInjectionLoader + 'pages/' + page;
                }
            }
            return accum;
        }, {});

    if (_.isEmpty(entries)) {
        console.warn('Page filter', options.filter, 'did not match any pages');
        process.exit(1);
    }
    if (!options.filter) {
        // Only use the commons chunk plugin when building all of the pages.
        var commonsChunkPlugin = new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            minChunks: 3
        });
        plugins.push(commonsChunkPlugin);
    }
    return mergeConfigs(sharedConfig, postCssConfig({
        profileName: options.profileName,
        splunkVersion: options.splunkVersion,
        loadTheme: theme
    }), {
        output: {
            path: outputPath,
            filename: '[name].js',
            chunkFilename: '[name].[hash].js',
            sourceMapFilename: '[file].map'
        },
        plugins: plugins,
        entry: entries
    });
};
