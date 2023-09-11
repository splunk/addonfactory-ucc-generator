/* eslint-env node */
module.exports = {
    presets: [
        [
            '@splunk/babel-preset',
            {
                runtime: 'automatic',
            },
        ],
        '@babel/preset-env',
    ],
};
