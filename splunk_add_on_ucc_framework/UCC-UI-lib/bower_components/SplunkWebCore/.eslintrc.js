const path = require('path');
const sharedConfigAbsolute = path.join(__dirname,
    'build_tools', 'profiles', 'common', 'shared.config.js');

module.exports = {
    extends: 'airbnb',
    plugins: [
        'react',
    ],
    rules: {
        // Set the required indent to 4 spaces
        indent: ['error', 4, { SwitchCase: 1 }],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        // Do not require a newline at the end of every file
        'eol-last': 'off',
        'max-len': ['error', 120],
        // Allow `console.log` statements, but not when they reference the global console.
        'no-console': 'off',
        'no-restricted-globals': ['error', 'console'],
        // import/no-duplicates is a superset of no-duplicate-imports
        'no-duplicate-imports': 'off',
    },
    env: {
        browser: true,
    },
    settings: {
        'import/resolver': {
            webpack: { config: sharedConfigAbsolute },
        },
    },
    root: true,
};
