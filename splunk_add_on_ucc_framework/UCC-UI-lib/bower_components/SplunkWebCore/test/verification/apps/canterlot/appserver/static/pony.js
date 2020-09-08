define([
    'app/canterlot/util/pony',
    'app/ponyville/pony'
], function (UtilPony, PonyvillePony) {
    return {
        neigh: function () {
            return UtilPony.neigh().concat(['canterlot pony'], PonyvillePony.neigh());
        }
    };
});
