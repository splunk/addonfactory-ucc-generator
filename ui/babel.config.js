/* eslint no-undef: "error" */
/* eslint-env node */
module.exports = {
    presets: [
        [
            '@babel/preset-react',
            {
                runtime: 'automatic',
            },
        ],
        '@babel/preset-env',
    ],
};
