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
        'jest/expect-expect': 'error',
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    '**/stories/**', // storybook stories
                    '**/tests/**',
                    '**/mocks/**',
                    '**/*{.,_}{test,spec}.{ts,tsx}', // tests where the extension or filename suffix denotes that it is a test,
                    '*.{ts,js}', // js configs from the root folder
                    '**/vite.config.*', // vite config
                    '**/test.setup.ts', // jest config
                ],
                optionalDependencies: false,
            },
        ],
        'react/jsx-one-expression-per-line': 'off', // This rule is not compatible with prettier
        'react/jsx-curly-newline': 'off', // This rule is not compatible with prettier
    },
    overrides: [
        {
            files: ['**/*.test.tsx'], // Apply only to .test.tsx files
            extends: ['plugin:testing-library/react'], // Enables Testing Library rules
            plugins: ['testing-library'],
            rules: {
                'testing-library/no-debugging-utils': 'error', // Prevent leaving debug utilities in tests
                'testing-library/await-async-queries': 'error', // Prevent missing awaits on async queries
                'testing-library/no-await-sync-queries': 'error', // Prevent unnecessary await on sync queries
                'testing-library/no-dom-import': 'error', // Prevent wrong imports; enforce @testing-library/react
                'testing-library/prefer-presence-queries': 'error', // prefers getBy*/queryBy* over findBy* for presence/absence checks
            },
        },
    ],
    root: true,
};
