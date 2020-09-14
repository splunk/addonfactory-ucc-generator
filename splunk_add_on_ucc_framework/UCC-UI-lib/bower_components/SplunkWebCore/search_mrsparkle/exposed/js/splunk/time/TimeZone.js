define(function(require, exports, module) {

    var Class = require("jg/Class");

    return Class(module.id, Object, function(TimeZone, base) {

        // Constructor

        this.constructor = function() {
            // noop
        };

        // Public Methods

        this.getStandardOffset = function() {
            return 0;
        };

        this.getOffset = function(time) {
            return 0;
        };

    });

});
