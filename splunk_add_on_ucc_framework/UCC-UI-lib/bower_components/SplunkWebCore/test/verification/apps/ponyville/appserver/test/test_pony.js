define([
    'app/ponyville/pony',
    './support/pony'
], function (Pony, TestSupportPony) {

    suite('Ponyville ponies', function () {

        test('import pony', function () {
            assert.deepEqual(Pony.neigh(), ['ponyville utility pony', 'ponyville pony', 'canterlot utility pony']);
        });

        test('import test support pony', function () {
            assert.deepEqual(TestSupportPony.neigh(), ['ponyville test support pony']);
        });
    });
});