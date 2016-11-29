var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var devConfig = require('./devConfig');

var rootDir = path.join(__dirname, '../../');
var repoBaseDir = path.join(__dirname, '../../..');

var webpackDir = path.join(rootDir, 'bower_components', 'SplunkWebCore', 'build_tools');
var mergeConfigs = require(path.join(webpackDir, '/util/mergeConfigs'));
var sharedConfig = require(path.join(webpackDir, 'profiles/common/shared.config'));
var postCssConfig = require(path.join(webpackDir, 'profiles/common/postcss.config'));
var appDir = path.join(rootDir, 'package');
var requireToDefineLoader = 'splunk-require-to-define-loader!';

var appJsDir = path.join(appDir, 'appserver', 'static', 'js');

var entries = fs.readdirSync(path.join(appDir, 'appserver', 'static', 'js', 'pages'))
    .filter(function(pageFile) {
        return /\.js$/.test(pageFile);
    })
    .map(function(pageFile) {
        return pageFile.slice(0, -3);
    })
    .reduce(function(accum, page) {
        accum[page] = requireToDefineLoader + path.join(appJsDir, 'pages', page);
        return accum;
    }, {});

module.exports = mergeConfigs(sharedConfig, postCssConfig({ loadTheme: 'enterprise' }), {
        resolve: {
            alias: {
              app: appJsDir,
              'lib/lodash': path.join(rootDir, 'bower_components', "lodash", "dist", "lodash"),
              lib: path.join(appJsDir, 'lib'),
              lodash: path.join(appJsDir, 'shim', 'lodash'),
              select2: path.join(rootDir, 'bower_components', 'select2', 'select2.min'),
              rootDir: rootDir,
              repoBaseDir: repoBaseDir,
              bootstrap: path.join(rootDir, 'bower_components', 'SplunkWebCore', 'search_mrsparkle', 'exposed', 'js', 'contrib', 'bootstrap-2.3.1.min'),
              numeral: path.join(appJsDir, 'shim', 'numeral') // this is to fix the i18m issues. The issue should be resolved in 6.5
            }
        },
        module: {
            loaders: [
                { test: /\.js$/, include: appJsDir, loader: 'babel' },
                { test: /\.html$/, include: appJsDir, loader: 'raw' }
            ]
        },
        output: {
            path: path.join(rootDir, 'build', 'appserver', 'static', 'js', 'build'),
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },
        entry: entries
    }
);
