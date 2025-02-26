/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');

module.exports = {
    output: {
        filename: 'index.js',
        path: path.join(__dirname, 'dist/lib'),
        clean: true,
        library: {
            type: 'module',
        },
    },
    entry: './src/publicApi.ts',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    optimization: {
        minimize: false,
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'tsx',
                    target: 'ES2020',
                    tsconfig: './tsconfig.lib.json',
                },
            },
            {
                test: /\.(s*)css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    experiments: {
        outputModule: true,
    },
};
