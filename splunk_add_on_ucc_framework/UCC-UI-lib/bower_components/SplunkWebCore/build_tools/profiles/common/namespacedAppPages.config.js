var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var _ = require('lodash');
var mergeConfigs = require('../../util/mergeConfigs');
var sharedConfig = require('./shared.config');
var postcssConfig = require('./postcss.config');
var SplunkNameModuleIdsPlugin = require('../../plugins/SplunkNameModuleIdsPlugin');
var postcssOptions = {
    loadTheme: 'enterprise'
};

module.exports = function(appDir, appName, options) {
    var loadTheme = options.loadTheme ? '/' + options.loadTheme : '';
    var publicPath = options.publicPath || '/static/app/' + appName + '/build/pages' + loadTheme;
    var publicPathInjectionLoader = 'splunk-public-path-injection-loader?' + publicPath +'!';
    var filter = new RegExp(options.filter);
    var appAlias = appName;
    var alias = {};
    alias[appAlias] = path.join(appDir, 'src');

    var plugins = [
        new SplunkNameModuleIdsPlugin({
            context: path.join(appDir, 'src'),
            prefix: appName + '-'
        })
    ];
    var entries = fs.readdirSync(path.join(appDir, 'src', 'pages'))
        .map(function(pageFile) {
            return pageFile.slice(0, -3);
        })
        .reduce(function(accum, page) {
            if (filter.test(page)) {
                accum[page] = publicPathInjectionLoader + appAlias + '/pages/' + page;
            }
            return accum;
        }, {});

    if (_.isEmpty(entries)) {
        console.warn('Page filter', options.filter, 'did not match any pages');
        process.exit(0);
    }

    if (!options.filter) {
        // Only use the commons chunk plugin when building all of the pages.
        var commonsChunkPlugin = new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            minChunks: 3
        });
        plugins.push(commonsChunkPlugin);
    }

    postcssOptions = _.merge({}, postcssOptions, options);
    return mergeConfigs(sharedConfig, postcssConfig(postcssOptions), {
        resolve: {
            alias: alias
        },
        output: {
            path: path.join(appDir, 'appserver', 'static', 'build', 'pages'),
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },
        plugins: plugins,
        entry: entries
    });
};
