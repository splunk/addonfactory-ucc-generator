/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { LicenseWebpackPlugin } = require('license-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const baseConfig = require('@splunk/webpack-configs/base.config').default;

const dev = process.env.NODE_ENV !== 'production';

module.exports = merge(baseConfig, {
    entry: {
        entry_page: path.join(__dirname, 'src/main/webapp/pages/entry_page'),
    },
    output: {
        path: path.join(__dirname, 'dist/package/appserver/static/js/build'),
        filename: '[name].js',
        chunkFilename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(s*)css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new LicenseWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(__dirname, 'src/main/resources/splunk'),
                    to: path.join(__dirname, 'dist/package'),
                },
                {
                    from: path.join(__dirname, 'src/main/webapp/schema/schema.json'),
                    to: path.join(__dirname, 'dist/schema'),
                },
                {
                    from: path.join(__dirname, 'THIRDPARTY'),
                    to: path.join(__dirname, 'dist'),
                },
            ],
        }),
        new ForkTsCheckerWebpackPlugin(),
    ],
    devtool: dev ? 'inline-source-map' : false,
});
