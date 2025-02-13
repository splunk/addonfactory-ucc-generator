/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');
const { merge } = require('webpack-merge');
const baseComponentConfig = require('@splunk/webpack-configs/component.config').default;

module.exports = merge(baseComponentConfig, {
    output: {
        path: path.join(__dirname, 'dist/lib'),
    },
    entry: './src/publicApi.ts',
});
