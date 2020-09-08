define(['app/ponyville/pony', 'app/ponyville/altPony'], function (Pony, AltPony) {

    suite('Define-mocked ponies 4', function () {

        test('this module has regular neigh', function () {
            assert.deepEqual(Pony.neigh(), ['ponyville utility pony', 'ponyville pony', 'canterlot utility pony']);
        });

        test('foreign module has regular neigh', function () {
            assert.deepEqual(AltPony.neigh(), ['ponyville utility pony']);
        });
    });
});
