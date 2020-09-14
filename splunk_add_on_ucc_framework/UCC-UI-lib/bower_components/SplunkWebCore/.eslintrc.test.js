module.exports = {
    extends: './.eslintrc.js',
    plugins: [
        'mocha',
    ],
    rules: {
        // for now, disable prefer-arrow-callback (clashes with mocha/no-mocha-arrows)
        // TODO: combine the two rules into one
        'prefer-arrow-callback': 'off',
        // as a consequence of this func-names is also turned off
        'func-names': 'off',

        // be strict about tests - we might want to disable some of the following
        // once we look at the reality of corejs_test and splunkjs_test
        'mocha/no-exclusive-tests': 'error',
        'mocha/no-pending-tests': 'error',
        'mocha/no-skipped-tests': 'error',
        'mocha/handle-done-callback': 'error',
        'mocha/no-global-tests': 'error',
        'mocha/no-return-and-callback': 'error',
        'mocha/valid-test-description': ['error', /.*\S.*/], // empty string
        'mocha/valid-suite-description': ['error', /.*\S.*/], // empty string
        'mocha/no-mocha-arrows': 'error',
        'mocha/no-identical-title': 'error',
        'mocha/max-top-level-suites': ['error', { limit: 5 }],

        // mocha rules purposely not in use:
        //  mocha/no-synchronous-tests
        //  mocha/no-hooks

        // mocha rules we cannot use yet:
        //  mocha/no-hooks-for-single-case (only supports BDD, not TDD interface)
        //  mocha/no-sibling-hooks (see above)
        //  mocha/no-top-level-hooks (see above)
    },
    env: {
        mocha: true,
    },
    globals: {
        assert: true, // from chai,
        sinon: true,
    },
};
