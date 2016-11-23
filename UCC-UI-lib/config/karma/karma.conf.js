var path = require('path');
var rootDir = path.join(__dirname, '../../');
var webpack = require('webpack');
var webpackBaseConfig = require('../webpack/base');
var mergeConfigs = require('../../bower_components/SplunkWebCore/build_tools/util/mergeConfigs');

module.exports = function (config) {
  config.set({

    browsers: ['PhantomJS'],

    singleRun: !!process.env.CI,

    frameworks: ['mocha'],

    files: [
      '../../node_modules/phantomjs-polyfill/bind-polyfill.js',
      './tests.webpack.js'
    ],

    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },

    reporters: [ 'mocha' ],

    plugins: [
      require("karma-webpack"),
      require("karma-mocha"),
      require("karma-mocha-reporter"),
      require("karma-phantomjs-launcher"),
      require("karma-sourcemap-loader")
    ],

    webpack: mergeConfigs(webpackBaseConfig, {
        output: undefined,
        resolve: {
            alias: {
                'lodash': path.join(rootDir, 'bower_components', "lodash", "dist", "lodash"),
            }
        }
    }),

    webpackServer: {
      noInfo: true
    }
  });
};
