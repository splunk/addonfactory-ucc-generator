define([
    'app/ponyville/util/pony',
    'app/canterlot/util/pony'
], function (UtilPony, CanterlotUtilPony) {
    return {
        neigh: function () {
            return UtilPony.neigh().concat(['ponyville pony'], CanterlotUtilPony.neigh());
        }
    };
});
