var webpack = require('webpack');
var ProgressPlugin = require('webpack/lib/ProgressPlugin');
/**
 * Production configuration settings
 * @type {Object}
 */
module.exports = {
    plugins: [
        // Prints progress of the build to the console
        new ProgressPlugin(function(progress, msg) {
            process.stdout.write('\r                                                      ');
            if (progress !== 1) {
                process.stdout.write('\rProgress: ' + Math.round(progress * 100) + '% ' + msg);
            }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': "'production'"
        }),
        new webpack.optimize.UglifyJsPlugin({
           compress: {
               warnings: false,
               drop_debugger: false
           },
           mangle: false
        })
    ]
};
