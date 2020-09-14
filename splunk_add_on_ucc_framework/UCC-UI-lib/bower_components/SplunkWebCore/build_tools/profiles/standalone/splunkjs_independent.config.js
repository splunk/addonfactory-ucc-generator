var _ = require('lodash');
var path = require('path');
var webpack = require('webpack');
var constants = require('../../constants');
var mergeConfigs = require('../../util/mergeConfigs');
var sharedConfig = require('../common/shared.config');
var postCssConfig = require('../common/postcss.config');
var virtualModuleLoader = require('../../web_loaders/virtual-module-loader');

module.exports = mergeConfigs(
    sharedConfig,
    virtualModuleLoader.config,
    postCssConfig({
        loadTheme: 'enterprise'
    }),
    {
        output: {
            path: path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs'),
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },
        devtool: null, //this overrides dev.local.config.js to ensure a reproducible build
        entry: {
            config: path.join(constants.splunkJsIndependentProfileDir, 'index.js')
        },
        resolve: {
            alias: {
                'framework.i18n': path.join(process.env.SPLUNK_SOURCE, 'cfg', 'bundles', 'framework', 'server', 'static', 'i18n'),
                'splunk.error': path.join(constants.splunkJsIndependentProfileDir, 'errorIntercept')
            }
        },
        plugins: [
            new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})
        ],
        module: {
            loaders: [
                {
                    test: /splunk\.error/,
                    loader: 'virtual-module?ns=splunkjs_independent&id=errorIntercept'
                }
            ]
        }
    });