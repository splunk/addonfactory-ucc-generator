define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Point = require("jg/geom/Point");
    var LatLon = require("splunk/mapping2/LatLon");
    var Projection = require("splunk/mapping2/projections/Projection");

    return Class(module.id, Projection, function(EquirectangularProjection, base) {

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        EquirectangularProjection.getInstance = function() {
            if (!_instance) {
                _instance = new EquirectangularProjection();
            }
            return _instance;
        };

        // Public Methods

        this.latLonToRelative = function(latLon) {
            var x = (latLon.lon + 180) / 360;
            var y = (90 - latLon.lat) / 180;
            return new Point(x, y);
        };

        this.relativeToLatLon = function(relativePoint) {
            var lat = 90 - relativePoint.y * 180;
            var lon = relativePoint.x * 360 - 180;
            return new LatLon(lat, lon);
        };

    });

});
