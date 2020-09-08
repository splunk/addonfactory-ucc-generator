define(function(require, exports, module) {

    var Class = require("jg/Class");
    var TimeZone = require("splunk/time/TimeZone");

    return Class(module.id, TimeZone, function(SimpleTimeZone, base) {

        // Private Properties

        this._offset = 0;

        // Constructor

        this.constructor = function(offset) {
            this._offset = (offset !== undefined) ? offset : 0;
        };

        // Public Methods

        this.getStandardOffset = function() {
            return this._offset;
        };

        this.getOffset = function(time) {
            return this._offset;
        };

    });

});
