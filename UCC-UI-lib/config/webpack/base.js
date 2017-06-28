var path = require('path');

var rootDir = path.join(__dirname, '../../');
var repoBaseDir = path.join(__dirname, '../../..');

var webpackDir = path.join(rootDir, 'bower_components', 'SplunkWebCore', 'build_tools');
var mergeConfigs = require(path.join(webpackDir, '/util/mergeConfigs'));
var sharedConfig = require(path.join(webpackDir, 'profiles/common/shared.config'));
var postCssConfig = require(path.join(webpackDir, 'profiles/common/postcss.config'));
var appDir = path.join(rootDir, 'package');
var appJsDir = path.join(appDir, 'appserver', 'static', 'js');
var appCssDir = path.join(appDir, 'appserver', 'static', 'css');
var testsDir = path.join(rootDir, 'testes');

module.exports = mergeConfigs(sharedConfig, postCssConfig({ loadTheme: 'enterprise' }), {
        resolve: {
            alias: {
              app: appJsDir,
              'lib/lodash': path.join(rootDir, 'bower_components', 'lodash', 'dist', 'lodash.min'),
              lodash: path.join(appJsDir, 'shim', 'lodash'),
              rootDir: rootDir,
              repoBaseDir: repoBaseDir,
              appCssDir: appCssDir,
              numeral: path.join(appJsDir, 'shim', 'numeral') // this is to fix the i18m issues. The issue should be resolved in 6.5
            }
        },
        module: {
            loaders: [
                { test: /\.js$/, include: [appJsDir, testsDir], loader: 'babel' },
                { test: /\.html$/, include: [appJsDir, testsDir], loader: 'raw' }
            ]
        },
        output: {
            path: path.join(rootDir, 'build', 'appserver', 'static', 'js', 'build'),
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },
        entry: {
            entry_page: path.join(appJsDir, 'pages', 'entry_page')
        },
        // use external requirejs to load dynamic components
        externals: {
            'requirejs': 'requirejs'
        }
    }
);
