/* eslint no-undef: "error" */
/* eslint-env node */
module.exports = {
    parser: '@babel/eslint-parser',
    extends: ['@splunk/eslint-config/browser', 'prettier', 'plugin:jest/recommended'],
    plugins: ['prettier', 'jest'],
    env: {
        'jest/globals': true,
    },
    globals: {
        __DEV__: true,
        window: true,
        __non_webpack_require__: 'readonly',
    },
    rules: {
        'prettier/prettier': 2,
        indent: 'off',
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    },
};
