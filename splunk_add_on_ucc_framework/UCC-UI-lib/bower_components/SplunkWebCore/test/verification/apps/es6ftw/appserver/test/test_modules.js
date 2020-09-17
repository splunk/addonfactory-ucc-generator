define([
    'app/es6ftw/modules/default-export',
    'app/es6ftw/modules/multiple-named-exports',
    'app/es6ftw/modules/named-and-default-exports'
], function(
    defaultExport,
    multipleNamedExports,
    namedAndDefaultExports
) {

    suite('ES6 Module Transpilation', function() {

        test('default export transpilation', function() {
            assert.equal(defaultExport(), 'default only', 
                'default export is exported directly');
        });

        test('multiple named exports transpilation', function() {
            assert.equal(multipleNamedExports.one(), 'one', 
                'named export is exported as object property (1 of 2)');
            assert.equal(multipleNamedExports.two(), 'two', 
                'named export is exported as object property (2 of 2)');
        });

        test('named and default exports transpilation', function() {
            assert.equal(namedAndDefaultExports.named(), 'named',
                'named export is exported as object property');
            assert.equal(namedAndDefaultExports.default(), 'default',
                'default export is exported as \'default\' object property');
        });

    });

});