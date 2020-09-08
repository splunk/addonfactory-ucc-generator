var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var _ = require('lodash');
var mergeConfigs = require('../../util/mergeConfigs');
var appDefaultConfig = require('./appBase.config');
var SplunkNameModuleIdsPlugin = require('../../plugins/SplunkNameModuleIdsPlugin');

module.exports = function(appDir, appName, options) {
    var publicPathInjectionLoader = 'splunk-public-path-injection-loader?/static/app/' + appName + '/build/pages!';

    var filter = new RegExp(options.filter);
    var plugins = [
        new SplunkNameModuleIdsPlugin({
            context: path.join(appDir, 'src'),
            prefix: appName + ':/'
        })
    ];
    var entries = fs.readdirSync(path.join(appDir, 'src', 'pages'))
        .map(function(pageFile) {
            return pageFile.slice(0, -3);
        })
        .reduce(function(accum, page) {
            if (filter.test(page)) {
                accum[page] = publicPathInjectionLoader + 'pages/' + page;
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

    return mergeConfigs(appDefaultConfig(appDir, _.merge({}, {profileName: appName}, options)), {
        output: {
            path: path.join(appDir, 'appserver', 'static', 'build', 'pages'),
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },
        plugins: plugins,
        entry: entries
    });

};
