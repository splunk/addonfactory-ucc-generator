define(function(require, exports, module) {

    var Class = require("jg/Class");

    return Class(module.id, function(GeoJsonUtils) {

        // Public Static Methods

        GeoJsonUtils.createFromBoundingBox = function(s, w, n, e) {
            s = Number(s);
            w = Number(w);
            n = Number(n);
            e = Number(e);
            return ({
                'type': 'MultiPolygon',
                'coordinates': [
                    [
                        [
                            [w, s],
                            [e, s],
                            [e, n],
                            [w, n]
                        ]
                    ]
                ]
            });
        };

    });

});
