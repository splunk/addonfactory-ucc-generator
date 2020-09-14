//for testing replacement of modules required by this module
define('app/ponyville/pony', ['app/canterlot/util/pony'], function (CanterlotPony) {
    return {
        neigh: function () {
            return CanterlotPony.neigh() + ' neigh';
        }
    }
})

//for testing replacement of modules required by modules required by this module
define('app/ponyville/util/pony', ['app/ponyville/mockAltPony'], function (MockAltPony) {
    return {
        neigh: function () {
            return MockAltPony.neigh() + ' neigh';
        }
    }
});


define(['app/ponyville/pony', 'app/ponyville/altPony'], function (Pony, AltPony) {

    suite('Define-mocked ponies 3', function () {

        test('this module has mocked neigh', function () {
            assert.deepEqual(Pony.neigh(), 'canterlot utility pony neigh');
        });

        test('foreign module has mocked neigh', function () {
            assert.deepEqual(AltPony.neigh(), 'mocked alternative neigh neigh');
        });
    });
});
