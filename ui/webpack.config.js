/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');
const { merge } = require('webpack-merge');
const { LicenseWebpackPlugin } = require('license-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const baseConfig = require('@splunk/webpack-configs/base.config').default;
const TerserPlugin = require("terser-webpack-plugin");

const proxyTargetUrl = 'http://localhost:8000';

const jsAssetsRegex = /.+\/app\/.+\/js\/build(\/.+(js(.map)?))/;
function isItStaticAsset(url) {
    const isItAsset = jsAssetsRegex.test(url);
    if (isItAsset) {
        const isItCustomJs = url.includes('js/build/custom');
        return !isItCustomJs;
    }
    return isItAsset;
}

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
    plugins: [
        new LicenseWebpackPlugin({
            stats: {
                warnings: false,
                errors: true,
            },
        }),
        new ForkTsCheckerWebpackPlugin(),
    ],
    devtool: 'source-map',
    resolve: {
        fallback: { querystring: require.resolve('querystring-es3') },
    },
    devServer: {
        hot: false,
        proxy: [
            {
                target: proxyTargetUrl,
                context(pathname) {
                    if (pathname.endsWith('globalConfig.json')) {
                        return true;
                    }
                    return !isItStaticAsset(pathname);
                },
            },
        ],
        setupMiddlewares: (middlewares, devServer) => {
            devServer.app.use((req, res, next) => {
                if (isItStaticAsset(req.url)) {
                    req.url = req.url.replace(jsAssetsRegex, '$1');
                }
                next();
            });

            return middlewares;
        },
    },
    optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            extractComments: false,
          }),
        ],
      },
});
