module.exports = {
    extends: '../../../.eslintrc.test.js',

    rules: {
        // doesn't work with app/ prefix
        'import/no-unresolved': 'off'
    }
};
