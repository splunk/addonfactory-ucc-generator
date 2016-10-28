var webpack = require('webpack');

module.exports = {
    debug: true,
    devtool: 'eval-source-map',
    watch: true,
    plugins: [
        new webpack.optimize.CommonsChunkPlugin("common.js"),
        new webpack.DefinePlugin({
            __CONFIG_FROM_FILE__: false
        })
    ],
    watch: true,
    keepalive: true
};
