/**
 * Development config settings shared by all.
 * If you'd like to use your own settings, you can create 'dev.local.config.js' and that will be
 * used instead of this.
 * @type {Object}
 */
var webpack = require('webpack');
var progressPlugin;
try {
    var ProgressBarPlugin = require('progress-bar-webpack-plugin');
    var colors = require('colors');

    var msgs = [
        'Really loving IT',
        'Flush twice!',
        'Pickup a floater...',
        'What\'s the latest?',
        'Full flavor!',
        'Ghetto ride!',
        'Birdflu!',
        'Cool cool, sure sure...',
        'HTTP!',
        'Animal style!',
        'Livin the dream!',
        'Rippin it up!',
        'Very marginal...',
        'Take a break!',
        'Very relaxing...',
        'Gonna go leather up',
        'Help a brother out',
        'Very inappropriate',
        'Very refreshing...',
        'Tim Hortons',
        'Old man mode',
        'Keep it simple',
        'Special Guest',
        'Delicious treats',
        'I enjoy a refreshing brew',
        'You love a good web build',
        'Ohh Yeahhh!',
        'Very Bro-laxing!',
        'Ghetto treats!',
        'Dual action!',
        'Black lung',
        'Residual matter',
        'Setup for success!',
        'Hey Len!',
        'Just thowin em back'
    ];

    progressPlugin = new ProgressBarPlugin({
        format: msgs[~~(Math.random() * msgs.length)] + ' ' +
        colors.gray('[') + colors.blue(':bar') + colors.gray(']') + ' ' +
        colors.green(':msg')
    });
} catch (e) {
    /*
     * Fallback to old progress plugin in case the new one is not installed yet.
     */
    var NyanProgressPlugin = require('nyan-progress-webpack-plugin');
    progressPlugin = new NyanProgressPlugin({
        nyanCatSays: function(progress, messages) {
            if (progress === 1) {
                return 'Success!';
            } else {
                return messages;
            }
        },
        getProgressMessage: function() {
            return '';
        }
    })
}

module.exports = {
    devtool: 'eval-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': "'development'"
        }),
        progressPlugin
    ]
};
