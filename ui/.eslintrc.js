module.exports = {
    parser: '@babel/eslint-parser',
    extends: ['@splunk/eslint-config/browser', 'prettier'],
    plugins: ['prettier'],
    globals: {
        __DEV__: true,
        window: true,
        __non_webpack_require__: 'readonly',
    },
    rules: {
        'prettier/prettier': 2,
        indent: 'off',
    }
};
