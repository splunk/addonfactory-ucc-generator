var path = require('path');
var bowerDir = path.join(__dirname, 'bower_components');
var webpackDir = path.join(bowerDir, 'SplunkWebCore', 'build_tools');
var mergeConfigs = require(path.join(webpackDir, '/util/mergeConfigs'));
var webpack = require('webpack');
var devConfigs = require('./build.config.dev');

module.exports = mergeConfigs(devConfigs, {
    devtool: 'cheap-module-source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            compress: {
                warnings: false
            }
        })
    ]
});
