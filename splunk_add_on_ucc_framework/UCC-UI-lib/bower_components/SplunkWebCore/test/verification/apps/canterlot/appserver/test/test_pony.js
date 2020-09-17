define([
    'app/canterlot/pony',
    './support/pony'
], function (Pony, TestSupportPony) {

    suite('Canterlot ponies', function () {

        test('import pony', function () {
            assert.deepEqual(Pony.neigh(), ['canterlot utility pony', 'canterlot pony',
                'ponyville utility pony', 'ponyville pony', 'canterlot utility pony']);
        });

        test('import test support pony', function () {
            assert.deepEqual(TestSupportPony.neigh(), ['canterlot test support pony']);
        });
    });
});