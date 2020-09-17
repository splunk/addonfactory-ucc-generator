define(function(require, exports, module) {

    var Class = require("jg/Class");

    return Class(module.id, Object, function(Projection, base) {

        // Constructor

        this.constructor = function() {
            // noop
        };

        // Public Methods

        this.latLonToRelative = function(latLon) {
            throw new Error("Must implement method latLonToRelative.");
        };

        this.relativeToLatLon = function(relativePoint) {
            throw new Error("Must implement method relativeToLatLon.");
        };

    });

});
