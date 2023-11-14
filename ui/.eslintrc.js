/* eslint no-undef: "error" */
/* eslint-env node */
module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        '@splunk/eslint-config/browser-prettier',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript', // resolves import TS files from JS code
        'plugin:jest/recommended',
        'plugin:storybook/recommended',
    ],
    plugins: ['@typescript-eslint', 'prettier', 'jest'],
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
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
        'no-console': 'error',
        // https://typescript-eslint.io/rules/no-use-before-define/#how-to-use
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error', { variables: false }],
    },
    root: true,
};
