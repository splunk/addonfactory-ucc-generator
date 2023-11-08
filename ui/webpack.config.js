/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');
const { merge } = require('webpack-merge');
const { LicenseWebpackPlugin } = require('license-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const baseConfig = require('@splunk/webpack-configs/base.config').default;

module.exports = merge(baseConfig, {
    entry: {
        entry_page: path.join(__dirname, 'src/pages/entry_page'),
    },
    output: {
        path: path.join(__dirname, 'dist/build'),
        filename: (pathData) =>
            pathData.chunk.name === 'entry_page' ? '[name].js' : '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].js',
    },
    module: {
        rules: [
            {
                test: /\.(s*)css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [new LicenseWebpackPlugin(), new ForkTsCheckerWebpackPlugin()],
    devtool: 'source-map',
    resolve: {
        fallback: { querystring: require.resolve('querystring-es3') },
    },
});
