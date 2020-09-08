//for testing replacement of modules required by this module
mockModuleLocationsGen(['app/ponyville/pony'], 'app/ponyville/mockPony');

//for testing replacement of modules required by modules required by this module
mockModuleLocationsGen(['app/ponyville/util/pony'], 'app/ponyville/mockPony');

//for testing replacement of modules required by modules required by modules required by this module
mockModuleLocationsGen(['app/ponyville/util/altPony3'], 'app/ponyville/mockPony');


define(['app/ponyville/pony', 'app/ponyville/altPony', 'app/ponyville/util/altPony'], function (Pony, AltPony, AltUtilPony) {

    suite('Mocked ponies 2', function () {

        test('this module has mocked neigh', function () {
            assert.deepEqual(Pony.neigh(), ['mocked neigh']);
        });

        test('foreign module has mocked neigh', function () {
            assert.deepEqual(AltPony.neigh(), ['mocked neigh']);
        });

        test('foreign module has a module which has a mocked neigh', function () {
            assert.deepEqual(AltUtilPony.neigh(), ['mocked neigh']);
        });
    });
});
