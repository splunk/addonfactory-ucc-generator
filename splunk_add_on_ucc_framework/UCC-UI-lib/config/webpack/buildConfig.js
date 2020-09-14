var webpack = require('webpack');

module.exports = {
    devtool: 'null',
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('common.js'),
        new webpack.DefinePlugin({
            __CONFIG_FROM_FILE__: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {warnings: false}
        })
    ]
};
