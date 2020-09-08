define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Point = require("jg/geom/Point");
    var NumberUtil = require("jg/utils/NumberUtil");
    var LatLon = require("splunk/mapping2/LatLon");
    var Projection = require("splunk/mapping2/projections/Projection");

    return Class(module.id, Projection, function(SphericalMercatorProjection, base) {

        // Private Static Constants

        var _MAX_LAT = 85.051128779806;
        var _PI = Math.PI;
        var _PI2 = _PI * 2;
        var _DEG_TO_RAD = _PI / 180;
        var _RAD_TO_DEG = 180 / _PI;

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        SphericalMercatorProjection.getInstance = function() {
            if (!_instance) {
                _instance = new SphericalMercatorProjection();
            }
            return _instance;
        };

        // Public Methods

        this.latLonToRelative = function(latLon) {
            var x = (latLon.lon + 180) / 360;
            var y = NumberUtil.minMax(latLon.lat, -_MAX_LAT, _MAX_LAT) * _DEG_TO_RAD;
            y = Math.log(Math.tan((_PI / 4) + (y / 2)));
            y = (_PI - y) / _PI2;
            return new Point(x, y);
        };

        this.relativeToLatLon = function(relativePoint) {
            var lat = _PI - relativePoint.y * _PI2;
            lat = 2 * Math.atan(Math.exp(lat)) - (_PI / 2);
            lat = NumberUtil.minMax(lat * _RAD_TO_DEG, -_MAX_LAT, _MAX_LAT);
            var lon = relativePoint.x * 360 - 180;
            return new LatLon(lat, lon);
        };

    });

});
