var webpack = require('webpack');

module.exports = {
    debug: true,
    devtool: 'eval-source-map',
    watch: true,
    plugins: [
        new webpack.optimize.CommonsChunkPlugin("common.js"),
        new webpack.DefinePlugin({
            __CONFIG_FROM_FILE__: false
        }),
        // Use old watching plugin as the bug below
        // https://github.com/webpack/webpack/issues/675#issuecomment-224991459
        new webpack.OldWatchingPlugin()
    ],
    watch: true,
    keepalive: true
};
